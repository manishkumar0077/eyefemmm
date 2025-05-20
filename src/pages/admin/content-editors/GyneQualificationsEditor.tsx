import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertTriangle, Plus, Save, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { useGyneQualifications, GyneQualification } from '@/hooks/useGyneQualifications';
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
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export const GyneQualificationsEditor = () => {
  const { qualifications, isLoading, error, refreshQualifications, updateQualification, addQualification, deleteQualification } = useGyneQualifications();
  const [selectedQualification, setSelectedQualification] = useState<GyneQualification | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newQualification, setNewQualification] = useState<Omit<GyneQualification, 'id' | 'created_at'>>({
    degree_title: '',
    institution: '',
    type: 'degree',
    sort_order: (qualifications?.length || 0) + 1
  });
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSelectQualification = (qualification: GyneQualification) => {
    setSelectedQualification(qualification);
    setIsAdding(false);
  };

  const handleNewQualification = () => {
    setSelectedQualification(null);
    setIsAdding(true);
    setNewQualification({
      degree_title: '',
      institution: '',
      type: 'degree',
      sort_order: (qualifications?.length || 0) + 1
    });
  };

  const handleQualificationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | 
    { target: { name: string; value: string } }
  ) => {
    if (isAdding) {
      setNewQualification({
        ...newQualification,
        [e.target.name]: e.target.name === 'sort_order' && typeof e.target.value === 'string' 
          ? parseInt(e.target.value, 10) 
          : e.target.value
      });
    } else if (selectedQualification) {
      setSelectedQualification({
        ...selectedQualification,
        [e.target.name]: e.target.name === 'sort_order' && typeof e.target.value === 'string' 
          ? parseInt(e.target.value, 10) 
          : e.target.value
      });
    }
  };

  const handleSelectChange = (value: string, fieldName: string) => {
    if (isAdding) {
      setNewQualification({
        ...newQualification,
        [fieldName]: value
      });
    } else if (selectedQualification) {
      setSelectedQualification({
        ...selectedQualification,
        [fieldName]: value
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isAdding) {
        const success = await addQualification(newQualification);

        if (success) {
          toast.success('Qualification added successfully');
          setIsAdding(false);
        } else {
          toast.error('Failed to add qualification');
        }
      } else if (selectedQualification) {
        const { id, created_at, ...updateData } = selectedQualification;
        const success = await updateQualification(id, updateData);

        if (success) {
          toast.success('Qualification updated successfully');
        } else {
          toast.error('Failed to update qualification');
        }
      }
    } catch (err) {
      toast.error('An error occurred while saving');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedQualification) return;
    
    setSaving(true);
    try {
      const success = await deleteQualification(selectedQualification.id);
      if (success) {
        toast.success('Qualification deleted successfully');
        setSelectedQualification(null);
      } else {
        toast.error('Failed to delete qualification');
      }
    } catch (err) {
      toast.error('An error occurred while deleting');
      console.error(err);
    } finally {
      setSaving(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(qualifications);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update sort_order for affected items
    const updatedItems = items.map((item, index) => ({
      ...item,
      sort_order: index + 1
    }));
    
    // Update all items with new sort_order
    setSaving(true);
    try {
      for (const item of updatedItems) {
        if (item.sort_order !== qualifications.find(q => q.id === item.id)?.sort_order) {
          await updateQualification(item.id, { sort_order: item.sort_order });
        }
      }
      await refreshQualifications();
      toast.success('Order updated successfully');
    } catch (err) {
      toast.error('Error updating order');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-gynecology" />
          <p className="mt-2">Loading qualifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">Error loading qualifications</h3>
        </div>
        <p className="mt-2 text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Qualifications List */}
      <div className="col-span-1 border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">Qualifications</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={handleNewQualification}
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
        
        {qualifications.length === 0 && !isAdding ? (
          <p className="text-gray-500">No qualifications found. Click "New" to add one.</p>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="qualifications">
              {(provided) => (
                <div 
                  className="space-y-2"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {qualifications.map((qualification, index) => (
                    <Draggable key={qualification.id} draggableId={qualification.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors
                            ${selectedQualification?.id === qualification.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
                        >
                          <div 
                            {...provided.dragHandleProps}
                            className="mr-2 cursor-grab"
                          >
                            <GripVertical className="h-4 w-4 text-gray-400" />
                          </div>
                          <div 
                            className="flex-1"
                            onClick={() => handleSelectQualification(qualification)}
                          >
                            <div className="font-medium">{qualification.degree_title}</div>
                            <div className="text-sm text-gray-500">{qualification.institution}</div>
                            <div className="text-xs mt-1">
                              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-200">
                                {qualification.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
        
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm"
            className="w-full"
            onClick={refreshQualifications}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Qualification Editor */}
      <div className="col-span-2 border rounded-lg p-6">
        {isAdding ? (
          <div className="space-y-6">
            <div>
              <Label htmlFor="degree_title">Title/Degree</Label>
              <Input 
                id="degree_title"
                name="degree_title"
                value={newQualification.degree_title}
                onChange={handleQualificationChange}
                placeholder="Enter qualification title"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="institution">Institution</Label>
              <Input 
                id="institution"
                name="institution"
                value={newQualification.institution}
                onChange={handleQualificationChange}
                placeholder="Enter institution name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="type">Type</Label>
              <Select 
                value={newQualification.type} 
                onValueChange={(value) => handleSelectChange(value, 'type')}
              >
                <SelectTrigger id="type" className="w-full mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="degree">Degree</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                    <SelectItem value="registration">Registration</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input 
                id="sort_order"
                name="sort_order"
                type="number"
                value={newQualification.sort_order}
                onChange={handleQualificationChange}
                className="mt-1"
                min={1}
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !newQualification.degree_title || !newQualification.institution}
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
        ) : selectedQualification ? (
          <div className="space-y-6">
            <div>
              <Label htmlFor="degree_title">Title/Degree</Label>
              <Input 
                id="degree_title"
                name="degree_title"
                value={selectedQualification.degree_title}
                onChange={handleQualificationChange}
                placeholder="Enter qualification title"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="institution">Institution</Label>
              <Input 
                id="institution"
                name="institution"
                value={selectedQualification.institution}
                onChange={handleQualificationChange}
                placeholder="Enter institution name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="type">Type</Label>
              <Select 
                value={selectedQualification.type} 
                onValueChange={(value) => handleSelectChange(value, 'type')}
              >
                <SelectTrigger id="type" className="w-full mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="degree">Degree</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                    <SelectItem value="registration">Registration</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input 
                id="sort_order"
                name="sort_order"
                type="number"
                value={selectedQualification.sort_order}
                onChange={handleQualificationChange}
                className="mt-1"
                min={1}
              />
            </div>
            
            <div className="flex justify-between gap-2 pt-2">
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={saving}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !selectedQualification.degree_title || !selectedQualification.institution}
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
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Select a qualification from the left to edit, or click "New" to add one</p>
          </div>
        )}
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this qualification. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}; 