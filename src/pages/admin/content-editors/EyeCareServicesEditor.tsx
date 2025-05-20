// import { useState, useEffect, useRef } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { Loader2, Save, Plus, Trash2, Upload, Image as ImageIcon, Check, AlertCircle, Edit, RefreshCw } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { useEyeCareServices } from "@/hooks/useEyeCareServices";

// interface TabService {
//   id: number;
//   tab_key: string;
//   section_title: string;
//   description: string;
//   image_url: string;
//   display_order: number;
// }

// export const EyeCareServicesEditor = () => {
//   const { services, organizedData, isLoading, error, activeTab, setActiveTab, addService, updateService, deleteService, uploadImage, refreshData } = useEyeCareServices();
//   const [selectedService, setSelectedService] = useState<TabService | null>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [isAdding, setIsAdding] = useState(false);
  
//   const [serviceForm, setServiceForm] = useState<Omit<TabService, 'id'>>({
//     tab_key: 'clinical',
//     section_title: '',
//     description: '',
//     image_url: '',
//     display_order: 0
//   });
  
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const { toast } = useToast();

//   const [loading, setLoading] = useState(false);
//   const { toast } = useToast();

//   // Select the first tab/subsection/item by default if nothing is selected
//   useEffect(() => {
//     if (tabs.length > 0 && selectedTabIndex === null) {
//       setSelectedTabIndex(0);
//       setTabForm(tabs[0]);
//     }
//   }, [tabs, selectedTabIndex]);

//   useEffect(() => {
//     if (selectedTabIndex !== null && subsections.length > 0) {
//       const tabSubsections = subsections.filter(s => s.tab_id === tabs[selectedTabIndex].id);
//       if (tabSubsections.length > 0 && selectedSubsectionIndex === null) {
//         const index = subsections.findIndex(s => s.id === tabSubsections[0].id);
//         setSelectedSubsectionIndex(index);
//         setSubsectionForm(subsections[index]);
//       }
//     }
//   }, [subsections, selectedTabIndex, selectedSubsectionIndex, tabs]);

//   useEffect(() => {
//     if (selectedSubsectionIndex !== null && items.length > 0) {
//       const subsectionItems = items.filter(i => i.subsection_id === subsections[selectedSubsectionIndex].id);
//       if (subsectionItems.length > 0 && selectedItemIndex === null) {
//         const index = items.findIndex(i => i.id === subsectionItems[0].id);
//         setSelectedItemIndex(index);
//         setItemForm(items[index]);
//       }
//     }
//   }, [items, selectedSubsectionIndex, selectedItemIndex, subsections]);

//   // Form handling for tabs
//   const handleTabChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setTabForm({
//       ...tabForm,
//       [name]: value
//     });
//   };

//   const handleTabSave = async () => {
//     setLoading(true);
//     try {
//       const { error } = await supabase
//         .from('csm_eyecare_service_tabs')
//         .upsert({
//           id: tabForm.id,
//           tab_key: tabForm.tab_key,
//           title: tabForm.title,
//           description: tabForm.description
//         });
      
//       if (error) throw error;
      
//       toast({
//         title: "Success",
//         description: "Tab saved successfully"
//       });
      
//       refreshData();
//     } catch (err) {
//       console.error("Error saving tab:", err);
//       toast({
//         title: "Error",
//         description: "Failed to save tab",
//         variant: "destructive"
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddTab = () => {
//     setTabForm({
//       id: '',
//       tab_key: '',
//       title: '',
//       description: ''
//     });
//     setSelectedTabIndex(null);
//   };

//   const handleDeleteTab = async () => {
//     if (!tabForm.id) return;
    
//     setLoading(true);
//     try {
//       const { error } = await supabase
//         .from('csm_eyecare_service_tabs')
//         .delete()
//         .eq('id', tabForm.id);
      
//       if (error) throw error;
      
//       toast({
//         title: "Success",
//         description: "Tab deleted successfully"
//       });
      
//       refreshData();
//       setSelectedTabIndex(null);
//       setTabForm({
//         id: '',
//         tab_key: '',
//         title: '',
//         description: ''
//       });
//     } catch (err) {
//       console.error("Error deleting tab:", err);
//       toast({
//         title: "Error",
//         description: "Failed to delete tab",
//         variant: "destructive"
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Form handling for subsections
//   const handleSubsectionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setSubsectionForm({
//       ...subsectionForm,
//       [name]: value
//     });
//   };

//   const handleSelectTabForSubsection = (tabId: string) => {
//     setSubsectionForm({
//       ...subsectionForm,
//       tab_id: tabId
//     });
//   };

//   const handleSubsectionSave = async () => {
//     setLoading(true);
//     try {
//       const { error } = await supabase
//         .from('csm_eyecare_service_subsections')
//         .upsert({
//           id: subsectionForm.id,
//           tab_id: subsectionForm.tab_id,
//           heading: subsectionForm.heading,
//           description: subsectionForm.description,
//           display_order: subsectionForm.display_order
//         });
      
//       if (error) throw error;
      
//       toast({
//         title: "Success",
//         description: "Subsection saved successfully"
//       });
      
//       refreshData();
//     } catch (err) {
//       console.error("Error saving subsection:", err);
//       toast({
//         title: "Error",
//         description: "Failed to save subsection",
//         variant: "destructive"
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddSubsection = () => {
//     const newOrderNumber = subsections.length > 0 
//       ? Math.max(...subsections.map(s => s.display_order || 0)) + 1 
//       : 1;

//     setSubsectionForm({
//       id: '',
//       tab_id: selectedTabIndex !== null ? tabs[selectedTabIndex].id : '',
//       heading: '',
//       description: '',
//       display_order: newOrderNumber
//     });
//     setSelectedSubsectionIndex(null);
//   };

//   const handleDeleteSubsection = async () => {
//     if (!subsectionForm.id) return;
    
//     setLoading(true);
//     try {
//       const { error } = await supabase
//         .from('csm_eyecare_service_subsections')
//         .delete()
//         .eq('id', subsectionForm.id);
      
//       if (error) throw error;
      
//       toast({
//         title: "Success",
//         description: "Subsection deleted successfully"
//       });
      
//       refreshData();
//       setSelectedSubsectionIndex(null);
//       setSubsectionForm({
//         id: '',
//         tab_id: selectedTabIndex !== null ? tabs[selectedTabIndex].id : '',
//         heading: '',
//         description: '',
//         display_order: 0
//       });
//     } catch (err) {
//       console.error("Error deleting subsection:", err);
//       toast({
//         title: "Error",
//         description: "Failed to delete subsection",
//         variant: "destructive"
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleMoveSubsection = async (direction: 'up' | 'down') => {
//     if (!subsectionForm.id) return;
    
//     // Find all subsections for the current tab
//     const tabSubsections = subsections
//       .filter(s => s.tab_id === subsectionForm.tab_id)
//       .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    
//     const currentIndex = tabSubsections.findIndex(s => s.id === subsectionForm.id);
//     if (currentIndex < 0) return;
    
//     let swapIndex;
//     if (direction === 'up' && currentIndex > 0) {
//       swapIndex = currentIndex - 1;
//     } else if (direction === 'down' && currentIndex < tabSubsections.length - 1) {
//       swapIndex = currentIndex + 1;
//     } else {
//       return; // Can't move further
//     }
    
//     const currentOrder = tabSubsections[currentIndex].display_order || 0;
//     const swapOrder = tabSubsections[swapIndex].display_order || 0;
    
//     setLoading(true);
//     try {
//       // Update both records
//       const updates = [
//         {
//           id: tabSubsections[currentIndex].id,
//           display_order: swapOrder
//         },
//         {
//           id: tabSubsections[swapIndex].id,
//           display_order: currentOrder
//         }
//       ];
      
//       for (const update of updates) {
//         const { error } = await supabase
//           .from('csm_eyecare_service_subsections')
//           .update({ display_order: update.display_order })
//           .eq('id', update.id);
        
//         if (error) throw error;
//       }
      
//       toast({
//         title: "Success",
//         description: "Subsection order updated"
//       });
      
//       refreshData();
      
//       // Update form with new display order
//       setSubsectionForm({
//         ...subsectionForm,
//         display_order: swapOrder
//       });
//     } catch (err) {
//       console.error("Error updating subsection order:", err);
//       toast({
//         title: "Error",
//         description: "Failed to update order",
//         variant: "destructive"
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Form handling for items
//   const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setItemForm({
//       ...itemForm,
//       [name]: value
//     });
//   };

//   const handleSelectSubsectionForItem = (subsectionId: string) => {
//     setItemForm({
//       ...itemForm,
//       subsection_id: subsectionId
//     });
//   };

//   const handleItemSave = async () => {
//     setLoading(true);
//     try {
//       const { error } = await supabase
//         .from('csm_eyecare_service_items')
//         .upsert({
//           id: itemForm.id,
//           subsection_id: itemForm.subsection_id,
//           label: itemForm.label,
//           detail: itemForm.detail,
//           display_order: itemForm.display_order
//         });
      
//       if (error) throw error;
      
//       toast({
//         title: "Success",
//         description: "Item saved successfully"
//       });
      
//       refreshData();
//     } catch (err) {
//       console.error("Error saving item:", err);
//       toast({
//         title: "Error",
//         description: "Failed to save item",
//         variant: "destructive"
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddItem = () => {
//     const subsectionItems = items.filter(i => i.subsection_id === subsectionForm.id);
//     const newOrderNumber = subsectionItems.length > 0 
//       ? Math.max(...subsectionItems.map(i => i.display_order || 0)) + 1 
//       : 1;

//     setItemForm({
//       id: '',
//       subsection_id: selectedSubsectionIndex !== null ? subsections[selectedSubsectionIndex].id : '',
//       label: '',
//       detail: '',
//       display_order: newOrderNumber
//     });
//     setSelectedItemIndex(null);
//   };

//   const handleDeleteItem = async () => {
//     if (!itemForm.id) return;
    
//     setLoading(true);
//     try {
//       const { error } = await supabase
//         .from('csm_eyecare_service_items')
//         .delete()
//         .eq('id', itemForm.id);
      
//       if (error) throw error;
      
//       toast({
//         title: "Success",
//         description: "Item deleted successfully"
//       });
      
//       refreshData();
//       setSelectedItemIndex(null);
//       setItemForm({
//         id: '',
//         subsection_id: selectedSubsectionIndex !== null ? subsections[selectedSubsectionIndex].id : '',
//         label: '',
//         detail: '',
//         display_order: 0
//       });
//     } catch (err) {
//       console.error("Error deleting item:", err);
//       toast({
//         title: "Error",
//         description: "Failed to delete item",
//         variant: "destructive"
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleMoveItem = async (direction: 'up' | 'down') => {
//     if (!itemForm.id) return;
    
//     // Find all items for the current subsection
//     const subsectionItems = items
//       .filter(i => i.subsection_id === itemForm.subsection_id)
//       .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    
//     const currentIndex = subsectionItems.findIndex(i => i.id === itemForm.id);
//     if (currentIndex < 0) return;
    
//     let swapIndex;
//     if (direction === 'up' && currentIndex > 0) {
//       swapIndex = currentIndex - 1;
//     } else if (direction === 'down' && currentIndex < subsectionItems.length - 1) {
//       swapIndex = currentIndex + 1;
//     } else {
//       return; // Can't move further
//     }
    
//     const currentOrder = subsectionItems[currentIndex].display_order || 0;
//     const swapOrder = subsectionItems[swapIndex].display_order || 0;
    
//     setLoading(true);
//     try {
//       // Update both records
//       const updates = [
//         {
//           id: subsectionItems[currentIndex].id,
//           display_order: swapOrder
//         },
//         {
//           id: subsectionItems[swapIndex].id,
//           display_order: currentOrder
//         }
//       ];
      
//       for (const update of updates) {
//         const { error } = await supabase
//           .from('csm_eyecare_service_items')
//           .update({ display_order: update.display_order })
//           .eq('id', update.id);
        
//         if (error) throw error;
//       }
      
//       toast({
//         title: "Success",
//         description: "Item order updated"
//       });
      
//       refreshData();
      
//       // Update form with new display order
//       setItemForm({
//         ...itemForm,
//         display_order: swapOrder
//       });
//     } catch (err) {
//       console.error("Error updating item order:", err);
//       toast({
//         title: "Error",
//         description: "Failed to update order",
//         variant: "destructive"
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//       <TabsList className="grid w-full grid-cols-3">
//         <TabsTrigger value="tabs">Tabs</TabsTrigger>
//         <TabsTrigger value="subsections">Subsections</TabsTrigger>
//         <TabsTrigger value="items">Items</TabsTrigger>
//       </TabsList>
      
//       {/* Tabs Editor */}
//       <TabsContent value="tabs">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="col-span-1 border rounded-lg p-4">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="font-medium text-lg">Service Tabs</h3>
//               <Button 
//                 size="sm" 
//                 variant="outline" 
//                 onClick={handleAddTab}
//               >
//                 <Plus className="h-4 w-4 mr-1" />
//                 Add New
//               </Button>
//             </div>
            
//             {tabs.length === 0 ? (
//               <p className="text-gray-500">No tabs found</p>
//             ) : (
//               <div className="space-y-2">
//                 {tabs.map((tab, index) => (
//                   <div 
//                     key={tab.id}
//                     className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors
//                       ${selectedTabIndex === index ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
//                     onClick={() => {
//                       setSelectedTabIndex(index);
//                       setTabForm(tab);
//                     }}
//                   >
//                     <div className="font-medium">{tab.title}</div>
//                     <div className="text-xs text-gray-500">{tab.tab_key}</div>
//                   </div>
//                 ))}
//               </div>
//             )}
            
//             <div className="mt-4">
//               <Button 
//                 variant="outline" 
//                 size="sm"
//                 className="w-full"
//                 onClick={refreshData}
//               >
//                 Refresh
//               </Button>
//             </div>
//           </div>
          
//           <div className="col-span-2 border rounded-lg p-6">
//             <h3 className="text-lg font-medium mb-4">
//               {tabForm.id ? 'Edit Tab' : 'Add New Tab'}
//             </h3>
            
//             <div className="space-y-4">
//               <div>
//                 <Label htmlFor="tab_key">Tab Key (unique identifier)</Label>
//                 <Input 
//                   id="tab_key"
//                   name="tab_key"
//                   value={tabForm.tab_key}
//                   onChange={handleTabChange}
//                   placeholder="e.g., clinical, surgical, refractive"
//                 />
//               </div>
              
//               <div>
//                 <Label htmlFor="title">Tab Title</Label>
//                 <Input 
//                   id="title"
//                   name="title"
//                   value={tabForm.title}
//                   onChange={handleTabChange}
//                   placeholder="e.g., Clinical Services"
//                 />
//               </div>
              
//               <div>
//                 <Label htmlFor="description">Description (optional)</Label>
//                 <Textarea 
//                   id="description"
//                   name="description"
//                   value={tabForm.description || ''}
//                   onChange={handleTabChange}
//                   placeholder="Brief description of this service category"
//                   rows={3}
//                 />
//               </div>
              
//               <div className="flex flex-wrap gap-2">
//                 <Button onClick={handleTabSave} disabled={loading}>
//                   {loading ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Saving
//                     </>
//                   ) : (
//                     <>
//                       <Save className="mr-2 h-4 w-4" />
//                       Save Tab
//                     </>
//                   )}
//                 </Button>
                
//                 {tabForm.id && (
//                   <Button variant="destructive" onClick={handleDeleteTab} disabled={loading}>
//                     <Trash2 className="mr-2 h-4 w-4" />
//                     Delete
//                   </Button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </TabsContent>
      
//       {/* Subsections Editor */}
//       <TabsContent value="subsections">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="col-span-1 border rounded-lg p-4">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="font-medium text-lg">Subsections</h3>
//               <Button 
//                 size="sm" 
//                 variant="outline" 
//                 onClick={handleAddSubsection}
//               >
//                 <Plus className="h-4 w-4 mr-1" />
//                 Add New
//               </Button>
//             </div>
            
//             {subsections.length === 0 ? (
//               <p className="text-gray-500">No subsections found</p>
//             ) : (
//               <>
//                 <div className="mb-3">
//                   <Select 
//                     value={selectedTabIndex !== null ? tabs[selectedTabIndex].id : ''} 
//                     onValueChange={(value) => {
//                       const index = tabs.findIndex(t => t.id === value);
//                       setSelectedTabIndex(index);
//                       // Reset subsection selection
//                       setSelectedSubsectionIndex(null);
//                       setSubsectionForm({
//                         id: '',
//                         tab_id: value,
//                         heading: '',
//                         description: '',
//                         display_order: 0
//                       });
//                     }}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Filter by tab" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {tabs.map(tab => (
//                         <SelectItem key={tab.id} value={tab.id}>
//                           {tab.title}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
                
//                 <div className="space-y-2">
//                   {subsections
//                     .filter(s => selectedTabIndex === null || s.tab_id === tabs[selectedTabIndex].id)
//                     .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
//                     .map((subsection, index) => {
//                       const actualIndex = subsections.findIndex(s => s.id === subsection.id);
//                       return (
//                         <div 
//                           key={subsection.id}
//                           className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors
//                             ${selectedSubsectionIndex === actualIndex ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
//                           onClick={() => {
//                             setSelectedSubsectionIndex(actualIndex);
//                             setSubsectionForm(subsection);
//                           }}
//                         >
//                           <div className="font-medium">{subsection.heading}</div>
//                           <div className="text-xs text-gray-500">Order: {subsection.display_order}</div>
//                         </div>
//                       );
//                     })}
//                 </div>
//               </>
//             )}
            
//             <div className="mt-4">
//               <Button 
//                 variant="outline" 
//                 size="sm"
//                 className="w-full"
//                 onClick={refreshData}
//               >
//                 Refresh
//               </Button>
//             </div>
//           </div>
          
//           <div className="col-span-2 border rounded-lg p-6">
//             <h3 className="text-lg font-medium mb-4">
//               {subsectionForm.id ? 'Edit Subsection' : 'Add New Subsection'}
//             </h3>
            
//             <div className="space-y-4">
//               <div>
//                 <Label htmlFor="tab_id">Parent Tab</Label>
//                 <Select 
//                   value={subsectionForm.tab_id} 
//                   onValueChange={handleSelectTabForSubsection}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select a tab" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {tabs.map(tab => (
//                       <SelectItem key={tab.id} value={tab.id}>
//                         {tab.title}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
              
//               <div>
//                 <Label htmlFor="heading">Heading</Label>
//                 <Input 
//                   id="heading"
//                   name="heading"
//                   value={subsectionForm.heading}
//                   onChange={handleSubsectionChange}
//                   placeholder="e.g., General Clinical Eye Checkup"
//                 />
//               </div>
              
//               <div>
//                 <Label htmlFor="description">Description (optional)</Label>
//                 <Textarea 
//                   id="description"
//                   name="description"
//                   value={subsectionForm.description || ''}
//                   onChange={handleSubsectionChange}
//                   placeholder="Description for this subsection"
//                   rows={4}
//                 />
//               </div>
              
//               <div>
//                 <Label htmlFor="display_order">Display Order</Label>
//                 <Input 
//                   id="display_order"
//                   name="display_order"
//                   type="number"
//                   value={subsectionForm.display_order || 0}
//                   onChange={handleSubsectionChange}
//                 />
//               </div>
              
//               <div className="flex flex-wrap gap-2">
//                 <Button onClick={handleSubsectionSave} disabled={loading}>
//                   {loading ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Saving
//                     </>
//                   ) : (
//                     <>
//                       <Save className="mr-2 h-4 w-4" />
//                       Save Subsection
//                     </>
//                   )}
//                 </Button>
                
//                 {subsectionForm.id && (
//                   <Button variant="destructive" onClick={handleDeleteSubsection} disabled={loading}>
//                     <Trash2 className="mr-2 h-4 w-4" />
//                     Delete
//                   </Button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </TabsContent>
      
//       {/* Items Editor */}
//       <TabsContent value="items">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="col-span-1 border rounded-lg p-4">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="font-medium text-lg">Items</h3>
//               <Button 
//                 size="sm" 
//                 variant="outline" 
//                 onClick={handleAddItem}
//               >
//                 <Plus className="h-4 w-4 mr-1" />
//                 Add New
//               </Button>
//             </div>
            
//             {items.length === 0 ? (
//               <p className="text-gray-500">No items found</p>
//             ) : (
//               <>
//                 <div className="mb-3">
//                   <Select 
//                     value={selectedSubsectionIndex !== null ? subsections[selectedSubsectionIndex].id : ''} 
//                     onValueChange={(value) => {
//                       const index = subsections.findIndex(s => s.id === value);
//                       setSelectedSubsectionIndex(index);
//                       // Reset item selection
//                       setSelectedItemIndex(null);
//                       setItemForm({
//                         id: '',
//                         subsection_id: value,
//                         label: '',
//                         detail: '',
//                         display_order: 0
//                       });
//                     }}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Filter by subsection" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {subsections.map(s => (
//                         <SelectItem key={s.id} value={s.id}>
//                           {s.heading}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
                
//                 <div className="space-y-2">
//                   {items
//                     .filter(i => selectedSubsectionIndex === null || i.subsection_id === subsections[selectedSubsectionIndex].id)
//                     .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
//                     .map((item, index) => {
//                       const actualIndex = items.findIndex(i => i.id === item.id);
//                       return (
//                         <div 
//                           key={item.id}
//                           className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors
//                             ${selectedItemIndex === actualIndex ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
//                           onClick={() => {
//                             setSelectedItemIndex(actualIndex);
//                             setItemForm(item);
//                           }}
//                         >
//                           <div className="font-medium">{item.label}</div>
//                           <div className="text-xs text-gray-500">Order: {item.display_order}</div>
//                         </div>
//                       );
//                     })}
//                 </div>
//               </>
//             )}
            
//             <div className="mt-4">
//               <Button 
//                 variant="outline" 
//                 size="sm"
//                 className="w-full"
//                 onClick={refreshData}
//               >
//                 Refresh
//               </Button>
//             </div>
//           </div>
          
//           <div className="col-span-2 border rounded-lg p-6">
//             <h3 className="text-lg font-medium mb-4">
//               {itemForm.id ? 'Edit Item' : 'Add New Item'}
//             </h3>
            
//             <div className="space-y-4">
//               <div>
//                 <Label htmlFor="label">Item Label</Label>
//                 <Input 
//                   id="label"
//                   name="label"
//                   value={itemForm.label}
//                   onChange={handleItemChange}
//                   placeholder="e.g., General Clinical Eye Checkup"
//                 />
//               </div>
              
//               <div>
//                 <Label htmlFor="detail">Item Detail</Label>
//                 <Textarea 
//                   id="detail"
//                   name="detail"
//                   value={itemForm.detail || ''}
//                   onChange={handleItemChange}
//                   placeholder="Description for this item"
//                   rows={4}
//                 />
//               </div>
              
//               <div>
//                 <Label htmlFor="display_order">Display Order</Label>
//                 <Input 
//                   id="display_order"
//                   name="display_order"
//                   type="number"
//                   value={itemForm.display_order || 0}
//                   onChange={handleItemChange}
//                 />
//               </div>
              
//               <div className="flex flex-wrap gap-2">
//                 <Button onClick={handleItemSave} disabled={loading}>
//                   {loading ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Saving
//                     </>
//                   ) : (
//                     <>
//                       <Save className="mr-2 h-4 w-4" />
//                       Save Item
//                     </>
//                   )}
//                 </Button>
                
//                 {itemForm.id && (
//                   <Button variant="destructive" onClick={handleDeleteItem} disabled={loading}>
//                     <Trash2 className="mr-2 h-4 w-4" />
//                     Delete
//                   </Button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </TabsContent>
//     </Tabs>
//   );
// };
