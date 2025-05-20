
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, AlertTriangle } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract token and expiration from query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const expires = params.get('expires');
    
    // Validate token and expiration
    if (!token) {
      console.error("Missing reset token in URL");
      setTokenError("Invalid reset link. Please request a new one.");
      return;
    }
    
    if (expires) {
      const expirationTime = new Date(decodeURIComponent(expires)).getTime();
      const currentTime = new Date().getTime();
      
      if (currentTime > expirationTime) {
        console.error("Reset token expired", { expirationTime, currentTime });
        setTokenError("This password reset link has expired. Please request a new one.");
        return;
      }
    }
    
    // Verify session is present
    const checkResetSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        // If there's no session or no user, redirect to login
        if (error || !data.session || !data.session.user) {
          console.error("Invalid session for password reset:", error);
          setTokenError("This password reset link is invalid or has expired. Please request a new one.");
        }
      } catch (err) {
        console.error("Error checking session:", err);
        setTokenError("An error occurred while validating your reset link. Please try again.");
      }
    };
    
    checkResetSession();
  }, [location.search, navigate]);
  
  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    if (password.length < 8) {
      return 'weak';
    }
    
    // Check for complexity
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    const complexity = [hasUppercase, hasLowercase, hasNumbers, hasSpecial].filter(Boolean).length;
    
    if (complexity >= 3 && password.length >= 10) {
      return 'strong';
    } else if (complexity >= 2 && password.length >= 8) {
      return 'medium';
    }
    return 'weak';
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordStrength === 'weak') {
      toast({
        title: "Password too weak",
        description: "Please use a stronger password with a mix of uppercase, lowercase, numbers, and special characters.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update password through Supabase Auth API
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        throw error;
      }
      
      // Log the successful reset for audit
      console.log(`Password reset completed successfully at ${new Date().toISOString()}`);
      
      setSuccess(true);
      toast({
        title: "Password updated",
        description: "Your password has been successfully reset.",
      });
      
      // Clear the token from the URL for security
      window.history.replaceState({}, document.title, '/admin/reset-password');
      
      // Auto redirect after a few seconds
      setTimeout(() => {
        navigate('/admin');
      }, 3000);
      
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Error",
        description: "There was a problem resetting your password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-red-600">Reset Link Invalid</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center py-8">
            <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>
            <p className="text-lg font-medium">Link Error</p>
            <p className="text-gray-500">{tokenError}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/admin/forgot-password')}
            >
              Request New Reset Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        
        {success ? (
          <CardContent className="space-y-4 text-center py-8">
            <div className="mx-auto w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <p className="text-lg font-medium">Password Reset Successful!</p>
            <p className="text-gray-500">
              Your password has been successfully updated.
              You will be redirected to the login page shortly.
            </p>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your new password"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={isLoading}
                  required
                  className={`${
                    passwordStrength === 'weak' ? 'border-red-500' : 
                    passwordStrength === 'medium' ? 'border-yellow-500' : 
                    passwordStrength === 'strong' ? 'border-green-500' : ''
                  }`}
                />
                
                {password && (
                  <div className="mt-1">
                    <div className="flex items-center gap-2">
                      <div className="h-1 flex-1 rounded-full bg-gray-200 overflow-hidden">
                        <div 
                          className={`h-full ${
                            passwordStrength === 'weak' ? 'w-1/3 bg-red-500' : 
                            passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' : 
                            'w-full bg-green-500'
                          }`} 
                        />
                      </div>
                      <span className={`text-xs ${
                        passwordStrength === 'weak' ? 'text-red-500' : 
                        passwordStrength === 'medium' ? 'text-yellow-500' : 
                        'text-green-500'
                      }`}>
                        {passwordStrength === 'weak' ? 'Weak' : 
                         passwordStrength === 'medium' ? 'Medium' : 
                         'Strong'}
                      </span>
                    </div>
                    {passwordStrength === 'weak' && (
                      <p className="text-xs text-red-500 mt-1">
                        Password must be at least 8 characters and include a mix of letters, numbers, and special characters.
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className={`${
                    confirmPassword && password !== confirmPassword ? 'border-red-500' : 
                    confirmPassword ? 'border-green-500' : ''
                  }`}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    Passwords don't match
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || passwordStrength === 'weak' || password !== confirmPassword}
              >
                {isLoading ? "Updating..." : "Reset Password"}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ResetPassword;
