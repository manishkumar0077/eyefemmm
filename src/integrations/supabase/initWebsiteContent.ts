
// Remove all code referencing "information_schema.tables" or "create_website_content_table"
import { supabase } from './client';

/**
 * Only focuses on clearing and re-seeding content (if needed).
 * Don't check for the table existence using system tables in Supabase client.
 */

export const ensureWebsiteContentTable = async () => {
  // NO-OP, table is managed by migrations
  // Could simply return true for now
  return true;
};

export const reinitializeWebsiteContent = async () => {
  try {
    // Clear all content from website_content table
    const { error: deleteError } = await supabase
      .from('website_content')
      .delete()
      .not('id', 'is', null);

    if (deleteError) throw deleteError;

    // Optionally: seed with default content here if you want

    console.log('Website content reinitialized');
    return true;
  } catch (error) {
    console.error('Error reinitializing website content:', error);
    return false;
  }
};
