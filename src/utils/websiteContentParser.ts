
import { supabase } from '@/integrations/supabase/client';

interface ParseOptions {
  includeHeadings?: boolean;
  includeParagraphs?: boolean;
  includeImages?: boolean;
  includeLists?: boolean;
  includeLinks?: boolean;
  excludePaths?: string[];
  waitTime?: number;
}

interface ParsedContent {
  type: 'heading' | 'paragraph' | 'list' | 'image' | 'link';
  content: string;
  level?: number; // For headings
  url?: string;   // For images and links
  visible: boolean;
}

/**
 * Parse website content and store to Supabase
 */
export const parseWebsiteContent = async (options: ParseOptions = {}): Promise<boolean> => {
  try {
    // Default options
    const {
      includeHeadings = true,
      includeParagraphs = true,
      includeImages = true,
      includeLists = true,
      includeLinks = true,
      excludePaths = ['admin', 'appointment'],
      waitTime = 2000
    } = options;

    // Wait for page to be fully loaded
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    // Skip excluded paths
    const currentPath = window.location.pathname;
    if (excludePaths.some(path => currentPath.includes(path))) {
      console.log(`Skipping content extraction for excluded page: ${currentPath}`);
      return false;
    }
    
    // Clear previous content for this page
    await supabase
      .from('content_blocks')
      .delete()
      .eq('page', currentPath);
    
    // Extract content
    const parsedContent: ParsedContent[] = [];
    
    // Extract headings
    if (includeHeadings) {
      document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading, index) => {
        const isVisible = isElementVisible(heading);
        if (isVisible && heading.textContent?.trim()) {
          parsedContent.push({
            type: 'heading',
            content: heading.textContent.trim(),
            level: parseInt(heading.tagName.substring(1), 10),
            visible: true
          });
        }
      });
    }
    
    // Extract paragraphs
    if (includeParagraphs) {
      document.querySelectorAll('p').forEach((paragraph, index) => {
        const isVisible = isElementVisible(paragraph);
        if (isVisible && paragraph.textContent?.trim()) {
          parsedContent.push({
            type: 'paragraph',
            content: paragraph.textContent.trim(),
            visible: true
          });
        }
      });
    }
    
    // Extract lists
    if (includeLists) {
      document.querySelectorAll('ul, ol').forEach((list, index) => {
        const isVisible = isElementVisible(list);
        if (isVisible) {
          const items = Array.from(list.querySelectorAll('li'))
            .filter(li => li.textContent?.trim())
            .map(li => li.textContent?.trim());
            
          if (items.length > 0) {
            parsedContent.push({
              type: 'list',
              content: items.join('\n'),
              visible: true
            });
          }
        }
      });
    }
    
    // Extract links
    if (includeLinks) {
      document.querySelectorAll('a').forEach((link, index) => {
        const isNav = link.closest('nav, header, footer');
        const isVisible = isElementVisible(link);
        
        if (!isNav && isVisible && link.textContent?.trim()) {
          parsedContent.push({
            type: 'link',
            content: link.textContent.trim(),
            url: link.href,
            visible: true
          });
        }
      });
    }
    
    // Extract images
    if (includeImages) {
      document.querySelectorAll('img').forEach((image, index) => {
        const isVisible = isElementVisible(image);
        if (isVisible && image.src && image.complete && image.naturalWidth !== 0) {
          parsedContent.push({
            type: 'image',
            content: image.alt || '',
            url: image.src,
            visible: true
          });
        }
      });
    }
    
    // Store parsed content in Supabase
    if (parsedContent.length > 0) {
      const contentBlocks = parsedContent.map((item, index) => {
        // Determine specialty based on URL path
        const pathSegments = currentPath.split('/').filter(Boolean);
        const specialty = pathSegments[0] === 'eyecare' || 
                       pathSegments[0] === 'gynecology' ? 
                       pathSegments[0] : 'general';
        
        // Map to content blocks schema
        return {
          page: currentPath,
          section: mapTypeToSection(item.type),
          name: `${item.type}_${index}`,
          title: item.type === 'heading' ? `Heading Level ${item.level}` : 
                item.type === 'image' ? item.content : null,
          content: item.content,
          image_url: item.url,
          specialty,
          order_index: index
        };
      });
      
      // Insert into database
      const { error } = await supabase
        .from('content_blocks')
        .insert(contentBlocks);
        
      if (error) {
        console.error('Error storing content blocks:', error);
        return false;
      }
      
      console.log(`Successfully stored ${contentBlocks.length} content blocks for ${currentPath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error parsing website content:', error);
    return false;
  }
};

/**
 * Check if an element is visible
 */
const isElementVisible = (element: Element): boolean => {
  const style = window.getComputedStyle(element);
  
  // Check if element is hidden
  if (style.display === 'none' || 
      style.visibility === 'hidden' || 
      style.opacity === '0') {
    return false;
  }
  
  // Check dimensions
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return false;
  }
  
  return true;
};

/**
 * Map content type to section name
 */
const mapTypeToSection = (type: string): string => {
  switch (type) {
    case 'heading': return 'heading';
    case 'paragraph': return 'text';
    case 'list': return 'list';
    case 'image': return 'image';
    case 'link': return 'link';
    default: return 'content';
  }
};

/**
 * Parse multiple pages by navigating through website
 */
export const parseAllPages = async (options: ParseOptions = {}): Promise<boolean> => {
  // Implementation for parsing all pages would go here
  // This would require creating an iframe to navigate through pages
  return false;
};
