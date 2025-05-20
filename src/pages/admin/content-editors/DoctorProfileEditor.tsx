import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDoctorProfile } from "@/hooks/useDoctorProfile";
import { Loader2, Save, Upload, X } from "lucide-react";
import { toast } from "sonner";

export const DoctorProfileEditor = () => {
  const { profile, isLoading, updateProfile } = useDoctorProfile();
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [form, setForm] = useState({
    full_name: '',
    title: '',
    description: '',
    appointment_url: ''
  });
  
  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        title: profile.title || '',
        description: profile.description || '',
        appointment_url: profile.appointment_url || ''
      });
      setImagePreview(profile.image_url || null);
    }
  }, [profile]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSave = async () => {
    if (!form.full_name.trim()) {
      toast.error("Doctor name is required");
      return;
    }
    
    if (!form.title.trim()) {
      toast.error("Doctor title is required");
      return;
    }
    
    setSaving(true);
    try {
      const success = await updateProfile(form, imageFile || undefined);
      
      if (success) {
        setImageFile(null);
        toast.success("Doctor profile updated successfully");
      } else {
        toast.error("Failed to update doctor profile");
      }
    } catch (error) {
      console.error("Error saving doctor profile:", error);
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="full_name">Doctor Name</Label>
          <Input 
            id="full_name"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Dr. Sanjeev Lehri"
          />
        </div>
        
        <div>
          <Label htmlFor="title">Title/Specialization</Label>
          <Input 
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Senior Ophthalmologist & Eye Surgeon"
          />
        </div>
        
        <div>
          <Label htmlFor="description">Bio/Description</Label>
          <Textarea 
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="With over 15 years of experience, Dr. Sanjeev Lehri is a renowned ophthalmologist..."
          />
        </div>

        <div>
          <Label htmlFor="appointment_url">Appointment URL</Label>
          <Input 
            id="appointment_url"
            name="appointment_url"
            value={form.appointment_url}
            onChange={handleChange}
            placeholder="https://example.com/book-appointment"
          />
        </div>

        {/* Image Upload Section */}
        <div className="mb-4">
          <Label htmlFor="doctor-image" className="block mb-2">Doctor Photo</Label>
          <div className="flex items-center">
            <div 
              className="rounded-full overflow-hidden border-2 border-gray-200 shadow-md w-32 h-32 mr-6 flex-shrink-0 relative cursor-pointer group"
              onClick={handleImageClick}
            >
              {imagePreview ? (
                <>
                  <img 
                    src={imagePreview} 
                    alt="Doctor Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/lovable-uploads/default-profile.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Upload className="h-6 w-6 text-gray-400" />
                </div>
              )}
              
              {imagePreview && (
                <button 
                  type="button"
                  className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 text-white" 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="doctor-image"
            />
            
            <div>
              <p className="text-sm text-gray-500">
                Click to upload a profile photo. Square images work best (1:1 ratio).
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Recommended size: 400x400 pixels
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Button 
        className="w-full bg-eyecare hover:bg-eyecare/90"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            Saving...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </span>
        )}
      </Button>
    </div>
  );
};

export default DoctorProfileEditor;