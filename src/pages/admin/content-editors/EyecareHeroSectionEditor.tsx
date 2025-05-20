import { useState, useEffect, useRef } from 'react';
import { useEyecareHeroSection } from '@/hooks/useEyecareHeroSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, Save, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export const EyecareHeroSectionEditor = () => {
  const { 
    heroSection, 
    isLoading, 
    error, 
    updateHeroSection, 
    uploadImage,
    refreshData
  } = useEyecareHeroSection();

  const [editValues, setEditValues] = useState({
    title: '',
    subtitle: '',
    image_url: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form when hero section is loaded
  useEffect(() => {
    if (heroSection) {
      setEditValues({
        title: heroSection.title,
        subtitle: heroSection.subtitle,
        image_url: heroSection.image_url
      });
      setImagePreview(heroSection.image_url);
    }
  }, [heroSection]);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    console.log("File selected for upload:", file.name);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      console.log("Image uploaded, URL:", imageUrl);
      if (imageUrl) {
        setEditValues(prev => ({ ...prev, image_url: imageUrl }));
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (err) {
      console.error('Error handling image:', err);
      toast.error('An error occurred while uploading the image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editValues.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSaving(true);
    try {
      const success = await updateHeroSection(editValues);
      if (success) {
        toast.success('Hero section updated successfully');
        refreshData();
      } else {
        toast.error('Failed to update hero section');
      }
    } catch (err) {
      console.error('Error updating hero section:', err);
      toast.error('An error occurred while updating');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Advanced Eye Care Services</CardTitle>
          <CardDescription>Edit the hero section on the Eyecare homepage</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Advanced Eye Care Services</CardTitle>
          <CardDescription>Edit the hero section on the Eyecare homepage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 p-4 rounded-md text-red-500">
            An error occurred while loading data. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Eye Care Services</CardTitle>
        <CardDescription>Edit the hero section on the Eyecare homepage</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={editValues.title}
              onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
              placeholder="Enter title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Textarea
              id="subtitle"
              value={editValues.subtitle || ''}
              onChange={(e) => setEditValues({ ...editValues, subtitle: e.target.value })}
              placeholder="Enter subtitle"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Hero Image</Label>
            <div 
              className="border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={handleImageClick}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
              
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Hero preview" 
                    className="w-full h-48 object-cover rounded-md" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity rounded-md">
                    <Button variant="ghost" size="sm" className="text-white">
                      <ImageIcon className="h-5 w-5 mr-2" />
                      Change Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload an image</p>
                </div>
              )}

              {isUploading && (
                <div className="mt-2 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Uploading...</span>
                </div>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isUploading || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving Changes
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EyecareHeroSectionEditor;
