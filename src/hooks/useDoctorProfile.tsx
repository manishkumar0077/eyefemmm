import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DoctorProfile {
  id: string;
  full_name: string;
  title: string;
  description: string;
  appointment_url: string;
  image_url?: string;
  created_at?: string;
}

export const useDoctorProfile = (doctorId?: string) => {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchData();
  }, [doctorId]);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      let result;
      
      // If a specific doctor ID is provided, query by ID
      if (doctorId) {
        result = await supabase
          .from('csm_doctor_profiles')
          .select('*')
          .eq('id', doctorId)
          .single();
      } else {
        // Try to get Dr. Lehri first
        result = await supabase
          .from('csm_doctor_profiles')
          .select('*')
          .eq('full_name', 'Dr. Sanjeev Lehri')
          .single();
          
        // If no results, get the first doctor
        if (result.error) {
          result = await supabase
            .from('csm_doctor_profiles')
            .select('*')
            .limit(1)
            .single();
        }
      }
      
      if (result.error) throw result.error;
      
      setProfile(result.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Error fetching doctor profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert file to data URL as fallback
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const updateProfile = async (
    data: Partial<DoctorProfile>,
    imageFile?: File
  ) => {
    try {
      const updates = { ...data };
      
      // If a new image is provided, upload it
      if (imageFile) {
        try {
          // Upload to website-images bucket
          const fileName = `doctor-${Date.now()}.${imageFile.name.split('.').pop()}`;
          
          const { error: uploadError } = await supabase.storage
            .from('website-images')
            .upload(`uploads/${fileName}`, imageFile);
          
          if (uploadError) {
            console.error("Upload error:", uploadError);
            // Fallback to data URL
            updates.image_url = await fileToDataURL(imageFile);
          } else {
            const { data: urlData } = supabase.storage
              .from('website-images')
              .getPublicUrl(`uploads/${fileName}`);
              
            if (urlData?.publicUrl) {
              updates.image_url = urlData.publicUrl;
            }
          }
        } catch (uploadErr) {
          console.error('Error uploading image:', uploadErr);
          // Fallback to data URL
          updates.image_url = await fileToDataURL(imageFile);
        }
      }
      
      // Update the profile in the database
      const { error: updateError } = await supabase
        .from('csm_doctor_profiles')
        .update(updates)
        .eq('id', profile?.id || data.id);

      if (updateError) throw updateError;
      
      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      toast.success('Doctor profile updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating doctor profile:', err);
      toast.error('Failed to update doctor profile');
      return false;
    }
  };

  return { 
    profile, 
    isLoading, 
    error, 
    refreshData: fetchData,
    updateProfile 
  };
};