import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContentItem {
  id: string;
  name: string;
  heading: string;
  description: string;
}

export const LandingPageEditor = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('csm_landingpage_getstarted')
        .select('*');
      
      if (error) throw error;
      
      setContentItems(data || []);
    } catch (err) {
      console.error("Error fetching content:", err);
      toast({
        title: "Error",
        description: "Failed to load content items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item: ContentItem) => {
    setSelectedItem({...item});
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!selectedItem) return;
    
    const { name, value } = e.target;
    setSelectedItem({
      ...selectedItem,
      [name]: value,
    });
  };

  const handleSave = async () => {
    if (!selectedItem) return;
    
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('csm_landingpage_getstarted')
        .upsert({
          id: selectedItem.id,
          name: selectedItem.name,
          heading: selectedItem.heading,
          description: selectedItem.description
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Content updated successfully"
      });
      
      // Update local state
      setContentItems(contentItems.map(item => 
        item.id === selectedItem.id ? selectedItem : item
      ));
    } catch (err) {
      console.error("Error saving content:", err);
      toast({
        title: "Error",
        description: "Failed to save content changes",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const previewText = (text: string, maxLength = 40) => {
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="col-span-1 border rounded-lg p-4">
        <h3 className="font-medium text-lg mb-4">Content Sections</h3>
        
        {contentItems.length === 0 ? (
          <p className="text-gray-500">No content items found</p>
        ) : (
          <div className="space-y-2">
            {contentItems.map(item => (
              <div 
                key={item.id}
                className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors
                  ${selectedItem?.id === item.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
                onClick={() => handleSelectItem(item)}
              >
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-500">
                  {previewText(item.heading)}
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
            onClick={fetchContent}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="col-span-2 border rounded-lg p-6">
        {selectedItem ? (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Section Name (ID)</Label>
              <Input 
                id="name"
                name="name"
                value={selectedItem.name}
                onChange={handleInputChange}
                disabled
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                This is used as the identifier and cannot be changed
              </p>
            </div>
            
            <div>
              <Label htmlFor="heading">Heading</Label>
              <Input 
                id="heading"
                name="heading"
                value={selectedItem.heading}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                name="description"
                value={selectedItem.description}
                onChange={handleInputChange}
                rows={5}
                className="mt-1"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => window.open('/', '_blank')}
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
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Select a content item from the left to edit</p>
          </div>
        )}
      </div>
    </div>
  );
};