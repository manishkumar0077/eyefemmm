import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DoctorCalendar from './DoctorCalendar';
import HolidayForm from './HolidayForm';
import HolidayList from './HolidayList';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import CalendarLegend from './CalendarLegend';

interface Appointment {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  specialty: string;
  reason: string;
  doctor: string;
  clinic: string;
  status: string;
  created_at: string;
  additional_info?: string | null;
  age?: number | null;
  gender?: string | null;
}

interface Holiday {
  id: string;
  date: Date;
  name: string;
  type: 'national' | 'doctor' | 'manual' | 'api';
  doctor?: string | null;
  description?: string | null;
}

interface CalendarTabProps {
  appointments: Appointment[];
}

const CalendarTab = ({ appointments }: CalendarTabProps) => {
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  useEffect(() => {
    const fetchHolidays = async () => {
      setIsLoadingHolidays(true);
      try {
        try {
          await supabase.rpc('create_holidays_table');
        } catch (error) {
          console.log("Table exists or error creating it:", error);
        }
        
        const { data: holidaysData, error: holidaysError } = await supabase
          .from('holidays')
          .select('*');
        
        if (holidaysError) {
          throw holidaysError;
        }
        
        const dbHolidays: Holiday[] = (holidaysData || []).map(holiday => ({
          id: holiday.id,
          date: new Date(holiday.date),
          name: holiday.name,
          type: holiday.type as 'national' | 'doctor' | 'manual' | 'api',
          doctor: holiday.doctor,
          description: holiday.description || null
        }));
        
        setHolidays(dbHolidays);
        await checkAndFetchIndianHolidays();
        
      } catch (error) {
        console.error("Error fetching holidays:", error);
        toast({
          title: "Error",
          description: "Failed to load holidays. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingHolidays(false);
      }
    };
    
    fetchHolidays();
  }, []);

  const checkAndFetchIndianHolidays = async () => {
    try {
      const currentYear = new Date().getFullYear();
      
      const { data: existingHolidays, error: checkError } = await supabase
        .from('holidays')
        .select('*')
        .eq('type', 'national')  // Changed from 'api' to 'national'
        .gte('date', `${currentYear}-01-01`)
        .lt('date', `${currentYear+1}-01-01`);
        
      if (checkError) throw checkError;
      
      if (existingHolidays && existingHolidays.length > 0) {
        console.log(`Already have ${existingHolidays.length} Indian holidays for ${currentYear}`);
        return;
      }
      
      console.log(`Fetching Indian holidays for ${currentYear}`);
      
      const { data, error } = await supabase.functions.invoke("fetch-indian-holidays", {
        body: { year: currentYear }
      });
      
      if (error) {
        console.error("Function invocation error:", error);
        throw error;
      }
      
      if (data && data.success) {
        toast({
          title: "Holidays Updated",
          description: `Successfully fetched ${data.count} Indian holidays for ${currentYear}`,
        });
        
        const { data: refreshedHolidays, error: refreshError } = await supabase
          .from('holidays')
          .select('*');
          
        if (refreshError) throw refreshError;
        
        const updatedHolidays: Holiday[] = (refreshedHolidays || []).map(holiday => ({
          id: holiday.id,
          date: new Date(holiday.date),
          name: holiday.name,
          type: holiday.type as 'national' | 'doctor' | 'manual' | 'api',
          doctor: holiday.doctor,
          description: holiday.description || null
        }));
        
        setHolidays(updatedHolidays);
      }
    } catch (error) {
      console.error("Error fetching Indian holidays:", error);
      toast({
        title: "Error",
        description: "Failed to fetch Indian holidays. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleHolidayAdded = async () => {
    setIsLoadingHolidays(true);
    try {
      const { data: refreshedHolidays, error } = await supabase
        .from('holidays')
        .select('*');
        
      if (error) throw error;
      
      const updatedHolidays: Holiday[] = (refreshedHolidays || []).map(holiday => ({
        id: holiday.id,
        date: new Date(holiday.date),
        name: holiday.name,
        type: holiday.type as 'national' | 'doctor' | 'manual' | 'api',
        doctor: holiday.doctor,
        description: holiday.description || null
      }));
      
      setHolidays(updatedHolidays);
    } catch (error) {
      console.error("Error refreshing holidays:", error);
    } finally {
      setIsLoadingHolidays(false);
    }
  };

  const filteredAppointments = selectedDoctor === 'all'
    ? appointments
    : appointments.filter(appointment => 
        (selectedDoctor === 'eye' && appointment.specialty === 'eyecare') ||
        (selectedDoctor === 'gynecology' && appointment.specialty === 'gynecology')
      );

  const legendItems = [
    { color: 'bg-red-500', label: 'National Holiday' },
    { color: 'bg-gray-200', label: 'Custom Holiday', description: 'manually added' },
    { color: 'bg-green-500', label: 'Confirmed Appointment' },
    { color: 'bg-yellow-500', label: 'Pending Appointment' },
    { color: 'bg-blue-500', label: 'Completed Appointment' },
    { color: 'bg-red-400', label: 'Cancelled Appointment' },
  ];

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b bg-gray-50">
        <CardTitle className="text-primary">Doctor Calendar</CardTitle>
        <CardDescription>
          View appointments and manage holidays for each doctor
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium">View calendar for:</span>
          <select 
            className="border rounded-md px-2 py-1 text-sm"
            value={selectedDoctor}
            onChange={e => setSelectedDoctor(e.target.value)}
          >
            <option value="all">All Doctors</option>
            <option value="eye">Eye Care (Dr. Sanjeev Lehri)</option>
            <option value="gynecology">Gynecology (Dr. Nisha Bhatnagar)</option>
          </select>
        </div>

        <CalendarLegend items={legendItems} />

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Doctor Appointments Calendar</h3>
            <DoctorCalendar 
              appointments={filteredAppointments}
              holidays={holidays}
              selectedDoctor={selectedDoctor}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Holiday Management</h3>
            <div className="bg-white border rounded-lg p-4">
              <div className="space-y-4">
                <HolidayForm 
                  selectedDate={selectedDate}
                  selectedDoctor={selectedDoctor}
                  onHolidayAdded={handleHolidayAdded}
                />
                
                <HolidayList 
                  holidays={holidays}
                  selectedDoctor={selectedDoctor}
                  onHolidayDeleted={handleHolidayAdded}
                  isLoading={isLoadingHolidays}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarTab;
