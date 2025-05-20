import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Save, Plus, Trash2, Upload, Image as ImageIcon, Edit, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEyeCareTabServicesLatest, EyeCareSection, EyeCareSubsection, EyeCareItem, NewSectionForm, NewSubsectionForm, NewItemForm } from "@/hooks/useEyeCareTabServicesLatest";
import SectionEditor from "../../../pages/admin/content-editors/eye-care-tab-components/SectionEditor";
import SubsectionEditor from "../../../pages/admin/content-editors/eye-care-tab-components/SubsectionEditor";
import ItemEditor from "../../../pages/admin/content-editors/eye-care-tab-components/ItemEditor";

export const EyeCareTabServicesEditorLatest = () => {
  const { 
    sections, 
    isLoading, 
    error, 
    activeSection,
    setActiveSection,
    fetchAllData,
    addSection,
    updateSection,
    deleteSection,
    addSubsection,
    updateSubsection,
    deleteSubsection,
    addItem,
    updateItem,
    deleteItem,
    uploadImage,
    getSectionById
  } = useEyeCareTabServicesLatest();
  
  // Editor states
  const [editorMode, setEditorMode] = useState<'section' | 'subsection' | 'item'>('section');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedSubsectionId, setSelectedSubsectionId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const { toast } = useToast();
  
  // Update selected section when activeSection changes
  useEffect(() => {
    if (activeSection) {
      setSelectedSectionId(activeSection);
    }
  }, [activeSection]);
  
  // When sections load, set the first one as active if none selected
  useEffect(() => {
    if (!isLoading && sections.length > 0 && !selectedSectionId) {
      setSelectedSectionId(sections[0].id);
      setActiveSection(sections[0].id);
    }
  }, [sections, isLoading, selectedSectionId, setActiveSection]);
  
  // Reset editing state when changing selection
  useEffect(() => {
    setIsAdding(false);
    setIsEditing(false);
  }, [selectedSectionId, selectedSubsectionId, selectedItemId, editorMode]);
  
  // Handler for refreshing data
  const handleRefresh = () => {
    fetchAllData();
    toast({
      title: "Refreshed",
      description: "Data has been refreshed"
    });
  };
  
  // Handlers for section selection
  const handleSectionSelect = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setActiveSection(sectionId);
    setSelectedSubsectionId(null);
    setSelectedItemId(null);
    setEditorMode('section');
  };
  
  // Handler for subsection selection
  const handleSubsectionSelect = (subsectionId: string) => {
    setSelectedSubsectionId(subsectionId);
    setSelectedItemId(null);
    setEditorMode('subsection');
  };
  
  // Handler for item selection
  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId);
    setEditorMode('item');
  };
  
  // Functions to start adding new items
  const startAddingSection = () => {
    setEditorMode('section');
    setSelectedSectionId(null);
    setSelectedSubsectionId(null);
    setSelectedItemId(null);
    setIsAdding(true);
    setIsEditing(false);
  };
  
  const startAddingSubsection = (sectionId: string) => {
    setEditorMode('subsection');
    setSelectedSectionId(sectionId);
    setSelectedSubsectionId(null);
    setSelectedItemId(null);
    setIsAdding(true);
    setIsEditing(false);
  };
  
  const startAddingItem = (subsectionId: string) => {
    setEditorMode('item');
    setSelectedSubsectionId(subsectionId);
    setSelectedItemId(null);
    setIsAdding(true);
    setIsEditing(false);
  };
  
  // Functions to start editing existing items
  const startEditingSection = (sectionId: string) => {
    setEditorMode('section');
    setSelectedSectionId(sectionId);
    setSelectedSubsectionId(null);
    setSelectedItemId(null);
    setIsAdding(false);
    setIsEditing(true);
  };
  
  const startEditingSubsection = (subsectionId: string) => {
    setEditorMode('subsection');
    setSelectedSubsectionId(subsectionId);
    setSelectedItemId(null);
    setIsAdding(false);
    setIsEditing(true);
  };
  
  const startEditingItem = (itemId: string) => {
    setEditorMode('item');
    setSelectedItemId(itemId);
    setIsAdding(false);
    setIsEditing(true);
  };
  
  // Cancel editing/adding
  const cancelEdit = () => {
    setIsAdding(false);
    setIsEditing(false);
  };
  
  // Render editor content based on current mode
  const renderEditorContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading data...</span>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex items-center justify-center h-64 text-destructive">
          <AlertCircle className="h-8 w-8 mr-2" />
          <span>Error loading data. Please try refreshing.</span>
        </div>
      );
    }
    
    switch (editorMode) {
      case 'section':
        return (
          <SectionEditor 
            sections={sections}
            selectedSectionId={selectedSectionId}
            isAdding={isAdding}
            isEditing={isEditing}
            uploadImage={uploadImage}
            addSection={addSection}
            updateSection={updateSection}
            deleteSection={deleteSection}
            onCancel={cancelEdit}
            onRefresh={handleRefresh}
          />
        );
      case 'subsection':
        return (
          <SubsectionEditor 
            selectedSectionId={selectedSectionId}
            selectedSubsectionId={selectedSubsectionId}
            sections={sections}
            isAdding={isAdding}
            isEditing={isEditing}
            addSubsection={addSubsection}
            updateSubsection={updateSubsection}
            deleteSubsection={deleteSubsection}
            onCancel={cancelEdit}
            onRefresh={handleRefresh}
          />
        );
      case 'item':
        return (
          <ItemEditor 
            selectedSubsectionId={selectedSubsectionId}
            selectedItemId={selectedItemId}
            sections={sections}
            isAdding={isAdding}
            isEditing={isEditing}
            addItem={addItem}
            updateItem={updateItem}
            deleteItem={deleteItem}
            onCancel={cancelEdit}
            onRefresh={handleRefresh}
          />
        );
      default:
        return null;
    }
  };
  
  // Render navigation sidebar
  const renderNavigation = () => {
    return (
      <div className="w-full pr-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Tab Services Structure</h3>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full mb-4" 
          onClick={startAddingSection}
        >
          <Plus className="h-4 w-4 mr-1" /> Add New Section
        </Button>
        
        <ScrollArea className="h-[calc(100vh-240px)] pr-3">
          {sections.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No sections yet. Click "Add New Section" to create one.
            </div>
          ) : (
            <div className="space-y-4">
              {sections.map((section) => (
                <Card 
                  key={section.id} 
                  className={`${selectedSectionId === section.id ? 'border-primary' : ''}`}
                >
                  <CardHeader className="p-3 cursor-pointer" onClick={() => handleSectionSelect(section.id)}>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-md">{section.title}</CardTitle>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          startEditingSection(section.id);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {selectedSectionId === section.id && (
                    <CardContent className="p-3 pt-0">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium">Subsections</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            startAddingSubsection(section.id);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {section.subsections && section.subsections.length > 0 ? (
                        <div className="space-y-2 pl-2">
                          {section.subsections.map((subsection) => (
                            <Card 
                              key={subsection.id} 
                              className={`${selectedSubsectionId === subsection.id ? 'border-primary' : ''}`}
                            >
                              <CardHeader className="p-2 cursor-pointer" onClick={() => handleSubsectionSelect(subsection.id)}>
                                <div className="flex justify-between items-center">
                                  <CardTitle className="text-sm">{subsection.title}</CardTitle>
                                  <div className="flex space-x-1">
                                    <Button variant="ghost" size="sm" onClick={(e) => {
                                      e.stopPropagation();
                                      startEditingSubsection(subsection.id);
                                    }}>
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              
                              {selectedSubsectionId === subsection.id && (
                                <CardContent className="p-2 pt-0">
                                  <div className="flex justify-between items-center mb-2">
                                    <h5 className="text-xs font-medium">Items</h5>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        startAddingItem(subsection.id);
                                      }}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  
                                  {subsection.items && subsection.items.length > 0 ? (
                                    <div className="space-y-1 pl-2">
                                      {subsection.items.map((item) => (
                                        <div 
                                          key={item.id} 
                                          className={`p-1 text-xs rounded cursor-pointer flex justify-between items-center ${selectedItemId === item.id ? 'bg-muted text-primary' : 'hover:bg-muted'}`}
                                          onClick={() => handleItemSelect(item.id)}
                                        >
                                          <span>{item.label || item.description?.substring(0, 20) + '...' || 'Unnamed item'}</span>
                                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => {
                                            e.stopPropagation();
                                            startEditingItem(item.id);
                                          }}>
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-muted-foreground pl-2">
                                      No items yet. Click + to add.
                                    </div>
                                  )}
                                </CardContent>
                              )}
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground pl-2">
                          No subsections yet. Click + to add.
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Eye Care Tab Services Editor</h2>
      </div>
      
      <p className="text-muted-foreground">
        Edit the tabbed services content displayed on the Eye Care Services page. Create sections, subsections, and items to organize your content.
      </p>
      
      <Separator className="my-4" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1">
          {renderNavigation()}
        </div>
        
        {/* Editor Area */}
        <div className="md:col-span-2">
          {renderEditorContent()}
        </div>
      </div>
    </div>
  );
};

export default EyeCareTabServicesEditorLatest;
