import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, AlarmCheck, Eye, HeartPulse, Users } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CancelAppointment } from './CancelAppointment';

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

interface AppointmentsTabProps {
  appointments: Appointment[];
  holidays: Holiday[];
  onAppointmentStatusChange: () => void;
}

const AppointmentsTab = ({ appointments, holidays, onAppointmentStatusChange }: AppointmentsTabProps) => {
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [processingAppointmentId, setProcessingAppointmentId] = useState<string | null>(null);
  
  const handleAppointmentAction = async (appointment: Appointment, newStatus: string) => {
    setProcessingAppointmentId(appointment.id);
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointment.id);
        
      if (error) {
        throw error;
      }
      
      if (newStatus === 'confirmed') {
        const { data, error: functionError } = await supabase.functions.invoke("send-appointment", {
          body: {
            firstName: appointment.first_name,
            lastName: appointment.last_name,
            email: appointment.email,
            phone: appointment.phone,
            date: appointment.date,
            time: appointment.time,
            reason: appointment.reason,
            additionalInfo: appointment.additional_info,
            specialty: appointment.specialty,
            clinic: appointment.clinic,
            doctor: appointment.doctor,
            status: newStatus,
            age: appointment.age,
            gender: appointment.gender
          }
        });
        
        if (functionError) {
          throw functionError;
        }
        
        toast({
          title: "Appointment Confirmed",
          description: "Confirmation emails and PDFs have been sent to the patient and doctor.",
        });
      } else if (newStatus === 'completed') {
        toast({
          title: "Appointment Completed",
          description: "The appointment has been marked as completed.",
        });
      }
      
      onAppointmentStatusChange();
      
    } catch (error) {
      console.error("Error handling appointment action:", error);
      toast({
        title: "Error",
        description: "Failed to process the appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingAppointmentId(null);
    }
  };

  const isHoliday = (dateStr: string) => {
    const date = new Date(dateStr);
    return holidays.some(holiday => 
      isSameDay(holiday.date, date) && 
      (holiday.doctor === null || 
       (holiday.doctor === 'eye' && appointments.find(a => a.date === dateStr)?.specialty === 'eyecare') ||
       (holiday.doctor === 'gynecology' && appointments.find(a => a.date === dateStr)?.specialty === 'gynecology'))
    );
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const filteredAppointments = selectedDoctor === 'all'
    ? appointments
    : appointments.filter(appointment => 
        (selectedDoctor === 'eye' && appointment.specialty === 'eyecare') ||
        (selectedDoctor === 'gynecology' && appointment.specialty === 'gynecology')
      );

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b bg-gray-50">
        <CardTitle className="text-primary">Recent Appointments</CardTitle>
        <CardDescription>
          View and manage appointment requests from patients
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filter by specialty:</span>
            <select 
              className="border rounded-md px-2 py-1 text-sm"
              value={selectedDoctor}
              onChange={e => setSelectedDoctor(e.target.value)}
            >
              <option value="all">All Specialties</option>
              <option value="eye">Eye Care (Dr. Sanjeev Lehri)</option>
              <option value="gynecology">Gynecology (Dr. Nisha Bhatnagar)</option>
            </select>
          </div>
        </div>
        
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p>No appointments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3 rounded-tl-md">Patient</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Specialty</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-tr-md">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => {
                  const isOnHoliday = isHoliday(appointment.date);
                  const patientName = `${appointment.first_name} ${appointment.last_name}`;
                  
                  return (
                    <tr key={appointment.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <div className="font-medium">{patientName}</div>
                        <div className="text-gray-500 text-xs">{appointment.email}</div>
                        {appointment.age && appointment.gender && (
                          <div className="text-gray-500 text-xs">
                            {appointment.age} years, {appointment.gender}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{appointment.date}</div>
                        <div className="text-gray-500 text-xs">{appointment.time}</div>
                        {isOnHoliday && (
                          <div className="text-xs text-red-500 font-medium mt-1">
                            Holiday
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.specialty === 'eyecare' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-pink-100 text-pink-800'
                        }`}>
                          {appointment.specialty === 'eyecare' ? (
                            <><Eye className="h-3 w-3 mr-1" /> Eye Care</>
                          ) : (
                            <><HeartPulse className="h-3 w-3 mr-1" /> Gynecology</>
                          )}
                        </span>
                      </td>
                      <td className="p-3">
                        <HoverCard>
                          <HoverCardTrigger>
                            <div className="max-w-[150px] truncate cursor-help">
                              {appointment.reason}
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="font-medium">Reason:</div>
                            <p className="text-sm">{appointment.reason}</p>
                            {appointment.additional_info && (
                              <>
                                <div className="font-medium mt-2">Additional Info:</div>
                                <p className="text-sm">{appointment.additional_info}</p>
                              </>
                            )}
                          </HoverCardContent>
                        </HoverCard>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : appointment.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : appointment.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : appointment.status === 'cancelled' || appointment.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {appointment.status === 'confirmed' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {appointment.status === 'completed' && <AlarmCheck className="h-3 w-3 mr-1" />}
                          {(appointment.status === 'cancelled' || appointment.status === 'rejected') && <XCircle className="h-3 w-3 mr-1" />}
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          {appointment.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => handleAppointmentAction(appointment, 'confirmed')}
                                disabled={processingAppointmentId === appointment.id || isOnHoliday}
                                title={isOnHoliday ? "Cannot confirm appointment on a holiday" : ""}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" /> Confirm
                              </Button>
                              
                              <CancelAppointment
                                appointmentId={appointment.id}
                                patientName={patientName}
                                patientEmail={appointment.email}
                                specialty={appointment.specialty}
                                appointmentDate={appointment.date}
                                appointmentTime={appointment.time}
                                onCancelled={onAppointmentStatusChange}
                              />
                            </>
                          )}
                          
                          {appointment.status === 'confirmed' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-blue-600 border-blue-600 hover:bg-blue-50" 
                                onClick={() => handleAppointmentAction(appointment, 'completed')}
                                disabled={processingAppointmentId === appointment.id}
                              >
                                <AlarmCheck className="h-3 w-3 mr-1" /> Complete
                              </Button>
                              
                              <CancelAppointment
                                appointmentId={appointment.id}
                                patientName={patientName}
                                patientEmail={appointment.email}
                                specialty={appointment.specialty}
                                appointmentDate={appointment.date}
                                appointmentTime={appointment.time}
                                onCancelled={onAppointmentStatusChange}
                              />
                            </>
                          )}
                          
                          {processingAppointmentId === appointment.id && (
                            <span className="text-xs text-gray-500 animate-pulse flex items-center">
                              <Clock className="h-3 w-3 mr-1 animate-spin" /> Processing...
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentsTab;
