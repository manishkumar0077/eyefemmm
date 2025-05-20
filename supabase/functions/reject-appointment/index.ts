
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// The logo URL from Supabase storage
const LOGO_URL = "https://pqkhtgdmgnneooleniis.supabase.co/storage/v1/object/public/eyefem-assets/logos/eyefem-logo.png";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RejectionRequest {
  appointmentId: string;
  patientName: string;
  patientEmail: string;
  specialty: string;
  appointmentDate: string;
  appointmentTime: string;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      appointmentId,
      patientName,
      patientEmail,
      specialty,
      appointmentDate,
      appointmentTime 
    } = await req.json() as RejectionRequest;

    console.log("Processing rejection for appointment:", appointmentId);

    // Define specialty-specific colors
    const specialtyColors = {
      eyecare: {
        primary: "#3182CE",
        secondary: "#EBF8FF",
        accent: "#63B3ED"
      },
      gynecology: {
        primary: "#D53F8C",
        secondary: "#FFF5F7",
        accent: "#F687B3"
      }
    };

    const colors = specialtyColors[specialty as keyof typeof specialtyColors];
    
    console.log("Sending rejection email to patient:", patientEmail);
    
    // Send rejection email directly to the patient
    const patientEmailResponse = await resend.emails.send({
      from: "Eyefem Clinic <onboarding@resend.dev>",
      to: [patientEmail],
      subject: "Appointment Rejected - We're Currently Overbooked",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${LOGO_URL}" alt="Eyefem Clinic Logo" style="max-width: 200px; margin: 0 auto 20px;">
          </div>
          
          <div style="text-align: center; margin-bottom: 20px; background-color: ${colors.secondary}; padding: 20px; border-radius: 5px;">
            <h1 style="color: ${colors.primary}; margin: 0; padding: 0;">
              Eyefem ${specialty === "eyecare" ? "Eye Care" : "Gynecology"} Clinic
            </h1>
          </div>
          
          <h2 style="color: ${colors.primary}; text-align: center;">We're Currently Overbooked</h2>
          
          <p>Dear ${patientName},</p>
          
          <p>We regret to inform you that we are unable to accommodate your appointment request for the following time slot:</p>
          
          <div style="background-color: ${colors.secondary}; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${colors.primary};">
            <p style="margin: 5px 0;"><strong>Date:</strong> ${appointmentDate}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${appointmentTime}</p>
            <p style="margin: 5px 0;"><strong>Department:</strong> ${specialty === "eyecare" ? "Eye Care" : "Gynecology"}</p>
          </div>
          
          <p>We're currently experiencing high demand and all our slots are filled.</p>
          
          <p>We apologize for any inconvenience this may cause. We encourage you to try booking for a different time slot or date that might better accommodate your schedule.</p>
          
          <p>If you need assistance with rebooking or have any questions, please feel free to contact us at +91 98765 43210.</p>
          
          <p style="margin-top: 30px;">Best regards,<br>The Eyefem Clinic Team</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center;">
            <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Eyefem Clinic. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    console.log("Rejection email sent successfully:", patientEmailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Rejection email sent successfully",
        emailId: patientEmailResponse
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error("Error in reject-appointment function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to send rejection email",
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
