import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { uploadWebsiteImage } from '@/integrations/supabase/storage';

interface WhyChooseSection {
  id: string;
  heading: string;
  description: string;
  image_url?: string;
}

interface FeatureItem {
  id: string;
  feature_text: string;
  display_order: number;
}

export const useEyeCareWhyChoose = () => {
  const [section, setSection] = useState<WhyChooseSection | null>(null);
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch section heading and description
      const { data: sectionData, error: sectionError } = await (supabase as any)
        .from('csm_eyecare_why_choose_section')
        .select('*')
        .single();
      
      if (sectionError) throw sectionError;
      
      // Fetch features list
      const { data: featuresData, error: featuresError } = await supabase
        .from('csm_eyecare_why_choose_features')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (featuresError) throw featuresError;
      
      setSection(sectionData);
      setFeatures(featuresData || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Error fetching eye care why choose section:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSection = async (updates: Partial<WhyChooseSection>): Promise<boolean> => {
    if (!section) return false;
    
    try {
      const { error } = await (supabase as any)
        .from('csm_eyecare_why_choose_section')
        .update(updates)
        .eq('id', section.id);
      
      if (error) throw error;
      
      await fetchData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Error updating why choose section:', err);
      return false;
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const imageUrl = await uploadWebsiteImage(file);
      return imageUrl;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Error uploading image:', err);
      return null;
    }
  };

  return { 
    section, 
    features, 
    isLoading, 
    error, 
    refreshData: fetchData,
    updateSection,
    uploadImage
  };
};
