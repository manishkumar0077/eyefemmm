import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Star, ThumbsUp, FileText, BookOpen, Calendar, Baby, HeartPulse, Stethoscope, Syringe, Microscope, Activity, Shield, Search, Pill, FlaskConical, Users, Hourglass } from 'lucide-react';

export interface GyneExpertise {
  id: string;
  title: string;
  description: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

// Used to map icon string names to actual Lucide React components
export const iconMap = {
  // Generic icons
  Star, 
  ThumbsUp, 
  FileText,
  BookOpen,
  Calendar,
  Activity,
  Search,
  Shield,

  // Gynecology specific icons
  Baby,
  HeartPulse,
  Stethoscope,
  Syringe,
  Microscope,
  Pill,
  FlaskConical,
  Users,
  Hourglass
};

export type IconName = keyof typeof iconMap;

export const useGyneExpertise = () => {
  const [expertise, setExpertise] = useState<GyneExpertise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchExpertise();
  }, []);
  
  const fetchExpertise = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('csm_gyne_expertise')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setExpertise(data);
      } else {
        console.log('No expertise data found');
        setExpertise(getDefaultExpertise());
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error(`Error fetching expertise data: ${err}`);
      // Set default data as fallback
      setExpertise(getDefaultExpertise());
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultExpertise = (): GyneExpertise[] => [
    {
      id: '1',
      title: 'In Vitro Fertilization (IVF)',
      description: 'Advanced fertility treatment with personalized protocols and comprehensive embryology services for couples struggling to conceive.',
      icon: 'Baby',
      sort_order: 1,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Intrauterine Insemination (IUI)',
      description: 'Minimally invasive fertility procedure with careful timing and monitoring for optimal success rates.',
      icon: 'Microscope',
      sort_order: 2,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Hysteroscopy',
      description: 'Advanced diagnostic and therapeutic procedures for uterine conditions using state-of-the-art equipment.',
      icon: 'Stethoscope',
      sort_order: 3,
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      title: 'Laparoscopic Procedures',
      description: 'Minimally invasive surgical techniques for various gynecological conditions with faster recovery times.',
      icon: 'Syringe',
      sort_order: 4,
      created_at: new Date().toISOString()
    },
    {
      id: '5',
      title: 'High Risk Pregnancy Management',
      description: 'Specialized care and monitoring for complex pregnancies requiring additional attention and expertise.',
      icon: 'HeartPulse',
      sort_order: 5,
      created_at: new Date().toISOString()
    },
    {
      id: '6',
      title: 'Fertility Preservation',
      description: 'Options for preserving fertility for patients undergoing cancer treatment or delaying pregnancy.',
      icon: 'FlaskConical',
      sort_order: 6,
      created_at: new Date().toISOString()
    }
  ];

  const updateExpertise = async (id: string, data: Partial<GyneExpertise>) => {
    try {
      const { error } = await supabase
        .from('csm_gyne_expertise')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchExpertise();
      return true;
    } catch (err) {
      console.error(`Error updating expertise: ${err}`);
      return false;
    }
  };

  const addExpertise = async (expertiseItem: Omit<GyneExpertise, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('csm_gyne_expertise')
        .insert([expertiseItem]);
      
      if (error) throw error;
      
      await fetchExpertise();
      return true;
    } catch (err) {
      console.error(`Error adding expertise: ${err}`);
      return false;
    }
  };

  const deleteExpertise = async (id: string) => {
    try {
      const { error } = await supabase
        .from('csm_gyne_expertise')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchExpertise();
      return true;
    } catch (err) {
      console.error(`Error deleting expertise: ${err}`);
      return false;
    }
  };

  return { 
    expertise, 
    isLoading, 
    error, 
    refreshExpertise: fetchExpertise,
    updateExpertise,
    addExpertise,
    deleteExpertise
  };
};
