import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Loader2, Save, Image, Type, LayoutGrid, PanelLeft, 
  MoveVertical, Move, Trash2, Plus, RotateCcw, Bold, Italic, 
  AlignCenter, AlignLeft, AlignRight, Link
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AlignTop from './AlignTop';
import AlignBottom from './AlignBottom';

interface PageEditorProps {
  pagePath: string;
}

interface ContentBlock {
  id: string;
  name: string;
  page: string;
  section: string;
  specialty: string;
  title: string | null;
  content: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  order?: number; // Optional field for managing display order
}

const PageEditor = ({ pagePath }: PageEditorProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('editor');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedBlockForImage, setSelectedBlockForImage] = useState<string | null>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Extract specialty from the path
  const specialty = pagePath.includes('eyecare') ? 'eyecare' : 
                     pagePath.includes('gynecology') ? 'gynecology' : 'general';

  useEffect(() => {
    const fetchPageContent = async () => {
      setIsLoading(true);
      try {
        // Fetch content blocks for this page
        const { data, error } = await supabase
          .from('content_blocks')
          .select('*')
          .eq('page', pagePath)
          .order('section', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        // Add temporary order field for drag and drop functionality
        const blocksWithOrder = data?.map((block, index) => ({
          ...block,
          order: index
        })) || [];
        
        setContentBlocks(blocksWithOrder);
      } catch (error) {
        console.error('Error fetching page content:', error);
        toast({
          title: 'Error loading page content',
          description: 'There was a problem fetching the content for this page.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPageContent();
  }, [pagePath]);

  const handleElementSelect = (elementId: string) => {
    setSelectedElement(elementId);
    setIsEditingText(false);
  };

  const handleContentChange = (id: string, field: string, value: string) => {
    setContentBlocks(blocks => 
      blocks.map(block => 
        block.id === id 
          ? { ...block, [field]: value, updated_at: new Date().toISOString() } 
          : block
      )
    );
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Filter only the blocks that have been modified
      const updatedBlocks = contentBlocks.filter(block => 
        block.updated_at > block.created_at
      );
      
      if (updatedBlocks.length === 0) {
        toast({
          title: 'No changes to save',
          description: 'No content has been modified.',
        });
        setIsSaving(false);
        return;
      }
      
      // Update each modified block
      for (const block of updatedBlocks) {
        const { error } = await supabase
          .from('content_blocks')
          .update({
            title: block.title,
            content: block.content,
            image_url: block.image_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', block.id);
          
        if (error) {
          throw error;
        }
      }
      
      toast({
        title: 'Changes saved',
        description: 'Your content updates have been saved successfully.',
      });

      // Refresh preview if in preview mode
      if (currentTab === 'preview' && iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }
    } catch (error) {
      console.error('Error saving content changes:', error);
      toast({
        title: 'Error saving changes',
        description: 'There was a problem saving your content updates.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedBlockForImage || !fileInputRef.current || !fileInputRef.current.files || fileInputRef.current.files.length === 0) {
      toast({
        title: 'No image selected',
        description: 'Please select an image to upload.',
        variant: 'destructive',
      });
      return;
    }

    const file = fileInputRef.current.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `content-images/${fileName}`;

    try {
      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL for the uploaded image
      const { data: publicURLData } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      if (!publicURLData || !publicURLData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image');
      }

      // Update content block with new image URL
      handleContentChange(selectedBlockForImage, 'image_url', publicURLData.publicUrl);
      setShowImagePicker(false);

      toast({
        title: 'Image uploaded',
        description: 'Your image has been uploaded successfully.',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error uploading image',
        description: 'There was a problem uploading your image.',
        variant: 'destructive',
      });
    }
  };

  const openImagePicker = (blockId: string) => {
    setSelectedBlockForImage(blockId);
    setShowImagePicker(true);
  };

  const handleReorderBlocks = (blockId: string, direction: 'up' | 'down') => {
    setContentBlocks(blocks => {
      const newBlocks = [...blocks];
      const currentIndex = newBlocks.findIndex(block => block.id === blockId);
      
      if (currentIndex === -1) return blocks;
      
      const swapIndex = direction === 'up' 
        ? Math.max(0, currentIndex - 1) 
        : Math.min(blocks.length - 1, currentIndex + 1);
        
      if (swapIndex === currentIndex) return blocks;
      
      // Swap order values
      const temp = newBlocks[currentIndex].order;
      newBlocks[currentIndex].order = newBlocks[swapIndex].order;
      newBlocks[swapIndex].order = temp;
      
      // Sort by order
      return newBlocks.sort((a, b) => (a.order || 0) - (b.order || 0));
    });
  };

  const handleAddNewBlock = async (section: string) => {
    const newBlock = {
      name: `new-block-${Date.now()}`,
      page: pagePath,
      section: section,
      specialty: specialty,
      title: 'New Content Block',
      content: 'Edit this content',
      image_url: null as string | null,
    };
    
    try {
      const { data, error } = await supabase
        .from('content_blocks')
        .insert(newBlock)
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setContentBlocks(prev => [...prev, { ...data[0], order: prev.length }]);
        setSelectedElement(data[0].id);
        
        toast({
          title: 'Block added',
          description: 'New content block has been added.',
        });
      }
    } catch (error) {
      console.error('Error adding new block:', error);
      toast({
        title: 'Error adding block',
        description: 'Failed to add new content block.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    try {
      const { error } = await supabase
        .from('content_blocks')
        .delete()
        .eq('id', blockId);
        
      if (error) throw error;
      
      setContentBlocks(prev => prev.filter(block => block.id !== blockId));
      setSelectedElement(null);
      
      toast({
        title: 'Block deleted',
        description: 'Content block has been removed.',
      });
    } catch (error) {
      console.error('Error deleting block:', error);
      toast({
        title: 'Error deleting block',
        description: 'Failed to delete content block.',
        variant: 'destructive',
      });
    }
  };

  const renderPreviewIframe = () => {
    return (
      <iframe 
        ref={iframeRef}
        src={pagePath} 
        className="w-full border-none min-h-[800px]"
        title="Page Preview"
      />
    );
  };

  const renderLiveEditor = () => {
    return (
      <div className="relative border rounded-md min-h-[800px] bg-white">
        <div className="sticky top-0 z-10 bg-gray-100 p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-medium">Live Editor</span>
            <span className="text-sm text-gray-500">Click on elements to edit them</span>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={isReordering ? "default" : "outline"}
              onClick={() => setIsReordering(!isReordering)}
            >
              <MoveVertical className="mr-2 h-4 w-4" />
              {isReordering ? "Exit Reordering" : "Reorder Elements"}
            </Button>
            <Button
              size="sm"
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          {contentBlocks
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(block => (
              <div 
                key={block.id}
                className={`relative border p-4 mb-4 rounded-md ${
                  selectedElement === block.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-400'
                }`}
                onClick={() => isReordering ? null : handleElementSelect(block.id)}
              >
                {/* Reordering controls */}
                {isReordering && (
                  <div className="absolute right-2 top-2 flex flex-col gap-1 bg-white p-1 rounded border">
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => handleReorderBlocks(block.id, 'up')}
                    >
                      <AlignTop className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => handleReorderBlocks(block.id, 'down')}
                    >
                      <AlignBottom className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm text-gray-500">
                    {block.name} - {block.section}
                  </div>
                  {selectedElement === block.id && (
                    <div className="flex gap-1">
                      <Button 
                        size="icon"
                        variant="ghost"
                        onClick={() => openImagePicker(block.id)}
                      >
                        <Image className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteBlock(block.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Title */}
                {block.title !== null && (
                  <div className="mb-3">
                    {selectedElement === block.id ? (
                      <Input
                        value={block.title || ''}
                        onChange={(e) => handleContentChange(block.id, 'title', e.target.value)}
                        className="font-bold text-lg"
                        placeholder="Enter title"
                      />
                    ) : (
                      <h3 className="font-bold text-lg">{block.title || 'No Title'}</h3>
                    )}
                  </div>
                )}
                
                {/* Content */}
                {block.content !== null && (
                  <div className="mb-3">
                    {selectedElement === block.id ? (
                      <Textarea
                        value={block.content || ''}
                        onChange={(e) => handleContentChange(block.id, 'content', e.target.value)}
                        className="min-h-[100px]"
                        placeholder="Enter content"
                      />
                    ) : (
                      <p className="text-gray-700">{block.content || 'No content'}</p>
                    )}
                  </div>
                )}
                
                {/* Image */}
                {block.image_url !== null && (
                  <div>
                    {block.image_url ? (
                      <img 
                        src={block.image_url} 
                        alt={block.title || 'Content image'} 
                        className="max-h-48 object-contain border rounded-md"
                        onClick={(e) => {
                          if (selectedElement === block.id) {
                            e.stopPropagation();
                            openImagePicker(block.id);
                          }
                        }}
                      />
                    ) : (
                      selectedElement === block.id ? (
                        <Button 
                          variant="outline" 
                          className="w-full h-24"
                          onClick={() => openImagePicker(block.id)}
                        >
                          <Image className="mr-2 h-4 w-4" />
                          Add Image
                        </Button>
                      ) : (
                        <div className="border rounded-md p-4 text-center text-gray-500">
                          No image set
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
            
          {/* Add new block button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add New Content Block
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add New Content Block</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <h3 className="mb-2 font-medium">Select Section</h3>
                <div className="grid grid-cols-1 gap-2">
                  {/* Get unique sections from existing blocks */}
                  {Array.from(new Set(contentBlocks.map(block => block.section))).map(section => (
                    <Button 
                      key={section} 
                      variant="outline"
                      onClick={() => handleAddNewBlock(section)}
                      className="justify-start"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add to "{section}" section
                    </Button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading page content...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="editor">
              <PanelLeft className="mr-2 h-4 w-4" /> Editor
            </TabsTrigger>
            <TabsTrigger value="liveEditor">
              <Move className="mr-2 h-4 w-4" /> Live Editor
            </TabsTrigger>
            <TabsTrigger value="preview">
              <LayoutGrid className="mr-2 h-4 w-4" /> Preview
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            {contentBlocks.length > 0 && currentTab === "editor" && (
              <Select 
                value={selectedElement || ''} 
                onValueChange={handleElementSelect}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select element" />
                </SelectTrigger>
                <SelectContent>
                  {contentBlocks.map(block => (
                    <SelectItem key={block.id} value={block.id}>
                      {block.name || block.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Button 
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
        
        <TabsContent value="editor" className="border rounded-md p-4">
          {contentBlocks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No content blocks found for this page.</p>
              <p className="text-sm text-gray-400 mt-2">
                Content blocks need to be initialized from the database first.
              </p>
            </div>
          ) : selectedElement ? (
            // Selected element editor
            (() => {
              const selectedBlock = contentBlocks.find(block => block.id === selectedElement);
              
              if (!selectedBlock) return null;
              
              return (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">
                      Editing: {selectedBlock.name || selectedBlock.section}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Section: {selectedBlock.section} | Page: {selectedBlock.page}
                    </p>
                  </div>
                  
                  {selectedBlock.title !== null && (
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Type className="mr-2 h-4 w-4" />
                        <label className="font-medium">Title</label>
                      </div>
                      <Input
                        value={selectedBlock.title || ''}
                        onChange={(e) => handleContentChange(selectedBlock.id, 'title', e.target.value)}
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter title"
                      />
                    </div>
                  )}
                  
                  {selectedBlock.content !== null && (
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Type className="mr-2 h-4 w-4" />
                        <label className="font-medium">Content</label>
                      </div>
                      <Textarea
                        value={selectedBlock.content || ''}
                        onChange={(e) => handleContentChange(selectedBlock.id, 'content', e.target.value)}
                        className="w-full p-2 border rounded-md min-h-[200px]"
                        placeholder="Enter content"
                      />
                    </div>
                  )}
                  
                  {selectedBlock.image_url !== null && (
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Image className="mr-2 h-4 w-4" />
                        <label className="font-medium">Image</label>
                      </div>
                      <div className="flex items-center gap-4">
                        {selectedBlock.image_url && (
                          <div className="border rounded-md overflow-hidden max-w-xs">
                            <img 
                              src={selectedBlock.image_url} 
                              alt={selectedBlock.title || 'Content image'} 
                              className="max-h-48 object-contain w-full"
                            />
                          </div>
                        )}
                        <Button 
                          variant="outline" 
                          onClick={() => openImagePicker(selectedBlock.id)}
                        >
                          {selectedBlock.image_url ? 'Change Image' : 'Add Image'}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Delete button */}
                  <div className="pt-4 border-t">
                    <Button 
                      variant="destructive"
                      onClick={() => handleDeleteBlock(selectedBlock.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Block
                    </Button>
                  </div>
                </div>
              );
            })()
          ) : (
            // Content blocks list
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contentBlocks.map(block => (
                <div 
                  key={block.id}
                  className="border rounded-md p-4 hover:border-primary cursor-pointer"
                  onClick={() => handleElementSelect(block.id)}
                >
                  <h3 className="font-medium">{block.name || block.section}</h3>
                  <p className="text-sm text-gray-500">{block.section}</p>
                  
                  <div className="mt-2 flex gap-2">
                    {block.title !== null && (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        <Type className="inline mr-1 h-3 w-3" /> Title
                      </span>
                    )}
                    {block.content !== null && (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        <Type className="inline mr-1 h-3 w-3" /> Content
                      </span>
                    )}
                    {block.image_url !== null && (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        <Image className="inline mr-1 h-3 w-3" /> Image
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {/* Add new block button */}
              <Sheet>
                <SheetTrigger asChild>
                  <div className="border border-dashed rounded-md p-4 hover:border-primary cursor-pointer flex items-center justify-center">
                    <Plus className="h-6 w-6 text-gray-400" />
                    <span className="ml-2 text-gray-600">Add New Content Block</span>
                  </div>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Add New Content Block</SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <h3 className="mb-2 font-medium">Select Section</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {/* Get unique sections from existing blocks */}
                      {Array.from(new Set(contentBlocks.map(block => block.section))).map(section => (
                        <Button 
                          key={section} 
                          variant="outline"
                          onClick={() => handleAddNewBlock(section)}
                          className="justify-start"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add to "{section}" section
                        </Button>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="liveEditor" className="border rounded-md">
          {renderLiveEditor()}
        </TabsContent>
        
        <TabsContent value="preview" className="border rounded-md">
          <div className="bg-white">
            {renderPreviewIframe()}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Image upload dialog */}
      <Dialog open={showImagePicker} onOpenChange={setShowImagePicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
            <DialogDescription>
              Select an image to upload for this content block.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
            />
            {/* Preview current image if exists */}
            {selectedBlockForImage && contentBlocks.find(b => b.id === selectedBlockForImage)?.image_url && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Current image:</p>
                <img 
                  src={contentBlocks.find(b => b.id === selectedBlockForImage)?.image_url || ''} 
                  alt="Current" 
                  className="max-h-32 max-w-full object-contain border rounded"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImagePicker(false)}>Cancel</Button>
            <Button onClick={handleImageUpload}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PageEditor;
