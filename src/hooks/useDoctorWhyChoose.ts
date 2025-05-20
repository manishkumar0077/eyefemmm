import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DoctorChoice {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export const useDoctorWhyChoose = () => {
  const [choices, setChoices] = useState<DoctorChoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchChoices();
  }, []);
  
  const fetchChoices = async () => {
    setIsLoading(true);
    try {
      // Try to create the table if it doesn't exist
      await createTableIfNeeded();
      
      const { data, error } = await supabase
        .from('csm_doctor_why_choose')
        .select('*')
        .order('created_at');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setChoices(data);
      } else {
        // If no data, insert default data
        await insertDefaultData();
        const { data: defaultData } = await supabase
          .from('csm_doctor_why_choose')
          .select('*')
          .order('created_at');
        
        setChoices(defaultData || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error(`Error fetching doctor choices: ${err}`);
      // Set default data for UI even if database operations failed
      setChoices(getDefaultChoices());
    } finally {
      setIsLoading(false);
    }
  };

  // Create table if it doesn't exist (not typically done in client-side code,
  // but we'll add this for demo purposes - in production this should be handled by migrations)
  const createTableIfNeeded = async () => {
    try {
      // Check if table exists by trying to select from it
      const { error } = await supabase
        .from('csm_doctor_why_choose')
        .select('id')
        .limit(1);
      
      // If no error, table exists
      if (!error) return;
      
      // For demo/development purposes only
      console.log('Table csm_doctor_why_choose might not exist, data operations may fail');
    } catch (err) {
      console.error('Error checking table existence:', err);
    }
  };

  const insertDefaultData = async () => {
    try {
      const defaultChoices = getDefaultChoices();
      const { error } = await supabase
        .from('csm_doctor_why_choose')
        .insert(defaultChoices.map(({ id, ...rest }) => rest));
      
      if (error) throw error;
    } catch (err) {
      console.error('Error inserting default data:', err);
      throw err;
    }
  };

  const getDefaultChoices = (): DoctorChoice[] => [
    {
      id: '1',
      title: 'Expert Care',
      description: 'With over 15 years of experience, Dr. Bhatnagar provides expert gynecological and fertility care based on the latest medical research.',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Personalized Approach',
      description: 'Each patient receives a customized treatment plan tailored to their specific health needs and family-building goals.',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Advanced Technology',
      description: 'Our clinic features state-of-the-art technology and the latest advancements in womens healthcare and fertility treatments.',
      created_at: new Date().toISOString()
    }
  ];

  const updateChoice = async (id: string, data: Partial<DoctorChoice>) => {
    try {
      const { error } = await supabase
        .from('csm_doctor_why_choose')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh the data
      await fetchChoices();
      return true;
    } catch (err) {
      console.error(`Error updating choice: ${err}`);
      return false;
    }
  };

  const addChoice = async (choice: Omit<DoctorChoice, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('csm_doctor_why_choose')
        .insert([choice]);
      
      if (error) throw error;
      
      // Refresh the data
      await fetchChoices();
      return true;
    } catch (err) {
      console.error(`Error adding choice: ${err}`);
      return false;
    }
  };

  const deleteChoice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('csm_doctor_why_choose')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh the data
      await fetchChoices();
      return true;
    } catch (err) {
      console.error(`Error deleting choice: ${err}`);
      return false;
    }
  };

  return { 
    choices, 
    isLoading, 
    error, 
    refreshChoices: fetchChoices,
    updateChoice,
    addChoice,
    deleteChoice
  };
}; 