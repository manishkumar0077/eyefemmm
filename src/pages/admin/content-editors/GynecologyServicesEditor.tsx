import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Eye, PlusCircle, Trash2, MoveUp, MoveDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import { GynecologyService } from "@/hooks/useGynecologyServices";

export const GynecologyServicesEditor = () => {
  const [services, setServices] = useState<GynecologyService[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedService, setSelectedService] = useState<GynecologyService | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('csm_gynecology_services')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      
      setServices(data || []);
    } catch (err) {
      console.error("Error fetching services:", err);
      toast({
        title: "Error",
        description: "Failed to load gynecology services",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectService = (service: GynecologyService) => {
    setSelectedService({...service});
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!selectedService) return;
    
    const { name, value } = e.target;
    setSelectedService({
      ...selectedService,
      [name]: name === 'display_order' ? parseInt(value) : value,
    });
  };

  const handleSave = async () => {
    if (!selectedService) return;
    
    setSaving(true);
    try {
      // Ensure display_order is set if this is a new service
      const serviceToSave = {
        ...selectedService,
        display_order: selectedService.display_order || 
          (services.length > 0 ? Math.max(...services.map(s => s.display_order || 0)) + 1 : 1)
      };
      
      const { data, error } = await supabase
        .from('csm_gynecology_services')
        .upsert(serviceToSave)
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Gynecology service updated successfully"
      });
      
      // Update local state
      if (selectedService.id) {
        setServices(services.map(item => 
          item.id === selectedService.id ? serviceToSave : item
        ));
      } else {
        fetchServices(); // Refetch to get the new ID
      }
    } catch (err) {
      console.error("Error saving service:", err);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddNew = () => {
    setSelectedService({
      id: '',
      title: "",
      description: "",
      display_order: services.length > 0 ? Math.max(...services.map(s => s.display_order || 0)) + 1 : 1,
      created_at: ''
    });
  };

  const handleDelete = async () => {
    if (!selectedService?.id) return;
    
    try {
      const { error } = await supabase
        .from('csm_gynecology_services')
        .delete()
        .eq('id', selectedService.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Gynecology service deleted successfully"
      });
      
      setServices(services.filter(item => item.id !== selectedService.id));
      setSelectedService(null);
    } catch (err) {
      console.error("Error deleting service:", err);
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const moveService = async (direction: 'up' | 'down') => {
    if (!selectedService) return;
    
    const currentIndex = services.findIndex(s => s.id === selectedService.id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(services.length - 1, currentIndex + 1);
    
    if (currentIndex === newIndex) return;
    
    // Create a copy of the services array
    const updatedServices = [...services];
    
    // Swap the display_order values
    const temp = updatedServices[newIndex].display_order;
    updatedServices[newIndex].display_order = updatedServices[currentIndex].display_order;
    updatedServices[currentIndex].display_order = temp;
    
    // Update the selected service with the new order
    setSelectedService({
      ...selectedService,
      display_order: temp
    });
    
    // Update the database
    try {
      const updates = [
        {
          id: updatedServices[currentIndex].id,
          display_order: updatedServices[currentIndex].display_order
        },
        {
          id: updatedServices[newIndex].id,
          display_order: updatedServices[newIndex].display_order
        }
      ];
      
      for (const update of updates) {
        const { error } = await supabase
          .from('csm_gynecology_services')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
        
        if (error) throw error;
      }
      
      // Re-sort the services by display_order
      updatedServices.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      setServices(updatedServices);
      
      toast({
        title: "Success",
        description: "Service order updated"
      });
    } catch (err) {
      console.error("Error updating service order:", err);
      toast({
        title: "Error",
        description: "Failed to update service order",
        variant: "destructive"
      });
      fetchServices(); // Refetch to reset state
    }
  };

  const previewText = (text: string, maxLength = 40) => {
    if (!text) return "No text";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">Gynecology Services</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddNew}
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
          
          {services.length === 0 && !selectedService ? (
            <p className="text-gray-500">No services found. Add your first one!</p>
          ) : (
            <div className="space-y-2">
              {services.map((service) => (
                <div 
                  key={service.id}
                  className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors
                    ${selectedService?.id === service.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
                  onClick={() => handleSelectService(service)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 mr-2">{service.display_order || 0}</span>
                    <div className="font-medium flex-grow">{service.title}</div>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {previewText(service.description)}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm"
              className="w-full"
              onClick={fetchServices}
            >
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="col-span-2 border rounded-lg p-6">
          {selectedService ? (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <Label htmlFor="display_order">Order</Label>
                  <Input 
                    id="display_order"
                    name="display_order"
                    type="number"
                    value={selectedService.display_order || ''}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title"
                    name="title"
                    value={selectedService.title}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  name="description"
                  value={selectedService.description}
                  onChange={handleInputChange}
                  rows={5}
                  className="mt-1"
                />
              </div>
              
              <div className="flex justify-between">
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    disabled={!selectedService.id}
                    onClick={() => moveService('up')}
                  >
                    <MoveUp className="h-4 w-4 mr-2" />
                    Move Up
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!selectedService.id}
                    onClick={() => moveService('down')}
                  >
                    <MoveDown className="h-4 w-4 mr-2" />
                    Move Down
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={!selectedService.id || saving}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => window.open('/gynecology', '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    {selectedService.id ? 'Save Changes' : 'Create'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Select a service from the left to edit or create a new one</p>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this gynecology service.
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
    </>
  );
}; 