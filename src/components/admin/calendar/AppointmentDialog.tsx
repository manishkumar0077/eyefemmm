
import React, { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

interface AppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  selectedDate: Date | undefined;
  selectedDoctor: string;
}

const AppointmentDialog: React.FC<AppointmentDialogProps> = ({
  isOpen,
  onClose,
  appointments: initialAppointments,
  selectedDate,
  selectedDoctor
}) => {
  const [filter, setFilter] = useState<'all' | 'eye' | 'gynecology'>(
    selectedDoctor === 'all' ? 'all' : 
    selectedDoctor === 'eye' ? 'eye' : 'gynecology'
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && selectedDate) {
      fetchAppointmentsForDate();
    }
  }, [isOpen, selectedDate, selectedDoctor]);

  const fetchAppointmentsForDate = async () => {
    if (!selectedDate) return;
    
    setIsLoading(true);
    try {
      // Try multiple date formats since the data could be stored in different formats
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const longFormattedDate = format(selectedDate, 'MMMM do, yyyy');
      const mediumFormattedDate = format(selectedDate, 'MMMM d, yyyy');
      
      console.log('Trying to fetch appointments for these date formats:');
      console.log('- SQL format:', formattedDate);
      console.log('- Long format:', longFormattedDate);
      console.log('- Medium format:', mediumFormattedDate);
      
      // Try standard SQL format first
      let { data: sqlData, error: sqlError } = await supabase
        .from('appointments')
        .select('*')
        .eq('date', formattedDate);
      
      // If no results, try long format (April 18th, 2025)
      if ((!sqlData || sqlData.length === 0) && !sqlError) {
        console.log('No results with SQL format, trying long format:', longFormattedDate);
        const { data: longData, error: longError } = await supabase
          .from('appointments')
          .select('*')
          .eq('date', longFormattedDate);
          
        if (longError) {
          console.error('Error with long format:', longError);
        } else if (longData && longData.length > 0) {
          console.log('Found appointments with long format:', longData.length);
          sqlData = longData;
        }
      }
      
      // If still no results, try medium format (April 18, 2025)
      if ((!sqlData || sqlData.length === 0) && !sqlError) {
        console.log('No results with long format, trying medium format:', mediumFormattedDate);
        const { data: mediumData, error: mediumError } = await supabase
          .from('appointments')
          .select('*')
          .eq('date', mediumFormattedDate);
          
        if (mediumError) {
          console.error('Error with medium format:', mediumError);
        } else if (mediumData && mediumData.length > 0) {
          console.log('Found appointments with medium format:', mediumData.length);
          sqlData = mediumData;
        }
      }
      
      // If still no results, try a partial match (this is less ideal but can help find data)
      if ((!sqlData || sqlData.length === 0) && !sqlError) {
        console.log('No results with exact matches, trying partial match with month and day');
        const monthDay = format(selectedDate, 'MMMM d');
        console.log('Searching for month and day:', monthDay);
        
        const { data: partialData, error: partialError } = await supabase
          .from('appointments')
          .select('*')
          .ilike('date', `%${monthDay}%`);
          
        if (partialError) {
          console.error('Error with partial match:', partialError);
        } else if (partialData && partialData.length > 0) {
          console.log('Found appointments with partial match:', partialData.length);
          sqlData = partialData;
        }
      }
      
      if (sqlError) {
        console.error('Error fetching appointments:', sqlError);
        return;
      }
      
      console.log('Final appointment data:', sqlData);
      setAppointments(sqlData || []);
    } catch (error) {
      console.error('Error in appointment fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    if (filter === 'all') return true;
    if (filter === 'eye') return appointment.specialty === 'eyecare';
    if (filter === 'gynecology') return appointment.specialty === 'gynecology';
    return true;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center justify-between">
            <span>
              Appointments for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
            </span>
            <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
              Total: {filteredAppointments.length}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-md">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm font-medium">Filter by specialty:</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setFilter('all')}
                className={`text-xs px-3 py-1 rounded-full ${
                  filter === 'all' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('eye')}
                className={`text-xs px-3 py-1 rounded-full ${
                  filter === 'eye' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Eye Care
              </button>
              <button 
                onClick={() => setFilter('gynecology')}
                className={`text-xs px-3 py-1 rounded-full ${
                  filter === 'gynecology' 
                    ? 'bg-pink-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Gynecology
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-gray-500">Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No appointments found for the selected filters.
            </CardContent>
          </Card>
        ) : (
          <Table>
            <TableCaption>List of appointments for selected date</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Doctor</TableHead>
                {filter === 'all' && <TableHead>Specialty</TableHead>}
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">
                    {appointment.first_name} {appointment.last_name}
                    {appointment.age && <span className="text-xs text-gray-500 ml-1">({appointment.age})</span>}
                  </TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>{appointment.doctor}</TableCell>
                  {filter === 'all' && (
                    <TableCell>
                      <Badge variant="outline" className={
                        appointment.specialty === 'eyecare' 
                          ? 'border-blue-500 text-blue-700' 
                          : 'border-pink-500 text-pink-700'
                      }>
                        {appointment.specialty === 'eyecare' ? 'Eye Care' : 'Gynecology'}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDialog;
