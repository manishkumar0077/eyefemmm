
import React, { useState } from 'react';
import { Plus, Type, Image, MousePointer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AddBlockButtonProps {
  onAddBlock: (type: 'text' | 'image' | 'button' | 'heading') => void;
}

export const AddBlockButton = ({ onAddBlock }: AddBlockButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="py-2 flex justify-center">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="border-dashed">
            <Plus className="h-4 w-4 mr-2" /> Add Block
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuItem onClick={() => {
            onAddBlock('heading');
            setIsOpen(false);
          }}>
            <Type className="mr-2 h-4 w-4" /> Heading
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            onAddBlock('text');
            setIsOpen(false);
          }}>
            <Type className="mr-2 h-4 w-4" /> Text
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            onAddBlock('image');
            setIsOpen(false);
          }}>
            <Image className="mr-2 h-4 w-4" /> Image
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            onAddBlock('button');
            setIsOpen(false);
          }}>
            <MousePointer className="mr-2 h-4 w-4" /> Button
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
