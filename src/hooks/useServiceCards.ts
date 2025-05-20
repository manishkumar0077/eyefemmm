import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ServiceCard {
  id: string;
  section: string;
  title: string;
  description: string;
  created_at: string;
}

export const useServiceCards = (section = 'home_services_section') => {
  const [cards, setCards] = useState<ServiceCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchCards(section);
  }, [section]);
  
  const fetchCards = async (sectionName: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('csm_landingpage_service_cards')
        .select()
        .eq('section', sectionName)
        .order('created_at');
      
      if (error) throw error;
      setCards(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error(`Error fetching service cards: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return { cards, isLoading, error, refreshCards: () => fetchCards(section) };
};