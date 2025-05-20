import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SectionContent {
  id: string;
  section: string;
  heading: string;
  description: string;
}

interface BenefitCard {
  id: string;
  section: string;
  title: string;
  description: string;
}

export const useWhyChooseUs = (sectionId = 'why_choose_us') => {
  const [sectionContent, setSectionContent] = useState<SectionContent | null>(null);
  const [benefitCards, setBenefitCards] = useState<BenefitCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchContent(sectionId);
  }, [sectionId]);
  
  const fetchContent = async (section: string) => {
    setIsLoading(true);
    try {
      // Fetch section heading and description
      const { data: sectionData, error: sectionError } = await supabase
        .from('csm_landingpage_why_choose_us_section')
        .select()
        .eq('section', section)
        .single();
      
      if (sectionError) throw sectionError;
      
      // Fetch benefit cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('csm_landingpage_why_choose_us_cards')
        .select()
        .eq('section', section)
        .order('created_at');
      
      if (cardsError) throw cardsError;
      
      setSectionContent(sectionData);
      setBenefitCards(cardsData || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error(`Error fetching Why Choose Us content: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    sectionContent, 
    benefitCards, 
    isLoading, 
    error, 
    refreshContent: () => fetchContent(sectionId) 
  };
};