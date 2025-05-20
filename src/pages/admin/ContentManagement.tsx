import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VisualPageEditor from '@/components/admin/VisualPageEditor';
import { LiveVisualEditor } from '@/components/admin/live-editor/LiveVisualEditor';
// import ContentExtractor from '@/components/ContentExtractor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, Save, Download, FileText, Edit, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface PageInfo {
  path: string;
  title: string;
  lastUpdated?: string;
  contentCount?: number;
}

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('content-extractor');
  const [selectedPagePath, setSelectedPagePath] = useState('/eyecare');
  const [availablePages, setAvailablePages] = useState<PageInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  // Fetch available pages from the database
  useEffect(() => {
    fetchAvailablePages();
  }, []);

  const fetchAvailablePages = async () => {
    setIsLoading(true);
    try {
      // Get distinct pages from content_blocks table
      const { data: pagesData, error: pagesError } = await supabase
        .from('content_blocks')
        .select('page')
        .limit(100);

      if (pagesError) throw pagesError;

      // Get default pages if no pages exist yet
      const pages = pagesData?.length > 0 
        ? [...new Set(pagesData.map(item => item.page))]
        : ['/eyecare', '/gynecology', '/about', '/contact'];

      // For each page, get content block count and last updated time
      const pagesInfo: PageInfo[] = [];
      
      for (const page of pages) {
        const { data: contentData, error: contentError } = await supabase
          .from('content_blocks')
          .select('updated_at')
          .eq('page', page)
          .order('updated_at', { ascending: false })
          .limit(1);
          
        const { count, error: countError } = await supabase
          .from('content_blocks')
          .select('id', { count: 'exact', head: true })
          .eq('page', page);
          
        if (!contentError && !countError) {
          pagesInfo.push({
            path: page,
            title: page.split('/').filter(Boolean).join(' / ') || 'Home',
            lastUpdated: contentData && contentData.length > 0 
              ? new Date(contentData[0].updated_at).toLocaleString() 
              : undefined,
            contentCount: count || 0
          });
        }
      }
      
      setAvailablePages(pagesInfo.sort((a, b) => a.path.localeCompare(b.path)));
    } catch (error) {
      console.error('Error fetching available pages:', error);
      toast({
        title: "Error",
        description: "Could not fetch available pages",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle going back to the tab selection
  const handleBack = () => {
    setActiveTab('content-extractor');
  };
  
  // Handle selecting a page to edit
  const handleSelectPage = (pagePath: string) => {
    setSelectedPagePath(pagePath);
    setActiveTab('visual-editor');
  };
  
  // Filter pages based on search query
  const filteredPages = availablePages.filter(page => 
    page.path.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const exportContentToJSON = async () => {
    try {
      const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .order('page, order_index');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Format data for export
        const formattedData = data.reduce((acc, block) => {
          const page = block.page;
          if (!acc[page]) {
            acc[page] = [];
          }
          acc[page].push(block);
          return acc;
        }, {} as Record<string, any[]>);
        
        // Create JSON file
        const jsonData = JSON.stringify(formattedData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = 'website_content.json';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Export Successful",
          description: `Exported content from ${Object.keys(formattedData).length} pages.`,
        });
      } else {
        toast({
          title: "No Content",
          description: "There is no content available to export.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error exporting content:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export content. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Content Management</h1>
      </div>
      
      <Tabs defaultValue="content-extractor" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="content-extractor">Content Pages</TabsTrigger>
          <TabsTrigger value="visual-editor">Visual Editor</TabsTrigger>
          <TabsTrigger value="live-editor">Live Editor</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content-extractor">
          <div className="grid gap-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-blue-800">
                  <Info className="h-5 w-5 mr-2" /> Website Content Management
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Extract, edit, and manage content from all website pages.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-blue-700">
                  Select a page below to edit its content using the visual editor. You can also extract content from all pages 
                  or export existing content as JSON.
                </p>
                <div className="flex gap-4">
                  <Button 
                    onClick={exportContentToJSON} 
                    variant="outline" 
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Content as JSON
                  </Button>
                  
                  <Button
                    onClick={fetchAvailablePages}
                    variant="ghost"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Pages
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Available Pages</CardTitle>
                  <CardDescription>
                    Select a page to edit its content
                  </CardDescription>
                  <div className="mt-2">
                    <Label htmlFor="search-pages" className="sr-only">
                      Search
                    </Label>
                    <Input
                      id="search-pages"
                      placeholder="Search pages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[350px] pr-4">
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full mx-auto"></div>
                        <p className="mt-2 text-sm text-muted-foreground">Loading pages...</p>
                      </div>
                    ) : filteredPages.length > 0 ? (
                      <div className="space-y-1">
                        {filteredPages.map((page, index) => (
                          <React.Fragment key={page.path}>
                            {index > 0 && <Separator className="my-2" />}
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-left flex items-start"
                              onClick={() => handleSelectPage(page.path)}
                            >
                              <div>
                                <div className="font-medium">{page.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {page.path}
                                  {page.contentCount !== undefined && (
                                    <span className="ml-2">({page.contentCount} items)</span>
                                  )}
                                </div>
                                {page.lastUpdated && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Last updated: {page.lastUpdated}
                                  </div>
                                )}
                              </div>
                            </Button>
                          </React.Fragment>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-8 text-muted-foreground">
                        {searchQuery ? 'No pages matching your search' : 'No pages available'}
                      </p>
                    )}
                  </ScrollArea>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">
                    Select a page to edit or extract content from all pages
                  </p>
                </CardFooter>
              </Card>
              
              <div className="md:col-span-2">
                {/* <ContentExtractor 
                  showControls={true} 
                  onExtractionComplete={fetchAvailablePages}
                /> */}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="visual-editor">
          <VisualPageEditor 
            pagePath={selectedPagePath}
            onBack={handleBack}
          />
        </TabsContent>
        
        <TabsContent value="live-editor">
          <LiveVisualEditor pagePath={selectedPagePath} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagement;
