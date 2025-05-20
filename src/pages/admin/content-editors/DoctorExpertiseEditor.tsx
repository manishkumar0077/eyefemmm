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
import { Loader2, AlertTriangle, Plus, Save, Trash2, GripVertical, Star, ThumbsUp, FileText, BookOpen, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useDoctorExpertise, DoctorExpertise, iconMap, IconName } from '@/hooks/useDoctorExpertise';
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

// Using react-beautiful-dnd types for TypeScript
interface DragEndResult {
  destination?: {
    index: number;
  };
  source: {
    index: number;
  };
}

export const DoctorExpertiseEditor = () => {
  const { expertise, isLoading, error, refreshExpertise, updateExpertise, addExpertise, deleteExpertise } = useDoctorExpertise();
  const [selectedExpertise, setSelectedExpertise] = useState<DoctorExpertise | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newExpertise, setNewExpertise] = useState<Omit<DoctorExpertise, 'id' | 'created_at'>>({
    title: '',
    description: '',
    icon: 'Star',
    sort_order: (expertise?.length || 0) + 1
  });
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSelectExpertise = (expertise: DoctorExpertise) => {
    setSelectedExpertise(expertise);
    setIsAdding(false);
  };

  const handleNewExpertise = () => {
    setSelectedExpertise(null);
    setIsAdding(true);
    setNewExpertise({
      title: '',
      description: '',
      icon: 'Star',
      sort_order: (expertise?.length || 0) + 1
    });
  };

  const handleExpertiseChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | 
    { target: { name: string; value: string } }
  ) => {
    if (isAdding) {
      setNewExpertise({
        ...newExpertise,
        [e.target.name]: e.target.name === 'sort_order' && typeof e.target.value === 'string' 
          ? parseInt(e.target.value, 10) 
          : e.target.value
      });
    } else if (selectedExpertise) {
      setSelectedExpertise({
        ...selectedExpertise,
        [e.target.name]: e.target.name === 'sort_order' && typeof e.target.value === 'string' 
          ? parseInt(e.target.value, 10) 
          : e.target.value
      });
    }
  };

  const handleSelectChange = (value: string, fieldName: string) => {
    if (isAdding) {
      setNewExpertise({
        ...newExpertise,
        [fieldName]: value
      });
    } else if (selectedExpertise) {
      setSelectedExpertise({
        ...selectedExpertise,
        [fieldName]: value
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isAdding) {
        const success = await addExpertise(newExpertise);

        if (success) {
          toast.success('Expertise added successfully');
          setIsAdding(false);
        } else {
          toast.error('Failed to add expertise');
        }
      } else if (selectedExpertise) {
        const { id, created_at, ...updateData } = selectedExpertise;
        const success = await updateExpertise(id, updateData);

        if (success) {
          toast.success('Expertise updated successfully');
        } else {
          toast.error('Failed to update expertise');
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
    if (!selectedExpertise) return;
    
    setSaving(true);
    try {
      const success = await deleteExpertise(selectedExpertise.id);
      if (success) {
        toast.success('Expertise deleted successfully');
        setSelectedExpertise(null);
      } else {
        toast.error('Failed to delete expertise');
      }
    } catch (err) {
      toast.error('An error occurred while deleting');
      console.error(err);
    } finally {
      setSaving(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleDragEnd = async (result: DragEndResult) => {
    if (!result.destination) return;
    
    const items = Array.from(expertise);
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
        if (item.sort_order !== expertise.find(q => q.id === item.id)?.sort_order) {
          await updateExpertise(item.id, { sort_order: item.sort_order });
        }
      }
      await refreshExpertise();
      toast.success('Order updated successfully');
    } catch (err) {
      toast.error('Error updating order');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Get icon component based on stored icon name
  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName as IconName] || Star;
    return <IconComponent className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-gynecology" />
          <p className="mt-2">Loading expertise data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">Error loading expertise data</h3>
        </div>
        <p className="mt-2 text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Expertise List */}
      <div className="col-span-1 border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">Areas of Expertise</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={handleNewExpertise}
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
        
        {expertise.length === 0 && !isAdding ? (
          <p className="text-gray-500">No expertise data found. Click "New" to add one.</p>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="expertise">
              {(provided) => (
                <div 
                  className="space-y-2"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {expertise.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors
                            ${selectedExpertise?.id === item.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
                        >
                          <div 
                            {...provided.dragHandleProps}
                            className="mr-2 cursor-grab"
                          >
                            <GripVertical className="h-4 w-4 text-gray-400" />
                          </div>
                          <div 
                            className="flex-1"
                            onClick={() => handleSelectExpertise(item)}
                          >
                            <div className="font-medium flex items-center">
                              <span className="mr-2 flex-shrink-0">
                                {getIconComponent(item.icon)}
                              </span>
                              <span>{item.title}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {item.description}
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
            onClick={refreshExpertise}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Expertise Editor */}
      <div className="col-span-2 border rounded-lg p-6">
        {isAdding ? (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title"
                name="title"
                value={newExpertise.title}
                onChange={handleExpertiseChange}
                placeholder="Enter expertise title"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                name="description"
                value={newExpertise.description}
                onChange={handleExpertiseChange}
                placeholder="Enter detailed description"
                rows={4}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="icon">Icon</Label>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gynecology">
                  {getIconComponent(newExpertise.icon)}
                </span>
                <span className="text-sm font-medium">{newExpertise.icon}</span>
              </div>
              <Select 
                value={newExpertise.icon} 
                onValueChange={(value) => handleSelectChange(value, 'icon')}
              >
                <SelectTrigger id="icon" className="w-full mt-1">
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.keys(iconMap).map((iconName) => (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center gap-2">
                          {getIconComponent(iconName)}
                          <span>{iconName}</span>
                        </div>
                      </SelectItem>
                    ))}
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
                value={newExpertise.sort_order}
                onChange={handleExpertiseChange}
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
                disabled={saving || !newExpertise.title || !newExpertise.description}
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
        ) : selectedExpertise ? (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title"
                name="title"
                value={selectedExpertise.title}
                onChange={handleExpertiseChange}
                placeholder="Enter expertise title"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                name="description"
                value={selectedExpertise.description}
                onChange={handleExpertiseChange}
                placeholder="Enter detailed description"
                rows={4}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="icon">Icon</Label>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gynecology">
                  {getIconComponent(selectedExpertise.icon)}
                </span>
                <span className="text-sm font-medium">{selectedExpertise.icon}</span>
              </div>
              <Select 
                value={selectedExpertise.icon} 
                onValueChange={(value) => handleSelectChange(value, 'icon')}
              >
                <SelectTrigger id="icon" className="w-full mt-1">
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.keys(iconMap).map((iconName) => (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center gap-2">
                          {getIconComponent(iconName)}
                          <span>{iconName}</span>
                        </div>
                      </SelectItem>
                    ))}
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
                value={selectedExpertise.sort_order}
                onChange={handleExpertiseChange}
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
                disabled={saving || !selectedExpertise.title || !selectedExpertise.description}
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
            <p>Select an expertise from the left to edit, or click "New" to add one</p>
          </div>
        )}
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this expertise. This action cannot be undone.
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