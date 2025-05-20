import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConditionsSection {
  id: string;
  heading: string;
  description: string;
}

interface EyeCondition {
  id: string;
  title: string;
  description: string;
  display_order: number;
}

export const useEyeCareConditions = () => {
  const [section, setSection] = useState<ConditionsSection | null>(null);
  const [conditions, setConditions] = useState<EyeCondition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch section heading and description
      const { data: sectionData, error: sectionError } = await supabase
        .from('csm_eyecare_conditions_section')
        .select('*')
        .single();
      
      if (sectionError) throw sectionError;
      
      // Fetch eye conditions
      const { data: conditionsData, error: conditionsError } = await supabase
        .from('csm_eyecare_conditions')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (conditionsError) throw conditionsError;
      
      setSection(sectionData);
      setConditions(conditionsData || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Error fetching eye care conditions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    section, 
    conditions, 
    isLoading, 
    error, 
    refreshData: fetchData 
  };
};
