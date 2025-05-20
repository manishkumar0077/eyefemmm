import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GynecologyService {
  id: string;
  title: string;
  description: string;
  display_order: number;
  created_at: string;
}

export const useGynecologyServices = () => {
  const [services, setServices] = useState<GynecologyService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);
  
  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('csm_gynecology_services')
        .select()
        .order('display_order');
      
      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error(`Error fetching gynecology services: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    services, 
    isLoading, 
    error, 
    refreshServices: fetchServices 
  };
}; 