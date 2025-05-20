import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EyeCareProcedure {
  id?: number; // Make ID optional since it might not exist in the table yet
  image_url: string;
  alt_text: string;
  title: string;
  description: string;
  created_at?: string;
}

export const useEyeCareProcedures = () => {
  const [procedures, setProcedures] = useState<EyeCareProcedure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchProcedures();
  }, []);

  const fetchProcedures = async () => {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('eye_care_procedures')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      
      // Add temporary IDs if not present in database
      const proceduresWithIds = data?.map((proc, index) => ({
        ...proc,
        id: proc.id || index + 1 // Use existing ID or create a temporary one
      })) || [];

      setProcedures(proceduresWithIds);
    } catch (err) {
      console.error('Error fetching eye care procedures:', err);
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

  const addProcedure = async (
    data: Omit<EyeCareProcedure, 'id' | 'created_at'>,
    imageFile?: File
  ) => {
    try {
      let imageUrl = data.image_url;

      // If a new image is provided, upload it
      if (imageFile) {
        try {
          // Upload to website-images bucket
          const fileName = `eye-procedure-${Date.now()}.${imageFile.name.split('.').pop()}`;
          
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
        .from('eye_care_procedures')
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
        // Assign temporary ID if needed
        const newItem = {
          ...insertData[0],
          id: insertData[0].id || procedures.length + 1
        };
        setProcedures(prev => [...prev, newItem]);
        toast.success('Eye care procedure added successfully');
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error adding eye care procedure:', err);
      toast.error('Failed to add eye care procedure');
      return false;
    }
  };

  const updateProcedure = async (
    id: number,
    data: Partial<Omit<EyeCareProcedure, 'id' | 'created_at'>>,
    imageFile?: File
  ) => {
    try {
      const updates: Partial<Omit<EyeCareProcedure, 'id' | 'created_at'>> = { ...data };

      // Find the procedure in our local state to get the identifier we need
      const procedureToUpdate = procedures.find(p => p.id === id);
      
      if (!procedureToUpdate) {
        throw new Error("Procedure not found");
      }

      // If a new image is provided, upload it
      if (imageFile) {
        try {
          // Upload to website-images bucket
          const fileName = `eye-procedure-${Date.now()}.${imageFile.name.split('.').pop()}`;
          
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

      // Use imageUrl and title as unique identifiers since we don't have an ID column
      const { error: updateError } = await supabase
        .from('eye_care_procedures')
        .update(updates)
        .eq('image_url', procedureToUpdate.image_url)
        .eq('title', procedureToUpdate.title);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setProcedures(prev => 
        prev.map(item => item.id === id ? { ...item, ...updates } : item)
      );
      
      toast.success('Eye care procedure updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating eye care procedure:', err);
      toast.error('Failed to update eye care procedure');
      return false;
    }
  };

  const deleteProcedure = async (id: number) => {
    try {
      // Find the procedure in our local state to get the identifier we need
      const procedureToDelete = procedures.find(p => p.id === id);
      
      if (!procedureToDelete) {
        throw new Error("Procedure not found");
      }

      // Use imageUrl and title as unique identifiers since we don't have an ID column
      const { error } = await supabase
        .from('eye_care_procedures')
        .delete()
        .eq('image_url', procedureToDelete.image_url)
        .eq('title', procedureToDelete.title);

      if (error) {
        throw error;
      }

      setProcedures(prev => prev.filter(item => item.id !== id));
      toast.success('Eye care procedure deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting eye care procedure:', err);
      toast.error('Failed to delete eye care procedure');
      return false;
    }
  };

  return {
    procedures,
    isLoading,
    error,
    addProcedure,
    updateProcedure,
    deleteProcedure,
    refresh: fetchProcedures
  };
}; 