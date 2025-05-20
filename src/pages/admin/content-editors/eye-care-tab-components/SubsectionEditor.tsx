import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EyeCareSection, EyeCareSubsection } from "@/hooks/useEyeCareTabServicesLatest";

interface SubsectionEditorProps {
  sections: EyeCareSection[];
  selectedSectionId: string | null;
  selectedSubsectionId: string | null;
  isAdding: boolean;
  isEditing: boolean;
  addSubsection: (subsection: { section_id: string; title: string; description: string | null }) => Promise<boolean>;
  updateSubsection: (id: string, updates: Partial<EyeCareSubsection>) => Promise<boolean>;
  deleteSubsection: (id: string) => Promise<boolean>;
  onCancel: () => void;
  onRefresh: () => void;
}

const SubsectionEditor: React.FC<SubsectionEditorProps> = ({
  sections,
  selectedSectionId,
  selectedSubsectionId,
  isAdding,
  isEditing,
  addSubsection,
  updateSubsection,
  deleteSubsection,
  onCancel,
  onRefresh
}) => {
  const [sectionId, setSectionId] = useState<string>(selectedSectionId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { toast } = useToast();
  
  // Load subsection data when editing
  useEffect(() => {
    if (isEditing && selectedSubsectionId) {
      for (const section of sections) {
        if (section.subsections) {
          const subsection = section.subsections.find(s => s.id === selectedSubsectionId);
          if (subsection) {
            setSectionId(subsection.section_id);
            setTitle(subsection.title);
            setDescription(subsection.description || '');
            break;
          }
        }
      }
    } else if (isAdding && selectedSectionId) {
      // Reset form for adding new subsection
      setSectionId(selectedSectionId);
      setTitle('');
      setDescription('');
    }
  }, [isEditing, isAdding, selectedSubsectionId, selectedSectionId, sections]);
  
  // Handle save (add or update)
  const handleSave = async () => {
    // Validate form
    if (!sectionId) {
      toast({
        title: "Error",
        description: "Please select a section",
        variant: "destructive"
      });
      return;
    }
    
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
        // Add new subsection
        success = await addSubsection({
          section_id: sectionId,
          title,
          description: description || null
        });
        
        if (success) {
          toast({
            title: "Success",
            description: "Subsection added successfully"
          });
          onRefresh();
          onCancel();
        }
      } else if (isEditing && selectedSubsectionId) {
        // Update existing subsection
        success = await updateSubsection(selectedSubsectionId, {
          section_id: sectionId,
          title,
          description: description || null
        });
        
        if (success) {
          toast({
            title: "Success",
            description: "Subsection updated successfully"
          });
          onRefresh();
          onCancel();
        }
      }
    } catch (err) {
      console.error("Error saving subsection:", err);
      toast({
        title: "Error",
        description: "Failed to save subsection",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!selectedSubsectionId) return;
    
    const confirmed = window.confirm("Are you sure you want to delete this subsection? This will also delete all items under it.");
    if (!confirmed) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteSubsection(selectedSubsectionId);
      
      if (success) {
        toast({
          title: "Success",
          description: "Subsection deleted successfully"
        });
        onRefresh();
        onCancel();
      }
    } catch (err) {
      console.error("Error deleting subsection:", err);
      toast({
        title: "Error",
        description: "Failed to delete subsection",
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
          <CardTitle>Subsection Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select a subsection to edit, or click "Add New Subsection" to create one.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isAdding ? "Add New Subsection" : "Edit Subsection"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Section Selection */}
          <div className="space-y-2">
            <Label htmlFor="section-select">Parent Section</Label>
            <Select 
              value={sectionId} 
              onValueChange={(value) => setSectionId(value)}
              disabled={isEditing} // Can't change parent section when editing
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="subsection-title">Subsection Title</Label>
            <Input
              id="subsection-title"
              placeholder="e.g., General Clinical Eye Checkup"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="subsection-description">Description (Optional)</Label>
            <Textarea
              id="subsection-description"
              placeholder="Brief description of this subsection"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
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

export default SubsectionEditor;
