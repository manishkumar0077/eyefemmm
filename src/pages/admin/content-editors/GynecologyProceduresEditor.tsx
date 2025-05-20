import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGynecologyProcedures } from "@/hooks/useGynecologyProcedures";
import { 
  Loader2, Save, Upload, X, Plus, Trash2, 
  AlertTriangle, MoveUp, MoveDown, Image, Edit
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const GynecologyProceduresEditor = () => {
  const { procedures, isLoading, error, updateProcedure, addProcedure, deleteProcedure } = useGynecologyProcedures();
  const [editingProcedure, setEditingProcedure] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state for editing/adding
  const [form, setForm] = useState({
    title: '',
    description: '',
    alt_text: '',
    image_url: ''
  });
  
  // Image handling
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when the editing procedure changes
  useEffect(() => {
    if (editingProcedure !== null) {
      const procedure = procedures.find(p => p.id === editingProcedure);
      if (procedure) {
        setForm({
          title: procedure.title,
          description: procedure.description,
          alt_text: procedure.alt_text,
          image_url: procedure.image_url
        });
        setImagePreview(procedure.image_url);
      }
    } else if (!showAddDialog) {
      resetForm();
    }
  }, [editingProcedure, procedures, showAddDialog]);

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      alt_text: '',
      image_url: ''
    });
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!form.description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (!form.alt_text.trim()) {
      toast.error("Alt text is required for accessibility");
      return;
    }

    if (!imagePreview && !form.image_url) {
      toast.error("Image is required");
      return;
    }

    setSaving(true);
    try {
      let success;
      
      if (editingProcedure !== null) {
        // Update existing procedure
        success = await updateProcedure(
          editingProcedure,
          form,
          imageFile || undefined
        );
        
        if (success) {
          setEditingProcedure(null);
          toast.success("Procedure updated successfully");
        }
      } else {
        // Add new procedure
        success = await addProcedure(
          form as Omit<typeof form, 'id' | 'created_at'>,
          imageFile || undefined
        );
        
        if (success) {
          setShowAddDialog(false);
          toast.success("New procedure added successfully");
        }
      }
      
      if (!success) {
        toast.error("Failed to save procedure");
      }
    } catch (error) {
      console.error("Error saving procedure:", error);
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this procedure?")) {
      try {
        const success = await deleteProcedure(id);
        
        if (success) {
          toast.success("Procedure deleted successfully");
        } else {
          toast.error("Failed to delete procedure");
        }
      } catch (error) {
        console.error("Error deleting procedure:", error);
        toast.error("An error occurred while deleting");
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">Error loading procedures</h3>
        </div>
        <p className="mt-2 text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  // Organize procedures - first 2 cards in top row, remainder in bottom row
  const topRowProcedures = procedures.slice(0, 2);
  const bottomRowProcedures = procedures.slice(2);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Gynecology Procedures</h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => { resetForm(); setEditingProcedure(null); }}
              className="bg-gynecology hover:bg-gynecology/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Procedure
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Procedure</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {renderForm()}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {topRowProcedures.map((procedure) => (
          <ProcedureCard 
            key={procedure.id} 
            procedure={procedure}
            onEdit={() => setEditingProcedure(procedure.id)}
            onDelete={() => handleDelete(procedure.id)}
          />
        ))}
      </div>

      <h3 className="text-lg font-medium mb-4">Additional Procedures</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bottomRowProcedures.map((procedure) => (
          <ProcedureCard 
            key={procedure.id} 
            procedure={procedure}
            onEdit={() => setEditingProcedure(procedure.id)}
            onDelete={() => handleDelete(procedure.id)}
            compact
          />
        ))}
      </div>

      {/* Editing Dialog */}
      <Dialog open={editingProcedure !== null} onOpenChange={(open) => !open && setEditingProcedure(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Procedure</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {renderForm()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  function renderForm() {
    return (
      <>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Procedure Title</Label>
            <Input 
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ultrasound Procedure"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Using advanced technology for accurate diagnosis"
            />
          </div>
          
          <div>
            <Label htmlFor="alt_text">Image Alt Text</Label>
            <Input 
              id="alt_text"
              name="alt_text"
              value={form.alt_text}
              onChange={handleChange}
              placeholder="Dr. Nisha Bhatnagar performing ultrasound"
            />
            <p className="text-xs text-gray-500 mt-1">
              Describe the image for accessibility (for screen readers)
            </p>
          </div>

          {/* Image Upload Section */}
          <div className="mb-4">
            <Label htmlFor="procedure-image" className="block mb-2">Procedure Image</Label>
            <div className="flex items-center">
              <div 
                className="rounded overflow-hidden border-2 border-gray-200 shadow-md w-32 h-32 mr-6 flex-shrink-0 relative cursor-pointer group"
                onClick={handleImageClick}
              >
                {imagePreview ? (
                  <>
                    <img 
                      src={imagePreview} 
                      alt="Procedure Preview" 
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
                <p className="text-sm text-gray-500">
                  Click to upload an image.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Recommended size: 800x600 pixels
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => editingProcedure ? setEditingProcedure(null) : setShowAddDialog(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            className="bg-gynecology hover:bg-gynecology/90"
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
                Save {editingProcedure !== null ? 'Changes' : 'Procedure'}
              </span>
            )}
          </Button>
        </div>
      </>
    );
  }
};

interface ProcedureCardProps {
  procedure: {
    id: number;
    image_url: string;
    alt_text: string;
    title: string;
    description: string;
  };
  onEdit: () => void;
  onDelete: () => void;
  compact?: boolean;
}

const ProcedureCard = ({ procedure, onEdit, onDelete, compact = false }: ProcedureCardProps) => {
  return (
    <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
      <div className={`relative ${compact ? 'h-40' : 'h-52'}`}>
        <img 
          src={procedure.image_url} 
          alt={procedure.alt_text}
          className="w-full h-full object-cover" 
          onError={(e) => {
            e.currentTarget.src = "/lovable-uploads/default-image.png";
          }}
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white text-black hover:bg-white/90"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>
      <CardContent className={`${compact ? 'p-3' : 'p-4'}`}>
        <h3 className={`font-semibold text-gray-800 ${compact ? 'text-sm' : 'text-base'} mb-1`}>{procedure.title}</h3>
        <p className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'} line-clamp-2`}>{procedure.description}</p>
      </CardContent>
    </Card>
  );
};
