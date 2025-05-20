import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Plus, Trash2, MoveUp, MoveDown, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEyeCareWhyChoose } from "@/hooks/UseEyeCareWhyChoose";

interface Feature {
  id: string;
  feature_text: string;
  display_order: number;
}

export const EyeCareWhyChooseEditor = () => {
  const { section, features, refreshData, updateSection, uploadImage } = useEyeCareWhyChoose();
  const [activeTab, setActiveTab] = useState("section");
  const [sectionData, setSectionData] = useState({
    id: "",
    heading: "",
    description: "",
    image_url: ""
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load section data when available
  useEffect(() => {
    if (section) {
      setSectionData({
        id: section.id,
        heading: section.heading,
        description: section.description || "",
        image_url: section.image_url || ""
      });
      if (section.image_url) {
        setImagePreview(section.image_url);
      }
    }
  }, [section]);
  
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    console.log("File selected for upload:", file.name);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      console.log("Image uploaded, URL:", imageUrl);
      if (imageUrl) {
        setSectionData(prev => ({ ...prev, image_url: imageUrl }));
        toast({
          title: "Success",
          description: "Image uploaded successfully"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error handling image:', err);
      toast({
        title: "Error",
        description: "An error occurred while uploading the image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSectionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSectionData({
      ...sectionData,
      [name]: value
    });
  };

  const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedFeature) return;
    
    const { name, value } = e.target;
    setSelectedFeature({
      ...selectedFeature,
      [name]: value
    });
  };

  const handleSaveSection = async () => {
    setLoading(true);
    try {
      const success = await updateSection({
        heading: sectionData.heading,
        description: sectionData.description,
        image_url: sectionData.image_url
      });
      
      if (!success) throw new Error('Failed to update section');
      
      toast({
        title: "Success",
        description: "Section content updated successfully"
      });
      
      refreshData();
    } catch (err) {
      console.error("Error saving section:", err);
      toast({
        title: "Error",
        description: "Failed to save section content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFeature = async () => {
    if (!selectedFeature) return;
    
    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('csm_eyecare_why_choose_features')
        .upsert({
          id: selectedFeature.id,
          feature_text: selectedFeature.feature_text,
          display_order: selectedFeature.display_order
        });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Feature updated successfully"
      });
      
      refreshData();
      setSelectedFeature(null);
    } catch (err) {
      console.error("Error saving feature:", err);
      toast({
        title: "Error",
        description: "Failed to save feature",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewFeature = () => {
    // Find the highest display order
    const maxOrder = features.length > 0
      ? Math.max(...features.map(f => f.display_order || 0))
      : 0;
    
    setSelectedFeature({
      id: '', // Will be generated on the server
      feature_text: '',
      display_order: maxOrder + 1
    });
  };

  const handleDeleteFeature = async () => {
    if (!selectedFeature?.id) return;
    
    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('csm_eyecare_why_choose_features')
        .delete()
        .eq('id', selectedFeature.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Feature deleted successfully"
      });
      
      refreshData();
      setSelectedFeature(null);
    } catch (err) {
      console.error("Error deleting feature:", err);
      toast({
        title: "Error",
        description: "Failed to delete feature",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMoveFeature = async (direction: 'up' | 'down') => {
    if (!selectedFeature) return;
    
    // Sort features by display order
    const sortedFeatures = [...features].sort((a, b) => 
      (a.display_order || 0) - (b.display_order || 0)
    );
    
    const currentIndex = sortedFeatures.findIndex(f => f.id === selectedFeature.id);
    if (currentIndex < 0) return;
    
    let swapIndex;
    if (direction === 'up' && currentIndex > 0) {
      swapIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < sortedFeatures.length - 1) {
      swapIndex = currentIndex + 1;
    } else {
      return; // Can't move further up or down
    }
    
    // Swap display orders
    const currentOrder = sortedFeatures[currentIndex].display_order || 0;
    const swapOrder = sortedFeatures[swapIndex].display_order || 0;
    
    setLoading(true);
    try {
      // Update both records
      const updates = [
        {
          id: sortedFeatures[currentIndex].id,
          display_order: swapOrder
        },
        {
          id: sortedFeatures[swapIndex].id,
          display_order: currentOrder
        }
      ];
      
      for (const update of updates) {
        const { error } = await (supabase as any)
          .from('csm_eyecare_why_choose_features')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
        
        if (error) throw error;
      }
      
      toast({
        title: "Success",
        description: "Feature order updated"
      });
      
      refreshData();
      
      // Update the selected feature with new display order
      setSelectedFeature({
        ...selectedFeature,
        display_order: swapOrder
      });
    } catch (err) {
      console.error("Error updating feature order:", err);
      toast({
        title: "Error",
        description: "Failed to update feature order",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="section">Section Content</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
      </TabsList>
      
      {/* Section Content Tab */}
      <TabsContent value="section" className="space-y-4">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="heading">Section Heading</Label>
            <Input 
              id="heading"
              name="heading"
              value={sectionData.heading}
              onChange={handleSectionChange}
              placeholder="Why Choose Our Eye Care Center?"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Section Description</Label>
            <Textarea 
              id="description"
              name="description"
              value={sectionData.description}
              onChange={handleSectionChange}
              placeholder="Enter section description"
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Section Image</Label>
            <div 
              className="border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={handleImageClick}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
              
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Why Choose Us preview" 
                    className="w-full h-48 object-cover rounded-md" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity rounded-md">
                    <Button variant="ghost" size="sm" className="text-white">
                      <ImageIcon className="h-5 w-5 mr-2" />
                      Change Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload an image</p>
                </div>
              )}

              {isUploading && (
                <div className="mt-2 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Uploading...</span>
                </div>
              )}
            </div>
          </div>
          
          <Button onClick={handleSaveSection} disabled={loading || isUploading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </TabsContent>
      
      {/* Features Tab */}
      <TabsContent value="features">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg">Features</h3>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleAddNewFeature}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add New
              </Button>
            </div>
            
            {features.length === 0 ? (
              <p className="text-gray-500">No features found</p>
            ) : (
              <div className="space-y-2">
                {features
                  .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                  .map(feature => (
                    <div 
                      key={feature.id}
                      className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors
                        ${selectedFeature?.id === feature.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
                      onClick={() => setSelectedFeature({...feature})}
                    >
                      <div className="font-medium">{feature.feature_text}</div>
                    </div>
                  ))}
              </div>
            )}
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={refreshData}
              >
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="col-span-2 border rounded-lg p-6">
            {selectedFeature ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-4">
                  {selectedFeature.id ? 'Edit Feature' : 'Add New Feature'}
                </h3>
                
                <div>
                  <Label htmlFor="feature_text">Feature Text</Label>
                  <Input 
                    id="feature_text"
                    name="feature_text"
                    value={selectedFeature.feature_text}
                    onChange={handleFeatureChange}
                    placeholder="Enter feature text"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleSaveFeature} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Feature
                      </>
                    )}
                  </Button>
                  
                  {selectedFeature.id && (
                    <Button variant="destructive" onClick={handleDeleteFeature} disabled={loading}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  )}
                  
                  <div className="ml-auto flex gap-2">
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => handleMoveFeature('up')}
                      disabled={loading}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => handleMoveFeature('down')}
                      disabled={loading}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Select a feature from the left to edit, or click "Add New"</p>
              </div>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
