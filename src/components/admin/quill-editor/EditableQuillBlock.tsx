
import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentBlock } from '../live-editor/LiveVisualEditor';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface EditableQuillBlockProps {
  block: ContentBlock;
  onContentChange: (content: string) => void;
  onImageUpload: (file: File) => Promise<string | null>;
  onDelete: () => void;
  onReorder: (direction: 'up' | 'down') => void;
}

export const EditableQuillBlock: React.FC<EditableQuillBlockProps> = ({
  block,
  onContentChange,
  onImageUpload,
  onDelete,
  onReorder
}) => {
  const [isEditingImage, setIsEditingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Quill modules configuration
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  const handleImageClick = () => {
    setIsEditingImage(true);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await onImageUpload(file);
    }
    setIsEditingImage(false);
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case 'heading':
        return (
          <div className="quill-container">
            <ReactQuill 
              theme="snow"
              value={block.content}
              onChange={onContentChange}
              modules={modules}
              placeholder="Enter heading text..."
              className="heading-editor"
            />
          </div>
        );
      
      case 'text':
        return (
          <div className="quill-container">
            <ReactQuill 
              theme="snow"
              value={block.content}
              onChange={onContentChange}
              modules={modules}
              placeholder="Enter text content..."
            />
          </div>
        );
      
      case 'button':
        return (
          <div className="quill-container button-editor">
            <ReactQuill 
              theme="snow"
              value={block.content}
              onChange={onContentChange}
              modules={{ toolbar: [['bold', 'italic', 'underline']] }}
              placeholder="Button text..."
            />
          </div>
        );
      
      case 'image':
        return (
          <div className="relative group">
            {block.image_url ? (
              <img 
                src={block.image_url} 
                alt="Content" 
                className="max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                onClick={handleImageClick}
              />
            ) : (
              <div 
                className="w-full h-40 bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                onClick={handleImageClick}
              >
                <Upload className="h-8 w-8 text-gray-500" />
                <span className="ml-2 text-gray-500">Click to upload image</span>
              </div>
            )}
            <input 
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageFileChange}
            />
          </div>
        );
      
      default:
        return <div>Unknown block type</div>;
    }
  };
  
  return (
    <div className="relative border border-gray-200 rounded-lg p-4 group">
      {/* Block controls */}
      <div className="absolute -right-10 top-1/2 transform -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => onReorder('up')}
          className="bg-white shadow-sm w-8 h-8"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => onReorder('down')}
          className="bg-white shadow-sm w-8 h-8"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={onDelete}
          className="bg-white shadow-sm w-8 h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="block-type-badge absolute top-0 left-0 transform -translate-y-1/2 bg-gray-700 text-white text-xs px-2 py-0.5 rounded">
        {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
      </div>
      
      {/* Block content */}
      <div className="mt-2">
        {renderBlockContent()}
      </div>
    </div>
  );
};
