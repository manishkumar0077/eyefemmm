import { useState } from "react";
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { EyeCareDetail, useEyeCareDetails } from "@/hooks/useEyeCareDetails";

export const EyeCareDetailsEditor = () => {
  const [editingItem, setEditingItem] = useState<EyeCareDetail | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    content: '',
    type: 'paragraph' as 'paragraph' | 'bullet'
  });
  
  const { details, isLoading, addDetail, updateDetail, deleteDetail } = useEyeCareDetails();
  const { toast } = useToast();

  const resetForm = () => {
    setForm({
      content: '',
      type: 'paragraph'
    });
    setEditingItem(null);
  };

  const handleOpenAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };
  
  const handleOpenEditDialog = (item: EyeCareDetail) => {
    setEditingItem(item);
    setForm({
      content: item.content,
      type: item.type
    });
    setIsEditDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (item: EyeCareDetail) => {
    setEditingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({
      ...prev,
      content: e.target.value
    }));
  };

  const handleTypeChange = (value: 'paragraph' | 'bullet') => {
    setForm((prev) => ({
      ...prev,
      type: value
    }));
  };

  const validateForm = () => {
    if (!form.content.trim()) {
      toast({
        title: "Missing content",
        description: "Please enter content for the detail",
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
      const success = await addDetail({
        content: form.content.trim(),
        type: form.type
      });
      
      if (success) {
        setIsAddDialogOpen(false);
        resetForm();
      }
    } catch (err) {
      console.error("Error adding detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingItem || !validateForm()) return;
    
    setLoading(true);
    try {
      const success = await updateDetail(editingItem.id, {
        content: form.content.trim(),
        type: form.type
      });
      
      if (success) {
        setIsEditDialogOpen(false);
        resetForm();
      }
    } catch (err) {
      console.error("Error updating detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingItem) return;
    
    setLoading(true);
    try {
      const success = await deleteDetail(editingItem.id);
      
      if (success) {
        setIsDeleteDialogOpen(false);
        resetForm();
      }
    } catch (err) {
      console.error("Error deleting detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const FormFields = () => (
    <>
      <div className="mb-4">
        <Label htmlFor="type">Type</Label>
        <Select 
          value={form.type} 
          onValueChange={(value) => handleTypeChange(value as 'paragraph' | 'bullet')}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paragraph">Paragraph</SelectItem>
            <SelectItem value="bullet">Bullet Point</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="mb-4">
        <Label htmlFor="content">Content</Label>
        {form.type === 'paragraph' ? (
          <Textarea 
            id="content"
            value={form.content}
            onChange={handleContentChange}
            rows={4}
            className="mt-1"
            placeholder="Enter paragraph text"
            required
          />
        ) : (
          <Input 
            id="content"
            value={form.content}
            onChange={handleContentChange}
            className="mt-1"
            placeholder="Enter bullet point text"
            required
          />
        )}
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Eye Care Details</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Detail
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Eye Care Detail</DialogTitle>
            </DialogHeader>
            
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
                  <>Add Detail</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-2 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-md bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : details.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <p className="text-gray-500">No details found. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 mt-4">
          {details.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="text-xs uppercase font-semibold text-gray-500 mr-2">
                        {item.type}
                      </span>
                    </div>
                    <p className={item.type === 'bullet' ? "flex items-start" : ""}>
                      {item.type === 'bullet' && <span className="mr-2 text-lg">•</span>}
                      {item.content}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mr-1"
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
            <DialogTitle>Edit Eye Care Detail</DialogTitle>
          </DialogHeader>
          
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
                <>Update Detail</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Eye Care Detail</DialogTitle>
          </DialogHeader>
          
          <p>Are you sure you want to delete this detail? This action cannot be undone.</p>
          
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