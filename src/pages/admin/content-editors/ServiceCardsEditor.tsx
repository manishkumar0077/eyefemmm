import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ServiceCard {
  id: string;
  section: string;
  title: string;
  description: string;
  created_at?: string;
}

export const ServiceCardsEditor = () => {
  const [cards, setCards] = useState<ServiceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ServiceCard | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('csm_landingpage_service_cards')
        .select('*')
        .order('created_at');
      
      if (error) throw error;
      
      setCards(data || []);
    } catch (err) {
      console.error("Error fetching service cards:", err);
      toast({
        title: "Error",
        description: "Failed to load service cards",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCard = (card: ServiceCard) => {
    setSelectedCard({...card});
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!selectedCard) return;
    
    const { name, value } = e.target;
    setSelectedCard({
      ...selectedCard,
      [name]: value,
    });
  };

  const handleSave = async () => {
    if (!selectedCard) return;
    
    setSaving(true);
    try {
      // Check if we're updating existing or creating new
      const isNewCard = !selectedCard.id || selectedCard.id === 'new';
      
      // Remove the id if it's a new card (so Supabase generates one)
      const cardData = isNewCard 
        ? { 
            section: selectedCard.section, 
            title: selectedCard.title, 
            description: selectedCard.description 
          }
        : selectedCard;
      
      const { data, error } = await supabase
        .from('csm_landingpage_service_cards')
        .upsert(cardData)
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Service card ${isNewCard ? 'created' : 'updated'} successfully`
      });
      
      // Refresh cards from database
      fetchCards();
      
      // If it was a new card, clear the selection
      if (isNewCard) {
        setSelectedCard(null);
      }
    } catch (err) {
      console.error("Error saving service card:", err);
      toast({
        title: "Error",
        description: "Failed to save service card",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddNew = () => {
    setSelectedCard({
      id: 'new',
      section: 'home_services_section',
      title: '',
      description: ''
    });
  };

  const handleDelete = async () => {
    if (!selectedCard || !selectedCard.id || selectedCard.id === 'new') return;
    
    if (!confirm('Are you sure you want to delete this service card?')) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('csm_landingpage_service_cards')
        .delete()
        .eq('id', selectedCard.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Service card deleted successfully"
      });
      
      // Refresh cards
      fetchCards();
      setSelectedCard(null);
    } catch (err) {
      console.error("Error deleting service card:", err);
      toast({
        title: "Error",
        description: "Failed to delete service card",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">Service Cards</h3>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleAddNew}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add New
          </Button>
        </div>
        
        {cards.length === 0 ? (
          <p className="text-gray-500">No service cards found</p>
        ) : (
          <div className="space-y-2">
            {cards.map(card => (
              <div 
                key={card.id}
                className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors
                  ${selectedCard?.id === card.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
                onClick={() => handleSelectCard(card)}
              >
                <div className="font-medium">{card.title}</div>
                <div className="text-xs text-gray-500">
                  {card.description.substring(0, 40)}...
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
            onClick={fetchCards}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="col-span-2 border rounded-lg p-6">
        {selectedCard ? (
          <div className="space-y-6">
            <div>
              <Label htmlFor="section">Section</Label>
              <Input 
                id="section"
                name="section"
                value={selectedCard.section}
                onChange={handleInputChange}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                This groups related cards together (e.g., "home_services_section")
              </p>
            </div>
            
            <div>
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title"
                name="title"
                value={selectedCard.title}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                name="description"
                value={selectedCard.description}
                onChange={handleInputChange}
                rows={5}
                className="mt-1"
              />
            </div>
            
            <div className="flex justify-between">
              {selectedCard.id && selectedCard.id !== 'new' && (
                <Button 
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
                
              <div className="ml-auto">
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
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Select a service card from the left to edit, or click "Add New"</p>
          </div>
        )}
      </div>
    </div>
  );
};
