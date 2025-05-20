import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Testimonial {
  id: string;
  author: string;
  title: string;
  quote: string;
  initials: string;
  delay: number;
  created_at: string;
}

export const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);
  
  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('csm_testimonials')
        .select('*')
        .order('created_at');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setTestimonials(data);
      } else {
        console.log('No testimonials found');
        setTestimonials([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error(`Error fetching testimonials: ${err}`);
      // Set default data as fallback
      setTestimonials(getDefaultTestimonials());
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultTestimonials = (): Testimonial[] => [
    {
      id: '1',
      author: 'Priya S.',
      title: 'Patient',
      quote: 'Dr. Nisha is a best Gynaec I ever experienced before meeting with Dr. Nisha I have consulted few other gynae who are just professional with their patients however Dr. Nisha is out of the world, she not listen everyone very patiently n calmly and give personal touch to all. I recommend everyone to consult this doctor and get best advice.',
      initials: 'P',
      delay: 100,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      author: 'Muskan Saarasar',
      title: 'Patient',
      quote: 'I am happy that i have consulted Dr.Nisha for my infertility problem and she help me in dealing with it.',
      initials: 'M',
      delay: 200,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      author: 'Nidhi P.',
      title: 'Patient',
      quote: 'We are blessed to have Dr.Nisha bhatnagar.She made me feel very comfortable in the whole process. She is always available to resolve your queries. It is like a dream come true for me.',
      initials: 'N',
      delay: 300,
      created_at: new Date().toISOString()
    }
  ];

  const updateTestimonial = async (id: string, data: Partial<Testimonial>) => {
    try {
      const { error } = await supabase
        .from('csm_testimonials')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchTestimonials();
      return true;
    } catch (err) {
      console.error(`Error updating testimonial: ${err}`);
      return false;
    }
  };

  const addTestimonial = async (testimonial: Omit<Testimonial, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('csm_testimonials')
        .insert([testimonial]);
      
      if (error) throw error;
      
      await fetchTestimonials();
      return true;
    } catch (err) {
      console.error(`Error adding testimonial: ${err}`);
      return false;
    }
  };

  const deleteTestimonial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('csm_testimonials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchTestimonials();
      return true;
    } catch (err) {
      console.error(`Error deleting testimonial: ${err}`);
      return false;
    }
  };

  return { 
    testimonials, 
    isLoading, 
    error, 
    refreshTestimonials: fetchTestimonials,
    updateTestimonial,
    addTestimonial,
    deleteTestimonial
  };
}; 