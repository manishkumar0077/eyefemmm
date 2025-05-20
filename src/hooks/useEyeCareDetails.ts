import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EyeCareDetail {
  id: number;
  content: string;
  type: 'paragraph' | 'bullet';
}

export const useEyeCareDetails = () => {
  const [details, setDetails] = useState<EyeCareDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('eye_care_details')
        .select('*')
        .order('id', { ascending: true });

      if (fetchError) throw fetchError;
      
      setDetails(data || []);
    } catch (err) {
      console.error('Error fetching eye care details:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const addDetail = async (detail: Omit<EyeCareDetail, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('eye_care_details')
        .insert([detail])
        .select();

      if (error) throw error;

      if (data) {
        setDetails(prev => [...prev, data[0]]);
        toast.success('Detail added successfully');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding eye care detail:', err);
      toast.error('Failed to add detail');
      return false;
    }
  };

  const updateDetail = async (id: number, updates: Partial<Omit<EyeCareDetail, 'id'>>) => {
    try {
      const { error } = await supabase
        .from('eye_care_details')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setDetails(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      toast.success('Detail updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating eye care detail:', err);
      toast.error('Failed to update detail');
      return false;
    }
  };

  const deleteDetail = async (id: number) => {
    try {
      const { error } = await supabase
        .from('eye_care_details')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDetails(prev => prev.filter(item => item.id !== id));
      toast.success('Detail deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting eye care detail:', err);
      toast.error('Failed to delete detail');
      return false;
    }
  };

  return {
    details,
    isLoading,
    error,
    addDetail,
    updateDetail,
    deleteDetail,
    refresh: fetchDetails
  };
}; 