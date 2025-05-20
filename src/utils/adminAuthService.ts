
import { supabase } from "@/integrations/supabase/client";
import crypto from 'crypto';

// Generate a strong 6-digit OTP using crypto for better randomness
export const generateOTP = (): string => {
  // Use crypto for better randomness when available, fallback to Math.random
  try {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    // Ensure it's 6 digits by taking modulo and adding offset
    return String(100000 + (buffer[0] % 900000));
  } catch (error) {
    // Fallback to Math.random if crypto is not available
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
};

// Encrypt OTP for added security
export const encryptOTP = (otp: string): string => {
  try {
    // Simple encryption for demonstration (in a real app, use a proper encryption library)
    // This is a simple Caesar cipher with shift of 3
    return otp.split('').map(char => {
      const digit = parseInt(char);
      return ((digit + 3) % 10).toString();
    }).join('');
  } catch (error) {
    console.error('Error encrypting OTP:', error);
    return otp; // Return original OTP if encryption fails
  }
};

// Decrypt OTP
export const decryptOTP = (encryptedOtp: string): string => {
  try {
    // Simple decryption (corresponding to the encryption above)
    return encryptedOtp.split('').map(char => {
      const digit = parseInt(char);
      return ((digit + 7) % 10).toString(); // (digit - 3 + 10) % 10
    }).join('');
  } catch (error) {
    console.error('Error decrypting OTP:', error);
    return encryptedOtp; // Return encrypted OTP if decryption fails
  }
};

// Save OTP to database with expiry time (15 minutes)
export const saveOTP = async (email: string, otp: string): Promise<boolean> => {
  try {
    // First check if the email exists in admin_users table
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', email)
      .single();

    if (adminError || !adminUser) {
      console.error("Email not found in admin users:", adminError);
      return false;
    }

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minute expiry

    // Delete any existing OTPs for this email first
    await supabase
      .from('admin_otps')
      .delete()
      .eq('email', email);

    // Encrypt OTP before saving to database
    const encryptedOTP = encryptOTP(otp);
    console.log("Saving encrypted OTP to database:", { email, encryptedOTP, expires_at: expiresAt.toISOString() });

    // Insert new OTP in the database
    const { error } = await supabase
      .from('admin_otps')
      .insert({
        email,
        otp: encryptedOTP, // Store encrypted OTP
        expires_at: expiresAt.toISOString()
      });

    if (error) {
      console.error("Error saving OTP:", error);
      return false;
    }

    console.log("OTP saved successfully to database");
    return true;
  } catch (error) {
    console.error("Error in saveOTP:", error);
    return false;
  }
};

// Verify OTP
export const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
  try {
    console.log("Verifying OTP:", { email, otp });
    
    const { data, error } = await supabase
      .from('admin_otps')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      console.error("Invalid OTP or not found in database:", error);
      return false;
    }

    console.log("Encrypted OTP found in database:", data);

    // Decrypt the OTP from the database
    const decryptedOTP = decryptOTP(data.otp);
    console.log("Decrypted OTP:", decryptedOTP);

    // Compare with the OTP provided by the user
    if (decryptedOTP !== otp) {
      console.error("OTP doesn't match after decryption");
      return false;
    }

    // Check if OTP is expired
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      console.error("OTP expired. Expiry time was:", expiresAt);
      return false;
    }

    // Delete the OTP after successful verification
    await supabase
      .from('admin_otps')
      .delete()
      .eq('email', email);

    console.log("OTP verified successfully and removed from database");
    return true;
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    return false;
  }
};

// Reset password
export const resetAdminPassword = async (email: string, newPassword: string): Promise<boolean> => {
  try {
    console.log("Resetting password for email:", email);
    
    // First check if the email exists in admin_users table
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (adminError || !adminUser) {
      console.error("Email not found in admin users:", adminError);
      return false;
    }

    // Update the password
    const { error } = await supabase
      .from('admin_passwords')
      .update({ password: newPassword })
      .eq('username', 'eyefem'); // Using hardcoded username as specified

    if (error) {
      console.error("Error resetting password:", error);
      return false;
    }

    console.log("Password reset successfully in database");
    return true;
  } catch (error) {
    console.error("Error in resetAdminPassword:", error);
    return false;
  }
};
