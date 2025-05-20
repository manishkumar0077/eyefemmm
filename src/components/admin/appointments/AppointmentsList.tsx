
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from 'lucide-react';
import { CancelAppointment } from './CancelAppointment';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const AppointmentsList = ({ appointments, onUpdateStatus }) => {
  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const appointment = appointments.find(appt => appt.id === appointmentId);
      if (!appointment) {
        throw new Error("Appointment not found");
      }

      // Optimistically update the UI
      onUpdateStatus(appointmentId, newStatus);

      // Update status in database
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (updateError) {
        throw updateError;
      }

      // If the status is 'confirmed', send confirmation email
      if (newStatus === 'confirmed') {
        toast({
          title: "Appointment Confirmed",
          description: "The patient has been notified via email.",
        });
      }
    } catch (error) {
      console.error("Error handling appointment action:", error);
      // Revert the UI on error
      onUpdateStatus(appointmentId, appointments.find(appt => appt.id === appointmentId)?.status || 'pending');
      toast({
        title: "Error",
        description: "Failed to update appointment status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div key={appointment.id} className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold">{appointment.first_name} {appointment.last_name}</h3>
              <p className="text-gray-600">{appointment.email} | {appointment.phone}</p>
            </div>
            <div>
              <p><strong>Date:</strong> {appointment.date}</p>
              <p><strong>Time:</strong> {appointment.time}</p>
              <p><strong>Reason:</strong> {appointment.reason}</p>
              <p><strong>Doctor:</strong> {appointment.doctor}</p>
              <p><strong>Clinic:</strong> {appointment.clinic}</p>
              <Badge
                variant="secondary"
                className="mt-2"
              >
                {appointment.status}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            {appointment.status === 'pending' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Confirm
                </Button>
                
                {/* Replaced the Reject button with a CancelAppointment component */}
                <CancelAppointment
                  appointmentId={appointment.id}
                  patientName={`${appointment.first_name} ${appointment.last_name}`}
                  patientEmail={appointment.email}
                  specialty={appointment.specialty}
                  appointmentDate={appointment.date}
                  appointmentTime={appointment.time}
                  onCancelled={() => onUpdateStatus(appointment.id, 'cancelled')}
                />
              </>
            )}
            
            {/* Cancel button always available */}
            {appointment.status !== 'pending' && (
              <CancelAppointment
                appointmentId={appointment.id}
                patientName={`${appointment.first_name} ${appointment.last_name}`}
                patientEmail={appointment.email}
                specialty={appointment.specialty}
                appointmentDate={appointment.date}
                appointmentTime={appointment.time}
                onCancelled={() => onUpdateStatus(appointment.id, 'cancelled')}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppointmentsList;
