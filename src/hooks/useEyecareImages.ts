import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { uploadWebsiteImage } from '@/integrations/supabase/storage';

export interface EyecareImage {
  id: number;
  category: string;
  title: string;
  image_url: string;
  created_at: string;
}

export const useEyecareImages = (initialCategory?: string) => {
  const [images, setImages] = useState<EyecareImage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string | undefined>(initialCategory);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Preload images for better UX
  const preloadImages = (imageUrls: string[]) => {
    imageUrls.forEach(url => {
      if (url) {
        const img = new Image();
        img.src = url;
      }
    });
  };

  // Fetch images when component mounts or category changes
  useEffect(() => {
    console.log("Fetching images for category:", currentCategory);
    fetchImages();
  }, [currentCategory]);

  // Fetch all available categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Using any to bypass TypeScript errors with table name
      const { data, error } = await (supabase as any)
        .from('csm_misc_eyecare_images')
        .select('category')
        .order('category');

      if (error) throw error;

      // Extract unique categories
      const uniqueCategories = Array.from(new Set((data as any[]).map(item => item.category)));
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  const fetchImages = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Using any to bypass TypeScript errors with table name
      let query = (supabase as any)
        .from('csm_misc_eyecare_images')
        .select('*')
        .order('title');
      
      // Filter by category if specified
      if (currentCategory) {
        query = query.eq('category', currentCategory);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log(`Fetched ${data?.length || 0} images for category: ${currentCategory}`, data);
      
      const fetchedImages = data as EyecareImage[] || [];
      setImages(fetchedImages);
      
      // Preload images for instant display
      if (fetchedImages.length > 0) {
        preloadImages(fetchedImages.map(img => img.image_url));
      }
      
    } catch (err) {
      console.error('Error fetching eyecare images:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const addImage = async (newImage: { category: string; title: string; image_url: string; }): Promise<boolean> => {
    try {
      // Using any to bypass TypeScript errors with table name
      const { error } = await (supabase as any)
        .from('csm_misc_eyecare_images')
        .insert([newImage]);
      
      if (error) throw error;
      
      await fetchImages();
      return true;
    } catch (err) {
      console.error('Error adding image:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };

  const updateImage = async (id: number, updates: Partial<EyecareImage>): Promise<boolean> => {
    try {
      // Using any to bypass TypeScript errors with table name
      const { error } = await (supabase as any)
        .from('csm_misc_eyecare_images')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchImages();
      return true;
    } catch (err) {
      console.error('Error updating image:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };

  const deleteImage = async (id: number): Promise<boolean> => {
    try {
      // Using any to bypass TypeScript errors with table name
      const { error } = await (supabase as any)
        .from('csm_misc_eyecare_images')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchImages();
      return true;
    } catch (err) {
      console.error('Error deleting image:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const imageUrl = await uploadWebsiteImage(file);
      return imageUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  const refreshData = () => {
    console.log("Manually refreshing data...");
    fetchImages();
    fetchCategories();
  };

  return {
    images,
    categories,
    isLoading,
    error,
    currentCategory,
    setCurrentCategory,
    addImage,
    updateImage,
    deleteImage,
    uploadImage,
    refreshData
  };
}; 