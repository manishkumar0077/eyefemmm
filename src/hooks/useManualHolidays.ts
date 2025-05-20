
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ManualHoliday {
  date: Date;
  reason: string;
  doctor: string | null;
}

export const useManualHolidays = (doctorKey: 'eye' | 'gynecology') => {
  const [manualHolidays, setManualHolidays] = useState<ManualHoliday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchManualHolidays = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('holidays')
        .select('date, name, doctor')
        .eq('type', 'manual');
      if (error) {
        setError(error.message);
        setManualHolidays([]);
        setLoading(false);
        return;
      }
      
      // Filter holidays based on doctorKey
      // Include:
      // 1. Holidays for all doctors (doctor = null or "all")
      // 2. Holidays specific to this doctor (doctor = doctorKey)
      setManualHolidays(
        (data || [])
          .filter(holiday => 
            holiday.doctor === null || 
            holiday.doctor === "all" || 
            holiday.doctor === doctorKey
          )
          .map((holiday) => ({
            date: new Date(holiday.date),
            reason: holiday.name,
            doctor: holiday.doctor,
          }))
      );
      setLoading(false);
    };
    fetchManualHolidays();
  }, [doctorKey]);

  const holidayForDate = (date: Date) =>
    manualHolidays.find(
      (holiday) =>
        holiday.date.getFullYear() === date.getFullYear() &&
        holiday.date.getMonth() === date.getMonth() &&
        holiday.date.getDate() === date.getDate() &&
        (holiday.doctor === null || holiday.doctor === "all" || holiday.doctor === doctorKey)
    );
  return { manualHolidays, holidayForDate, loading, error };
};
