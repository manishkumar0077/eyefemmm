
import React, { useState, useEffect } from 'react';
import { Crosshair, Eye, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { EditableLiveBlock } from './EditableLiveBlock';
import { AddBlockButton } from './AddBlockButton';
import { convertToMetadataObject, inferBlockType } from '@/utils/contentBlockUtils';

interface LiveVisualEditorProps {
  pagePath: string;
}

export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'button' | 'heading' | 'link' | 'list';
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

export const LiveVisualEditor = ({ pagePath }: LiveVisualEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

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

      // Map the database fields to our ContentBlock interface
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
      // Convert updates to match database schema
      const dbUpdates: any = { ...updates };
      
      // If metadata is provided, ensure it's properly formatted
      if (dbUpdates.metadata) {
        dbUpdates.metadata = dbUpdates.metadata;
      }
      
      // Remove type from database updates if present
      if (dbUpdates.type) {
        delete dbUpdates.type;
      }

      const { error } = await supabase
        .from('content_blocks')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
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

  const handleAddBlock = async (type: 'text' | 'image' | 'button' | 'heading') => {
    try {
      // Find the highest order_index to place new block at the end
      const maxOrderIndex = blocks.length > 0 
        ? Math.max(...blocks.map(block => block.order_index))
        : 0;

      const newBlock = {
        page: pagePath,
        name: `new-${type}-${Date.now()}`,
        content: type === 'text' ? 'New text block' : 
                 type === 'button' ? 'New button' :
                 type === 'heading' ? 'New Heading' : '',
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
      
      // Map the response to our ContentBlock type
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
      
      // Select the newly added block
      setSelectedBlockId(addedBlock.id);
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
      
      // Update local state
      setBlocks(blocks.filter(block => block.id !== id));
      setSelectedBlockId(null);
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

  const handleBlockSelect = (id: string) => {
    setSelectedBlockId(id === selectedBlockId ? null : id);
  };
  
  const handleReorderBlock = async (id: string, direction: 'up' | 'down') => {
    // Find current block and its index
    const currentBlockIndex = blocks.findIndex(block => block.id === id);
    if (currentBlockIndex === -1) return;
    
    const currentBlock = blocks[currentBlockIndex];
    
    // Find the block to swap with
    const targetIndex = direction === 'up' 
      ? Math.max(0, currentBlockIndex - 1)
      : Math.min(blocks.length - 1, currentBlockIndex + 1);
      
    // Don't do anything if we're already at the edge
    if (targetIndex === currentBlockIndex) return;
    
    const targetBlock = blocks[targetIndex];
    
    // Create the updated blocks array with swapped order_index values
    try {
      // Update the order_index values in the database
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
      
      // Update local state
      const newBlocks = [...blocks];
      newBlocks[currentBlockIndex] = { ...currentBlock, order_index: targetBlock.order_index };
      newBlocks[targetIndex] = { ...targetBlock, order_index: currentBlock.order_index };
      
      // Sort by order_index
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
    <div className="min-h-screen bg-white relative">
      {/* Live Preview Area */}
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto p-4 space-y-8">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full mx-auto"></div>
              <p className="mt-2">Loading content...</p>
            </div>
          ) : blocks.length > 0 ? (
            <div className={`space-y-4 ${isEditing ? 'cursor-crosshair' : ''}`}>
              {blocks
                .sort((a, b) => a.order_index - b.order_index)
                .map((block, index) => (
                  <React.Fragment key={block.id}>
                    <EditableLiveBlock
                      block={block}
                      isEditing={isEditing}
                      isSelected={selectedBlockId === block.id}
                      onSelect={() => isEditing && handleBlockSelect(block.id)}
                      onUpdate={handleUpdateBlock}
                      onDelete={handleDeleteBlock}
                      onReorder={handleReorderBlock}
                    />
                    {isEditing && index === blocks.length - 1 && (
                      <AddBlockButton onAddBlock={handleAddBlock} />
                    )}
                  </React.Fragment>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No content blocks found for this page.</p>
              {isEditing && (
                <AddBlockButton onAddBlock={handleAddBlock} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Edit Mode Button */}
      <div className="fixed bottom-8 right-8">
        <Button
          size="lg"
          className={`rounded-full p-3 shadow-lg ${isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-violet-600 hover:bg-violet-700'}`}
          onClick={() => {
            setIsEditing(!isEditing);
            // Clear selection when exiting edit mode
            if (isEditing) setSelectedBlockId(null);
          }}
        >
          {isEditing ? (
            <Eye className="h-6 w-6" />
          ) : (
            <Crosshair className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Floating Save Button (visible in edit mode) */}
      {isEditing && (
        <div className="fixed bottom-8 right-28">
          <Button
            size="lg"
            className="rounded-full p-3 shadow-lg bg-green-600 hover:bg-green-700"
            onClick={() => {
              toast({ description: "All changes have been saved" });
            }}
          >
            <Save className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
};
