import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Qualification {
  id: string;
  title: string;
  description: string;
  degree?: string; // For backward compatibility
  institution?: string; // For backward compatibility
  years?: string; // For backward compatibility
  created_at?: string;
}

export const useDoctorQualifications = () => {
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Using any type for data as the table may not be in the TypeScript definitions
      const { data, error: fetchError } = await supabase
        .from('csm_doctor_qualifications')
        .select('*')
        .order('created_at') as { data: any[], error: any };
      
      if (fetchError) throw fetchError;
      
      // Transform the data to match the Qualification interface
      const transformedData: Qualification[] = (data || []).map(item => ({
        id: item.id,
        title: item.title || '',
        description: item.description || '',
        // Keep backward compatibility fields
        degree: item.title || '',
        institution: item.description || '',
        years: '',
        created_at: item.created_at
      }));
      
      setQualifications(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Error fetching doctor qualifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    qualifications, 
    isLoading, 
    error, 
    refreshData: fetchData 
  };
}; 