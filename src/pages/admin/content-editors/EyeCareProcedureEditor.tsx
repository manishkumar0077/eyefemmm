import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Edit, Trash2, Upload, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { EyeCareProcedure, useEyeCareProcedures } from "@/hooks/useEyeCareProcedures";

export const EyeCareProcedureEditor = () => {
  const [editingItem, setEditingItem] = useState<EyeCareProcedure | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    alt_text: '',
    image_url: ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { procedures, isLoading, addProcedure, updateProcedure, deleteProcedure } = useEyeCareProcedures();
  const { toast } = useToast();

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      alt_text: '',
      image_url: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingItem(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };
  
  const handleOpenEditDialog = (item: EyeCareProcedure) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      description: item.description,
      alt_text: item.alt_text,
      image_url: item.image_url
    });
    setImagePreview(item.image_url);
    setIsEditDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (item: EyeCareProcedure) => {
    setEditingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
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

  const validateForm = () => {
    if (!form.title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a title for the procedure",
        variant: "destructive"
      });
      return false;
    }
    
    if (!form.description.trim()) {
      toast({
        title: "Missing description",
        description: "Please enter a description for the procedure",
        variant: "destructive"
      });
      return false;
    }
    
    if (!form.alt_text.trim()) {
      toast({
        title: "Missing alt text",
        description: "Please enter alt text for the image",
        variant: "destructive"
      });
      return false;
    }
    
    if (!imagePreview && !isEditDialogOpen) {
      toast({
        title: "Missing image",
        description: "Please select an image for the procedure",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const success = await addProcedure(
        {
          title: form.title.trim(),
          description: form.description.trim(),
          alt_text: form.alt_text.trim(),
          image_url: form.image_url
        },
        imageFile || undefined
      );
      
      if (success) {
        setIsAddDialogOpen(false);
        resetForm();
      }
    } catch (err) {
      console.error("Error adding procedure:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingItem || !validateForm()) return;
    
    setLoading(true);
    try {
      const updates = {
        title: form.title.trim(),
        description: form.description.trim(),
        alt_text: form.alt_text.trim()
      };
      
      if (!imageFile && imagePreview !== editingItem.image_url) {
        updates.image_url = imagePreview || '';
      }
      
      const success = await updateProcedure(
        editingItem.id,
        updates,
        imageFile || undefined
      );
      
      if (success) {
        setIsEditDialogOpen(false);
        resetForm();
      }
    } catch (err) {
      console.error("Error updating procedure:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingItem) return;
    
    setLoading(true);
    try {
      const success = await deleteProcedure(editingItem.id);
      
      if (success) {
        setIsDeleteDialogOpen(false);
        resetForm();
      }
    } catch (err) {
      console.error("Error deleting procedure:", err);
    } finally {
      setLoading(false);
    }
  };

  const ImageUploader = () => (
    <div className="mb-4">
      <Label htmlFor="image" className="block mb-2">Image</Label>
      <div className="flex items-center">
        <div 
          className="rounded-lg overflow-hidden border-2 border-gray-200 shadow-md w-24 h-24 mr-6 flex-shrink-0 relative cursor-pointer group"
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
          id="image"
        />
        
        <div>
          <p className="text-sm text-gray-500">
            Click to upload an image. Recommended size: 800x600 pixels.
          </p>
        </div>
      </div>
    </div>
  );

  const FormFields = () => (
    <>
      <div className="mb-4">
        <Label htmlFor="title">Title</Label>
        <Input 
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          className="mt-1"
          placeholder="e.g., Advanced Diagnostic Testing"
          required
        />
      </div>
      
      <div className="mb-4">
        <Label htmlFor="alt_text">Alt Text</Label>
        <Input 
          id="alt_text"
          name="alt_text"
          value={form.alt_text}
          onChange={handleChange}
          className="mt-1"
          placeholder="e.g., Advanced eye examination equipment"
          required
        />
      </div>
      
      <div className="mb-4">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={2}
          className="mt-1"
          placeholder="e.g., Early detection of eye conditions with cutting-edge equipment"
          required
        />
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Eye Care Procedures</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Procedure
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Eye Care Procedure</DialogTitle>
            </DialogHeader>
            
            <ImageUploader />
            <FormFields />
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={loading}>Cancel</Button>
              </DialogClose>
              <Button onClick={handleAdd} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>Add Procedure</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-md bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : procedures.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <p className="text-gray-500">No procedures found. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 mt-4">
          {procedures.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-24 h-24 flex-shrink-0">
                    <img 
                      src={item.image_url} 
                      alt={item.alt_text} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/lovable-uploads/default-image.png";
                      }}
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <div className="p-4 flex items-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mr-2"
                      onClick={() => handleOpenEditDialog(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleOpenDeleteDialog(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Eye Care Procedure</DialogTitle>
          </DialogHeader>
          
          <ImageUploader />
          <FormFields />
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>Update Procedure</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Eye Care Procedure</DialogTitle>
          </DialogHeader>
          
          <p>Are you sure you want to delete this procedure? This action cannot be undone.</p>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 