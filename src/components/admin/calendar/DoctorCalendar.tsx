
import React, { useState } from 'react';
import { isSameDay, format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Clock, Check, X, CalendarIcon } from 'lucide-react';
import AppointmentDialog from './AppointmentDialog';

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

interface DoctorCalendarProps {
  appointments: Appointment[];
  holidays: Holiday[];
  selectedDoctor: string;
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
}

const DoctorCalendar = ({ 
  appointments, 
  holidays, 
  selectedDoctor, 
  selectedDate,
  onSelectDate
}: DoctorCalendarProps) => {
  const [selectedDayAppointments, setSelectedDayAppointments] = useState<Appointment[]>([]);
  const [isDayPopoverOpen, setIsDayPopoverOpen] = useState(false);
  const [showAppointmentsList, setShowAppointmentsList] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDayClick = (day: Date | undefined) => {
    if (!day) return;
    
    onSelectDate(day);
    
    const apptsOnDay = appointments.filter(
      appointment => {
        try {
          const appointmentDate = new Date(appointment.date);
          return isSameDay(appointmentDate, day);
        } catch (e) {
          return false;
        }
      }
    );
    
    setSelectedDayAppointments(apptsOnDay);
    setIsDialogOpen(true);  // Always open the dialog when a day is clicked
    setIsDayPopoverOpen(apptsOnDay.length > 0);
    setShowAppointmentsList(true);
  };

  const getDayContent = (day: Date) => {
    try {
      const appointmentsOnDay = appointments.filter(
        appointment => {
          try {
            const appointmentDate = new Date(appointment.date);
            return isSameDay(appointmentDate, day) && 
                   (selectedDoctor === 'all' || 
                    (appointment.specialty === 'eyecare' && selectedDoctor === 'eye') ||
                    (appointment.specialty === 'gynecology' && selectedDoctor === 'gynecology'));
          } catch (e) {
            return false;
          }
        }
      );
      
      const holidaysOnDay = holidays.filter(
        holiday => {
          return isSameDay(holiday.date, day) && 
                 (holiday.type === 'national' || holiday.type === 'api' || 
                  holiday.doctor === null || 
                  selectedDoctor === 'all' || 
                  (holiday.doctor === 'eye' && selectedDoctor === 'eye') ||
                  (holiday.doctor === 'gynecology' && selectedDoctor === 'gynecology'));
        }
      );
      
      const hasHoliday = holidaysOnDay.length > 0;
      const hasCustomHoliday = holidaysOnDay.some(h => h.type === 'manual');
      const hasAppointments = appointmentsOnDay.length > 0;
      
      const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
      
      return (
        <HoverCard openDelay={100} closeDelay={100}>
          <HoverCardTrigger asChild>
            <div 
              className={`relative w-full h-full flex flex-col items-center justify-start pt-1 cursor-pointer group ${
                isSelected ? 'bg-blue-100 rounded-md' : ''
              } ${hasCustomHoliday ? 'bg-gray-200' : ''} hover:bg-gray-50`}
              onClick={() => handleDayClick(day)}
            >
              <span className="text-xs font-medium text-gray-800 mb-1">{day.getDate()}</span>
              
              {hasHoliday && !hasCustomHoliday && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-1.5 w-1.5 bg-red-500 rounded-full"></div>
              )}
              
              {hasAppointments && (
                <div className="absolute top-0 right-0 flex gap-0.5 p-0.5">
                  {appointmentsOnDay.some(a => a.status === 'confirmed') && (
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                  )}
                  {appointmentsOnDay.some(a => a.status === 'pending') && (
                    <div className="h-1.5 w-1.5 bg-yellow-500 rounded-full"></div>
                  )}
                  {appointmentsOnDay.some(a => a.status === 'completed') && (
                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              )}
              
              {hasAppointments && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-[8px] text-gray-500">
                  {appointmentsOnDay.length}
                </div>
              )}
              
              <div className="opacity-0 group-hover:opacity-100 absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full transition-opacity duration-200"></div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-72 p-3 shadow-lg border-gray-200">
            <div className="text-sm max-w-[280px]">
              <div className="font-medium mb-1.5">
                {format(day, 'MMMM d, yyyy')}
              </div>
              
              {hasHoliday && (
                <div className="mb-2">
                  <p className="font-semibold text-xs flex items-center text-red-600 mb-1">
                    <CalendarIcon className="h-3 w-3 mr-1 inline" /> 
                    Holiday
                  </p>
                  <ul className="space-y-1">
                    {holidaysOnDay.map((holiday, index) => (
                      <li key={index} className="text-xs bg-red-50 rounded-md p-1.5">
                        <span className="font-medium block">{holiday.name}</span>
                        {holiday.description && (
                          <span className="text-gray-500 block text-[10px] mt-0.5">{holiday.description}</span>
                        )}
                        <span className="text-[10px] text-gray-500 capitalize mt-0.5 block">
                          {holiday.type === 'api' ? 'National' : holiday.type} holiday
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {hasAppointments && (
                <div className={hasHoliday ? 'mt-2 pt-2 border-t border-gray-200' : ''}>
                  <p className="font-semibold text-xs flex items-center mb-1">
                    Appointments: {appointmentsOnDay.length}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {appointmentsOnDay.some(a => a.status === 'pending') && (
                      <div className="flex items-center text-xs bg-yellow-50 px-2 py-1 rounded-md">
                        <Clock className="h-3 w-3 mr-1 text-yellow-600" />
                        <span className="text-yellow-800">
                          {appointmentsOnDay.filter(a => a.status === 'pending').length} pending
                        </span>
                      </div>
                    )}
                    
                    {appointmentsOnDay.some(a => a.status === 'confirmed') && (
                      <div className="flex items-center text-xs bg-green-50 px-2 py-1 rounded-md">
                        <Check className="h-3 w-3 mr-1 text-green-600" />
                        <span className="text-green-800">
                          {appointmentsOnDay.filter(a => a.status === 'confirmed').length} confirmed
                        </span>
                      </div>
                    )}
                    
                    {appointmentsOnDay.some(a => a.status === 'completed') && (
                      <div className="flex items-center text-xs bg-blue-50 px-2 py-1 rounded-md">
                        <Check className="h-3 w-3 mr-1 text-blue-600" />
                        <span className="text-blue-800">
                          {appointmentsOnDay.filter(a => a.status === 'completed').length} completed
                        </span>
                      </div>
                    )}
                    
                    {appointmentsOnDay.some(a => a.status === 'cancelled') && (
                      <div className="flex items-center text-xs bg-red-50 px-2 py-1 rounded-md">
                        <X className="h-3 w-3 mr-1 text-red-600" />
                        <span className="text-red-800">
                          {appointmentsOnDay.filter(a => a.status === 'cancelled').length} cancelled
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-600">
                    Click to view appointment details
                  </div>
                </div>
              )}
              
              {!hasHoliday && !hasAppointments && (
                <p className="text-xs text-gray-500">No appointments or holidays</p>
              )}
            </div>
          </HoverCardContent>
        </HoverCard>
      );
    } catch (e) {
      console.error("Error rendering day content:", e);
      return null;
    }
  };

  const isHoliday = (date: Date) => {
    return holidays.some(holiday => 
      isSameDay(holiday.date, date) && 
      (holiday.doctor === null || 
       selectedDoctor === 'all' || 
       (holiday.doctor === 'eye' && selectedDoctor === 'eye') ||
       (holiday.doctor === 'gynecology' && selectedDoctor === 'gynecology'))
    );
  };

  // Format appointment time for display
  const formatTime = (time: string) => {
    return time;
  };

  const closeAppointmentsList = () => {
    setShowAppointmentsList(false);
  };

  return (
    <div>
      <div className="bg-white border rounded-lg p-4 relative">
        <Popover open={isDayPopoverOpen} onOpenChange={setIsDayPopoverOpen}>
          <PopoverTrigger className="hidden">
            <span>Appointments Details</span>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0">
            <div className="p-4 border-b">
              <h4 className="font-semibold">
                {selectedDayAppointments.length} Appointments
                {selectedDate && ` on ${format(selectedDate, 'MMMM d, yyyy')}`}
              </h4>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2">
              {selectedDayAppointments.length === 0 ? (
                <p className="text-center py-4 text-gray-500">No appointments for this day</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayAppointments.map(appt => (
                    <div key={appt.id} className="border rounded-md p-2 text-sm">
                      <div className="font-medium">{appt.first_name} {appt.last_name}</div>
                      <div className="text-gray-500">{appt.time}</div>
                      <div className={`mt-1 px-2 py-0.5 rounded-full text-xs inline-block ${
                        appt.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : appt.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : appt.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <CalendarComponent
          mode="single"
          selected={selectedDate}
          onSelect={handleDayClick}
          className="w-full"
          components={{
            Day: (props) => getDayContent(props.date)
          }}
        />
      </div>

      {showAppointmentsList && selectedDayAppointments.length > 0 && selectedDate && (
        <Card className="mt-4 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between">
              <span>Appointments for {format(selectedDate, 'MMMM d, yyyy')}</span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Total: {selectedDayAppointments.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  {selectedDoctor === 'all' && <TableHead>Specialty</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedDayAppointments.map(appointment => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      {appointment.first_name} {appointment.last_name}
                    </TableCell>
                    <TableCell>{formatTime(appointment.time)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        appointment.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : appointment.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </TableCell>
                    {selectedDoctor === 'all' && (
                      <TableCell>
                        {appointment.specialty === 'eyecare' 
                          ? 'Eye Care' 
                          : appointment.specialty === 'gynecology'
                          ? 'Gynecology'
                          : appointment.specialty}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <AppointmentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        appointments={selectedDayAppointments}
        selectedDate={selectedDate}
        selectedDoctor={selectedDoctor}
      />
    </div>
  );
};

export default DoctorCalendar;
