
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X } from 'lucide-react';

interface CancelAppointmentProps {
  appointmentId: string;
  patientName: string;
  patientEmail: string;
  specialty: string;
  appointmentDate: string;
  appointmentTime: string;
  onCancelled: () => void;
}

export const CancelAppointment = ({
  appointmentId,
  patientName,
  patientEmail,
  specialty,
  appointmentDate,
  appointmentTime,
  onCancelled,
}: CancelAppointmentProps) => {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      console.log("Starting cancellation process for appointment:", appointmentId);

      if (!appointmentId || !patientName || !patientEmail) {
        console.error("Missing required appointment information:", { appointmentId, patientName, patientEmail });
        throw new Error("Missing required appointment information");
      }

      // Update appointment status in database
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (updateError) {
        console.error("Database update error:", updateError);
        throw updateError;
      }

      console.log("Appointment status updated in database");
      
      // Send cancellation notification
      toast({
        title: "Processing Cancellation",
        description: "Sending cancellation notification...",
      });
      
      console.log("Sending cancellation notification to:", patientEmail, "with data:", {
        appointmentId,
        patientName,
        patientEmail,
        specialty,
        appointmentDate,
        appointmentTime
      });
      
      const { data: functionResponse, error: functionError } = await supabase.functions.invoke('cancel-appointment', {
        body: JSON.stringify({
          appointmentId,
          patientName,
          patientEmail,
          specialty,
          appointmentDate,
          appointmentTime
        }),
      });
      
      if (functionError) {
        console.error("Error calling cancel-appointment function:", functionError);
        throw functionError;
      }

      console.log("Cancellation function response:", functionResponse);
      
      toast({
        title: "Appointment Cancelled",
        description: "The patient has been notified via email.",
        variant: "default",
      });

      onCancelled();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleCancel}
      disabled={isCancelling}
    >
      <X className="w-4 h-4 mr-1" />
      {isCancelling ? "Cancelling..." : "Cancel"}
    </Button>
  );
};
