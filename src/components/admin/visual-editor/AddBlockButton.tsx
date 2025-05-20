
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, FileText, Image, MousePointer, 
  List, Link, ChevronDown, ChevronRight 
} from 'lucide-react';

interface AddBlockButtonProps {
  onAddBlock: (type: 'text' | 'image' | 'button' | 'heading' | 'list' | 'link') => void;
}

export const AddBlockButton = ({ onAddBlock }: AddBlockButtonProps) => {
  const [showOptions, setShowOptions] = useState(false);

  const contentTypes = [
    { id: 'heading', name: 'Heading', icon: <FileText className="w-4 h-4 mr-2" /> },
    { id: 'text', name: 'Text', icon: <FileText className="w-4 h-4 mr-2" /> },
    { id: 'image', name: 'Image', icon: <Image className="w-4 h-4 mr-2" /> },
    { id: 'button', name: 'Button', icon: <MousePointer className="w-4 h-4 mr-2" /> },
    { id: 'list', name: 'List', icon: <List className="w-4 h-4 mr-2" /> },
    { id: 'link', name: 'Link', icon: <Link className="w-4 h-4 mr-2" /> }
  ];

  return (
    <div className="flex justify-center my-8 relative">
      <div className="relative">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setShowOptions(!showOptions)}
        >
          <Plus className="w-4 h-4" />
          Add Content Block
          {showOptions ? (
            <ChevronDown className="w-4 h-4 ml-1" />
          ) : (
            <ChevronRight className="w-4 h-4 ml-1" />
          )}
        </Button>

        {showOptions && (
          <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg overflow-hidden z-10 w-full min-w-[200px]">
            {contentTypes.map((type) => (
              <Button
                key={type.id}
                variant="ghost"
                className="flex items-center justify-start w-full rounded-none hover:bg-gray-100 px-4 py-2 h-auto"
                onClick={() => {
                  onAddBlock(type.id as any);
                  setShowOptions(false);
                }}
              >
                {type.icon}
                {type.name}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
