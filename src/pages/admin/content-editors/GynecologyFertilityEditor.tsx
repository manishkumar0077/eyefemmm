import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFertilityTreatments } from "@/hooks/useFertilityTreatments";
import { Loader2, Save, Plus, Trash2, Upload, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const GynecologyFertilityEditor = () => {
  const { fertilityData, isLoading, updateData } = useFertilityTreatments();
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    treatments: [] as string[],
    currentTreatment: ''
  });
  
  useEffect(() => {
    if (fertilityData) {
      setForm({
        title: fertilityData.title || '',
        description: fertilityData.description || '',
        treatments: Array.isArray(fertilityData.treatments) ? fertilityData.treatments : [],
        currentTreatment: ''
      });
      setImagePreview(fertilityData.image_url || null);
    }
  }, [fertilityData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddTreatment = () => {
    if (form.currentTreatment.trim()) {
      setForm(prev => ({
        ...prev,
        treatments: [...prev.treatments, prev.currentTreatment.trim()],
        currentTreatment: ''
      }));
    }
  };
  
  const handleRemoveTreatment = (index: number) => {
    setForm(prev => ({
      ...prev,
      treatments: prev.treatments.filter((_, i) => i !== index)
    }));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTreatment();
    }
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
    if (!form.title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a title",
        variant: "destructive"
      });
      return;
    }
    
    if (!form.description.trim()) {
      toast({
        title: "Missing description",
        description: "Please enter a description",
        variant: "destructive"
      });
      return;
    }
    
    setSaving(true);
    try {
      const success = await updateData({
        title: form.title,
        description: form.description,
        treatments: form.treatments
      }, imageFile || undefined);
      
      if (success) {
        setImageFile(null);
        toast({
          title: "Success",
          description: "Fertility section updated successfully"
        });
      }
    } catch (error) {
      console.error("Error saving fertility data:", error);
      toast({
        title: "Error",
        description: "Failed to update fertility data",
        variant: "destructive"
      });
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
          <Label htmlFor="title">Title</Label>
          <Input 
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Advanced Fertility Treatments"
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Our fertility center offers state-of-the-art reproductive technologies..."
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="image" className="block mb-2">Section Image</Label>
          <div className="flex items-center">
            <div 
              className="rounded-lg overflow-hidden border-2 border-gray-200 shadow-md w-32 h-24 mr-6 flex-shrink-0 relative cursor-pointer group"
              onClick={handleImageClick}
            >
              {imagePreview ? (
                <>
                  <img 
                    src={imagePreview} 
                    alt="Fertility Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/lovable-uploads/default-image.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
              id="image"
            />
            
            <div>
              <p className="text-sm text-gray-500">
                Click to upload an image. Recommended size: 800x600 pixels.
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <Label>Treatments</Label>
          <div className="flex gap-2 mb-2">
            <Input 
              placeholder="Add a treatment option..."
              value={form.currentTreatment}
              name="currentTreatment"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
            <Button 
              type="button" 
              onClick={handleAddTreatment}
              variant="outline"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="bg-gray-50 rounded-md p-2 min-h-24">
            {form.treatments.length === 0 ? (
              <p className="text-gray-500 text-center p-4">No treatments added. Add a treatment above.</p>
            ) : (
              <ul className="space-y-2">
                {form.treatments.map((treatment, index) => (
                  <li key={index} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                    <span>{treatment}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveTreatment(index)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </>
        )}
      </Button>
    </div>
  );
}; 