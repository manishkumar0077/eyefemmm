import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertTriangle, Plus, Save, Trash2, GripVertical, Star, ThumbsUp, FileText, BookOpen, Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useDoctorExpertise, Expertise, iconMap, IconName } from "@/hooks/useDoctorExpertise";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";

interface ExpertiseForm {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  sort_order: number;
}

// Define available icons for selection
const availableIcons = Object.keys(iconMap) as IconName[];

export const DoctorExpertiseEditor = () => {
  const { expertise, refreshData } = useDoctorExpertise();
  const [selectedExpertiseId, setSelectedExpertiseId] = useState<string | null>(null);
  const [form, setForm] = useState<ExpertiseForm>({
    id: "",
    title: "",
    description: "",
    icon: "Star",
    sort_order: 0
  });
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Select an expertise when clicked
  const handleSelectExpertise = (id: string) => {
    const selected = expertise.find(e => e.id === id);
    if (selected) {
      setSelectedExpertiseId(id);
      setForm({
        id: selected.id,
        title: selected.title,
        description: selected.description || '',
        icon: selected.icon || 'Star',
        sort_order: selected.sort_order || 0
      });
    }
  };

  // Add new expertise
  const handleAddNew = () => {
    setSelectedExpertiseId(null);
    setForm({
      id: '',
      title: '',
      description: '',
      icon: 'Star',
      sort_order: expertise.length + 1 // Set default sort order to end of list
    });
  };

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setForm({
      ...form,
      [name]: value
    });
  };

  // Save expertise
  const handleSave = async () => {
    if (!form.title) {
      toast.error("Please provide a title for the expertise area.");
      return;
    }

    setLoading(true);
    try {
      // Use type assertion to fix TypeScript errors since table isn't in the type definitions yet
      const { error } = await (supabase
        .from('csm_doctor_expertise_latest') as any)
        .upsert({
          id: form.id || undefined,
          title: form.title,
          description: form.description,
          icon: form.icon,
          sort_order: form.sort_order
        });
      
      if (error) throw error;
      
      toast.success("Expertise saved successfully");
      
      refreshData();
      if (!form.id) {
        handleAddNew();
      }
    } catch (err) {
      console.error("Error saving expertise:", err);
      toast.error("Failed to save expertise");
    } finally {
      setLoading(false);
    }
  };

  // Delete expertise
  const handleDelete = async () => {
    if (!form.id) return;
    
    setDeleteDialogOpen(false);
    setLoading(true);
    
    try {
      // Use type assertion to fix TypeScript errors since table isn't in the type definitions yet
      const { error } = await (supabase
        .from('csm_doctor_expertise_latest') as any)
        .delete()
        .eq('id', form.id);
      
      if (error) throw error;
      
      toast.success("Expertise deleted successfully");
      
      refreshData();
      handleAddNew();
    } catch (err) {
      console.error("Error deleting expertise:", err);
      toast.error("Failed to delete expertise");
    } finally {
      setLoading(false);
    }
  };
  
  // Open delete confirmation dialog
  const confirmDelete = () => {
    if (!form.id) return;
    setDeleteDialogOpen(true);
  };

  // Preview component
  const ExpertisePreview = () => {
    const IconComponent = iconMap[form.icon];
    
    return (
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-eyecare/10 rounded-full flex items-center justify-center mb-4">
              <IconComponent className="h-6 w-6 text-eyecare" />
            </div>
            <div>
              <h3 className="font-bold text-xl mb-2">{form.title || "Expertise Title"}</h3>
              <p className="text-gray-600">{form.description || "Description of this expertise area will appear here."}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Expertise List */}
      <div className="col-span-1 border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">Areas of Expertise</h3>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleAddNew}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add New
          </Button>
        </div>
        
        {expertise.length === 0 ? (
          <p className="text-gray-500">No expertise areas found</p>
        ) : (
          <>
            <div className="space-y-2 mb-4">
              {expertise.map(exp => (
                <div 
                  key={exp.id}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${selectedExpertiseId === exp.id ? 'bg-eyecare/10 border-eyecare' : 'hover:bg-gray-50'}`}
                  onClick={() => handleSelectExpertise(exp.id)}
                >
                  <h3 className="font-medium">{exp.title}</h3>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Edit form */}
      <div className="md:col-span-2 space-y-4">
        <h2 className="text-xl font-semibold">{form.id ? 'Edit Expertise' : 'New Expertise'}</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Title of expertise area"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe this area of expertise"
              rows={4}
            />
          </div>
          
          <div>
            <Label>Icon</Label>
            <Select 
              value={form.icon} 
              onValueChange={(value) => handleSelectChange('icon', value as IconName)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                {availableIcons.map((iconName) => {
                  const IconComponent = iconMap[iconName];
                  return (
                    <SelectItem key={iconName} value={iconName}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <span>{iconName}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          {/* Preview */}
          <ExpertisePreview />
          
          <div className="flex justify-between pt-4">
            <Button 
              onClick={confirmDelete} 
              variant="destructive" 
              disabled={!form.id || loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete
            </Button>
            
            <Button 
              onClick={handleSave} 
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the expertise area "{form.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
