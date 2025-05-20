import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { PDFDocument, rgb, StandardFonts } from "https://cdn.skypack.dev/pdf-lib@1.17.1?dts";
import { Resend } from "npm:resend@1.0.0";

// Initialize Resend with the correct API key
const RESEND_API_KEY = "re_HzgLW5XG_Eaz1TkDNRuhpaFjy7XYA52Q2";
const resend = new Resend(RESEND_API_KEY);

// Configure CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Doctor's email address - use the specified email
const DOCTOR_EMAIL = "malhotrashubham144@gmail.com";

// Updated URL for the logo image from Supabase storage - pointing to where it actually exists
const LOGO_URL = "https://pqkhtgdmgnneooleniis.supabase.co/storage/v1/object/public/website-content/eyefem-logo.png";

interface AppointmentRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  reason: string;
  additionalInfo?: string;
  specialty: "eyecare" | "gynecology";
  clinic: string;
  doctor: string;
  age?: number;
  gender?: string;
  status?: string;
}

// Helper function to generate PDF for patients and doctors
async function generatePDF(appointment: AppointmentRequest, isForDoctor: boolean): Promise<Uint8Array> {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();
    
    // Add fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // PDF title
    const title = isForDoctor 
      ? `DOCTOR COPY: Patient Appointment Details` 
      : `Appointment Confirmation`;
    
    const specialty = appointment.specialty === "eyecare" 
      ? "Eye Care" 
      : "Gynecology";
    
    // Set color based on specialty
    const headerColor = appointment.specialty === "eyecare"
      ? rgb(0.2, 0.4, 0.8) // Blue for eyecare
      : rgb(0.85, 0.35, 0.65); // Pink for gynecology
    
    // Draw title with spacing and department-specific color
    page.drawRectangle({
      x: 0,
      y: height - 140,
      width: width,
      height: 70,
      color: headerColor,
      opacity: 0.2,
    });
    
    page.drawText(title, {
      x: 50,
      y: height - 100,
      size: 18,
      font: boldFont,
      color: headerColor,
    });
    
    // Clinic name with appropriate styling
    page.drawText(`Eyefem ${specialty} Clinic`, {
      x: 50,
      y: height - 130,
      size: 14,
      font: boldFont,
      color: headerColor,
    });
    
    // Appointment reference
    const appointmentRef = `${appointment.specialty.substring(0, 3).toUpperCase()}-${Date.now().toString().substring(9)}`;
    
    page.drawText(`Reference: ${appointmentRef}`, {
      x: 50,
      y: height - 160,
      size: 10,
      font,
    });
    
    page.drawText(`Generated: ${new Date().toLocaleString()}`, {
      x: 50,
      y: height - 180,
      size: 10,
      font,
    });
    
    // Create two columns
    const leftColumnX = 50;
    const rightColumnX = width / 2 + 20;
    
    // Patient information 
    page.drawText("Patient Information", {
      x: leftColumnX,
      y: height - 220,
      size: 14,
      font: boldFont,
    });
    
    const patientInfo = [
      `Name: ${appointment.firstName} ${appointment.lastName}`,
      `Email: ${appointment.email}`,
      `Phone: ${appointment.phone}`,
    ];
    
    // Add age and gender if available
    if (appointment.age) {
      patientInfo.push(`Age: ${appointment.age}`);
    }
    if (appointment.gender) {
      patientInfo.push(`Gender: ${appointment.gender}`);
    }
    
    patientInfo.forEach((line, index) => {
      page.drawText(line, {
        x: leftColumnX,
        y: height - 250 - (index * 20),
        size: 10,
        font,
      });
    });
    
    // Appointment details
    page.drawText("Appointment Details", {
      x: rightColumnX,
      y: height - 220,
      size: 14,
      font: boldFont,
    });
    
    const appointmentInfo = [
      `Date: ${appointment.date}`,
      `Time: ${appointment.time}`,
      `Department: ${specialty}`,
      `Doctor: ${appointment.doctor}`,
      `Clinic: ${appointment.clinic}`,
      `Status: ${appointment.status || "Pending"}`,
    ];
    
    appointmentInfo.forEach((line, index) => {
      page.drawText(line, {
        x: rightColumnX,
        y: height - 250 - (index * 20),
        size: 10,
        font,
      });
    });
    
    // Reason for visit
    page.drawText("Reason for visit:", {
      x: leftColumnX,
      y: height - 370,
      size: 12,
      font: boldFont,
    });
    
    page.drawText(appointment.reason, {
      x: leftColumnX,
      y: height - 390,
      size: 10,
      font,
      maxWidth: width - 100,
    });
    
    // Additional information if provided
    if (appointment.additionalInfo && appointment.additionalInfo.trim() !== "") {
      page.drawText("Additional Information:", {
        x: leftColumnX,
        y: height - 430,
        size: 12,
        font: boldFont,
      });
      
      page.drawText(appointment.additionalInfo, {
        x: leftColumnX,
        y: height - 450,
        size: 10,
        font,
        maxWidth: width - 100,
      });
    }
    
    // Special notes for doctor's copy
    if (isForDoctor) {
      page.drawText("FOR DOCTOR'S REFERENCE ONLY", {
        x: width / 2 - 100,
        y: 120,
        size: 14,
        font: boldFont,
        color: rgb(0.8, 0, 0),
      });
      
      // Add section for doctor notes if it's the doctor's copy
      page.drawText("Doctor Notes:", {
        x: leftColumnX,
        y: height - 500,
        size: 12,
        font: boldFont,
      });
      
      // Draw a rectangle for notes
      page.drawRectangle({
        x: leftColumnX,
        y: height - 650,
        width: width - 100,
        height: 130,
        borderColor: rgb(0.7, 0.7, 0.7),
        borderWidth: 1,
        color: rgb(0.98, 0.98, 0.98),
      });
    } else {
      // Footer for patient
      page.drawText("Thank you for choosing Eyefem Clinic. Please arrive 10-15 minutes before your appointment.", {
        x: width / 2 - 200,
        y: 100,
        size: 10,
        font,
      });
      
      page.drawText("If you need to reschedule, please call us at least 24 hours in advance.", {
        x: width / 2 - 180,
        y: 80,
        size: 10,
        font,
      });
    }

    return await pdfDoc.save();
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
}

// Helper function to convert Uint8Array to base64 string
function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Main handler for the Supabase Edge Function
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Parse the appointment request
    const appointment: AppointmentRequest = await req.json();
    console.log("Received appointment request:", appointment);
    
    const isApproval = appointment.status === "confirmed";
    const isRejection = appointment.status === "rejected";
    
    if (isApproval) {
      // This is an approval request from admin - send confirmation emails with PDFs
      console.log("Processing approval for appointment");
      
      // Generate both PDFs
      console.log("Generating patient PDF...");
      const patientPdf = await generatePDF(appointment, false);
      console.log("Patient PDF size:", patientPdf.byteLength);
      
      console.log("Generating doctor PDF...");
      const doctorPdf = await generatePDF(appointment, true);
      console.log("Doctor PDF size:", doctorPdf.byteLength);

      // Convert PDFs to base64 for email attachments
      const patientPdfBase64 = arrayBufferToBase64(patientPdf);
      const doctorPdfBase64 = arrayBufferToBase64(doctorPdf);
      console.log("PDF conversion to base64 completed");

      // Prepare email data
      const patientName = `${appointment.firstName} ${appointment.lastName}`;
      const subject = `Your Appointment Has Been Confirmed - ${patientName}`;
      
      // Define specialty-specific colors and styling
      const specialtyColors = {
        eyecare: {
          primary: "#3182CE", // blue
          secondary: "#EBF8FF",
          accent: "#63B3ED"
        },
        gynecology: {
          primary: "#D53F8C", // pink
          secondary: "#FFF5F7",
          accent: "#F687B3"
        }
      };
      
      const colors = specialtyColors[appointment.specialty];
      
      // Email template for confirmation with specialty-specific styling
      const patientHtmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${LOGO_URL}" alt="Eyefem Clinic Logo" style="max-width: 200px; margin: 0 auto 20px;">
          </div>
          
          <div style="text-align: center; margin-bottom: 20px; background-color: ${colors.secondary}; padding: 20px; border-radius: 5px;">
            <h1 style="color: ${colors.primary}; margin: 0; padding: 0;">Eyefem ${appointment.specialty === "eyecare" ? "Eye Care" : "Gynecology"} Clinic</h1>
          </div>
          
          <h2 style="color: ${colors.primary}; text-align: center;">Your Appointment Has Been Confirmed</h2>
          
          <p>Dear ${patientName},</p>
          
          <p>Your appointment with <strong>Dr. ${appointment.doctor}</strong> has been confirmed.</p>
          
          <div style="background-color: ${colors.secondary}; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${colors.primary};">
            <p style="margin: 5px 0;"><strong>Date:</strong> ${appointment.date}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.time}</p>
            <p style="margin: 5px 0;"><strong>Department:</strong> ${appointment.specialty === "eyecare" ? "Eye Care" : "Gynecology"}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${appointment.clinic}</p>
            <p style="margin: 5px 0;"><strong>Reason:</strong> ${appointment.reason}</p>
          </div>
          
          <p>Please find your appointment receipt attached to this email. We recommend arriving 10-15 minutes before your scheduled appointment time.</p>
          
          <p>If you need to reschedule or have any questions, please contact us at +91 98765 43210.</p>
          
          <p style="margin-top: 30px;">Best regards,<br>The Eyefem Clinic Team</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center;">
            <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Eyefem Clinic. All rights reserved.</p>
          </div>
        </div>
      `;

      console.log("Sending confirmation email to patient...");
      // Send email to patient
      const patientEmail = await resend.emails.send({
        from: "Eyefem Clinic <no-reply@resend.dev>",
        to: [appointment.email],
        bcc: [DOCTOR_EMAIL], // Always BCC the admin email
        subject: subject,
        html: patientHtmlContent,
        attachments: [
          {
            filename: `appointment_${appointment.lastName}_${Date.now()}.pdf`,
            content: patientPdfBase64,
          },
        ],
      });
      console.log("Confirmation email sent to patient:", patientEmail);

      console.log("Sending confirmation email to doctor...");
      // Send email to doctor with both PDFs, also with specialty styling
      const doctorEmail = await resend.emails.send({
        from: "Eyefem Clinic <no-reply@resend.dev>",
        to: [DOCTOR_EMAIL], // Doctor's email
        subject: `Appointment Confirmed – ${patientName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="${LOGO_URL}" alt="Eyefem Clinic Logo" style="max-width: 200px; margin: 0 auto 20px;">
            </div>
            
            <div style="text-align: center; margin-bottom: 20px; background-color: ${colors.secondary}; padding: 20px; border-radius: 5px;">
              <h1 style="color: ${colors.primary}; margin: 0; padding: 0;">Eyefem ${appointment.specialty === "eyecare" ? "Eye Care" : "Gynecology"} Clinic</h1>
            </div>
            
            <h2 style="color: ${colors.primary};">Appointment Confirmed – Patient Receipt Attached</h2>
            
            <p>A patient appointment has been confirmed:</p>
            
            <div style="background-color: ${colors.secondary}; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${colors.primary};">
              <p style="margin: 5px 0;"><strong>Patient:</strong> ${patientName}</p>
              ${appointment.age ? `<p style="margin: 5px 0;"><strong>Age:</strong> ${appointment.age}</p>` : ''}
              ${appointment.gender ? `<p style="margin: 5px 0;"><strong>Gender:</strong> ${appointment.gender}</p>` : ''}
              <p style="margin: 5px 0;"><strong>Date:</strong> ${appointment.date}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.time}</p>
              <p style="margin: 5px 0;"><strong>Department:</strong> ${appointment.specialty === "eyecare" ? "Eye Care" : "Gynecology"}</p>
              <p style="margin: 5px 0;"><strong>Reason:</strong> ${appointment.reason}</p>
              <p style="margin: 5px 0;"><strong>Contact:</strong> ${appointment.email} / ${appointment.phone}</p>
            </div>
            
            <p>Both the patient's receipt and your detailed copy are attached to this email.</p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center;">
              <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Eyefem Clinic. All rights reserved.</p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: `doctor_copy_${appointment.lastName}_${Date.now()}.pdf`,
            content: doctorPdfBase64,
          },
          {
            filename: `patient_copy_${appointment.lastName}_${Date.now()}.pdf`,
            content: patientPdfBase64,
          },
        ],
      });
      console.log("Confirmation email sent to doctor:", doctorEmail);

      console.log("Confirmation emails sent successfully:", {
        patientEmail: patientEmail.id,
        doctorEmail: doctorEmail.id
      });

      // Return success with PDF data
      return new Response(
        JSON.stringify({
          success: true,
          message: "Appointment confirmed and emails sent",
          patientPdfBase64: patientPdfBase64,
          patientEmail: patientEmail,
          doctorEmail: doctorEmail,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } else if (isRejection) {
      console.log("Processing rejection for appointment");
      
      // Define specialty-specific colors and styling
      const specialtyColors = {
        eyecare: {
          primary: "#3182CE", // blue
          secondary: "#EBF8FF",
          accent: "#63B3ED"
        },
        gynecology: {
          primary: "#D53F8C", // pink
          secondary: "#FFF5F7",
          accent: "#F687B3"
        }
      };
      
      const colors = specialtyColors[appointment.specialty];
      const patientName = `${appointment.firstName} ${appointment.lastName}`;
      
      // Send rejection email to patient
      console.log("Sending rejection email to patient...");
      const patientEmail = await resend.emails.send({
        from: "Eyefem Clinic <no-reply@resend.dev>",
        to: [appointment.email],
        bcc: [DOCTOR_EMAIL], // Always BCC the admin email
        subject: "Appointment Request - Unable to Accommodate",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="${LOGO_URL}" alt="Eyefem Clinic Logo" style="max-width: 200px; margin: 0 auto 20px;">
            </div>
            
            <div style="text-align: center; margin-bottom: 20px; background-color: ${colors.secondary}; padding: 20px; border-radius: 5px;">
              <h1 style="color: ${colors.primary}; margin: 0; padding: 0;">Eyefem ${appointment.specialty === "eyecare" ? "Eye Care" : "Gynecology"} Clinic</h1>
            </div>
            
            <h2 style="color: ${colors.primary}; text-align: center;">Appointment Request Update</h2>
            
            <p>Dear ${patientName},</p>
            
            <p>Thank you for your interest in booking an appointment with Dr. ${appointment.doctor}. We regret to inform you that we are unable to accommodate your appointment request for the following time slot:</p>
            
            <div style="background-color: ${colors.secondary}; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${colors.primary};">
              <p style="margin: 5px 0;"><strong>Date:</strong> ${appointment.date}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.time}</p>
              <p style="margin: 5px 0;"><strong>Department:</strong> ${appointment.specialty === "eyecare" ? "Eye Care" : "Gynecology"}</p>
            </div>
            
            <p>We apologize for any inconvenience this may cause. We encourage you to try booking for a different time slot or date that might better accommodate your schedule.</p>
            
            <p>If you need assistance with rebooking or have any questions, please feel free to contact us at +91 98765 43210.</p>
            
            <p style="margin-top: 30px;">Best regards,<br>The Eyefem Clinic Team</p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center;">
              <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Eyefem Clinic. All rights reserved.</p>
            </div>
          </div>
        `,
      });
      console.log("Rejection email sent to patient:", patientEmail);

      // Return success response
      return new Response(
        JSON.stringify({
          success: true,
          message: "Rejection email sent successfully",
          patientEmail: patientEmail,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      // This is an initial appointment request - send notification emails without PDFs
      console.log("Processing initial appointment request");
      
      // Prepare email data
      const patientName = `${appointment.firstName} ${appointment.lastName}`;
      
      // Define specialty-specific colors and styling
      const specialtyColors = {
        eyecare: {
          primary: "#3182CE", // blue
          secondary: "#EBF8FF",
          accent: "#63B3ED"
        },
        gynecology: {
          primary: "#D53F8C", // pink
          secondary: "#FFF5F7",
          accent: "#F687B3"
        }
      };
      
      const colors = specialtyColors[appointment.specialty];
      
      // Email template for patient notification with specialty styling and logo
      const patientHtmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${LOGO_URL}" alt="Eyefem Clinic Logo" style="max-width: 200px; margin: 0 auto 20px;">
          </div>
          
          <div style="text-align: center; margin-bottom: 20px; background-color: ${colors.secondary}; padding: 20px; border-radius: 5px;">
            <h1 style="color: ${colors.primary}; margin: 0; padding: 0;">Eyefem ${appointment.specialty === "eyecare" ? "Eye Care" : "Gynecology"} Clinic</h1>
          </div>
          
          <h2 style="color: ${colors.primary}; text-align: center;">Your appointment request has been received</h2>
          
          <p>Dear ${patientName},</p>
          
          <p>Thank you for submitting your appointment request. It has been forwarded to the doctor and is currently pending approval. You will receive a confirmation email once it is approved.</p>
          
          <div style="background-color: ${colors.secondary}; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${colors.primary};">
            <p style="margin: 5px 0;"><strong>Date:</strong> ${appointment.date}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.time}</p>
            <p style="margin: 5px 0;"><strong>Department:</strong> ${appointment.specialty === "eyecare" ? "Eye Care" : "Gynecology"}</p>
            <p style="margin: 5px 0;"><strong>Doctor:</strong> ${appointment.doctor}</p>
            <p style="margin: 5px 0;"><strong>Reason:</strong> ${appointment.reason}</p>
          </div>
          
          <p>If you need to make any changes to your request, please contact us at +91 98765 43210.</p>
          
          <p style="margin-top: 30px;">Best regards,<br>The Eyefem Clinic Team</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center;">
            <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Eyefem Clinic. All rights reserved.</p>
          </div>
        </div>
      `;

      console.log("Sending notification email to patient...");
      // Send email to patient
      try {
        const patientEmail = await resend.emails.send({
          from: "Eyefem Clinic <no-reply@resend.dev>",
          to: [appointment.email],
          bcc: [DOCTOR_EMAIL], // Always BCC the admin email
          subject: "Your appointment request has been received",
          html: patientHtmlContent,
        });
        console.log("Notification email sent to patient:", patientEmail);

        console.log("Sending notification email to doctor...");
        // Send email to doctor about new appointment request, with specialty styling
        const doctorEmail = await resend.emails.send({
          from: "Eyefem Clinic <no-reply@resend.dev>",
          to: [DOCTOR_EMAIL], // Doctor's email
          subject: "New Appointment Request Pending Approval",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="${LOGO_URL}" alt="Eyefem Clinic Logo" style="max-width: 200px; margin: 0 auto 20px;">
              </div>
              
              <div style="text-align: center; margin-bottom: 20px; background-color: ${colors.secondary}; padding: 20px; border-radius: 5px;">
                <h1 style="color: ${colors.primary}; margin: 0; padding: 0;">Eyefem ${appointment.specialty === "eyecare" ? "Eye Care" : "Gynecology"} Clinic</h1>
              </div>
              
              <h2 style="color: ${colors.primary};">New Appointment Request Pending Approval</h2>
              
              <p>You've received a new appointment request. Please log in to the admin panel to confirm or reject it.</p>
              
              <div style="background-color: ${colors.secondary}; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${colors.primary};">
                <p style="margin: 5px 0;"><strong>Patient:</strong> ${patientName}</p>
                ${appointment.age ? `<p style="margin: 5px 0;"><strong>Age:</strong> ${appointment.age}</p>` : ''}
                ${appointment.gender ? `<p style="margin: 5px 0;"><strong>Gender:</strong> ${appointment.gender}</p>` : ''}
                <p style="margin: 5px 0;"><strong>Date:</strong> ${appointment.date}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.time}</p>
                <p style="margin: 5px 0;"><strong>Department:</strong> ${appointment.specialty === "eyecare" ? "Eye Care" : "Gynecology"}</p>
                <p style="margin: 5px 0;"><strong>Reason:</strong> ${appointment.reason}</p>
                <p style="margin: 5px 0;"><strong>Contact:</strong> ${appointment.email} / ${appointment.phone}</p>
              </div>
              
              <p>Please log in to the admin panel to review and take action on this appointment request.</p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center;">
                <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Eyefem Clinic. All rights reserved.</p>
              </div>
            </div>
          `,
        });
        console.log("Notification email sent to doctor:", doctorEmail);

        console.log("Notification emails sent successfully:", {
          patientEmail: patientEmail.id,
          doctorEmail: doctorEmail.id
        });

        // Return success without PDF data
        return new Response(
          JSON.stringify({
            success: true,
            message: "Initial emails sent successfully for new appointment request",
            patientEmail: patientEmail,
            doctorEmail: doctorEmail,
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        throw new Error("Failed to send email: " + emailError.message);
      }
    }
  } catch (error) {
    console.error("Error processing appointment:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to process appointment",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
