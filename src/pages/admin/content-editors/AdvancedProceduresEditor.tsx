import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, AlertTriangle, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useGyneAdvancedProcedures } from '@/hooks/useGyneAdvancedProcedures';
import { Label } from '@/components/ui/label';

export const AdvancedProceduresEditor = () => {
  const { procedure, isLoading, error, updateProcedure, uploadImage } = useGyneAdvancedProcedures();
  const [editData, setEditData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_url: ''
  });
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize edit data from procedure
  useEffect(() => {
    if (procedure) {
      setEditData({
        title: procedure.title,
        subtitle: procedure.subtitle,
        description: procedure.description,
        image_url: procedure.image_url || ''
      });
      
      if (procedure.image_url) {
        setImagePreview(procedure.image_url);
      }
    }
  }, [procedure]);

  const handleSave = async () => {
    if (!editData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSaving(true);
    try {
      const success = await updateProcedure(editData);
      if (success) {
        toast.success('Advanced Procedures updated successfully!');
      } else {
        toast.error('Failed to update Advanced Procedures.');
      }
    } catch (err) {
      console.error('Error saving Advanced Procedures:', err);
      toast.error('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    try {
      // Show a temporary preview
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);

      // Upload the image
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        setEditData({ ...editData, image_url: imageUrl });
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
        // Revert to previous image if upload failed
        setImagePreview(editData.image_url || null);
      }
    } catch (err) {
      console.error('Error handling image:', err);
      toast.error('An error occurred while uploading the image');
      setImagePreview(editData.image_url || null);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setEditData({ ...editData, image_url: '' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-gynecology" />
          <p className="mt-2">Loading Advanced Procedures...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">Error loading Advanced Procedures</h3>
        </div>
        <p className="mt-2 text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Advanced Procedures</h3>
        <p className="text-sm text-gray-500">Edit the Advanced Procedures section displayed on the doctor page</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input
            value={editData.title}
            onChange={(e) => setEditData({...editData, title: e.target.value})}
            placeholder="Enter section title"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Subtitle</label>
          <Input
            value={editData.subtitle}
            onChange={(e) => setEditData({...editData, subtitle: e.target.value})}
            placeholder="Enter section subtitle"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <p className="text-xs text-gray-500 mb-1">Use bullet points with • character for lists</p>
          <Textarea
            value={editData.description}
            onChange={(e) => setEditData({...editData, description: e.target.value})}
            placeholder="Enter section description"
            rows={8}
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="procedure-image" className="block text-sm font-medium mb-1">Procedure Image</Label>
          <div className="flex items-center">
            <div 
              className="rounded overflow-hidden border-2 border-gray-200 shadow-md w-32 h-32 mr-6 flex-shrink-0 relative cursor-pointer group"
              onClick={handleImageClick}
            >
              {imagePreview ? (
                <>
                  <img 
                    src={imagePreview} 
                    alt="Advanced Procedure Preview" 
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
              id="procedure-image"
            />
            
            <div>
              <p className="text-xs text-gray-500">
                Click to upload an image. Recommended size: 800x600 pixels.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gynecology hover:bg-gynecology/90"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}; 