import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GyneQualification {
  id: string;
  degree_title: string;
  institution: string;
  type: 'degree' | 'certification' | 'registration';
  sort_order: number;
  created_at: string;
}

export const useGyneQualifications = () => {
  const [qualifications, setQualifications] = useState<GyneQualification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchQualifications();
  }, []);
  
  const fetchQualifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('csm_gyne_qualifications')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setQualifications(data);
      } else {
        console.log('No qualifications found');
        setQualifications(getDefaultQualifications());
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error(`Error fetching qualifications: ${err}`);
      // Set default data as fallback
      setQualifications(getDefaultQualifications());
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultQualifications = (): GyneQualification[] => [
    {
      id: '1',
      degree_title: 'M.B.B.S.',
      institution: 'Dr. B.S.A. University, Aurangabad, Maharashtra',
      type: 'degree',
      sort_order: 1,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      degree_title: 'M.D. (Obstetrics & Gynecology)',
      institution: 'Dr. B.S.A. University, Aurangabad, Maharashtra',
      type: 'degree',
      sort_order: 2,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      degree_title: 'IVF Specialist',
      institution: 'Specialized training in advanced reproductive technologies',
      type: 'certification',
      sort_order: 3,
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      degree_title: 'Registered with Delhi Medical Council',
      institution: 'Delhi Medical Council',
      type: 'registration',
      sort_order: 4,
      created_at: new Date().toISOString()
    },
    {
      id: '5',
      degree_title: 'PCPNDT Licensed',
      institution: 'Government of India',
      type: 'registration',
      sort_order: 5,
      created_at: new Date().toISOString()
    }
  ];

  const updateQualification = async (id: string, data: Partial<GyneQualification>) => {
    try {
      const { error } = await supabase
        .from('csm_gyne_qualifications')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchQualifications();
      return true;
    } catch (err) {
      console.error(`Error updating qualification: ${err}`);
      return false;
    }
  };

  const addQualification = async (qualification: Omit<GyneQualification, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('csm_gyne_qualifications')
        .insert([qualification]);
      
      if (error) throw error;
      
      await fetchQualifications();
      return true;
    } catch (err) {
      console.error(`Error adding qualification: ${err}`);
      return false;
    }
  };

  const deleteQualification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('csm_gyne_qualifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchQualifications();
      return true;
    } catch (err) {
      console.error(`Error deleting qualification: ${err}`);
      return false;
    }
  };

  return { 
    qualifications, 
    isLoading, 
    error, 
    refreshQualifications: fetchQualifications,
    updateQualification,
    addQualification,
    deleteQualification
  };
}; 