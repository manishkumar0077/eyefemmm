
import { supabase } from './client';

// Helper function to upload the logo
const uploadLogo = async () => {
  try {
    // First, check if the logo already exists
    const { data: existingFile, error: checkError } = await supabase.storage
      .from('public')
      .list('', {
        search: 'eyefem-logo.png'
      });
    
    if (checkError) {
      console.error('Error checking for existing logo:', checkError);
      return;
    }
    
    // If logo exists, no need to upload again
    if (existingFile && existingFile.length > 0) {
      console.log('Logo already exists in storage');
      
      // Get the public URL for the existing logo
      const { data: publicURLData } = supabase.storage
        .from('public')
        .getPublicUrl('eyefem-logo.png');
      
      if (publicURLData?.publicUrl) {
        // Update global variable
        if (window.EYEFEM_LOGO_URL !== publicURLData.publicUrl) {
          window.EYEFEM_LOGO_URL = publicURLData.publicUrl;
          console.log('Updated global logo URL from existing file:', window.EYEFEM_LOGO_URL);
        }
      }
      
      return;
    }
    
    // Fetch the logo from the public URL provided in the task
    const logoUrl = "/lovable-uploads/a3d06283-3588-47bd-b72e-8fe5ff5799e2.png";
    const logoResponse = await fetch(logoUrl);
    
    if (!logoResponse.ok) {
      // Try the fallback URL
      const fallbackLogoResponse = await fetch('/lovable-uploads/e2b16d7e-6663-42fc-bd9b-68fed360f249.png');
      if (!fallbackLogoResponse.ok) {
        throw new Error(`Failed to fetch logo from both sources`);
      }
      
      const logoBlob = await fallbackLogoResponse.blob();
      
      // Upload the logo to storage
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload('eyefem-logo.png', logoBlob, {
          contentType: 'image/png',
          upsert: true
        });
      
      if (uploadError) {
        throw uploadError;
      }
    } else {
      // Use the primary logo if available
      const logoBlob = await logoResponse.blob();
      
      // Upload the logo to storage
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload('eyefem-logo.png', logoBlob, {
          contentType: 'image/png',
          upsert: true
        });
      
      if (uploadError) {
        throw uploadError;
      }
    }
    
    console.log('Successfully uploaded logo to storage');
    
    // Get the public URL for the uploaded logo
    const { data: publicURLData } = supabase.storage
      .from('public')
      .getPublicUrl('eyefem-logo.png');
    
    console.log('Logo public URL:', publicURLData?.publicUrl);
    
    // Update the global logo URL
    if (publicURLData?.publicUrl) {
      window.EYEFEM_LOGO_URL = publicURLData.publicUrl;
      console.log('Updated global logo URL after upload:', window.EYEFEM_LOGO_URL);
    }
  } catch (error) {
    console.error('Error uploading logo:', error);
  }
};

export const createPublicStorageBucket = async () => {
  try {
    // Check if bucket already exists
    const { data: existingBuckets } = await supabase.storage.listBuckets();
    const bucketExists = existingBuckets?.some(bucket => bucket.name === 'public');
    
    if (bucketExists) {
      console.log('Public bucket already exists');
    } else {
      // Create new public bucket
      const { data, error } = await supabase.storage.createBucket('public', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (error) {
        throw error;
      }
      
      console.log('Public storage bucket created successfully:', data);
    }
    
    // Upload the logo to the bucket
    await uploadLogo();
  } catch (error) {
    console.error('Error creating public storage bucket:', error);
  }
};
