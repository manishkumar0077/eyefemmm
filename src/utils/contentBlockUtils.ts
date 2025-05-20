
// Create or update this file
import { ContentBlock } from "@/components/admin/visual-editor/VisualEditor";

/**
 * Convert metadata from database format to object
 */
export const convertToMetadataObject = (metadata: any): Record<string, any> => {
  if (!metadata) return {};
  
  try {
    if (typeof metadata === 'string') {
      return JSON.parse(metadata);
    }
    return metadata;
  } catch (error) {
    console.error('Error parsing metadata:', error);
    return {};
  }
};

/**
 * Infer content block type based on available properties
 */
export const inferBlockType = (item: any): ContentBlock['type'] => {
  if (item.type) {
    return item.type as ContentBlock['type'];
  }
  
  if (item.image_url) {
    return 'image';
  }
  
  if (item.section === 'heading' || item.name?.includes('heading')) {
    return 'heading';
  }
  
  if (item.section === 'button' || item.name?.includes('button')) {
    return 'button';
  }
  
  if (item.section === 'list' || item.name?.includes('list') || 
      (item.content && item.content.includes('|'))) {
    return 'list';
  }
  
  if (item.section === 'link' || item.name?.includes('link') || 
      (item.metadata && item.metadata.url)) {
    return 'link';
  }
  
  return 'text';
};

/**
 * Generate a unique name for content blocks
 */
export const generateUniqueName = (type: string, index: number): string => {
  return `${type.toLowerCase()}_${Date.now()}_${index}`;
};

/**
 * Format content for storage based on type
 */
export const formatContentForType = (
  content: string, 
  type: ContentBlock['type']
): string => {
  switch (type) {
    case 'list':
      // Convert array to pipe-delimited string if needed
      if (Array.isArray(content)) {
        return content.join('|');
      }
      return content;
    default:
      return content;
  }
};

/**
 * Determine the best section name based on content type
 */
export const getSectionName = (type: ContentBlock['type']): string => {
  switch (type) {
    case 'heading':
      return 'heading';
    case 'image':
      return 'image';
    case 'button':
      return 'button';
    case 'list':
      return 'list';
    case 'link':
      return 'link';
    default:
      return 'text';
  }
};

/**
 * Generate CSS classes from block metadata
 */
export const generateClassesFromMetadata = (metadata: Record<string, any>): string => {
  const classes: string[] = [];
  
  // Add text alignment classes
  if (metadata.textAlign) {
    classes.push(metadata.textAlign);
  }
  
  // Add font size classes
  if (metadata.fontSize) {
    classes.push(metadata.fontSize);
  }
  
  // Add font weight classes
  if (metadata.fontWeight) {
    classes.push(metadata.fontWeight);
  }
  
  // Add text color classes
  if (metadata.textColor) {
    classes.push(metadata.textColor);
  }
  
  // Add custom classes if defined
  if (metadata.customClasses) {
    classes.push(metadata.customClasses);
  }
  
  return classes.join(' ');
};

/**
 * Generate inline styles from block metadata
 */
export const generateStylesFromMetadata = (metadata: Record<string, any>): React.CSSProperties => {
  const styles: React.CSSProperties = {};
  
  // Add margin styles
  if (metadata.marginTop !== undefined) {
    styles.marginTop = `${metadata.marginTop}px`;
  }
  if (metadata.marginBottom !== undefined) {
    styles.marginBottom = `${metadata.marginBottom}px`;
  }
  if (metadata.marginLeft !== undefined) {
    styles.marginLeft = `${metadata.marginLeft}px`;
  }
  if (metadata.marginRight !== undefined) {
    styles.marginRight = `${metadata.marginRight}px`;
  }
  
  // Add padding styles
  if (metadata.paddingX !== undefined) {
    styles.paddingLeft = `${metadata.paddingX}px`;
    styles.paddingRight = `${metadata.paddingX}px`;
  }
  if (metadata.paddingY !== undefined) {
    styles.paddingTop = `${metadata.paddingY}px`;
    styles.paddingBottom = `${metadata.paddingY}px`;
  }
  
  // Add custom inline styles if defined
  if (metadata.customStyles && typeof metadata.customStyles === 'object') {
    Object.assign(styles, metadata.customStyles);
  }
  
  return styles;
};
