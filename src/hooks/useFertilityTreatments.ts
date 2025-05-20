import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FertilityTreatmentData {
  id: number;
  title: string;
  description: string;
  treatments: string[];
  image_url?: string;
}

export const useFertilityTreatments = () => {
  const [fertilityData, setFertilityData] = useState<FertilityTreatmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('csm_gynecology_fertility')
        .select('*')
        .order('id', { ascending: true })
        .limit(1)
        .single();

      if (fetchError) throw fetchError;

      const treatments = data.treatments ? 
        Array.isArray(data.treatments) ? 
          data.treatments : 
          JSON.parse(data.treatments) : 
        [];

      setFertilityData({
        ...data,
        treatments: treatments
      });
    } catch (err) {
      console.error('Error fetching fertility data:', err);
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

  const updateData = async (
    data: Partial<Omit<FertilityTreatmentData, 'id'>>,
    imageFile?: File
  ) => {
    try {
      const updates: Partial<Omit<FertilityTreatmentData, 'id'>> = { ...data };
      
      // Handle treatments - ensure it's stringified if needed
      if (updates.treatments && Array.isArray(updates.treatments)) {
        updates.treatments = updates.treatments;
      }

      // If a new image is provided, upload it
      if (imageFile) {
        try {
          // Upload to website-images bucket
          const fileName = `fertility-${Date.now()}.${imageFile.name.split('.').pop()}`;
          
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

      // Update the record
      const { error: updateError } = await supabase
        .from('csm_gynecology_fertility')
        .update(updates)
        .eq('id', fertilityData?.id || 1); // Use existing ID or default to 1

      if (updateError) throw updateError;

      // Update local state
      if (fertilityData) {
        setFertilityData({
          ...fertilityData,
          ...updates
        });
      }

      toast.success('Fertility data updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating fertility data:', err);
      toast.error('Failed to update fertility data');
      return false;
    }
  };

  return {
    fertilityData,
    isLoading,
    error,
    updateData,
    refreshData: fetchData
  };
}; 