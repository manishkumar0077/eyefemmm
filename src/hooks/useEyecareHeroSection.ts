import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { uploadWebsiteImage } from '@/integrations/supabase/storage';

export interface EyecareHeroSection {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  created_at: string;
}

export const useEyecareHeroSection = () => {
  const [heroSection, setHeroSection] = useState<EyecareHeroSection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHeroSection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Using any to bypass TypeScript errors with table name
      const { data, error } = await (supabase as any)
        .from('csm_eyecare_hero_sections')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      
      console.log('Fetched hero section:', data);
      setHeroSection(data as EyecareHeroSection || null);
      
    } catch (err) {
      console.error('Error fetching hero section:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const updateHeroSection = async (updates: Partial<EyecareHeroSection>): Promise<boolean> => {
    if (!heroSection) return false;
    
    try {
      // Using any to bypass TypeScript errors with table name
      const { error } = await (supabase as any)
        .from('csm_eyecare_hero_sections')
        .update(updates)
        .eq('id', heroSection.id);
      
      if (error) throw error;
      
      await fetchHeroSection();
      return true;
    } catch (err) {
      console.error('Error updating hero section:', err);
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

  // Fetch hero section when component mounts
  useEffect(() => {
    console.log("Fetching eyecare hero section");
    fetchHeroSection();
  }, []);

  return {
    heroSection,
    isLoading,
    error,
    updateHeroSection,
    uploadImage,
    refreshData: fetchHeroSection
  };
};
