
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { 
  Pencil, Save, Trash, ArrowUp, ArrowDown, 
  Image, FileText, Link, List 
} from 'lucide-react';
import { ContentBlock } from './VisualEditor';

interface EditableBlockProps {
  block: ContentBlock;
  isEditing: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (id: string, updates: Partial<ContentBlock>) => Promise<boolean>;
  onDelete: (id: string) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
}

export const EditableBlock: React.FC<EditableBlockProps> = ({
  block,
  isEditing,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onReorder,
}) => {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(block.content);
  const [imageUrl, setImageUrl] = useState(block.image_url || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleStartEditing = () => {
    setEditing(true);
    setContent(block.content);
    setImageUrl(block.image_url || '');
  };

  const handleSave = async () => {
    if (content === block.content && imageUrl === block.image_url) {
      setEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const updates: Partial<ContentBlock> = { content };
      if (block.type === 'image') {
        updates.image_url = imageUrl;
      }
      
      const success = await onUpdate(block.id, updates);
      if (success) {
        setEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getBlockIcon = () => {
    switch (block.type) {
      case 'heading':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'list':
        return <List className="h-4 w-4" />;
      case 'link':
        return <Link className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getBlockTypeLabel = () => {
    switch (block.type) {
      case 'heading':
        return 'Heading';
      case 'text':
        return 'Text';
      case 'image':
        return 'Image';
      case 'button':
        return 'Button';
      case 'list':
        return 'List';
      case 'link':
        return 'Link';
      default:
        return 'Content';
    }
  };

  const renderContent = () => {
    if (!isEditing && !editing) {
      switch (block.type) {
        case 'heading':
          return <h2 className="text-2xl font-bold">{block.content}</h2>;
        case 'text':
          return <p className="text-base">{block.content}</p>;
        case 'button':
          return (
            <Button className="mt-2" variant="secondary">
              {block.content}
            </Button>
          );
        case 'image':
          return (
            <div>
              <img 
                src={block.image_url} 
                alt={block.content || 'Image'} 
                className="max-w-full rounded-md max-h-64 object-contain my-2" 
              />
              {block.content && <p className="text-sm text-gray-500 text-center">{block.content}</p>}
            </div>
          );
        case 'list':
          return (
            <ul className="list-disc ml-5 space-y-1">
              {block.content.split('|').map((item, i) => (
                <li key={i}>{item.trim()}</li>
              ))}
            </ul>
          );
        case 'link':
          return (
            <a href={block.metadata?.url || '#'} className="text-blue-600 hover:underline">
              {block.content}
            </a>
          );
        default:
          return <p>{block.content}</p>;
      }
    }

    return (
      <div className="space-y-4">
        {block.type === 'image' && (
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL"
            />
            {imageUrl && (
              <div className="mt-2">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-w-full rounded-md max-h-40 object-contain"
                />
              </div>
            )}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-1">
            {block.type === 'image' ? 'Caption' : 'Content'}
          </label>
          {block.type === 'list' ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Enter list items separated by | (pipe character)</p>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Item 1|Item 2|Item 3"
                rows={4}
              />
              {content && (
                <div className="text-sm border p-3 rounded bg-gray-50">
                  <p className="mb-1 font-medium">Preview:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    {content.split('|').map((item, i) => (
                      <li key={i}>{item.trim()}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : block.type === 'link' ? (
            <div className="space-y-2">
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Link text"
              />
              <Input
                value={block.metadata?.url || ''}
                onChange={(e) => {
                  onUpdate(block.id, { 
                    metadata: { ...block.metadata, url: e.target.value } 
                  });
                }}
                placeholder="URL (e.g. https://example.com)"
              />
            </div>
          ) : (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Enter ${block.type} content`}
              rows={block.type === 'heading' ? 2 : 4}
            />
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`relative transition-all ${
        isSelected ? 'ring-2 ring-blue-500 rounded-lg' : ''
      }`}
      onClick={onSelect}
    >
      <Card className={`overflow-hidden ${
        isSelected && isEditing ? 'border-blue-500' : ''
      }`}>
        {isEditing && isSelected && (
          <CardHeader className="p-2 bg-gray-50 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              {getBlockIcon()}
              <span className="text-sm font-medium">{getBlockTypeLabel()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReorder(block.id, 'up')}
                className="h-8 w-8 p-0"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReorder(block.id, 'down')}
                className="h-8 w-8 p-0"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(block.id)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        )}
        
        <CardContent className={`p-4 ${editing ? 'bg-gray-50' : ''}`}>
          {renderContent()}
        </CardContent>
        
        {isEditing && isSelected && !editing && (
          <CardFooter className="p-2 bg-gray-50 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartEditing}
              className="flex items-center gap-1"
            >
              <Pencil className="h-4 w-4" />
              Edit {getBlockTypeLabel()}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};
