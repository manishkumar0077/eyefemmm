import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, Plus, Trash2, Upload, Image as ImageIcon, Edit, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEyeCareTabServices, TabService } from "@/hooks/useEyeCareTabServices";

export const EyeCareTabServicesEditor = () => {
  const { services, organizedData, isLoading, error, activeTab, setActiveTab, addService, updateService, deleteService, uploadImage, refreshData } = useEyeCareTabServices();
  const [selectedService, setSelectedService] = useState<TabService | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const [serviceForm, setServiceForm] = useState<Omit<TabService, 'id'>>({ 
    tab_key: 'clinical',
    section_title: '',
    description: '',
    image_url: '',
    display_order: 1
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Update the form when a service is selected
  const populateForm = (service: TabService) => {
    setServiceForm({
      tab_key: service.tab_key,
      section_title: service.section_title,
      description: service.description,
      image_url: service.image_url,
      display_order: service.display_order
    });
    setImagePreview(service.image_url);
    setIsEditing(true);
    setIsAdding(false);
  };

  // Load the first service by default when data is loaded
  useEffect(() => {
    if (!isLoading && services.length > 0 && !selectedService) {
      // Find a service for the active tab or use the first service
      const tabServices = services.filter(s => s.tab_key === activeTab);
      const serviceToSelect = tabServices.length > 0 ? tabServices[0] : services[0];
      
      setSelectedService(serviceToSelect);
      populateForm(serviceToSelect);
    }
  }, [services, isLoading, selectedService, activeTab, populateForm]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select field changes
  const handleSelectChange = (name: string, value: string) => {
    setServiceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle number field changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  // Handle file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (files && files.length > 0) {
      const file = files[0];
      // Preview the image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
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
      const imageUrl = await uploadImage(file);
      
      if (imageUrl) {
        setServiceForm(prev => ({
          ...prev,
          image_url: imageUrl
        }));
        
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

  // Handle saving the service (add or update)
  const handleSave = async () => {
    // Validate the form
    if (!serviceForm.section_title || !serviceForm.description || !serviceForm.image_url) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      let success = false;
      
      if (isAdding) {
        // Add new service
        success = await addService(serviceForm);
        if (success) {
          toast({
            title: "Success",
            description: "Service added successfully"
          });
          setIsAdding(false);
        }
      } else if (isEditing && selectedService) {
        // Update existing service
        success = await updateService(selectedService.id, serviceForm);
        if (success) {
          toast({
            title: "Success",
            description: "Service updated successfully"
          });
        }
      }
      
      if (success) {
        await refreshData();
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err) {
      console.error("Error saving service:", err);
      toast({
        title: "Error",
        description: "Failed to save service",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle deleting a service
  const handleDelete = async () => {
    if (!selectedService) return;
    
    if (!confirm(`Are you sure you want to delete "${selectedService.section_title}"?`)) {
      return;
    }
    
    try {
      const success = await deleteService(selectedService.id);
      
      if (success) {
        toast({
          title: "Success",
          description: "Service deleted successfully"
        });
        
        // Reset form and selection
        if (services.length > 1) {
          // Select another service
          const newIndex = services.findIndex(s => s.id === selectedService.id) - 1;
          const nextService = services[newIndex >= 0 ? newIndex : 1];
          setSelectedService(nextService);
          populateForm(nextService);
        } else {
          handleReset();
        }
      }
    } catch (err) {
      console.error("Error deleting service:", err);
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive"
      });
    }
  };

  // Handle adding a new service
  const handleAdd = () => {
    setSelectedService(null);
    // Use the currently active tab for new services
    const tabServices = services.filter(s => s.tab_key === activeTab);
    setServiceForm({
      tab_key: activeTab,
      section_title: '',
      description: '',
      image_url: '',
      display_order: tabServices.length + 1
    });
    setImagePreview(null);
    setIsAdding(true);
    setIsEditing(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle resetting the form
  const handleReset = () => {
    setSelectedService(null);
    setServiceForm({
      tab_key: activeTab,
      section_title: '',
      description: '',
      image_url: '',
      display_order: services.filter(s => s.tab_key === activeTab).length + 1
    });
    setImagePreview(null);
    setIsAdding(false);
    setIsEditing(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle selecting a service
  const handleSelectService = (service: TabService) => {
    setSelectedService(service);
    populateForm(service);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Clear selection if changing tabs
    if (selectedService && selectedService.tab_key !== value) {
      setSelectedService(null);
      setIsEditing(false);
      setIsAdding(false);
      
      // Reset form for the new tab
      setServiceForm({
        tab_key: value,
        section_title: '',
        description: '',
        image_url: '',
        display_order: services.filter(s => s.tab_key === value).length + 1
      });
    }
  };

  // Handle refreshing the data
  const handleRefresh = async () => {
    await refreshData();
    toast({
      title: "Success",
      description: "Data refreshed successfully"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Eye Care Tab Services Editor</h2>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar - Service List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Service Sections</CardTitle>
            <CardDescription>Select a service to edit or add a new one</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500">No services available. Add your first one!</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="clinical">Clinical</TabsTrigger>
                    <TabsTrigger value="surgical">Surgical</TabsTrigger>
                    <TabsTrigger value="refractive">Refractive</TabsTrigger>
                  </TabsList>
                  {Object.keys(organizedData).map(tabKey => (
                    <TabsContent key={tabKey} value={tabKey} className="space-y-2 mt-2">
                      {organizedData[tabKey]?.services?.map((service: TabService) => (
                        <div
                          key={service.id}
                          onClick={() => handleSelectService(service)}
                          className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 ${selectedService?.id === service.id ? 'bg-gray-100 border-l-4 border-primary' : ''}`}
                        >
                          <div className="font-medium truncate">{service.section_title}</div>
                          <div className="text-sm text-gray-500 mt-1">Order: {service.display_order}</div>
                        </div>
                      ))}
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}
            
            <div className="pt-4">
              <Button onClick={handleAdd} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add New Service
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Right side - Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {isAdding ? "Add New Service" : isEditing ? "Edit Service" : "Service Details"}
            </CardTitle>
            <CardDescription>
              {isAdding ? "Create a new service" : isEditing ? "Make changes to the selected service" : "Select a service to edit or add a new one"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {(isAdding || isEditing) && (
              <>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tab_key">Tab Key</Label>
                      <Select 
                        value={serviceForm.tab_key} 
                        onValueChange={(value) => handleSelectChange('tab_key', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tab" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clinical">Clinical Services</SelectItem>
                          <SelectItem value="surgical">Surgical Procedures</SelectItem>
                          <SelectItem value="refractive">Refractive Surgery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="display_order">Display Order</Label>
                      <Input
                        id="display_order"
                        name="display_order"
                        type="number"
                        value={serviceForm.display_order}
                        onChange={handleNumberChange}
                        min="1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="section_title">Section Title</Label>
                    <Input
                      id="section_title"
                      name="section_title"
                      value={serviceForm.section_title}
                      onChange={handleChange}
                      placeholder="E.g., Clinical Eye Care Services"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description (Use \n for line breaks and bullet points with • character)
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={serviceForm.description}
                      onChange={handleChange}
                      placeholder="E.g., General Clinical Eye Checkup:\n• Visual acuity testing\n• Eye pressure measurement"
                      rows={8}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Service Image</Label>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="border rounded-md p-4">
                        <div className="flex flex-wrap gap-2 mb-4">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                            id="image-upload"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Select Image
                          </Button>
                          <Button 
                            type="button" 
                            onClick={handleImageUpload}
                            disabled={isUploading || !fileInputRef.current?.files?.length}
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <ImageIcon className="h-4 w-4 mr-2" />
                                Upload Image
                              </>
                            )}
                          </Button>
                        </div>
                        
                        <div className="mb-4">
                          <Label htmlFor="image_url">Image URL</Label>
                          <Input
                            id="image_url"
                            name="image_url"
                            value={serviceForm.image_url}
                            onChange={handleChange}
                            placeholder="Enter image URL or upload above"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Upload to the website-images bucket. Recommended size: 600x400px
                          </p>
                        </div>
                        
                        {/* Image preview */}
                        <div className="mt-4">
                          <Label>Image Preview</Label>
                          {imagePreview ? (
                            <div className="mt-2 relative aspect-video rounded-md overflow-hidden border max-w-md mx-auto">
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  console.error("Image failed to load");
                                  e.currentTarget.src = "/lovable-uploads/default-image.png";
                                }}
                              />
                            </div>
                          ) : (
                            <div className="mt-2 aspect-video rounded-md border flex items-center justify-center bg-gray-50 max-w-md mx-auto">
                              <div className="text-center text-gray-500">
                                <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                <p>No image selected</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {!isAdding && !isEditing && (
              <div className="py-8 text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">No Service Selected</h3>
                <p className="text-gray-500 mb-4">
                  Select a service from the list to edit or add a new one
                </p>
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Service
                </Button>
              </div>
            )}
          </CardContent>
          
          {(isAdding || isEditing) && (
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleReset}>
                Cancel
              </Button>
              <div className="space-x-2">
                {isEditing && (
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
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
            </CardFooter>
          )}
        </Card>
      </div>
      
      {/* Preview section removed as requested */}
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800">Error</h4>
            <p className="text-sm text-red-700">{error.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EyeCareTabServicesEditor;
