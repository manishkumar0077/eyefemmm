
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PuckEditor } from './PuckEditor';
import { fetchPageBlocks, Block } from '@/integrations/supabase/blocks';

interface WebsiteContent {
  id: string;
  selector: string;
  element_type: string;
  content: string;
  image_url?: string;
  styles: Record<string, any>;
  properties: Record<string, any>;
}

export const LivePreview = ({ pagePath }: { pagePath: string }) => {
  const [editMode, setEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [contentMap, setContentMap] = useState<Record<string, WebsiteContent>>({});
  const [puckBlocks, setPuckBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [previewKey, setPreviewKey] = useState(Date.now()); // Used to force iframe refresh

  useEffect(() => {
    fetchPageContent();
    loadPuckBlocks();

    // Set up a subscription to the blocks table
    const channel = supabase
      .channel('blocks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blocks',
          filter: `page_path=eq.${pagePath}`
        },
        () => {
          // Reload blocks when changes are made
          loadPuckBlocks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pagePath]);

  useEffect(() => {
    // Set up the iframe listener after the iframe has loaded
    const handleIframeLoad = () => {
      if (iframeRef.current?.contentDocument) {
        setupIframeListeners();
        setLoading(false);
      }
    };

    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', handleIframeLoad);
      return () => {
        iframeRef.current?.removeEventListener('load', handleIframeLoad);
      };
    }
  }, [iframeRef.current, editMode]);

  const loadPuckBlocks = async () => {
    try {
      const blocks = await fetchPageBlocks(pagePath);
      setPuckBlocks(blocks);
    } catch (error) {
      console.error('Error loading Puck blocks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load page blocks',
        variant: 'destructive'
      });
    }
  };

  const fetchPageContent = async () => {
    const { data, error } = await supabase
      .from('website_content')
      .select('*')
      .eq('page_path', pagePath);

    if (error) {
      toast({ 
        title: "Error loading content",
        description: "Could not load page content",
        variant: "destructive"
      });
      return;
    }

    const contentMapData = data.reduce((acc, item) => {
      const styles = typeof item.styles === 'string' 
        ? JSON.parse(item.styles) 
        : item.styles || {};
        
      const properties = typeof item.properties === 'string'
        ? JSON.parse(item.properties)
        : item.properties || {};
        
      acc[item.selector] = {
        ...item,
        styles,
        properties
      };
      return acc;
    }, {} as Record<string, WebsiteContent>);

    setContentMap(contentMapData);
  };

  const setupIframeListeners = () => {
    const iframeDocument = iframeRef.current?.contentDocument;
    if (!iframeDocument) return;

    if (editMode) {
      makeElementsEditable(iframeDocument);
    }
  };

  const makeElementsEditable = (doc: Document) => {
    const elements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6, p, img, a');
    
    elements.forEach((element) => {
      element.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleElementClick(element as HTMLElement);
      });

      if (editMode) {
        element.classList.add('hover:outline-dashed', 'hover:outline-2', 'hover:outline-blue-500');
      }
    });
  };

  const handleElementClick = async (element: HTMLElement) => {
    if (!editMode) return;

    setSelectedElement(element);
    
    const selector = generateSelector(element);
    const content = element.innerText || element.getAttribute('src') || '';
    
    const { error } = await supabase
      .from('website_content')
      .upsert({
        page_path: pagePath,
        selector,
        element_type: element.tagName.toLowerCase(),
        content,
        styles: getComputedStyles(element),
        properties: getElementProperties(element)
      });

    if (error) {
      toast({
        title: "Error saving",
        description: "Could not save changes",
        variant: "destructive"
      });
      return;
    }

    await fetchPageContent();
  };

  const generateSelector = (element: HTMLElement): string => {
    let path = [];
    let current = element;

    while (current.parentElement) {
      let selector = current.tagName.toLowerCase();
      if (current.id) {
        selector += `#${current.id}`;
      } else if (current.className) {
        selector += `.${current.className.split(' ').join('.')}`;
      }
      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(' > ');
  };

  const getComputedStyles = (element: HTMLElement) => {
    const styles = window.getComputedStyle(element);
    return {
      color: styles.color,
      backgroundColor: styles.backgroundColor,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      padding: styles.padding,
      margin: styles.margin,
    };
  };

  const getElementProperties = (element: HTMLElement) => {
    if (element.tagName.toLowerCase() === 'img') {
      return {
        src: element.getAttribute('src'),
        alt: element.getAttribute('alt'),
      };
    }
    if (element.tagName.toLowerCase() === 'a') {
      return {
        href: element.getAttribute('href'),
      };
    }
    return {};
  };

  const handleBlocksChange = (newBlocks: any[]) => {
    // Force iframe refresh to reflect changes
    setPreviewKey(Date.now());
  };

  return (
    <div className="relative min-h-screen bg-white">
      {editMode ? (
        <PuckEditor 
          pagePath={pagePath} 
          blocks={puckBlocks} 
          onSave={() => {
            setEditMode(false);
            loadPuckBlocks();
            // Force iframe refresh when returning to preview mode
            setPreviewKey(Date.now());
          }}
          onCancel={() => {
            setEditMode(false);
            // Force iframe refresh when canceling edits
            setPreviewKey(Date.now());
          }}
          onBlocksChange={handleBlocksChange}
        />
      ) : (
        <>
          <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b p-4 flex items-center justify-between shadow-sm">
            <h2 className="text-xl font-semibold">Live Preview: {pagePath}</h2>
            <Button
              onClick={() => setEditMode(true)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" /> Edit Page
            </Button>
          </div>

          <div className="pt-16">
            {loading ? (
              <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <iframe
                key={previewKey}
                ref={iframeRef}
                src={pagePath}
                className="w-full h-[calc(100vh-4rem)] border-0"
                title="Live Preview"
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};
