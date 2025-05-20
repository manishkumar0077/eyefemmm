
import { supabase } from './client';
import { uploadWebsiteImage } from './storage';

// Store logo in a fixed location for consistent access across all email templates
export const uploadLogo = async (file: File) => {
  try {
    // Create a consistent filename for the logo
    const fileExt = file.name.split('.').pop();
    const fileName = `eyefem-logo.${fileExt}`;
    
    // Upload to the website-content bucket (where the logo is actually located)
    const filePath = `eyefem-logo.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('website-content')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true, // Overwrite if exists
      });
      
    if (error) {
      throw error;
    }
    
    // Get the public URL
    const logoUrl = getLogoUrl();
    
    // Update the global logo URL if it exists in the window object
    if (window.EYEFEM_LOGO_URL) {
      window.EYEFEM_LOGO_URL = logoUrl;
    }
    
    return logoUrl;
  } catch (error) {
    console.error("Error uploading logo:", error);
    throw error;
  }
};

export const getLogoUrl = () => {
  // Return a fixed URL to the logo file
  return supabase.storage
    .from('website-content')
    .getPublicUrl('eyefem-logo.png')
    .data.publicUrl;
};

export const checkLogoExists = async () => {
  try {
    const { data, error } = await supabase.storage
      .from('website-content')
      .list('', {
        limit: 1,
        search: 'eyefem-logo',
      });
      
    if (error) {
      console.error("Error checking logo:", error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking if logo exists:", error);
    return false;
  }
};
