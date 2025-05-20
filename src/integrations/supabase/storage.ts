import { supabase } from './client';

/**
 * Upload a file to Supabase storage
 * @param bucket The storage bucket name
 * @param filePath The path where the file will be stored
 * @param file The file to upload
 * @returns 
 */
export const uploadFile = async (bucket: string, filePath: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Get a public URL for a file in Supabase storage
 * @param bucket The storage bucket name
 * @param filePath The path to the file
 * @returns The public URL string
 */
export const getPublicUrl = (bucket: string, filePath: string): string => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
    
  return data.publicUrl;
};

/**
 * Delete a file from Supabase storage
 * @param bucket The storage bucket name
 * @param filePath The path to the file
 */
export const deleteFile = async (bucket: string, filePath: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);
    
  if (error) {
    throw error;
  }
};

/**
 * Upload a content image to the website-content bucket
 */
export const uploadContentImage = async (file: File) => {
  const filePath = `content/${Date.now()}_${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('website-content')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw error;
  }

  return getPublicUrl('website-content', filePath);
};

/**
 * Utility: Hash file name using SHA-256 and keep extension.
 */
function obfuscateFileName(originalName: string): Promise<string> {
  const ext = originalName.substring(originalName.lastIndexOf('.')) || '';
  const base = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  // Use browser crypto.subtle for hashing
  return window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(base + Date.now() + Math.random()))
    .then(buf => {
      const arr = Array.from(new Uint8Array(buf));
      // Convert hash to hex
      const hex = arr.map(b => b.toString(16).padStart(2, '0')).join('');
      return `${hex}${ext}`;
    });
}

/**
 * Upload a file to Supabase storage with obfuscated name
 * @param file The file to upload
 * @returns The public URL string of the uploaded file
 */
export const uploadWebsiteImage = async (file: File): Promise<string> => {
  const fileName = await obfuscateFileName(file.name);
  const filePath = `uploads/${fileName}`;
  const { data, error } = await supabase.storage
    .from('website-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw error;
  }
  // Always return public URL
  const { data: publicData } = supabase.storage
    .from('website-images')
    .getPublicUrl(filePath);

  return publicData.publicUrl;
};
