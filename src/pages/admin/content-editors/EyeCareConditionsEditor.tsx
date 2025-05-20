import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Plus, Trash2, MoveUp, MoveDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEyeCareConditions } from "@/hooks/useEyeCareConditions";

interface Condition {
  id: string;
  title: string;
  description: string;
  display_order: number;
}

export const EyeCareConditionsEditor = () => {
  const { section, conditions, refreshData } = useEyeCareConditions();
  const [activeTab, setActiveTab] = useState("section");
  const [sectionData, setSectionData] = useState({
    id: "",
    heading: "",
    description: ""
  });
  const [selectedCondition, setSelectedCondition] = useState<Condition | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load section data when available
  useEffect(() => {
    if (section) {
      setSectionData({
        id: section.id,
        heading: section.heading,
        description: section.description || ""
      });
    }
  }, [section]);

  const handleSectionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSectionData({
      ...sectionData,
      [name]: value
    });
  };

  const handleSaveSection = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('csm_eyecare_conditions_section')
        .upsert({
          id: sectionData.id,
          heading: sectionData.heading,
          description: sectionData.description
        });
      
      if (error) throw error;
      
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

  const handleSelectCondition = (condition: Condition) => {
    setSelectedCondition({...condition});
  };

  const handleAddNewCondition = () => {
    // Find the highest display order
    const maxOrder = conditions.length > 0
      ? Math.max(...conditions.map(c => c.display_order || 0))
      : 0;
      
    setSelectedCondition({
      id: 'new',
      title: '',
      description: '',
      display_order: maxOrder + 1
    });
  };

  const handleConditionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!selectedCondition) return;
    
    const { name, value } = e.target;
    setSelectedCondition({
      ...selectedCondition,
      [name]: value
    });
  };

  const handleSaveCondition = async () => {
    if (!selectedCondition) return;
    
    setLoading(true);
    try {
      // Check if new or existing
      const isNewCondition = !selectedCondition.id || selectedCondition.id === 'new';
      
      // Prepare data for upsert
      const conditionData = isNewCondition
        ? {
            title: selectedCondition.title,
            description: selectedCondition.description,
            display_order: selectedCondition.display_order
          }
        : selectedCondition;
      
      const { data, error } = await supabase
        .from('csm_eyecare_conditions')
        .upsert(conditionData)
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Condition ${isNewCondition ? 'created' : 'updated'} successfully`
      });
      
      refreshData();
      
      // Update the selected condition with the returned data if it's new
      if (isNewCondition && data && data.length > 0) {
        setSelectedCondition(data[0]);
      }
    } catch (err) {
      console.error("Error saving condition:", err);
      toast({
        title: "Error",
        description: "Failed to save condition",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCondition = async () => {
    if (!selectedCondition || !selectedCondition.id || selectedCondition.id === 'new') return;
    
    if (!confirm('Are you sure you want to delete this condition?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('csm_eyecare_conditions')
        .delete()
        .eq('id', selectedCondition.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Condition deleted successfully"
      });
      
      refreshData();
      setSelectedCondition(null);
    } catch (err) {
      console.error("Error deleting condition:", err);
      toast({
        title: "Error",
        description: "Failed to delete condition",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMoveCondition = async (direction: 'up' | 'down') => {
    if (!selectedCondition || !selectedCondition.id || selectedCondition.id === 'new') return;
    
    // Find the current index
    const currentIndex = conditions.findIndex(c => c.id === selectedCondition.id);
    if (currentIndex === -1) return;
    
    // Calculate new index
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Check if move is valid
    if (newIndex < 0 || newIndex >= conditions.length) {
      return;
    }
    
    // Swap display orders
    const updatedConditions = [...conditions];
    const currentOrder = updatedConditions[currentIndex].display_order || 0;
    const targetOrder = updatedConditions[newIndex].display_order || 0;
    
    updatedConditions[currentIndex].display_order = targetOrder;
    updatedConditions[newIndex].display_order = currentOrder;
    
    // Update in database
    setLoading(true);
    try {
      // Update both conditions
      const { error } = await supabase
        .from('csm_eyecare_conditions')
        .upsert([
          { id: updatedConditions[currentIndex].id, display_order: updatedConditions[currentIndex].display_order },
          { id: updatedConditions[newIndex].id, display_order: updatedConditions[newIndex].display_order }
        ]);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Condition order updated"
      });
      
      refreshData();
    } catch (err) {
      console.error("Error updating condition order:", err);
      toast({
        title: "Error",
        description: "Failed to update condition order",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="section">Section Content</TabsTrigger>
        <TabsTrigger value="conditions">Eye Conditions</TabsTrigger>
      </TabsList>
      
      <TabsContent value="section">
        <div className="space-y-6">
          <div>
            <Label htmlFor="heading">Section Heading</Label>
            <Input
              id="heading"
              name="heading"
              value={sectionData.heading}
              onChange={handleSectionChange}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Section Description</Label>
            <Textarea
              id="description"
              name="description"
              value={sectionData.description}
              onChange={handleSectionChange}
              rows={3}
              className="mt-1"
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveSection}
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="conditions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg">Eye Conditions</h3>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleAddNewCondition}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add New
              </Button>
            </div>
            
            {conditions.length === 0 ? (
              <p className="text-gray-500">No conditions found</p>
            ) : (
              <div className="space-y-2">
                {conditions.map(condition => (
                  <div 
                    key={condition.id}
                    className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors
                      ${selectedCondition?.id === condition.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
                    onClick={() => handleSelectCondition(condition)}
                  >
                    <div className="font-medium">{condition.title}</div>
                    <div className="text-xs text-gray-500">
                      {condition.description.substring(0, 40)}...
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
                onClick={refreshData}
              >
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="col-span-2 border rounded-lg p-6">
            {selectedCondition ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Condition Title</Label>
                  <Input 
                    id="title"
                    name="title"
                    value={selectedCondition.title}
                    onChange={handleConditionChange}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Condition Description</Label>
                  <Textarea 
                    id="description"
                    name="description"
                    value={selectedCondition.description}
                    onChange={handleConditionChange}
                    rows={4}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input 
                    id="display_order"
                    name="display_order"
                    type="number"
                    value={selectedCondition.display_order}
                    onChange={handleConditionChange}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex justify-between items-center pt-4">
                  {selectedCondition.id && selectedCondition.id !== 'new' && (
                    <Button 
                      variant="destructive"
                      onClick={handleDeleteCondition}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                  
                  <div className="flex gap-2">
                    {selectedCondition.id && selectedCondition.id !== 'new' && (
                      <>
                        <Button 
                          variant="outline"
                          onClick={() => handleMoveCondition('up')}
                          disabled={loading}
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleMoveCondition('down')}
                          disabled={loading}
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    <Button 
                      onClick={handleSaveCondition}
                      disabled={loading}
                    >
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Select a condition from the left to edit, or click "Add New"</p>
              </div>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
