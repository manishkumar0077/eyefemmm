import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DoctorSpeciality {
  id: number;
  name: string;
  specialization: string;
  image_url: string;
}

export const useDoctorSpecialities = () => {
  const [specialities, setSpecialities] = useState<DoctorSpeciality[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchSpecialities();
  }, []);

  const fetchSpecialities = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('csm_doctors_profile_specilities')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        throw error;
      }

      setSpecialities(data || []);
    } catch (err) {
      console.error('Error fetching doctor specialities:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
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

  const addSpeciality = async (
    data: Omit<DoctorSpeciality, 'id'>,
    imageFile?: File
  ) => {
    try {
      let imageUrl = data.image_url;

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
            imageUrl = await fileToDataURL(imageFile);
          } else {
            const { data: urlData } = supabase.storage
              .from('website-images')
              .getPublicUrl(`uploads/${fileName}`);
              
            if (urlData?.publicUrl) {
              imageUrl = urlData.publicUrl;
            }
          }
        } catch (uploadErr) {
          console.error('Error uploading image:', uploadErr);
          // Fallback to data URL
          imageUrl = await fileToDataURL(imageFile);
        }
      }

      const { data: insertData, error: insertError } = await supabase
        .from('csm_doctors_profile_specilities')
        .insert([{
          name: data.name,
          specialization: data.specialization,
          image_url: imageUrl
        }])
        .select();

      if (insertError) {
        throw insertError;
      }

      if (insertData) {
        setSpecialities(prev => [...prev, insertData[0]]);
        toast.success('Doctor speciality added successfully');
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error adding doctor speciality:', err);
      toast.error('Failed to add doctor speciality');
      return false;
    }
  };

  const updateSpeciality = async (
    id: number,
    data: Partial<Omit<DoctorSpeciality, 'id'>>,
    imageFile?: File
  ) => {
    try {
      const updates: Partial<Omit<DoctorSpeciality, 'id'>> = { ...data };

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

      const { error: updateError } = await supabase
        .from('csm_doctors_profile_specilities')
        .update(updates)
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setSpecialities(prev => 
        prev.map(item => item.id === id ? { ...item, ...updates } : item)
      );
      
      toast.success('Doctor speciality updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating doctor speciality:', err);
      toast.error('Failed to update doctor speciality');
      return false;
    }
  };

  const deleteSpeciality = async (id: number) => {
    try {
      const { error } = await supabase
        .from('csm_doctors_profile_specilities')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setSpecialities(prev => prev.filter(item => item.id !== id));
      toast.success('Doctor speciality deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting doctor speciality:', err);
      toast.error('Failed to delete doctor speciality');
      return false;
    }
  };

  return {
    specialities,
    isLoading,
    error,
    addSpeciality,
    updateSpeciality,
    deleteSpeciality,
    refresh: fetchSpecialities
  };
}; 