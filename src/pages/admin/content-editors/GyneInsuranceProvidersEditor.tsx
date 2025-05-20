import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Loader2, AlertTriangle, Plus, Save, Trash2, Image, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useGyneInsuranceProviders, GyneInsuranceProvider } from '@/hooks/useGyneInsuranceProviders';

export const GyneInsuranceProvidersEditor = () => {
  const { 
    providers,
    featuredProviders, 
    insuranceProviders, 
    isLoading, 
    error, 
    addProvider,
    updateProvider,
    deleteProvider,
    uploadProviderImage,
    refresh 
  } = useGyneInsuranceProviders();
  
  const [activeTab, setActiveTab] = useState<'featured' | 'insurance'>('featured');
  const [selectedProvider, setSelectedProvider] = useState<GyneInsuranceProvider | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newProviderImageFile, setNewProviderImageFile] = useState<File | null>(null);
  const [selectedProviderImageFile, setSelectedProviderImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const newImageInputRef = useRef<HTMLInputElement>(null);
  const editImageInputRef = useRef<HTMLInputElement>(null);
  
  const [newProvider, setNewProvider] = useState<Omit<GyneInsuranceProvider, 'id' | 'created_at'>>({
    name: '',
    provider_type: 'featured',
    image: null,
    sort_order: 0
  });
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // When changing tabs, reset selection
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'featured' | 'insurance');
    setSelectedProvider(null);
    setIsAdding(false);
  };

  // Setup for adding a new provider
  const handleAddNew = () => {
    setSelectedProvider(null);
    setIsAdding(true);
    setNewProvider({
      name: '',
      provider_type: activeTab,
      image: activeTab === 'featured' ? '' : null,
      sort_order: activeTab === 'featured' 
        ? featuredProviders.length + 1
        : providers.filter(p => p.provider_type === 'insurance').length + 1
    });
  };

  // Handle input changes for new provider
  const handleNewProviderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setNewProvider({
      ...newProvider,
      [name]: type === 'number' ? parseInt(value, 10) : value
    });
  };

  // Handle input changes for selected provider
  const handleProviderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedProvider) return;
    
    const { name, value, type } = e.target;
    setSelectedProvider({
      ...selectedProvider,
      [name]: type === 'number' ? parseInt(value, 10) : value
    });
  };

  // Handle file selection for image uploads
  const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewProviderImageFile(e.target.files[0]);
    }
  };
  
  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedProviderImageFile(e.target.files[0]);
    }
  };
  
  // Save changes (create new or update existing)
  const handleSave = async () => {
    setSaving(true);
    try {
      if (isAdding) {
        // Upload image if selected
        let imageUrl = newProvider.image;
        if (newProviderImageFile) {
          setUploadingImage(true);
          imageUrl = await uploadProviderImage(newProviderImageFile);
          setUploadingImage(false);
          if (!imageUrl) {
            throw new Error('Failed to upload image');
          }
        }
        
        // Adding a new provider with the uploaded image URL
        const providerToAdd = {
          ...newProvider,
          image: imageUrl
        };
        
        const success = await addProvider(providerToAdd);
        
        if (success) {
          toast.success(`${newProvider.provider_type === 'featured' ? 'Featured' : 'Insurance'} provider added successfully`);
          setIsAdding(false);
          setNewProviderImageFile(null);
        }
      } else if (selectedProvider) {
        // Upload image if selected
        let imageUrl = selectedProvider.image;
        if (selectedProviderImageFile) {
          setUploadingImage(true);
          imageUrl = await uploadProviderImage(selectedProviderImageFile);
          setUploadingImage(false);
          if (!imageUrl) {
            throw new Error('Failed to upload image');
          }
        }
        
        // Updating an existing provider with the uploaded image URL
        const updates = {
          name: selectedProvider.name,
          provider_type: selectedProvider.provider_type,
          image: imageUrl,
          sort_order: selectedProvider.sort_order
        };
        
        const success = await updateProvider(selectedProvider.id, updates);
        
        if (success) {
          toast.success('Provider updated successfully');
          setSelectedProvider(null);
          setSelectedProviderImageFile(null);
        }
      }
    } catch (err) {
      console.error('Error saving provider:', err);
      toast.error('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  // Delete the selected provider
  const handleDelete = async () => {
    if (!selectedProvider) return;
    
    setSaving(true);
    try {
      const success = await deleteProvider(selectedProvider.id);
      
      if (success) {
        toast.success('Provider deleted successfully');
        setSelectedProvider(null);
        setDeleteDialogOpen(false);
      }
    } catch (err) {
      console.error('Error deleting provider:', err);
      toast.error('An error occurred while deleting');
    } finally {
      setSaving(false);
    }
  };

  // Show loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-10 w-10 text-red-500" />
        <h2 className="text-xl font-semibold">Error loading insurance providers</h2>
        <p className="text-gray-500">{error.message}</p>
        <Button onClick={refresh} className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Insurance Providers Editor</h1>
      
      <Tabs defaultValue="featured" onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="featured">Featured Providers</TabsTrigger>
          <TabsTrigger value="insurance">Insurance Providers</TabsTrigger>
        </TabsList>
        
        {/* Featured Providers Tab */}
        <TabsContent value="featured" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Featured Providers</h2>
            <Button onClick={handleAddNew} className="bg-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Featured Provider
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Provider list */}
            <div className="col-span-1 border-r pr-4">
              <h3 className="font-medium mb-3">Provider List</h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {featuredProviders.length === 0 ? (
                  <p className="text-gray-500 text-sm">No featured providers yet</p>
                ) : (
                  featuredProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer ${
                        selectedProvider?.id === provider.id
                          ? 'bg-primary/10 border-primary'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      } border transition-all`}
                      onClick={() => {
                        setSelectedProvider(provider);
                        setIsAdding(false);
                      }}
                    >
                      {provider.image && (
                        <div className="w-10 h-10 flex-shrink-0 border rounded overflow-hidden bg-white">
                          <img 
                            src={provider.image} 
                            alt={provider.name}
                            className="w-full h-full object-contain" 
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{provider.name}</div>
                        <div className="text-xs text-gray-500">Order: {provider.sort_order}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Editor panel */}
            <div className="col-span-2">
              {isAdding ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Featured Provider</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Provider Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={newProvider.name}
                        onChange={handleNewProviderChange}
                        placeholder="Enter provider name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="image">Provider Image</Label>
                      
                      <div className="flex gap-2 items-start mt-2">
                        <Input
                          id="image"
                          name="image"
                          value={newProvider.image || ''}
                          onChange={handleNewProviderChange}
                          placeholder="/images/provider-logo.png"
                          className="flex-1"
                        />
                        <div>
                          <input 
                            type="file" 
                            ref={newImageInputRef}
                            onChange={handleNewFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => newImageInputRef.current?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                        </div>
                      </div>
                      
                      {newProviderImageFile && (
                        <div className="mt-2">
                          <div className="p-2 border rounded bg-gray-50 flex justify-center mb-1">
                            <img 
                              src={URL.createObjectURL(newProviderImageFile)}
                              alt="Preview"
                              className="max-h-24 object-contain"
                              onLoad={() => URL.revokeObjectURL(URL.createObjectURL(newProviderImageFile))}
                            />
                          </div>
                          <div className="text-sm text-gray-600">
                            Selected file: {newProviderImageFile.name}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the path to the image or upload a new one
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="sort_order">Sort Order</Label>
                      <Input
                        id="sort_order"
                        name="sort_order"
                        type="number"
                        value={newProvider.sort_order}
                        onChange={handleNewProviderChange}
                        min={1}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setIsAdding(false)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving || !newProvider.name}
                      className="bg-primary"
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
                  </CardFooter>
                </Card>
              ) : selectedProvider?.provider_type === 'featured' ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Featured Provider</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="edit-name">Provider Name</Label>
                      <Input
                        id="edit-name"
                        name="name"
                        value={selectedProvider.name}
                        onChange={handleProviderChange}
                        placeholder="Enter provider name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-image">Provider Image</Label>
                      {selectedProvider.image && (
                        <div 
                          className="mb-3 p-2 border rounded bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors relative"
                          onClick={() => editImageInputRef.current?.click()}
                          title="Click to change image"
                        >
                          <div className="flex justify-center">
                            <img 
                              src={selectedProvider.image} 
                              alt={selectedProvider.name}
                              className="max-h-32 object-contain"
                            />
                          </div>
                          <div className="absolute opacity-0 hover:opacity-100 inset-0 flex items-center justify-center bg-black/40 transition-opacity rounded">
                            <Upload className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2 items-start mt-2">
                        <Input
                          id="edit-image"
                          name="image"
                          value={selectedProvider.image || ''}
                          onChange={handleProviderChange}
                          placeholder="/images/provider-logo.png"
                          className="flex-1"
                        />
                        <div>
                          <input 
                            type="file" 
                            ref={editImageInputRef}
                            onChange={handleEditFileChange}
                            accept="image/*"
                            className="hidden" 
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => editImageInputRef.current?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                        </div>
                      </div>
                      
                      {selectedProviderImageFile && (
                        <div className="mt-2">
                          <div className="p-2 border rounded bg-gray-50 flex justify-center mb-1">
                            <img 
                              src={URL.createObjectURL(selectedProviderImageFile)}
                              alt="Preview"
                              className="max-h-24 object-contain"
                              onLoad={() => URL.revokeObjectURL(URL.createObjectURL(selectedProviderImageFile))}
                            />
                          </div>
                          <div className="text-sm text-gray-600">
                            Selected file: {selectedProviderImageFile.name}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the path to the image or upload a new one
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-sort">Sort Order</Label>
                      <Input
                        id="edit-sort"
                        name="sort_order"
                        type="number"
                        value={selectedProvider.sort_order}
                        onChange={handleProviderChange}
                        min={1}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
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
                      disabled={saving || !selectedProvider.name}
                      className="bg-primary"
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
                  </CardFooter>
                </Card>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 border rounded-lg text-gray-500">
                  <Image className="h-10 w-10 mb-2 text-gray-300" />
                  <p>Select a provider to edit or add a new one</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Insurance Providers Tab */}
        <TabsContent value="insurance" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Insurance Providers</h2>
            <Button onClick={handleAddNew} className="bg-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Insurance Provider
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Provider list */}
            <div className="col-span-1 border-r pr-4">
              <h3 className="font-medium mb-3">Provider List</h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {providers.filter(p => p.provider_type === 'insurance').length === 0 ? (
                  <p className="text-gray-500 text-sm">No insurance providers yet</p>
                ) : (
                  providers
                    .filter(p => p.provider_type === 'insurance')
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((provider) => (
                      <div
                        key={provider.id}
                        className={`p-3 rounded-lg flex items-center cursor-pointer ${
                          selectedProvider?.id === provider.id
                            ? 'bg-primary/10 border-primary'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        } border transition-all`}
                        onClick={() => {
                          setSelectedProvider(provider);
                          setIsAdding(false);
                        }}
                      >
                        <div className="font-medium">{provider.name}</div>
                      </div>
                    ))
                )}
              </div>
            </div>
            
            {/* Editor panel */}
            <div className="col-span-2">
              {isAdding ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Insurance Provider</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="ins-name">Provider Name</Label>
                      <Input
                        id="ins-name"
                        name="name"
                        value={newProvider.name}
                        onChange={handleNewProviderChange}
                        placeholder="Enter provider name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="ins-sort">Sort Order</Label>
                      <Input
                        id="ins-sort"
                        name="sort_order"
                        type="number"
                        value={newProvider.sort_order}
                        onChange={handleNewProviderChange}
                        min={1}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setIsAdding(false)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving || !newProvider.name}
                      className="bg-primary"
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
                  </CardFooter>
                </Card>
              ) : selectedProvider?.provider_type === 'insurance' ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Insurance Provider</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="edit-ins-name">Provider Name</Label>
                      <Input
                        id="edit-ins-name"
                        name="name"
                        value={selectedProvider.name}
                        onChange={handleProviderChange}
                        placeholder="Enter provider name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-ins-sort">Sort Order</Label>
                      <Input
                        id="edit-ins-sort"
                        name="sort_order"
                        type="number"
                        value={selectedProvider.sort_order}
                        onChange={handleProviderChange}
                        min={1}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
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
                      disabled={saving || !selectedProvider.name}
                      className="bg-primary"
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
                  </CardFooter>
                </Card>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 border rounded-lg text-gray-500">
                  <p>Select a provider to edit or add a new one</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this provider. This action cannot be undone.
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
