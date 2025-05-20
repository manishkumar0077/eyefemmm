import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ServiceHighlight {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  created_at?: string;
}

export const useServiceHighlights = () => {
  const [highlights, setHighlights] = useState<ServiceHighlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchHighlights();
  }, []);

  const fetchHighlights = async () => {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('csm_service_highlights')
        .select('*')
        .order('id', { ascending: true });

      if (fetchError) throw fetchError;
      
      setHighlights(data || []);
    } catch (err) {
      console.error('Error fetching service highlights:', err);
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

  const addHighlight = async (
    data: Omit<ServiceHighlight, 'id' | 'created_at'>,
    imageFile?: File
  ) => {
    try {
      let imageUrl = data.image_url || '';

      // If a new image is provided, upload it
      if (imageFile) {
        try {
          // Upload to website-images bucket
          const fileName = `service-highlight-${Date.now()}.${imageFile.name.split('.').pop()}`;
          
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
        .from('csm_service_highlights')
        .insert([{
          title: data.title,
          description: data.description,
          image_url: imageUrl
        }])
        .select();

      if (insertError) {
        throw insertError;
      }

      if (insertData) {
        setHighlights(prev => [...prev, insertData[0]]);
        toast.success('Service highlight added successfully');
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error adding service highlight:', err);
      toast.error('Failed to add service highlight');
      return false;
    }
  };

  const updateHighlight = async (
    id: number,
    data: Partial<Omit<ServiceHighlight, 'id' | 'created_at'>>,
    imageFile?: File
  ) => {
    try {
      const updates: Partial<Omit<ServiceHighlight, 'id' | 'created_at'>> = { ...data };

      // If a new image is provided, upload it
      if (imageFile) {
        try {
          // Upload to website-images bucket
          const fileName = `service-highlight-${Date.now()}.${imageFile.name.split('.').pop()}`;
          
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
        .from('csm_service_highlights')
        .update(updates)
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setHighlights(prev => 
        prev.map(item => item.id === id ? { ...item, ...updates } : item)
      );
      
      toast.success('Service highlight updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating service highlight:', err);
      toast.error('Failed to update service highlight');
      return false;
    }
  };

  const deleteHighlight = async (id: number) => {
    try {
      const { error } = await supabase
        .from('csm_service_highlights')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setHighlights(prev => prev.filter(item => item.id !== id));
      toast.success('Service highlight deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting service highlight:', err);
      toast.error('Failed to delete service highlight');
      return false;
    }
  };

  return {
    highlights,
    isLoading,
    error,
    addHighlight,
    updateHighlight,
    deleteHighlight,
    refresh: fetchHighlights
  };
}; 