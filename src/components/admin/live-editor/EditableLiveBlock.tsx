import React, { useState, useRef } from 'react';
import { Trash, ChevronUp, ChevronDown, Edit, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { uploadFile, getPublicUrl } from '@/integrations/supabase/storage';
import { ContentBlock } from './LiveVisualEditor';
import { generateClassesFromMetadata, generateStylesFromMetadata } from '@/utils/contentBlockUtils';
import { toast } from '@/hooks/use-toast';

interface EditableLiveBlockProps {
  block: ContentBlock;
  isEditing: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (id: string, updates: Partial<ContentBlock>) => Promise<boolean>;
  onDelete: (id: string) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
}

export const EditableLiveBlock = ({
  block,
  isEditing,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onReorder
}: EditableLiveBlockProps) => {
  const [editedContent, setEditedContent] = useState(block.content);
  const [editedMetadata, setEditedMetadata] = useState({ ...block.metadata });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
  };

  const handleMetadataChange = (key: string, value: any) => {
    setEditedMetadata(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const success = await onUpdate(block.id, {
      content: editedContent,
      metadata: editedMetadata
    });

    if (success) {
      toast({ description: "Changes saved successfully" });
    }
  };

  const handleCancel = () => {
    setEditedContent(block.content);
    setEditedMetadata({ ...block.metadata });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsUploading(true);
    
    try {
      const filePath = `page-content/${block.page}/${block.id}_${Date.now()}.${file.name.split('.').pop()}`;
      
      await uploadFile('public', filePath, file);
      const url = getPublicUrl('public', filePath);
      
      // If it's an image block, update the image_url
      if (block.type === 'image') {
        await onUpdate(block.id, { 
          image_url: url
        });
      } 
      // If it's another block type with an image in metadata
      else {
        await onUpdate(block.id, {
          metadata: { ...editedMetadata, imageUrl: url }
        });
        setEditedMetadata(prev => ({ ...prev, imageUrl: url }));
      }
      
      toast({ description: "Image uploaded successfully" });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ 
        title: "Upload failed", 
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const classes = generateClassesFromMetadata(block.metadata);
  const styles = generateStylesFromMetadata(block.metadata);

  const renderBlock = () => {
    switch (block.type) {
      case 'heading':
        return (
          <div 
            className={`font-bold ${classes}`} 
            style={styles}
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        );
      case 'text':
        return (
          <div 
            className={classes} 
            style={styles}
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        );
      case 'image':
        return (
          <div className={classes} style={styles}>
            <img 
              src={block.image_url || ''}
              alt={block.metadata.alt || 'Image'} 
              className="max-w-full h-auto"
            />
          </div>
        );
      case 'button':
        return (
          <Button
            className={`${classes} cursor-pointer`}
            style={styles}
          >
            {block.content}
          </Button>
        );
      default:
        return (
          <div className={classes} style={styles}>
            {block.content}
          </div>
        );
    }
  };

  const renderEditingSidebar = () => {
    if (!isSelected) return null;
    
    return (
      <Card className="fixed left-0 top-0 h-screen w-80 z-50 shadow-lg overflow-y-auto bg-gray-900 text-white">
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-700 pb-2">
            <div className="flex items-center">
              {block.type === 'heading' && <h3 className="text-lg font-bold">h1</h3>}
              {block.type === 'text' && <h3 className="text-lg font-bold">Text</h3>}
              {block.type === 'image' && <h3 className="text-lg font-bold">Image</h3>}
              {block.type === 'button' && <h3 className="text-lg font-bold">Button</h3>}
            </div>
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDelete(block.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onSelect()}
                className="text-gray-400 hover:text-gray-300"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-300 mb-2">Content</h4>
              {block.type === 'image' ? (
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {block.image_url && (
                    <img 
                      src={block.image_url} 
                      alt="Preview" 
                      className="max-w-full h-auto rounded mt-2"
                    />
                  )}
                </div>
              ) : block.type === 'heading' || block.type === 'button' ? (
                <Input
                  value={editedContent}
                  onChange={handleContentChange}
                  className="bg-gray-800 border-gray-700"
                />
              ) : (
                <Textarea
                  value={editedContent}
                  onChange={handleContentChange}
                  rows={4}
                  className="bg-gray-800 border-gray-700"
                />
              )}
            </div>
            
            <div>
              <h4 className="font-medium text-gray-300 mb-2">Margin</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="margin-h" className="text-sm text-gray-400">Horizontal</Label>
                  <div className="flex items-center">
                    <Input
                      id="margin-h"
                      type="number"
                      value={editedMetadata.marginLeft || 0}
                      onChange={e => handleMetadataChange('marginLeft', parseInt(e.target.value))}
                      className="bg-gray-800 border-gray-700"
                    />
                    <span className="ml-2">0</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="margin-v" className="text-sm text-gray-400">Vertical</Label>
                  <div className="flex items-center">
                    <Input
                      id="margin-v"
                      type="number"
                      value={editedMetadata.marginTop || 0}
                      onChange={e => handleMetadataChange('marginTop', parseInt(e.target.value))}
                      className="bg-gray-800 border-gray-700"
                    />
                    <span className="ml-2">0</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-300 mb-2">Padding</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="padding-h" className="text-sm text-gray-400">Horizontal</Label>
                  <div className="flex items-center">
                    <Input
                      id="padding-h"
                      type="number"
                      value={editedMetadata.paddingX || 0}
                      onChange={e => handleMetadataChange('paddingX', parseInt(e.target.value))}
                      className="bg-gray-800 border-gray-700"
                    />
                    <span className="ml-2">0</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="padding-v" className="text-sm text-gray-400">Vertical</Label>
                  <div className="flex items-center">
                    <Input
                      id="padding-v"
                      type="number"
                      value={editedMetadata.paddingY || 0}
                      onChange={e => handleMetadataChange('paddingY', parseInt(e.target.value))}
                      className="bg-gray-800 border-gray-700"
                    />
                    <span className="ml-2">0</span>
                  </div>
                </div>
              </div>
            </div>
            
            {(block.type === 'text' || block.type === 'heading' || block.type === 'button') && (
              <div>
                <h4 className="font-medium text-gray-300 mb-2">Font size</h4>
                <Select 
                  value={editedMetadata.fontSize || ''}
                  onValueChange={value => handleMetadataChange('fontSize', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-xs">Extra Small</SelectItem>
                    <SelectItem value="text-sm">Small</SelectItem>
                    <SelectItem value="text-base">Normal</SelectItem>
                    <SelectItem value="text-lg">Large</SelectItem>
                    <SelectItem value="text-xl">Extra Large</SelectItem>
                    <SelectItem value="text-2xl">2XL</SelectItem>
                    <SelectItem value="text-3xl">3XL</SelectItem>
                    <SelectItem value="text-4xl">4XL</SelectItem>
                    <SelectItem value="text-5xl">5XL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {(block.type === 'text' || block.type === 'heading' || block.type === 'button') && (
              <div>
                <h4 className="font-medium text-gray-300 mb-2">Font weight</h4>
                <Select 
                  value={editedMetadata.fontWeight || ''}
                  onValueChange={value => handleMetadataChange('fontWeight', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select weight" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="font-light">Light</SelectItem>
                    <SelectItem value="font-normal">Normal</SelectItem>
                    <SelectItem value="font-medium">Medium</SelectItem>
                    <SelectItem value="font-semibold">Semibold</SelectItem>
                    <SelectItem value="font-bold">Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {(block.type === 'text' || block.type === 'heading' || block.type === 'button') && (
              <div>
                <h4 className="font-medium text-gray-300 mb-2">Color</h4>
                <Select 
                  value={editedMetadata.textColor || ''}
                  onValueChange={value => handleMetadataChange('textColor', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-inherit">Inherit</SelectItem>
                    <SelectItem value="text-black">Black</SelectItem>
                    <SelectItem value="text-white">White</SelectItem>
                    <SelectItem value="text-gray-500">Gray</SelectItem>
                    <SelectItem value="text-red-500">Red</SelectItem>
                    <SelectItem value="text-blue-500">Blue</SelectItem>
                    <SelectItem value="text-green-500">Green</SelectItem>
                    <SelectItem value="text-yellow-500">Yellow</SelectItem>
                    <SelectItem value="text-purple-500">Purple</SelectItem>
                    <SelectItem value="text-pink-500">Pink</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {(block.type === 'text' || block.type === 'heading') && (
              <div>
                <h4 className="font-medium text-gray-300 mb-2">Alignment</h4>
                <div className="grid grid-cols-4 gap-2">
                  <Button 
                    variant={editedMetadata.textAlign === 'text-left' ? 'default' : 'outline'} 
                    className={`${editedMetadata.textAlign === 'text-left' ? 'bg-primary' : 'bg-gray-800 border-gray-700'}`}
                    onClick={() => handleMetadataChange('textAlign', 'text-left')}
                  >
                    <div className="w-4 h-4 flex flex-col justify-center items-start">
                      <div className="w-full h-0.5 bg-current mb-0.5"></div>
                      <div className="w-2/3 h-0.5 bg-current mb-0.5"></div>
                      <div className="w-full h-0.5 bg-current"></div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant={editedMetadata.textAlign === 'text-center' ? 'default' : 'outline'}
                    className={`${editedMetadata.textAlign === 'text-center' ? 'bg-primary' : 'bg-gray-800 border-gray-700'}`}
                    onClick={() => handleMetadataChange('textAlign', 'text-center')}
                  >
                    <div className="w-4 h-4 flex flex-col justify-center items-center">
                      <div className="w-full h-0.5 bg-current mb-0.5"></div>
                      <div className="w-2/3 h-0.5 bg-current mb-0.5"></div>
                      <div className="w-full h-0.5 bg-current"></div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant={editedMetadata.textAlign === 'text-right' ? 'default' : 'outline'}
                    className={`${editedMetadata.textAlign === 'text-right' ? 'bg-primary' : 'bg-gray-800 border-gray-700'}`}
                    onClick={() => handleMetadataChange('textAlign', 'text-right')}
                  >
                    <div className="w-4 h-4 flex flex-col justify-center items-end">
                      <div className="w-full h-0.5 bg-current mb-0.5"></div>
                      <div className="w-2/3 h-0.5 bg-current mb-0.5"></div>
                      <div className="w-full h-0.5 bg-current"></div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant={editedMetadata.textAlign === 'text-justify' ? 'default' : 'outline'}
                    className={`${editedMetadata.textAlign === 'text-justify' ? 'bg-primary' : 'bg-gray-800 border-gray-700'}`}
                    onClick={() => handleMetadataChange('textAlign', 'text-justify')}
                  >
                    <div className="w-4 h-4 flex flex-col justify-center">
                      <div className="w-full h-0.5 bg-current mb-0.5"></div>
                      <div className="w-full h-0.5 bg-current mb-0.5"></div>
                      <div className="w-full h-0.5 bg-current"></div>
                    </div>
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-6 border-t border-gray-700 mt-4">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="bg-gray-800 border-gray-700 hover:bg-gray-700"
            >
              Discard
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90"
            >
              Save
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <>
      {isEditing && renderEditingSidebar()}
      
      <div 
        className={`relative ${isEditing ? 'hover:outline hover:outline-dashed hover:outline-blue-400 focus:outline-blue-500 transition-all' : ''} ${isSelected ? 'outline outline-2 outline-blue-500' : ''}`}
        onClick={onSelect}
        tabIndex={isEditing ? 0 : undefined}
      >
        {renderBlock()}
        
        {isEditing && isSelected && (
          <div className="absolute flex flex-col right-0 top-1/2 transform -translate-y-1/2 -translate-x-full mr-2">
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onReorder(block.id, 'up');
              }}
              className="rounded-full w-6 h-6 mb-1 bg-white shadow-md hover:bg-gray-100"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onReorder(block.id, 'down');
              }}
              className="rounded-full w-6 h-6 bg-white shadow-md hover:bg-gray-100"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
