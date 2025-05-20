import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EyefemImage {
  id: string;
  category: string;
  title: string;
  image_url: string;
  created_at: string;
}

export function useEyefemImages(category?: string) {
  const [images, setImages] = useState<EyefemImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      const query = supabase
        .from('csv_misc_eyefem_images')
        .select('*')
        .order('created_at', { ascending: true });

      if (category) {
        query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching images:', error);
        setError(error.message);
      } else {
        setImages(data || []);
      }

      setLoading(false);
    };

    fetchImages();
  }, [category]);

  return { images, loading, error };
}
