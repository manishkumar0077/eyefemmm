
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// The logo URL from Supabase storage
const LOGO_URL = "https://pqkhtgdmgnneooleniis.supabase.co/storage/v1/object/public/eyefem-assets/logos/eyefem-logo.png";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancelAppointmentRequest {
  appointmentId: string;
  patientName: string;
  patientEmail: string;
  specialty: "eyecare" | "gynecology";
  appointmentDate: string;
  appointmentTime: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Cancel appointment function called");
    const { appointmentId, patientName, patientEmail, specialty, appointmentDate, appointmentTime } = 
      await req.json() as CancelAppointmentRequest;

    if (!appointmentId || !patientName || !patientEmail || !specialty || !appointmentDate || !appointmentTime) {
      throw new Error("Missing required fields");
    }

    console.log(`Processing cancellation for appointment ID ${appointmentId}`);

    // Define specialty-specific colors
    const colors = {
      eyecare: {
        primary: "#3182CE", // blue
        secondary: "#EBF8FF",
      },
      gynecology: {
        primary: "#D53F8C", // pink
        secondary: "#FFF5F7",
      }
    };

    const specialtyColors = colors[specialty];
    const specialtyName = specialty === "eyecare" ? "Eye Care" : "Gynecology";
    
    // Send cancellation email to patient
    console.log("Sending cancellation email to patient:", patientEmail);
    
    const emailResponse = await resend.emails.send({
      from: "Eyefem Healthcare <onboarding@resend.dev>",
      to: [patientEmail],
      subject: "Appointment Cancelled - We're Currently Overbooked",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${LOGO_URL}" alt="Eyefem Clinic Logo" style="max-width: 200px; margin: 0 auto 20px;">
          </div>
          
          <div style="text-align: center; margin-bottom: 20px; background-color: ${specialtyColors.secondary}; padding: 20px; border-radius: 5px;">
            <h1 style="color: ${specialtyColors.primary}; margin: 0; padding: 0;">Eyefem ${specialtyName} Clinic</h1>
          </div>
          
          <h2 style="color: ${specialtyColors.primary}; text-align: center;">We're Currently Overbooked</h2>
          
          <p>Dear ${patientName},</p>
          
          <p>We regret to inform you that your appointment scheduled for:</p>
          
          <div style="background-color: ${specialtyColors.secondary}; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${specialtyColors.primary};">
            <p style="margin: 5px 0;"><strong>Date:</strong> ${appointmentDate}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${appointmentTime}</p>
            <p style="margin: 5px 0;"><strong>Department:</strong> ${specialtyName}</p>
          </div>
          
          <p>has been cancelled due to high demand and overbooking issues.</p>
          
          <p>We sincerely apologize for any inconvenience this may cause. We encourage you to schedule a new appointment for another available time slot tomorrow or later this week.</p>
          
          <p>You can easily book a new appointment through our website or contact us directly.</p>
          
          <p style="margin-top: 30px;">Best regards,<br>The Eyefem Healthcare Team</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center;">
            <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Eyefem Healthcare. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    console.log("Cancellation email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Appointment cancelled and email sent",
        emailResponse
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error in cancel-appointment function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
