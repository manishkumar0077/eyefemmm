import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GynecologyProcedure {
  id: number;
  image_url: string;
  alt_text: string;
  title: string;
  description: string;
  created_at: string;
}

export const useGynecologyProcedures = () => {
  const [procedures, setProcedures] = useState<GynecologyProcedure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use useCallback to prevent unnecessary re-renders
  const fetchProcedures = useCallback(async () => {
    console.log("Fetching gynecology procedures...");
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('csm_gynecology_procedures')
        .select('*')
        .order('id', { ascending: true });
      
      if (error) {
        console.error("Error fetching procedures:", error);
        throw error;
      }
      
      console.log("Procedures data fetched:", data);
      
      if (data) {
        setProcedures(data as GynecologyProcedure[]);
      } else {
        console.log('No procedures found');
        setProcedures([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error(`Error fetching procedures data: ${err}`);
      setProcedures([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProcedures();
  }, [fetchProcedures]);

  const updateProcedure = async (id: number, data: Partial<GynecologyProcedure>, imageFile?: File) => {
    try {
      console.log("Updating procedure", id, "with data:", data);
      let imageUrl = data.image_url;
      
      // Upload image if provided
      if (imageFile) {
        console.log("Uploading new image for procedure", id);
        // Create a unique file name with timestamp and extension
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `gynecology-procedure-${id}-${Date.now()}.${fileExt}`;
        
        // Upload to website-images bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('website-images')
          .upload(`gynecology-procedures/${fileName}`, imageFile, {
            upsert: true,
            cacheControl: '3600'
          });
          
        if (uploadError) {
          console.error("Image upload error:", uploadError);
          throw uploadError;
        }
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('website-images')
          .getPublicUrl(`gynecology-procedures/${fileName}`);
          
        if (publicUrlData) {
          imageUrl = publicUrlData.publicUrl;
          console.log("New image URL:", imageUrl);
        }
      }
      
      // Update procedure data
      const { error } = await supabase
        .from('csm_gynecology_procedures')
        .update({
          ...data,
          ...(imageFile ? { image_url: imageUrl } : {})
        })
        .eq('id', id);
      
      if (error) {
        console.error("Error updating procedure in database:", error);
        throw error;
      }
      
      console.log("Procedure updated successfully, refreshing data");
      await fetchProcedures();
      return true;
    } catch (err) {
      console.error(`Error updating procedure:`, err);
      return false;
    }
  };

  const addProcedure = async (data: Omit<GynecologyProcedure, 'id' | 'created_at'>, imageFile?: File) => {
    try {
      console.log("Adding new procedure with data:", data);
      let imageUrl = data.image_url;
      
      // Upload image if provided
      if (imageFile) {
        console.log("Uploading image for new procedure");
        // Create a unique file name with timestamp and extension
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `gynecology-procedure-new-${Date.now()}.${fileExt}`;
        
        // Upload to website-images bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('website-images')
          .upload(`gynecology-procedures/${fileName}`, imageFile, {
            upsert: true,
            cacheControl: '3600'
          });
          
        if (uploadError) {
          console.error("Image upload error:", uploadError);
          throw uploadError;
        }
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('website-images')
          .getPublicUrl(`gynecology-procedures/${fileName}`);
          
        if (publicUrlData) {
          imageUrl = publicUrlData.publicUrl;
          console.log("New image URL:", imageUrl);
        }
      }
      
      // Insert new procedure
      const { error } = await supabase
        .from('csm_gynecology_procedures')
        .insert({
          ...data,
          image_url: imageUrl
        });
      
      if (error) {
        console.error("Error adding procedure to database:", error);
        throw error;
      }
      
      console.log("Procedure added successfully, refreshing data");
      await fetchProcedures();
      return true;
    } catch (err) {
      console.error(`Error adding procedure:`, err);
      return false;
    }
  };

  const deleteProcedure = async (id: number) => {
    try {
      console.log("Deleting procedure", id);
      const { error } = await supabase
        .from('csm_gynecology_procedures')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting procedure:", error);
        throw error;
      }
      
      console.log("Procedure deleted successfully, refreshing data");
      await fetchProcedures();
      return true;
    } catch (err) {
      console.error(`Error deleting procedure:`, err);
      return false;
    }
  };

  return { 
    procedures, 
    isLoading, 
    error, 
    refreshData: fetchProcedures,
    updateProcedure,
    addProcedure,
    deleteProcedure
  };
};
