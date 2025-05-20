import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, Users, Settings, List, LayoutDashboard, Edit, FileSpreadsheet, FileEdit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppointmentsTab from '@/components/admin/appointments/AppointmentsTab';
import CalendarTab from '@/components/admin/calendar/CalendarTab';
import { toast } from '@/hooks/use-toast';
import { useHolidays } from '@/hooks/useHolidays';
import { supabase } from '@/integrations/supabase/client';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const { holidays, isLoading: holidaysLoading } = useHolidays();

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      setAppointmentsLoading(true);
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .order('date', { ascending: false });
          
        if (error) throw error;
        setAppointments(data || []);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: "Error",
          description: "Failed to load appointments.",
          variant: "destructive"
        });
      } finally {
        setAppointmentsLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);

  const handleAppointmentStatusChange = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: false });
        
      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error refreshing appointments:', error);
    }
  };

  // Format holidays to match the expected format in CalendarTab
  const formattedHolidays = holidays.map(holiday => ({
    ...holiday,
    date: new Date(holiday.date)
  }));

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
          <Link 
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Back to Website
          </Link>
        </div>
      </header>
      
      {/* Main content */}
      <main>
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          
          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <Link to="/admin/export-data">
                <CardContent className="p-6 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
                  <FileSpreadsheet className="h-8 w-8 text-gray-600 mb-2" />
                  <span className="text-lg font-medium">Export Data</span>
                </CardContent>
              </Link>
            </Card>
            <Card>
              <Link to="/admin/edit-content">
                <CardContent className="p-6 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
                  <Edit className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-lg font-medium">Edit Content</span>
                </CardContent>
              </Link>
            </Card>
          </div>
          
          {/* Tabs for different sections */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 bg-white">
              <TabsTrigger value="appointments" className="flex items-center">
                <List className="h-4 w-4 mr-2" />
                Appointments
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="appointments" className="mt-0">
              <AppointmentsTab 
                appointments={appointments} 
                holidays={formattedHolidays} 
                onAppointmentStatusChange={handleAppointmentStatusChange} 
              />
            </TabsContent>
            
            <TabsContent value="calendar" className="mt-0">
              <CalendarTab appointments={appointments} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
