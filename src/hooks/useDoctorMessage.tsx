import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DoctorMessage {
  id: string;
  title: string;
  message_1: string;
  message_2: string;
  author: string;
  created_at?: string;
}

export const useDoctorMessage = () => {
  const [message, setMessage] = useState<DoctorMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('csm_doctor_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (fetchError) throw fetchError;
      
      setMessage(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Error fetching doctor message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    message, 
    isLoading, 
    error, 
    refreshData: fetchData 
  };
};