import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DoctorGalleryItem {
  id: number;
  image_url: string;
  alt_text: string;
  title: string;
  description: string;
}

export const useDoctorGallery = () => {
  const [galleryItems, setGalleryItems] = useState<DoctorGalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('csm_doctor_gallery')
        .select('*')
        .order('id', { ascending: true });

      if (fetchError) throw fetchError;
      
      setGalleryItems(data || []);
    } catch (err) {
      console.error('Error fetching doctor gallery:', err);
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

  const addGalleryItem = async (
    data: Omit<DoctorGalleryItem, 'id'>,
    imageFile?: File
  ) => {
    try {
      let imageUrl = data.image_url;

      // If a new image is provided, upload it
      if (imageFile) {
        try {
          // Upload to website-images bucket
          const fileName = `doctor-gallery-${Date.now()}.${imageFile.name.split('.').pop()}`;
          
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
        .from('csm_doctor_gallery')
        .insert([{
          image_url: imageUrl,
          alt_text: data.alt_text,
          title: data.title,
          description: data.description
        }])
        .select();

      if (insertError) {
        throw insertError;
      }

      if (insertData) {
        setGalleryItems(prev => [...prev, insertData[0]]);
        toast.success('Gallery item added successfully');
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error adding gallery item:', err);
      toast.error('Failed to add gallery item');
      return false;
    }
  };

  const updateGalleryItem = async (
    id: number,
    data: Partial<Omit<DoctorGalleryItem, 'id'>>,
    imageFile?: File
  ) => {
    try {
      const updates: Partial<Omit<DoctorGalleryItem, 'id'>> = { ...data };

      // If a new image is provided, upload it
      if (imageFile) {
        try {
          // Upload to website-images bucket
          const fileName = `doctor-gallery-${Date.now()}.${imageFile.name.split('.').pop()}`;
          
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
        .from('csm_doctor_gallery')
        .update(updates)
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setGalleryItems(prev => 
        prev.map(item => item.id === id ? { ...item, ...updates } : item)
      );
      
      toast.success('Gallery item updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating gallery item:', err);
      toast.error('Failed to update gallery item');
      return false;
    }
  };

  const deleteGalleryItem = async (id: number) => {
    try {
      const { error } = await supabase
        .from('csm_doctor_gallery')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setGalleryItems(prev => prev.filter(item => item.id !== id));
      toast.success('Gallery item deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting gallery item:', err);
      toast.error('Failed to delete gallery item');
      return false;
    }
  };

  return {
    galleryItems,
    isLoading,
    error,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    refresh: fetchGalleryItems
  };
}; 