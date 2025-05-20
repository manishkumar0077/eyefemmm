import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWhyChooseUs } from "@/hooks/useWhyChooseUs";

interface BenefitCard {
  id: string;
  section: string;
  title: string;
  description: string;
  created_at?: string;
}

export const WhyChooseUsEditor = () => {
  const { sectionContent, benefitCards, refreshContent } = useWhyChooseUs();
  const [activeTab, setActiveTab] = useState("section");
  const [section, setSection] = useState({
    id: "",
    section: "why_choose_us",
    heading: "",
    description: ""
  });
  const [selectedCard, setSelectedCard] = useState<BenefitCard | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load section content when available
  useEffect(() => {
    if (sectionContent) {
      setSection({
        id: sectionContent.id,
        section: sectionContent.section,
        heading: sectionContent.heading,
        description: sectionContent.description
      });
    }
  }, [sectionContent]);

  const handleSectionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSection({
      ...section,
      [name]: value
    });
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!selectedCard) return;
    
    const { name, value } = e.target;
    setSelectedCard({
      ...selectedCard,
      [name]: value
    });
  };

  const handleSaveSection = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('csm_landingpage_why_choose_us_section')
        .upsert({
          id: section.id,
          section: section.section,
          heading: section.heading,
          description: section.description
        });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Section content updated successfully"
      });
      
      refreshContent();
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

  const handleSelectCard = (card: BenefitCard) => {
    setSelectedCard({...card});
    setActiveTab("cards");
  };

  const handleAddNewCard = () => {
    setSelectedCard({
      id: 'new',
      section: 'why_choose_us',
      title: '',
      description: ''
    });
    setActiveTab("cards");
  };

  const handleSaveCard = async () => {
    if (!selectedCard) return;
    
    setLoading(true);
    try {
      // Check if we're creating a new card
      const isNewCard = !selectedCard.id || selectedCard.id === 'new';
      
      // Remove id for new cards (so Supabase will generate one)
      const cardData = isNewCard
        ? {
            section: selectedCard.section,
            title: selectedCard.title,
            description: selectedCard.description
          }
        : selectedCard;
      
      const { error } = await supabase
        .from('csm_landingpage_why_choose_us_cards')
        .upsert(cardData);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Card ${isNewCard ? 'created' : 'updated'} successfully`
      });
      
      refreshContent();
      
      // Clear selection for new cards
      if (isNewCard) {
        setSelectedCard(null);
      }
    } catch (err) {
      console.error("Error saving card:", err);
      toast({
        title: "Error",
        description: "Failed to save card",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!selectedCard || !selectedCard.id || selectedCard.id === 'new') return;
    
    if (!confirm('Are you sure you want to delete this card?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('csm_landingpage_why_choose_us_cards')
        .delete()
        .eq('id', selectedCard.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Card deleted successfully"
      });
      
      refreshContent();
      setSelectedCard(null);
    } catch (err) {
      console.error("Error deleting card:", err);
      toast({
        title: "Error",
        description: "Failed to delete card",
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
        <TabsTrigger value="cards">Benefit Cards</TabsTrigger>
      </TabsList>
      
      <TabsContent value="section">
        <div className="space-y-6">
          <div>
            <Label htmlFor="heading">Section Heading</Label>
            <Input
              id="heading"
              name="heading"
              value={section.heading}
              onChange={handleSectionChange}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Section Description</Label>
            <Textarea
              id="description"
              name="description"
              value={section.description}
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
      
      <TabsContent value="cards">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg">Benefit Cards</h3>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleAddNewCard}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add New
              </Button>
            </div>
            
            {benefitCards.length === 0 ? (
              <p className="text-gray-500">No benefit cards found</p>
            ) : (
              <div className="space-y-2">
                {benefitCards.map(card => (
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
                onClick={refreshContent}
              >
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="col-span-2 border rounded-lg p-6">
            {selectedCard ? (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="cardTitle">Card Title</Label>
                  <Input 
                    id="cardTitle"
                    name="title"
                    value={selectedCard.title}
                    onChange={handleCardChange}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cardDescription">Card Description</Label>
                  <Textarea 
                    id="cardDescription"
                    name="description"
                    value={selectedCard.description}
                    onChange={handleCardChange}
                    rows={4}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex justify-between">
                  {selectedCard.id && selectedCard.id !== 'new' && (
                    <Button 
                      variant="destructive"
                      onClick={handleDeleteCard}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                    
                  <div className="ml-auto">
                    <Button 
                      onClick={handleSaveCard}
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
                <p>Select a card from the left to edit, or click "Add New"</p>
              </div>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
