
import { supabase } from './client';

// Type definitions for content blocks
interface ContentBlock {
  id?: string;
  page: string;
  section: string;
  name: string;
  title?: string;
  content?: string;
  image_url?: string;
  specialty: string;
}

// Function to clear all existing content blocks
const clearAllContentBlocks = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('content_blocks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (error) {
      console.error('Error clearing content blocks:', error);
      return false;
    }

    console.log('Successfully cleared all content blocks');
    return true;
  } catch (error) {
    console.error('Error in clearAllContentBlocks:', error);
    return false;
  }
};

// Function to extract text content from the webpage and store in Supabase
export const extractAndStoreContent = async (): Promise<boolean> => {
  try {
    console.log('Starting content extraction...');
    
    // Get all text elements on the page
    const contentBlocks: ContentBlock[] = [];
    
    // Process headings (h1, h2, h3, h4, h5, h6)
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading, index) => {
      if (heading.textContent && heading.textContent.trim()) {
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        const specialty = pathSegments[0] === 'eyecare' || pathSegments[0] === 'gynecology' ? pathSegments[0] : 'general';
        const page = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : 'home';
        
        contentBlocks.push({
          page,
          section: 'heading',
          name: `heading_${heading.tagName.toLowerCase()}_${index}`,
          title: heading.tagName.toUpperCase(),
          content: heading.textContent.trim(),
          specialty
        });
      }
    });
    
    // Process paragraphs
    const paragraphs = document.querySelectorAll('p');
    paragraphs.forEach((paragraph, index) => {
      if (paragraph.textContent && paragraph.textContent.trim()) {
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        const specialty = pathSegments[0] === 'eyecare' || pathSegments[0] === 'gynecology' ? pathSegments[0] : 'general';
        const page = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : 'home';
        
        contentBlocks.push({
          page,
          section: 'paragraph',
          name: `paragraph_${index}`,
          content: paragraph.textContent.trim(),
          specialty
        });
      }
    });
    
    // Process buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach((button, index) => {
      if (button.textContent && button.textContent.trim()) {
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        const specialty = pathSegments[0] === 'eyecare' || pathSegments[0] === 'gynecology' ? pathSegments[0] : 'general';
        const page = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : 'home';
        
        contentBlocks.push({
          page,
          section: 'button',
          name: `button_${index}`,
          content: button.textContent.trim(),
          specialty
        });
      }
    });
    
    // Process links
    const links = document.querySelectorAll('a');
    links.forEach((link, index) => {
      if (link.textContent && link.textContent.trim()) {
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        const specialty = pathSegments[0] === 'eyecare' || pathSegments[0] === 'gynecology' ? pathSegments[0] : 'general';
        const page = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : 'home';
        
        contentBlocks.push({
          page,
          section: 'link',
          name: `link_${index}`,
          content: link.textContent.trim(),
          specialty
        });
      }
    });
    
    // Process images
    const images = document.querySelectorAll('img');
    images.forEach((image, index) => {
      if (image.src) {
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        const specialty = pathSegments[0] === 'eyecare' || pathSegments[0] === 'gynecology' ? pathSegments[0] : 'general';
        const page = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : 'home';
        
        contentBlocks.push({
          page,
          section: 'image',
          name: `image_${index}`,
          title: image.alt || `Image ${index}`,
          image_url: image.src,
          specialty
        });
      }
    });
    
    // Store the extracted content blocks in Supabase
    if (contentBlocks.length > 0) {
      const { error } = await supabase
        .from('content_blocks')
        .insert(contentBlocks);
      
      if (error) {
        console.error('Error storing content blocks:', error);
        return false;
      }
      
      console.log(`Successfully stored ${contentBlocks.length} content blocks`);
      return true;
    } else {
      console.warn('No content blocks found to extract');
      return false;
    }
  } catch (error) {
    console.error('Error in extractAndStoreContent:', error);
    return false;
  }
};

// Function to add predefined content blocks for important pages
const addPredefinedContentBlocks = async (): Promise<boolean> => {
  try {
    const predefinedBlocks: ContentBlock[] = [
      // Landing page content
      {
        page: 'landing',
        section: 'hero',
        name: 'hero_heading',
        title: 'Main Heading',
        content: 'Empowering Women\'s Health & Vision',
        specialty: 'general'
      },
      {
        page: 'landing',
        section: 'hero',
        name: 'hero_subheading',
        content: 'Specialized healthcare for women in gynecology and eyecare services',
        specialty: 'general'
      },
      // Eye Care section
      {
        page: 'home',
        section: 'intro',
        name: 'eyecare_intro_heading',
        title: 'Section Heading',
        content: 'Expert Eye Care Services',
        specialty: 'eyecare'
      },
      {
        page: 'home',
        section: 'intro',
        name: 'eyecare_intro_text',
        content: 'Our dedicated team of ophthalmologists provide comprehensive eye examinations and treatments with state-of-the-art technology.',
        specialty: 'eyecare'
      },
      // Gynecology section
      {
        page: 'home',
        section: 'intro',
        name: 'gynecology_intro_heading',
        title: 'Section Heading',
        content: 'Specialized Gynecology Care',
        specialty: 'gynecology'
      },
      {
        page: 'home',
        section: 'intro',
        name: 'gynecology_intro_text',
        content: 'Our experienced gynecologists provide comprehensive women\'s health services from routine check-ups to specialized treatments.',
        specialty: 'gynecology'
      },
      // About section
      {
        page: 'about',
        section: 'about',
        name: 'about_heading',
        title: 'Section Heading',
        content: 'About Eyefem Clinic',
        specialty: 'general'
      },
      {
        page: 'about',
        section: 'about',
        name: 'about_text',
        content: 'Eyefem Clinic is a specialized healthcare provider focusing on women\'s health and vision care needs. Our team of experts is dedicated to providing personalized, compassionate healthcare.',
        specialty: 'general'
      },
      // Services section
      {
        page: 'services',
        section: 'services',
        name: 'services_heading',
        title: 'Section Heading',
        content: 'Our Services',
        specialty: 'general'
      },
      // Doctor bios
      {
        page: 'doctor',
        section: 'doctor',
        name: 'eyecare_doctor_name',
        title: 'Doctor Name',
        content: 'Dr. Sanjeev Lehri',
        specialty: 'eyecare'
      },
      {
        page: 'doctor',
        section: 'doctor',
        name: 'eyecare_doctor_bio',
        content: 'Dr. Sanjeev Lehri is a highly experienced ophthalmologist specializing in cataract surgery and refractive errors.',
        specialty: 'eyecare'
      },
      {
        page: 'doctor',
        section: 'doctor',
        name: 'gynecology_doctor_name',
        title: 'Doctor Name',
        content: 'Dr. Nisha Bhatnagar',
        specialty: 'gynecology'
      },
      {
        page: 'doctor',
        section: 'doctor',
        name: 'gynecology_doctor_bio',
        content: 'Dr. Nisha Bhatnagar is a board-certified gynecologist with expertise in women\'s reproductive health and fertility treatments.',
        specialty: 'gynecology'
      },
      // Contact information
      {
        page: 'appointment',
        section: 'contact',
        name: 'clinic_address',
        title: 'Address',
        content: '11, W Patel Nagar Rd, Block 25, East Patel Nagar, Patel Nagar, New Delhi, Delhi 110008',
        specialty: 'general'
      },
      {
        page: 'appointment',
        section: 'contact',
        name: 'clinic_phone',
        title: 'Phone',
        content: '+91 98765 43210',
        specialty: 'general'
      },
      {
        page: 'appointment',
        section: 'contact',
        name: 'clinic_email',
        title: 'Email',
        content: 'info@eyefem.com',
        specialty: 'general'
      }
    ];
    
    const { error } = await supabase
      .from('content_blocks')
      .insert(predefinedBlocks);
    
    if (error) {
      console.error('Error adding predefined content blocks:', error);
      return false;
    }
    
    console.log('Successfully added predefined content blocks');
    return true;
  } catch (error) {
    console.error('Error in addPredefinedContentBlocks:', error);
    return false;
  }
};

// Function to visit and extract content from important pages
const visitAndExtractFromAllPages = async (): Promise<boolean> => {
  try {
    // Define the list of important pages to visit
    const pagesToVisit = [
      '/',
      '/eyecare',
      '/eyecare/doctor',
      '/eyecare/conditions',
      '/eyecare/appointment',
      '/gynecology',
      '/gynecology/doctor',
      '/gynecology/health',
      '/gynecology/appointment'
    ];
    
    // Create an iframe to visit each page and extract content
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.position = 'fixed';
    iframe.style.top = '-1000px'; // Hide it off-screen
    document.body.appendChild(iframe);
    
    // Function to extract content from the iframe
    const extractFromIframe = () => {
      return new Promise<boolean>((resolve) => {
        setTimeout(async () => {
          try {
            // Extract content blocks from the iframe's document
            const iframeDoc = iframe.contentDocument;
            if (!iframeDoc) {
              console.warn('Could not access iframe document');
              resolve(false);
              return;
            }
            
            // Process headings
            const headings = iframeDoc.querySelectorAll('h1, h2, h3, h4, h5, h6');
            const pathSegments = iframe.src.split('/').slice(3).filter(Boolean);
            const specialty = pathSegments[0] === 'eyecare' || pathSegments[0] === 'gynecology' ? pathSegments[0] : 'general';
            const page = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : 'home';
            
            const contentBlocks: ContentBlock[] = [];
            
            headings.forEach((heading, index) => {
              if (heading.textContent && heading.textContent.trim()) {
                contentBlocks.push({
                  page,
                  section: 'heading',
                  name: `heading_${heading.tagName.toLowerCase()}_${index}`,
                  title: heading.tagName.toUpperCase(),
                  content: heading.textContent.trim(),
                  specialty
                });
              }
            });
            
            // Process paragraphs
            const paragraphs = iframeDoc.querySelectorAll('p');
            paragraphs.forEach((paragraph, index) => {
              if (paragraph.textContent && paragraph.textContent.trim()) {
                contentBlocks.push({
                  page,
                  section: 'paragraph',
                  name: `paragraph_${index}`,
                  content: paragraph.textContent.trim(),
                  specialty
                });
              }
            });
            
            // Process buttons
            const buttons = iframeDoc.querySelectorAll('button');
            buttons.forEach((button, index) => {
              if (button.textContent && button.textContent.trim()) {
                contentBlocks.push({
                  page,
                  section: 'button',
                  name: `button_${index}`,
                  content: button.textContent.trim(),
                  specialty
                });
              }
            });
            
            // Process links
            const links = iframeDoc.querySelectorAll('a');
            links.forEach((link, index) => {
              if (link.textContent && link.textContent.trim()) {
                contentBlocks.push({
                  page,
                  section: 'link',
                  name: `link_${index}`,
                  content: link.textContent.trim(),
                  specialty
                });
              }
            });
            
            // Process images
            const images = iframeDoc.querySelectorAll('img');
            images.forEach((image, index) => {
              if (image.src) {
                contentBlocks.push({
                  page,
                  section: 'image',
                  name: `image_${index}`,
                  title: image.alt || `Image ${index}`,
                  image_url: image.src,
                  specialty
                });
              }
            });
            
            // Store the extracted content blocks in Supabase
            if (contentBlocks.length > 0) {
              const { error } = await supabase
                .from('content_blocks')
                .insert(contentBlocks);
              
              if (error) {
                console.error('Error storing content blocks from iframe:', error);
                resolve(false);
                return;
              }
              
              console.log(`Successfully stored ${contentBlocks.length} content blocks from ${iframe.src}`);
              resolve(true);
            } else {
              console.warn(`No content blocks found in ${iframe.src}`);
              resolve(true);
            }
          } catch (error) {
            console.error('Error extracting content from iframe:', error);
            resolve(false);
          }
        }, 2000); // Wait for page to load
      });
    };
    
    // Visit each page sequentially and extract content
    let allSuccess = true;
    for (const page of pagesToVisit) {
      iframe.src = page;
      console.log(`Visiting page: ${page}`);
      const success = await extractFromIframe();
      if (!success) {
        console.warn(`Failed to extract content from ${page}`);
        allSuccess = false;
      }
    }
    
    // Clean up
    document.body.removeChild(iframe);
    
    return allSuccess;
  } catch (error) {
    console.error('Error in visitAndExtractFromAllPages:', error);
    return false;
  }
};

// Main function to reinitialize all content
export const reinitializeAllContent = async (): Promise<boolean> => {
  try {
    console.log('Starting content blocks reinitialization...');
    
    // Step 1: Clear all existing content blocks
    const cleared = await clearAllContentBlocks();
    if (!cleared) {
      console.error('Failed to clear existing content blocks');
      return false;
    }
    
    // Step 2: Add predefined content blocks for important pages
    const predefinedAdded = await addPredefinedContentBlocks();
    if (!predefinedAdded) {
      console.error('Failed to add predefined content blocks');
      // Continue anyway
    }
    
    // Step 3: Visit all important pages and extract content
    const pagesExtracted = await visitAndExtractFromAllPages();
    if (!pagesExtracted) {
      console.warn('Could not extract content from all pages');
      // Continue anyway
    }
    
    // Step 4: Extract content from the current page
    const currentPageExtracted = await extractAndStoreContent();
    if (!currentPageExtracted) {
      console.warn('Could not extract content from current page');
      // Continue anyway
    }
    
    console.log('Content blocks reinitialization completed successfully!');
    return true;
  } catch (error) {
    console.error('Error in reinitializeAllContent:', error);
    return false;
  }
};
