
import { supabase } from './client';
import { v4 as uuidv4 } from 'uuid';

export interface Block {
  id: string;
  page_path: string;
  type: string;
  content: any;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch all blocks for a specific page
 */
export const fetchPageBlocks = async (pagePath: string): Promise<Block[]> => {
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('page_path', pagePath)
    .order('order_index', { ascending: true });
    
  if (error) {
    throw new Error(`Error fetching blocks: ${error.message}`);
  }
  
  return data || [];
};

/**
 * Save blocks for a specific page
 */
export const savePageBlocks = async (pagePath: string, blocks: Partial<Block>[]): Promise<Block[]> => {
  const { error: deleteError } = await supabase
    .from('blocks')
    .delete()
    .eq('page_path', pagePath);
    
  if (deleteError) {
    throw new Error(`Error deleting existing blocks: ${deleteError.message}`);
  }
  
  const blocksToSave = blocks.map((block, index) => ({
    id: block.id || uuidv4(),
    page_path: pagePath,
    type: block.type,
    content: block.content || {},
    order_index: index
  }));
  
  const { data, error: insertError } = await supabase
    .from('blocks')
    .insert(blocksToSave)
    .select();
    
  if (insertError) {
    throw new Error(`Error saving blocks: ${insertError.message}`);
  }
  
  return data || [];
};

/**
 * Save a single block for a specific page 
 */
export const saveSingleBlock = async (block: Partial<Block>): Promise<Block> => {
  if (!block.id || !block.page_path) {
    throw new Error('Block ID and page path are required');
  }

  const { data, error } = await supabase
    .from('blocks')
    .upsert({
      id: block.id,
      page_path: block.page_path,
      type: block.type,
      content: block.content || {},
      order_index: block.order_index || 0
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error saving block: ${error.message}`);
  }

  return data;
};

/**
 * Delete all blocks for a specific page
 */
export const deletePageBlocks = async (pagePath: string): Promise<void> => {
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('page_path', pagePath);
    
  if (error) {
    throw new Error(`Error deleting blocks: ${error.message}`);
  }
};
