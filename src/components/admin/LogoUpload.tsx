import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Upload, Check, AlertCircle, Info } from 'lucide-react';
import { uploadLogo, getLogoUrl, checkLogoExists } from '@/integrations/supabase/logoStorage';

const LogoUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [logoExists, setLogoExists] = useState(false);
  
  useEffect(() => {
    const checkLogo = async () => {
      const exists = await checkLogoExists();
      setLogoExists(exists);
      
      if (exists) {
        const url = getLogoUrl();
        setLogoUrl(url);
        console.log('Logo exists, URL set to:', url);
      }
    };
    
    checkLogo();
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file type
      if (!['image/jpeg', 'image/png', 'image/svg+xml'].includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPEG, PNG, or SVG image.",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 2MB)
      if (selectedFile.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Logo image must be smaller than 2MB.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      // Upload logo to the fixed location
      const url = await uploadLogo(file);
      setLogoUrl(url);
      setLogoExists(true);

      if (window.EYEFEM_LOGO_URL) {
        window.EYEFEM_LOGO_URL = url;
      }

      toast({
        title: "Logo uploaded",
        description: "Your logo has been successfully uploaded and will appear in emails.",
      });
    } catch (error) {
      console.error('Error uploading new logo:', error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clinic Logo</CardTitle>
        <CardDescription>
          Upload your clinic logo for use in emails and PDF documents.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logoExists && (
            <div className="mb-4 p-4 border rounded-md bg-green-50 flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700">
                Logo is already uploaded and will appear in emails
              </span>
            </div>
          )}
          
          <div className="p-4 border rounded-md bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">
                Logo Storage Information
              </span>
            </div>
            <p className="text-xs text-blue-600 mb-1">
              Your logo is stored at: <code className="bg-blue-100 px-1 py-0.5 rounded">website-content/eyefem-logo.png</code>
            </p>
            <p className="text-xs text-blue-600">
              This file will be used in email templates and PDF documents automatically.
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                type="file"
                id="logo-upload"
                accept=".jpg,.jpeg,.png,.svg"
                onChange={handleFileChange}
              />
            </div>
            <Button 
              onClick={handleUpload} 
              disabled={!file || isUploading}
              className="whitespace-nowrap"
            >
              {isUploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </>
              )}
            </Button>
          </div>
          
          {preview && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Preview:</p>
              <div className="border rounded-md p-4 bg-white h-24 flex items-center justify-center">
                <img 
                  src={preview} 
                  alt="Logo preview" 
                  className="h-14 w-auto object-contain"
                />
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Current logo:</p>
            <div className="border rounded-md p-4 bg-white h-24 flex items-center justify-center">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Current logo" 
                  className="h-14 w-auto object-contain"
                />
              ) : (
                <div className="h-14 flex items-center justify-center text-sm text-gray-400">
                  No logo uploaded yet
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            <p className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              For best results, upload a logo with transparent background (PNG or SVG).
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogoUpload;
