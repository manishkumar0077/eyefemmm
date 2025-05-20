import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DoctorGyne {
  id: string;
  name: string;
  title: string;
  description: string;
  image_url?: string | null;
  created_at: string;
}

export const useDoctorGyne = () => {
  const [doctor, setDoctor] = useState<DoctorGyne | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchDoctorData();
  }, []);
  
  const fetchDoctorData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('csm_doctors_gyne')
        .select('*')
        .single();
      
      if (error) throw error;
      
      if (data) {
        setDoctor(data as DoctorGyne);
      } else {
        console.log('No doctor data found');
        setDoctor(getDefaultDoctor());
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error(`Error fetching doctor data: ${err}`);
      // Set default data as fallback
      setDoctor(getDefaultDoctor());
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultDoctor = (): DoctorGyne => ({
    id: '1',
    name: 'Dr. Nisha Bhatnagar',
    title: 'Senior Gynecologist & Fertility Specialist',
    description: 'With over 15 years of experience, Dr. Nisha Bhatnagar is a renowned gynecologist specializing in women\'s health, fertility treatments, and reproductive medicine.',
    image_url: null,
    created_at: new Date().toISOString()
  });

  const updateDoctorData = async (data: Partial<DoctorGyne>, imageFile?: File) => {
    if (!doctor) return false;
    
    try {
      let imageUrl = doctor.image_url;
      
      // Upload image if provided
      if (imageFile) {
        // Create a unique file name with timestamp and extension
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `doctor-gyne-${Date.now()}.${fileExt}`;
        
        // Upload to website-images bucket - using the correct bucket from error message
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('website-images')  // Changed from 'public' to 'website-images'
          .upload(`doctor-images/${fileName}`, imageFile, {
            upsert: true,
            cacheControl: '3600'
          });
          
        if (uploadError) {
          console.error("Image upload error:", uploadError);
          throw uploadError;
        }
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('website-images')  // Changed from 'public' to 'website-images'
          .getPublicUrl(`doctor-images/${fileName}`);
          
        if (publicUrlData) {
          imageUrl = publicUrlData.publicUrl;
        }
      }
      
      // Update doctor data
      const { error } = await supabase
        .from('csm_doctors_gyne')
        .update({
          ...data,
          ...(imageFile ? { image_url: imageUrl } : {})
        })
        .eq('id', doctor.id);
      
      if (error) throw error;
      
      await fetchDoctorData();
      return true;
    } catch (err) {
      console.error(`Error updating doctor data:`, err);
      return false;
    }
  };

  return { 
    doctor, 
    isLoading, 
    error, 
    refreshData: fetchDoctorData,
    updateDoctorData
  };
}; 