import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { uploadWebsiteImage } from '@/integrations/supabase/storage';

export interface AdvancedProcedure {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image_url?: string;
  created_at: string;
}

export const useGyneAdvancedProcedures = () => {
  const [procedure, setProcedure] = useState<AdvancedProcedure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchProcedure();
  }, []);
  
  const fetchProcedure = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('csm_gyne_advanced_procedures')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected if no data exists yet
        throw error;
      }
      
      if (data) {
        setProcedure(data);
      } else {
        // If no data, insert default data
        await insertDefaultData();
        const { data: defaultData, error: fetchError } = await supabase
          .from('csm_gyne_advanced_procedures')
          .select('*')
          .single();
        
        if (fetchError) throw fetchError;
        setProcedure(defaultData);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error(`Error fetching advanced procedure: ${err}`);
      // Set default data for UI even if database operations failed
      setProcedure(getDefaultProcedure());
    } finally {
      setIsLoading(false);
    }
  };

  const insertDefaultData = async () => {
    try {
      const defaultProcedure = getDefaultProcedure();
      const { id, created_at, ...dataToInsert } = defaultProcedure;
      
      const { error } = await supabase
        .from('csm_gyne_advanced_procedures')
        .insert([dataToInsert]);
      
      if (error) throw error;
    } catch (err) {
      console.error('Error inserting default data:', err);
      throw err;
    }
  };

  const getDefaultProcedure = (): AdvancedProcedure => ({
    id: '1',
    title: 'Advanced Procedures',
    subtitle: 'Dr. Bhatnagar specializes in advanced gynecological procedures using cutting-edge technology',
    description: 'Dr. Bhatnagar utilizes the latest technology in gynecology to provide precise diagnoses and effective treatments. Her clinic features state-of-the-art equipment including:\n• 4D Ultrasound imaging for detailed fetal assessment\n• Hysteroscopy for minimally invasive diagnosis and treatment\n• Advanced IVF laboratory equipment\n• Laparoscopic surgery tools for minimally invasive procedures\n• Colposcopy for detailed cervical examination\nThese advanced technologies enable Dr. Bhatnagar to provide the highest standard of care while minimizing discomfort and recovery time for her patients.',
    image_url: '',
    created_at: new Date().toISOString()
  });

  const updateProcedure = async (data: Partial<AdvancedProcedure>) => {
    try {
      if (!procedure?.id) return false;
      
      const { error } = await supabase
        .from('csm_gyne_advanced_procedures')
        .update(data)
        .eq('id', procedure.id);
      
      if (error) throw error;
      
      // Refresh the data
      await fetchProcedure();
      return true;
    } catch (err) {
      console.error(`Error updating procedure: ${err}`);
      return false;
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // Upload to website-images bucket
      const imageUrl = await uploadWebsiteImage(file);
      return imageUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      return null;
    }
  };

  return { 
    procedure, 
    isLoading, 
    error, 
    refreshProcedure: fetchProcedure,
    updateProcedure,
    uploadImage
  };
}; 