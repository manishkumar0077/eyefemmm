import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Testimonial {
  id: string;
  name: string;
  initial: string;
  role: string;
  content: string;
  created_at?: string;
}

// Optional category parameter allows filtering by page if needed in the future
export const useEyeTestimonials = (category?: string) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchData();
  }, [category]);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('csm_eye_testimonials')
        .select('*')
        .order('created_at', { ascending: false });
        
      // Add category filtering if implemented in the future
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      setTestimonials(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Error fetching eye testimonials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    testimonials, 
    isLoading, 
    error, 
    refreshData: fetchData 
  };
};
