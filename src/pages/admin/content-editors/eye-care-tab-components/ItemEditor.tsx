import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EyeCareSection, EyeCareSubsection, EyeCareItem } from "@/hooks/useEyeCareTabServicesLatest";

interface ItemEditorProps {
  sections: EyeCareSection[];
  selectedSubsectionId: string | null;
  selectedItemId: string | null;
  isAdding: boolean;
  isEditing: boolean;
  addItem: (item: { subsection_id: string; label: string | null; description: string | null }) => Promise<boolean>;
  updateItem: (id: string, updates: Partial<EyeCareItem>) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  onCancel: () => void;
  onRefresh: () => void;
}

const ItemEditor: React.FC<ItemEditorProps> = ({
  sections,
  selectedSubsectionId,
  selectedItemId,
  isAdding,
  isEditing,
  addItem,
  updateItem,
  deleteItem,
  onCancel,
  onRefresh
}) => {
  const [subsectionId, setSubsectionId] = useState<string>(selectedSubsectionId || '');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Get available subsections from all sections
  const allSubsections: EyeCareSubsection[] = sections.flatMap(section => 
    section.subsections ? section.subsections : []
  );
  
  const { toast } = useToast();
  
  // Load item data when editing
  useEffect(() => {
    if (isEditing && selectedItemId) {
      for (const section of sections) {
        if (section.subsections) {
          for (const subsection of section.subsections) {
            if (subsection.items) {
              const item = subsection.items.find(i => i.id === selectedItemId);
              if (item) {
                setSubsectionId(item.subsection_id);
                setLabel(item.label || '');
                setDescription(item.description || '');
                return;
              }
            }
          }
        }
      }
    } else if (isAdding && selectedSubsectionId) {
      // Reset form for adding new item
      setSubsectionId(selectedSubsectionId);
      setLabel('');
      setDescription('');
    }
  }, [isEditing, isAdding, selectedItemId, selectedSubsectionId, sections]);
  
  // Handle save (add or update)
  const handleSave = async () => {
    // Validate form
    if (!subsectionId) {
      toast({
        title: "Error",
        description: "Please select a subsection",
        variant: "destructive"
      });
      return;
    }
    
    // Either label or description must be provided
    if (!label && !description) {
      toast({
        title: "Error",
        description: "Please enter either a label or description",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      let success = false;
      
      if (isAdding) {
        // Add new item
        success = await addItem({
          subsection_id: subsectionId,
          label: label || null,
          description: description || null
        });
        
        if (success) {
          toast({
            title: "Success",
            description: "Item added successfully"
          });
          onRefresh();
          onCancel();
        }
      } else if (isEditing && selectedItemId) {
        // Update existing item
        success = await updateItem(selectedItemId, {
          subsection_id: subsectionId,
          label: label || null,
          description: description || null
        });
        
        if (success) {
          toast({
            title: "Success",
            description: "Item updated successfully"
          });
          onRefresh();
          onCancel();
        }
      }
    } catch (err) {
      console.error("Error saving item:", err);
      toast({
        title: "Error",
        description: "Failed to save item",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!selectedItemId) return;
    
    const confirmed = window.confirm("Are you sure you want to delete this item?");
    if (!confirmed) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteItem(selectedItemId);
      
      if (success) {
        toast({
          title: "Success",
          description: "Item deleted successfully"
        });
        onRefresh();
        onCancel();
      }
    } catch (err) {
      console.error("Error deleting item:", err);
      toast({
        title: "Error",
        description: "Failed to delete item",
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
          <CardTitle>Item Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select an item to edit, or click "Add New Item" to create one.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Find the current subsection name for display
  const currentSubsection = allSubsections.find(sub => sub.id === subsectionId);
  const parentSectionId = currentSubsection?.section_id;
  const parentSection = sections.find(section => section.id === parentSectionId);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isAdding ? "Add New Item" : "Edit Item"}</CardTitle>
        {currentSubsection && parentSection && (
          <p className="text-sm text-muted-foreground">
            Under {parentSection.title} → {currentSubsection.title}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Subsection Selection */}
          <div className="space-y-2">
            <Label htmlFor="subsection-select">Parent Subsection</Label>
            <Select 
              value={subsectionId} 
              onValueChange={(value) => setSubsectionId(value)}
              disabled={isEditing} // Can't change parent subsection when editing
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a subsection" />
              </SelectTrigger>
              <SelectContent>
                {allSubsections.map((subsection) => {
                  const parentSection = sections.find(s => s.id === subsection.section_id);
                  return (
                    <SelectItem key={subsection.id} value={subsection.id}>
                      {parentSection ? `${parentSection.title} → ${subsection.title}` : subsection.title}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          {/* Label Field */}
          <div className="space-y-2">
            <Label htmlFor="item-label">Label</Label>
            <Input
              id="item-label"
              placeholder="e.g., Visual acuity testing"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Short label for the item (optional if description is provided)</p>
          </div>
          
          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="item-description">Description</Label>
            <Textarea
              id="item-description"
              placeholder="Detailed description of this item"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">Detailed description (optional if label is provided)</p>
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

export default ItemEditor;
