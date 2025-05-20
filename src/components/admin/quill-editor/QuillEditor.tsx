
import React, { useState, useEffect, useRef } from 'react';
import { Save, Upload, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { uploadFile, getPublicUrl } from '@/integrations/supabase/storage';
import { ContentBlock } from '../live-editor/LiveVisualEditor';
import { convertToMetadataObject, inferBlockType } from '@/utils/contentBlockUtils';
import { EditableQuillBlock } from './EditableQuillBlock';

interface QuillEditorProps {
  pagePath: string;
}

export const QuillEditor = ({ pagePath }: QuillEditorProps) => {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

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
      
      setHasChanges(false);
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
      setHasChanges(true);
      
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

  const handleContentChange = (blockId: string, content: string) => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === blockId ? { ...block, content } : block
      )
    );
    setHasChanges(true);
  };

  const handleImageUpload = async (blockId: string, file: File) => {
    try {
      const filePath = `page-content/${pagePath}/${blockId}_${Date.now()}.${file.name.split('.').pop()}`;
      
      await uploadFile('public', filePath, file);
      const url = getPublicUrl('public', filePath);
      
      // Update block with new image URL
      await handleUpdateBlock(blockId, { image_url: url });
      setHasChanges(true);
      
      toast({ description: "Image uploaded successfully" });
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ 
        title: "Upload failed", 
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
      return null;
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
      setHasChanges(true);
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
      setHasChanges(true);
      
    } catch (error) {
      console.error('Error reordering blocks:', error);
      toast({
        title: "Error reordering content",
        description: "Failed to reorder the content blocks.",
        variant: "destructive"
      });
    }
  };

  const handleSaveAll = async () => {
    try {
      for (const block of blocks) {
        await handleUpdateBlock(block.id, {
          content: block.content,
          metadata: block.metadata
        });
      }
      
      toast({ 
        title: "Success",
        description: "All changes have been saved" 
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Error",
        description: "Failed to save some changes. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddNewBlock = () => {
    const options = [
      { label: "Heading", type: "heading" as const },
      { label: "Text", type: "text" as const },
      { label: "Image", type: "image" as const },
      { label: "Button", type: "button" as const }
    ];
    
    // Show a prompt to select block type
    const selectedTypeIndex = window.prompt(
      `Select block type to add (1-${options.length}):\n${options.map((opt, i) => `${i + 1}. ${opt.label}`).join('\n')}`
    );
    
    if (selectedTypeIndex !== null) {
      const index = parseInt(selectedTypeIndex) - 1;
      if (!isNaN(index) && index >= 0 && index < options.length) {
        handleAddBlock(options[index].type);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full mx-auto"></div>
            <p className="mt-2">Loading content...</p>
          </div>
        ) : blocks.length > 0 ? (
          <div className="space-y-4">
            {blocks
              .sort((a, b) => a.order_index - b.order_index)
              .map(block => (
                <EditableQuillBlock
                  key={block.id}
                  block={block}
                  onContentChange={(content) => handleContentChange(block.id, content)}
                  onImageUpload={(file) => handleImageUpload(block.id, file)}
                  onDelete={() => handleDeleteBlock(block.id)}
                  onReorder={(direction) => handleReorderBlock(block.id, direction)}
                />
              ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No content blocks found for this page.</p>
            <Button onClick={handleAddNewBlock} className="mt-4">
              Add New Block
            </Button>
          </div>
        )}

        {blocks.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Button onClick={handleAddNewBlock} variant="outline" className="mr-2">
              Add New Block
            </Button>
          </div>
        )}
      </div>

      {/* Floating action buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col space-y-2">
        {hasChanges && (
          <Button
            size="lg"
            className="rounded-full p-3 shadow-lg bg-green-600 hover:bg-green-700"
            onClick={handleSaveAll}
          >
            <Save className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  );
};
