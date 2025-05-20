
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Holiday {
  id: string;
  date: string;
  name: string;
  type: 'national' | 'doctor' | 'manual' | 'api';
  doctor?: string | null;
  description?: string | null;
}

export const useHolidays = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHolidays = async () => {
      setIsLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('holidays')
          .select('*');
        
        if (fetchError) {
          throw fetchError;
        }
        
        // Convert date objects to strings for easier handling and validate type property
        const formattedHolidays = data?.map(holiday => ({
          ...holiday,
          date: typeof holiday.date === 'string' ? holiday.date : new Date(holiday.date).toISOString().split('T')[0],
          // Ensure type is within allowed values
          type: validateHolidayType(holiday.type)
        })) || [];
        
        // Type assertion after validation
        setHolidays(formattedHolidays as Holiday[]);
      } catch (err) {
        console.error('Error fetching holidays:', err);
        setError('Failed to load holidays');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHolidays();
  }, []);

  // Helper function to validate the holiday type
  const validateHolidayType = (type: string): 'national' | 'doctor' | 'manual' | 'api' => {
    const validTypes = ['national', 'doctor', 'manual', 'api'];
    if (validTypes.includes(type)) {
      return type as 'national' | 'doctor' | 'manual' | 'api';
    }
    // Default to 'manual' if an invalid type is received
    console.warn(`Invalid holiday type "${type}" received, defaulting to "manual"`);
    return 'manual';
  };

  return { holidays, isLoading, error };
};
