
// Updated import to fix the "Headers is not a constructor" error
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@1.0.0";

const RESEND_API_KEY = "re_Hph4TPWL_HtU6QUmUX8AUmyWBiRi1XB63";
const resend = new Resend(RESEND_API_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OTPRequest {
  email: string;
  otp: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    console.log("OTP email function called");
    const { email, otp } = await req.json() as OTPRequest;

    if (!email || !otp) {
      throw new Error("Email and OTP are required");
    }

    console.log(`Sending OTP to email: ${email} with code: ${otp}`);
    
    // Update the logo URL to point to where your logo actually exists
    const logoUrl = "https://pqkhtgdmgnneooleniis.supabase.co/storage/v1/object/public/website-content/eyefem-logo.png";
    
    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "EyeFem <onboarding@resend.dev>",
      to: [email],
      subject: "Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${logoUrl}" alt="EyeFem Clinic Logo" style="max-width: 200px; margin: 0 auto 20px;">
          </div>
          <h2 style="color: #333;">Password Reset OTP</h2>
          <p>We received a request to reset your password.</p>
          <p>Your One-Time Password (OTP) is:</p>
          <div style="background-color: #f4f4f4; padding: 10px; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; letter-spacing: 5px;">
            ${otp}
          </div>
          <p>This OTP will expire in 15 minutes.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="color: #777; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log("Email sent successfully via Resend:", data);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "OTP email sent successfully",
        details: data
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error in send-otp function:", error);
    
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
