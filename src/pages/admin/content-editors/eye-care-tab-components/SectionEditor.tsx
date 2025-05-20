import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Trash2, Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EyeCareSection } from "@/hooks/useEyeCareTabServicesLatest";

interface SectionEditorProps {
  sections: EyeCareSection[];
  selectedSectionId: string | null;
  isAdding: boolean;
  isEditing: boolean;
  uploadImage: (file: File) => Promise<string | null>;
  addSection: (section: { title: string; image_url: string | null }) => Promise<boolean>;
  updateSection: (id: string, updates: Partial<EyeCareSection>) => Promise<boolean>;
  deleteSection: (id: string) => Promise<boolean>;
  onCancel: () => void;
  onRefresh: () => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  sections,
  selectedSectionId,
  isAdding,
  isEditing,
  uploadImage,
  addSection,
  updateSection,
  deleteSection,
  onCancel,
  onRefresh
}) => {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Load section data when editing
  useEffect(() => {
    if (isEditing && selectedSectionId) {
      const section = sections.find(s => s.id === selectedSectionId);
      if (section) {
        setTitle(section.title);
        setImageUrl(section.image_url);
        setImagePreview(section.image_url);
      }
    } else if (isAdding) {
      // Reset form for adding new section
      setTitle('');
      setImageUrl(null);
      setImagePreview(null);
    }
  }, [isEditing, isAdding, selectedSectionId, sections]);
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (files && files.length > 0) {
      const file = files[0];
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle image upload
  const handleImageUpload = async () => {
    const files = fileInputRef.current?.files;
    
    if (!files || files.length === 0) {
      toast({
        title: "Error",
        description: "Please select an image to upload",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    try {
      const file = files[0];
      const url = await uploadImage(file);
      
      if (url) {
        setImageUrl(url);
        toast({
          title: "Success",
          description: "Image uploaded successfully"
        });
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle save (add or update)
  const handleSave = async () => {
    // Validate form
    if (!title) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      let success = false;
      
      if (isAdding) {
        // Add new section
        success = await addSection({
          title,
          image_url: imageUrl
        });
        
        if (success) {
          toast({
            title: "Success",
            description: "Section added successfully"
          });
          onRefresh();
          onCancel();
        }
      } else if (isEditing && selectedSectionId) {
        // Update existing section
        success = await updateSection(selectedSectionId, {
          title,
          image_url: imageUrl
        });
        
        if (success) {
          toast({
            title: "Success",
            description: "Section updated successfully"
          });
          onRefresh();
          onCancel();
        }
      }
    } catch (err) {
      console.error("Error saving section:", err);
      toast({
        title: "Error",
        description: "Failed to save section",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!selectedSectionId) return;
    
    const confirmed = window.confirm("Are you sure you want to delete this section? This will also delete all subsections and items under it.");
    if (!confirmed) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteSection(selectedSectionId);
      
      if (success) {
        toast({
          title: "Success",
          description: "Section deleted successfully"
        });
        onRefresh();
        onCancel();
      }
    } catch (err) {
      console.error("Error deleting section:", err);
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // If not editing or adding, show a message
  if (!isEditing && !isAdding) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Section Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select a section to edit, or click "Add New Section" to create one.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isAdding ? "Add New Section" : "Edit Section"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="section-title">Section Title</Label>
            <Input
              id="section-title"
              placeholder="e.g., Clinical Services"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="section-image">Section Image</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="section-image"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Button 
                onClick={handleImageUpload} 
                variant="secondary"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-4">
              <Label>Image Preview</Label>
              <div className="mt-2 relative aspect-video rounded-md overflow-hidden border">
                <img 
                  src={imagePreview} 
                  alt="Section preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/lovable-uploads/default-image.png";
                  }}
                />
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <div>
              <Button variant="outline" onClick={onCancel} className="mr-2">
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </>
                )}
              </Button>
            </div>
            
            {isEditing && (
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SectionEditor;
