
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, RefreshCw, Save, FileText, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { extractAndStoreCurrentPage } from '@/utils/contentExtractor';
import { Progress } from '@/components/ui/progress';

const ContentEditor = () => {
  const navigate = useNavigate();
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [pages, setPages] = useState<string[]>([]);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [pageContent, setPageContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available pages
  useEffect(() => {
    fetchPages();
  }, []);

  // Fetch content when a page is selected
  useEffect(() => {
    if (selectedPage) {
      fetchPageContent(selectedPage);
    }
  }, [selectedPage]);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('content_blocks')
        .select('page')
        .not('content', 'is', null)
        .order('page')
        .not('page', 'ilike', '%appointment%')
        .not('page', 'ilike', '%admin%');

      if (error) throw error;

      // Get unique page paths
      const uniquePages = Array.from(new Set(data.map(item => item.page)));
      setPages(uniquePages);

      if (uniquePages.length > 0 && !selectedPage) {
        setSelectedPage(uniquePages[0]);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast({
        title: "Error fetching pages",
        description: "Could not retrieve available pages.",
        variant: "destructive"
      });
    }
  };

  const fetchPageContent = async (pagePath: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('page', pagePath)
        .order('order_index');

      if (error) throw error;
      
      setPageContent(data);
    } catch (error) {
      console.error('Error fetching page content:', error);
      toast({
        title: "Error",
        description: "Could not load page content.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractContent = async () => {
    setIsExtracting(true);
    setExtractionProgress(0);
    
    try {
      // Show progress updates to user
      const progressInterval = setInterval(() => {
        setExtractionProgress(prev => {
          const newProgress = Math.min(prev + 5, 90);
          return newProgress;
        });
      }, 300);
      
      const options = {
        waitTime: 3000, // Wait time for dynamic content
        includeHeadings: true,
        includeParagraphs: true,
        includeImages: true,
        includeLists: true,
        includeLinks: true,
        excludePaths: ['admin', 'appointment']
      };
      
      // Fix the function call here - remove the third argument if it exists
      const success = await extractAndStoreCurrentPage(options);
      
      clearInterval(progressInterval);
      setExtractionProgress(100);
      
      if (success) {
        toast({
          title: "Content extracted",
          description: "Page content has been successfully extracted and stored.",
        });
        
        // Refresh the page list
        fetchPages();
      } else {
        toast({
          title: "Extraction failed",
          description: "Could not extract content from this page.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error extracting content:', error);
      toast({
        title: "Error",
        description: "An error occurred during content extraction.",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setIsExtracting(false);
        setExtractionProgress(0);
      }, 1000);
    }
  };

  const handleContentUpdate = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('content_blocks')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      
      // Update the local state
      setPageContent(prevContent => 
        prevContent.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      );
      
      toast({
        description: "Content updated successfully",
      });
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: "Error",
        description: "Could not update content.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Content Editor</h1>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/dashboard')}
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={handleExtractContent}
            disabled={isExtracting}
          >
            {isExtracting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Extract Current Page
              </>
            )}
          </Button>
        </div>
      </div>
      
      {isExtracting && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Progress value={extractionProgress} className="w-full h-2" />
              <p className="text-sm text-center text-muted-foreground">
                {extractionProgress < 100 
                  ? `Extracting page content... ${extractionProgress}%` 
                  : "Complete! Processing data..."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Page Selection Sidebar */}
        <div className="col-span-1 md:border-r pr-0 md:pr-4">
          <h2 className="text-xl font-semibold mb-4">Available Pages</h2>
          
          {pages.length > 0 ? (
            <div className="space-y-1">
              {pages.map((page) => (
                <Button
                  key={page}
                  variant={selectedPage === page ? "default" : "ghost"}
                  className="w-full justify-start text-left"
                  onClick={() => setSelectedPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
          ) : (
            <Alert className="bg-amber-50 border-amber-200">
              <FileText className="h-4 w-4" />
              <AlertTitle>No pages found</AlertTitle>
              <AlertDescription>
                No content has been extracted yet. Navigate to a page and use the "Extract Current Page" button.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Page Content Editor */}
        <div className="col-span-1 md:col-span-3">
          {selectedPage ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Editing: {selectedPage}</h2>
              
              {isLoading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pageContent.length > 0 ? (
                <div className="space-y-6">
                  {pageContent.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <span className="text-sm font-medium bg-blue-100 text-blue-800 py-0.5 px-2 rounded">
                              {item.section}
                            </span>
                            {item.name && (
                              <span className="ml-2 text-sm text-gray-500">
                                {item.name}
                              </span>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleContentUpdate(item.id, { 
                              content: item.content 
                            })}
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        </div>
                        
                        {item.image_url ? (
                          <div className="space-y-2">
                            <img 
                              src={item.image_url} 
                              alt={item.title || 'Content image'} 
                              className="max-h-40 object-contain mb-2" 
                            />
                            <label className="block text-sm font-medium text-gray-700">
                              Image URL
                            </label>
                            <input
                              type="text"
                              value={item.image_url}
                              className="w-full p-2 border rounded"
                              onChange={(e) => {
                                const updatedContent = [...pageContent];
                                const index = updatedContent.findIndex(c => c.id === item.id);
                                updatedContent[index] = {
                                  ...updatedContent[index],
                                  image_url: e.target.value
                                };
                                setPageContent(updatedContent);
                              }}
                            />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Content
                            </label>
                            <textarea
                              value={item.content || ''}
                              rows={3}
                              className="w-full p-2 border rounded"
                              onChange={(e) => {
                                const updatedContent = [...pageContent];
                                const index = updatedContent.findIndex(c => c.id === item.id);
                                updatedContent[index] = {
                                  ...updatedContent[index],
                                  content: e.target.value
                                };
                                setPageContent(updatedContent);
                              }}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert className="bg-amber-50 border-amber-200">
                  <Eye className="h-4 w-4" />
                  <AlertTitle>No content found</AlertTitle>
                  <AlertDescription>
                    No content has been extracted for this page yet.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Select a page to edit its content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
