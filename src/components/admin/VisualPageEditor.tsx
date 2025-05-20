
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Save, Loader2, FileText, Eye, Crosshair, RefreshCw } from 'lucide-react';
import { VisualEditor } from './visual-editor/VisualEditor';
import { extractAndStoreCurrentPage } from '@/utils/contentExtractor';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface VisualPageEditorProps {
  pagePath: string;
  onBack: () => void;
}

const VisualPageEditor = ({ pagePath, onBack }: VisualPageEditorProps) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [hasContent, setHasContent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  
  // List of restricted pages that cannot be edited
  const restrictedPages = [
    '/eyecare/appointment',
    '/gynecology/appointment',
    '/book-appointment',
    '/admin'
  ];
  
  // Check for existing content on load
  useEffect(() => {
    checkForExistingContent();
  }, [pagePath]);
  
  // Check if content exists for this page
  const checkForExistingContent = async () => {
    try {
      const { count } = await supabase
        .from('content_blocks')
        .select('*', { count: 'exact', head: true })
        .eq('page', pagePath);
      
      setHasContent(!!count && count > 0);
    } catch (error) {
      console.error('Error checking for content:', error);
    }
  };

  // Check if current page is restricted
  const isRestrictedPage = restrictedPages.some(path => pagePath.includes(path));
  
  // Handle extract content with improved feedback
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
        waitTime: 4000, // Extended wait time for dynamic content
        includeHeadings: true,
        includeParagraphs: true,
        includeImages: true,
        includeLists: true,
        includeLinks: true,
        excludePaths: ['admin', 'appointment']
      };
      
      const success = await extractAndStoreCurrentPage(options);
      
      clearInterval(progressInterval);
      setExtractionProgress(100);
      
      if (success) {
        toast({
          title: "Content extracted",
          description: "Page content has been successfully extracted and stored.",
        });
        setHasContent(true);
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

  // Force re-extraction of content
  const handleReExtractContent = async () => {
    // Delete existing content for this page first
    try {
      setIsExtracting(true);
      
      const { error } = await supabase
        .from('content_blocks')
        .delete()
        .eq('page', pagePath);
        
      if (error) {
        throw error;
      }
      
      // Now extract fresh content
      await handleExtractContent();
      
    } catch (error) {
      console.error('Error re-extracting content:', error);
      toast({
        title: "Error",
        description: "Failed to re-extract content.",
        variant: "destructive"
      });
      setIsExtracting(false);
    }
  };

  const handleSaveChanges = async () => {
    toast({
      title: "Changes saved",
      description: "All content changes have been saved successfully.",
    });
  };

  if (isRestrictedPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Restricted Page</h1>
        <p className="text-gray-600 mb-8">This page cannot be edited through the visual editor.</p>
        <Button onClick={onBack}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }
  
  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg shadow-sm">
        <FileText className="h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Content Found</h2>
        <p className="text-gray-500 text-center mb-6 max-w-md">
          There is no content extracted for this page yet. 
          Extract content to begin editing with the visual editor.
        </p>
        
        {isExtracting ? (
          <Card className="w-full max-w-md">
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
        ) : (
          <div className="space-y-4 w-full max-w-md">
            <Button 
              onClick={handleExtractContent} 
              disabled={isExtracting}
              className="w-full"
            >
              Extract Page Content
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              This will parse the current page and extract all visible text and images for editing.
            </p>
          </div>
        )}
        
        <Button 
          variant="outline" 
          onClick={onBack} 
          className="mt-6"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h2 className="text-xl font-semibold">
            Editing: {pagePath}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleReExtractContent}
            disabled={isExtracting}
            className="flex items-center"
          >
            {isExtracting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Re-extract Content
          </Button>
          
          <Button 
            variant="default"
            onClick={handleSaveChanges}
            className="flex items-center"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
          
          <Button
            variant={isEditing ? "secondary" : "outline"}
            onClick={() => {
              setIsEditing(!isEditing);
              if (isEditing) setSelectedBlockId(null);
            }}
            className="flex items-center"
          >
            {isEditing ? (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Preview Mode
              </>
            ) : (
              <>
                <Crosshair className="mr-2 h-4 w-4" />
                Edit Mode
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="pt-20 pb-12 px-4 md:px-8">
        <VisualEditor 
          pagePath={pagePath} 
          isEditMode={isEditing}
          selectedBlockId={selectedBlockId}
          onSelectBlock={setSelectedBlockId}
        />
      </div>
    </div>
  );
};

export default VisualPageEditor;
