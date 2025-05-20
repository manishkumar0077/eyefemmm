// src/hooks/usePageContent.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// TODO: Add proper type definition for Database
type PageContent = {
  id: number;
  name: string;
  content: string;
  created_at: string;
};

export const usePageContent = (contentName: string) => {
  const [content, setContent] = useState<PageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchContent(contentName);
  }, [contentName]);
  
  const fetchContent = async (name: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('csm_landingpage_getstarted')
        .select()
        .eq('name', name)
        .single();
      
      if (error) throw error;
      setContent(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error(`Error fetching content: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return { content, isLoading, error };
};