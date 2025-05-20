import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DoctorGyneMessage {
  id: string;
  doctor_name: string;
  heading: string;
  message_1: string;
  message_2: string;
  signature: string;
  created_at: string;
}

export const useDoctorGyneMessage = () => {
  const [message, setMessage] = useState<DoctorGyneMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchMessage();
  }, []);
  
  const fetchMessage = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('csm_gyne_doctor_messages')
        .select('*')
        .single();
      
      if (error) throw error;
      
      if (data) {
        setMessage(data);
      } else {
        console.log('No doctor message found');
        setMessage(getDefaultMessage());
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error(`Error fetching doctor message: ${err}`);
      // Set default data as fallback
      setMessage(getDefaultMessage());
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultMessage = (): DoctorGyneMessage => ({
    id: '1',
    doctor_name: 'Dr. Nisha Bhatnagar',
    heading: 'A Message From Dr. Nisha Bhatnagar',
    message_1: 'I believe that every woman deserves personalized care that addresses not just her physical health, but her emotional well-being too. My mission has always been to combine advanced medical techniques with compassion to support women through all life stages.',
    message_2: 'Whether you\'re seeking general gynecological care, struggling with fertility, or navigating menopause, my team and I are committed to providing you with an exceptional experience and the best possible outcomes for your health.',
    signature: '- Dr. Nisha Bhatnagar',
    created_at: new Date().toISOString()
  });

  const updateMessage = async (data: Partial<DoctorGyneMessage>) => {
    if (!message) return false;
    
    try {
      const { error } = await supabase
        .from('csm_gyne_doctor_messages')
        .update(data)
        .eq('id', message.id);
      
      if (error) throw error;
      
      await fetchMessage();
      return true;
    } catch (err) {
      console.error(`Error updating doctor message: ${err}`);
      return false;
    }
  };

  return { 
    message, 
    isLoading, 
    error, 
    refreshMessage: fetchMessage,
    updateMessage
  };
}; 