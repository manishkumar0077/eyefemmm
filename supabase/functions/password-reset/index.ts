
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@1.0.0";

const RESEND_API_KEY = "re_Hph4TPWL_HtU6QUmUX8AUmyWBiRi1XB63";
const resend = new Resend(RESEND_API_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetUrl: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    console.log("Password reset function called");
    const { email, resetUrl } = await req.json() as PasswordResetRequest;

    if (!email) {
      throw new Error("Email is required");
    }

    console.log(`Processing password reset for email: ${email}`);

    // Get env variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    // Create authenticated Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate password reset link
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: resetUrl,
      },
    });

    if (error) {
      throw new Error(`Error generating reset link: ${error.message}`);
    }

    // Get the action link from response
    const actionLink = data?.properties?.action_link;
    
    if (!actionLink) {
      throw new Error("Failed to generate reset link");
    }

    console.log("Password reset link generated successfully");

    // Update the logo URL to point to where your logo actually exists
    const logoUrl = "https://pqkhtgdmgnneooleniis.supabase.co/storage/v1/object/public/website-content/eyefem-logo.png";

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "EyeFem <onboarding@resend.dev>",
      to: [email],
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${logoUrl}" alt="EyeFem Clinic Logo" style="max-width: 200px; margin: 0 auto 20px;">
          </div>
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>We received a request to reset your password.</p>
          <p>Please click the link below to reset your password:</p>
          <p>
            <a 
              href="${actionLink}" 
              style="background-color: #4366a0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;"
            >
              Reset Password
            </a>
          </p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="color: #777; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `
    });

    if (emailResponse.error) {
      throw new Error(`Failed to send email: ${emailResponse.error}`);
    }

    console.log("Password reset email sent successfully via Resend");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Password reset email sent successfully",
        details: emailResponse
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error in password-reset function:", error);
    
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
