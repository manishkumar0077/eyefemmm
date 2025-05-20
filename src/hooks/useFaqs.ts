import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  created_at: string;
}

export const useFaqs = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchFaqs();
  }, []);
  
  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('csm_faqs')
        .select('*')
        .order('created_at');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setFaqs(data);
      } else {
        console.log('No FAQs found');
        setFaqs([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error(`Error fetching FAQs: ${err}`);
      // Set default data as fallback
      setFaqs(getDefaultFaqs());
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultFaqs = (): FAQ[] => [
    {
      id: '1',
      question: 'When should I see a gynecologist?',
      answer: 'Women should begin seeing a gynecologist for annual check-ups around age 21, or earlier if they become sexually active. You should also consult a gynecologist if you experience abnormal symptoms such as irregular periods, pelvic pain, unusual discharge, or if you are planning to become pregnant.',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      question: 'How long does it usually take to get pregnant?',
      answer: 'For most couples, it takes about 6-12 months of active trying to conceive. However, this varies widely based on factors such as age, overall health, and frequency of intercourse. If you are under 35 and have been trying for over a year without success, or over 35 and have been trying for 6 months, we recommend scheduling a fertility consultation.',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      question: 'What are the success rates for IVF treatment?',
      answer: 'Success rates for IVF vary based on several factors, including age, cause of infertility, and previous pregnancy history. At our clinic, women under 35 typically have success rates of 40-45% per cycle, while women 35-40 have around 30-35% success rates. We provide personalized assessments to give you a more accurate understanding of your specific chances.',
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      question: 'Is laparoscopic surgery painful?',
      answer: 'Laparoscopic procedures are minimally invasive, resulting in significantly less pain than traditional open surgeries. Most patients experience some discomfort for 1-3 days after surgery, which can typically be managed with over-the-counter or prescription pain medication. Most patients return to normal activities within 1-2 weeks, compared to 4-6 weeks for open surgery.',
      created_at: new Date().toISOString()
    },
    {
      id: '5',
      question: 'What should I expect during my first gynecology appointment?',
      answer: 'Your first appointment will typically include a detailed discussion of your medical history and any concerns you may have. Depending on your age and needs, it may also include a physical examination, a breast exam, and possibly a pelvic exam. We strive to make every patient feel comfortable and informed throughout the process.',
      created_at: new Date().toISOString()
    }
  ];

  const updateFaq = async (id: string, data: Partial<FAQ>) => {
    try {
      const { error } = await supabase
        .from('csm_faqs')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchFaqs();
      return true;
    } catch (err) {
      console.error(`Error updating FAQ: ${err}`);
      return false;
    }
  };

  const addFaq = async (faq: Omit<FAQ, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('csm_faqs')
        .insert([faq]);
      
      if (error) throw error;
      
      await fetchFaqs();
      return true;
    } catch (err) {
      console.error(`Error adding FAQ: ${err}`);
      return false;
    }
  };

  const deleteFaq = async (id: string) => {
    try {
      const { error } = await supabase
        .from('csm_faqs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchFaqs();
      return true;
    } catch (err) {
      console.error(`Error deleting FAQ: ${err}`);
      return false;
    }
  };

  return { 
    faqs, 
    isLoading, 
    error, 
    refreshFaqs: fetchFaqs,
    updateFaq,
    addFaq,
    deleteFaq
  };
}; 