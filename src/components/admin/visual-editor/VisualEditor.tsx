
import React, { useState, useEffect } from 'react';
import { Eye, Crosshair, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditableBlock } from './EditableBlock';
import { AddBlockButton } from './AddBlockButton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { convertToMetadataObject, inferBlockType } from '@/utils/contentBlockUtils';

interface VisualEditorProps {
  pagePath: string;
  isEditMode?: boolean;
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string) => void;
}

export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'button' | 'heading' | 'list' | 'link';
  content: string;
  metadata: Record<string, any>;
  order_index: number;
  page: string;
  section?: string;
  specialty?: string;
  name?: string;
  title?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export const VisualEditor = ({ 
  pagePath, 
  isEditMode = false, 
  selectedBlockId = null,
  onSelectBlock = () => {}
}: VisualEditorProps) => {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBlocks();
    subscribeToChanges();
  }, [pagePath]);

  const fetchBlocks = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('page', pagePath)
        .order('order_index');

      if (error) throw error;

      const mappedBlocks: ContentBlock[] = data.map(item => ({
        id: item.id,
        type: inferBlockType(item),
        content: item.content || '',
        metadata: convertToMetadataObject(item.metadata),
        order_index: item.order_index || 0,
        page: item.page,
        section: item.section,
        specialty: item.specialty,
        name: item.name,
        title: item.title,
        image_url: item.image_url,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      setBlocks(mappedBlocks);
    } catch (error) {
      console.error('Error fetching blocks:', error);
      toast({
        title: "Error loading content",
        description: "Could not load content blocks from the database.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToChanges = () => {
    const channel = supabase
      .channel('content_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_blocks',
          filter: `page=eq.${pagePath}`
        },
        () => {
          fetchBlocks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleUpdateBlock = async (id: string, updates: Partial<ContentBlock>) => {
    try {
      const dbUpdates: any = { ...updates };
      
      if (dbUpdates.metadata) {
        dbUpdates.metadata = dbUpdates.metadata;
      }
      
      if (dbUpdates.type) {
        delete dbUpdates.type;
      }

      const { error } = await supabase
        .from('content_blocks')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      
      setBlocks(prevBlocks => 
        prevBlocks.map(block => 
          block.id === id ? { ...block, ...updates } : block
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error updating block:', error);
      toast({
        title: "Error updating content",
        description: "Failed to update the content. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleAddBlock = async (type: 'text' | 'image' | 'button' | 'heading' | 'list' | 'link') => {
    try {
      const maxOrderIndex = blocks.length > 0 
        ? Math.max(...blocks.map(block => block.order_index))
        : 0;

      let initialContent = '';
      switch(type) {
        case 'text':
          initialContent = 'New text block';
          break;
        case 'button':
          initialContent = 'New button';
          break;
        case 'heading':
          initialContent = 'New Heading';
          break;
        case 'list':
          initialContent = 'Item 1|Item 2|Item 3';
          break;
        case 'link':
          initialContent = 'New link';
          break;
        default:
          initialContent = '';
      }

      const newBlock = {
        page: pagePath,
        name: `new-${type}-${Date.now()}`,
        content: initialContent,
        order_index: maxOrderIndex + 1,
        section: 'main',
        specialty: 'general',
        metadata: {}
      };

      const { data, error } = await supabase
        .from('content_blocks')
        .insert(newBlock)
        .select()
        .single();

      if (error) throw error;
      
      const addedBlock: ContentBlock = {
        id: data.id,
        type: type,
        content: data.content || '',
        metadata: convertToMetadataObject(data.metadata),
        order_index: data.order_index || 0,
        page: data.page,
        section: data.section,
        specialty: data.specialty,
        name: data.name,
        title: data.title,
        image_url: data.image_url,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setBlocks([...blocks, addedBlock]);
      toast({ description: "Block added successfully" });
      
      if (onSelectBlock) {
        onSelectBlock(addedBlock.id);
      }
    } catch (error) {
      console.error('Error adding block:', error);
      toast({
        title: "Error adding block",
        description: "Failed to add a new content block.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBlock = async (id: string) => {
    try {
      const { error } = await supabase
        .from('content_blocks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setBlocks(blocks.filter(block => block.id !== id));
      toast({ description: "Block deleted successfully" });
    } catch (error) {
      console.error('Error deleting block:', error);
      toast({
        title: "Error deleting block",
        description: "Failed to delete the content block.",
        variant: "destructive"
      });
    }
  };
  
  const handleReorderBlock = async (id: string, direction: 'up' | 'down') => {
    const currentBlockIndex = blocks.findIndex(block => block.id === id);
    if (currentBlockIndex === -1) return;
    
    const currentBlock = blocks[currentBlockIndex];
    
    const targetIndex = direction === 'up' 
      ? Math.max(0, currentBlockIndex - 1)
      : Math.min(blocks.length - 1, currentBlockIndex + 1);
      
    if (targetIndex === currentBlockIndex) return;
    
    const targetBlock = blocks[targetIndex];
    
    try {
      const updates = [
        { id: currentBlock.id, order_index: targetBlock.order_index },
        { id: targetBlock.id, order_index: currentBlock.order_index }
      ];
      
      for (const update of updates) {
        const { error } = await supabase
          .from('content_blocks')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
          
        if (error) throw error;
      }
      
      const newBlocks = [...blocks];
      newBlocks[currentBlockIndex] = { ...currentBlock, order_index: targetBlock.order_index };
      newBlocks[targetIndex] = { ...targetBlock, order_index: currentBlock.order_index };
      
      setBlocks(newBlocks.sort((a, b) => a.order_index - b.order_index));
      
    } catch (error) {
      console.error('Error reordering blocks:', error);
      toast({
        title: "Error reordering content",
        description: "Failed to reorder the content blocks.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full bg-white">
        <div className="max-w-5xl mx-auto space-y-8">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full mx-auto"></div>
              <p className="mt-2">Loading content...</p>
            </div>
          ) : blocks.length > 0 ? (
            <div className={`space-y-4 ${isEditMode ? 'cursor-crosshair' : ''}`}>
              {blocks
                .sort((a, b) => a.order_index - b.order_index)
                .map((block, index) => (
                  <React.Fragment key={block.id}>
                    <EditableBlock
                      block={block}
                      isEditing={isEditMode}
                      isSelected={selectedBlockId === block.id}
                      onSelect={() => isEditMode && onSelectBlock(block.id)}
                      onUpdate={handleUpdateBlock}
                      onDelete={handleDeleteBlock}
                      onReorder={handleReorderBlock}
                    />
                    {isEditMode && index === blocks.length - 1 && (
                      <AddBlockButton onAddBlock={handleAddBlock} />
                    )}
                  </React.Fragment>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No content blocks found for this page.</p>
              {isEditMode && (
                <AddBlockButton onAddBlock={handleAddBlock} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
