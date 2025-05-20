import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { uploadWebsiteImage } from '@/integrations/supabase/storage';

// Add the new eye care tab services tables to the existing Supabase client types
declare module '@supabase/supabase-js' {
  interface Database {
    public: {
      Tables: {
        admin_otps: Record<string, unknown>;
        admin_users: Record<string, unknown>;
        admin_passwords: Record<string, unknown>;
        appointments: Record<string, unknown>;
        blocks: Record<string, unknown>;
        content_blocks: Record<string, unknown>;
        doctor_availability: Record<string, unknown>;
        doctor_holidays: Record<string, unknown>;
        holidays: Record<string, unknown>;
        page_content: Record<string, unknown>;
        page_content_elements: Record<string, unknown>;
        public_holidays: Record<string, unknown>;
        website_content: Record<string, unknown>;
        csm_eyecare_tab_services_2: Record<string, unknown>;
        // New tables for eye care tab services
        csm_tab_eye_care_sections: {
          Row: {
            id: string; // UUID
            title: string;
            image_url: string | null;
          };
          Insert: {
            id?: string;
            title: string;
            image_url?: string | null;
          };
          Update: {
            id?: string;
            title?: string;
            image_url?: string | null;
          };
        };
        csm_tab_eye_care_subsections: {
          Row: {
            id: string; // UUID
            section_id: string;
            title: string;
            description: string | null;
          };
          Insert: {
            id?: string;
            section_id: string;
            title: string;
            description?: string | null;
          };
          Update: {
            id?: string;
            section_id?: string;
            title?: string;
            description?: string | null;
          };
        };
        csm_tab_eye_care_items: {
          Row: {
            id: string; // UUID
            subsection_id: string;
            label: string | null;
            description: string | null;
          };
          Insert: {
            id?: string;
            subsection_id: string;
            label?: string | null;
            description?: string | null;
          };
          Update: {
            id?: string;
            subsection_id?: string;
            label?: string | null;
            description?: string | null;
          };
        };
      };
    };
  }
}

// Types for our data structure
export interface EyeCareSection {
  id: string;
  title: string;
  image_url: string | null;
  subsections?: EyeCareSubsection[];
}

export interface EyeCareSubsection {
  id: string;
  section_id: string;
  title: string;
  description: string | null;
  items?: EyeCareItem[];
}

export interface EyeCareItem {
  id: string;
  subsection_id: string;
  label: string | null;
  description: string | null;
}

export interface NewSectionForm {
  title: string;
  image_url: string | null;
}

export interface NewSubsectionForm {
  section_id: string;
  title: string;
  description: string | null;
}

export interface NewItemForm {
  subsection_id: string;
  label: string | null;
  description: string | null;
}

export const useEyeCareTabServicesLatest = () => {
  const [sections, setSections] = useState<EyeCareSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  // Fetch all data (sections, subsections, and items)
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch sections
      const { data: sectionsData, error: sectionsError } = await (supabase as any)
        .from('csm_tab_eye_care_sections')
        .select('*')
        .order('title');
      
      if (sectionsError) throw sectionsError;
      
      // If we have sections
      if (sectionsData && sectionsData.length > 0) {
        const enrichedSections = await Promise.all(
          sectionsData.map(async (section) => {
            // Fetch subsections for this section
            const { data: subsectionsData, error: subsectionsError } = await (supabase as any)
              .from('csm_tab_eye_care_subsections')
              .select('*')
              .eq('section_id', section.id);
            
            if (subsectionsError) throw subsectionsError;
            
            // For each subsection, fetch its items
            const enrichedSubsections = await Promise.all(
              (subsectionsData || []).map(async (subsection) => {
                const { data: itemsData, error: itemsError } = await (supabase as any)
                  .from('csm_tab_eye_care_items')
                  .select('*')
                  .eq('subsection_id', subsection.id);
                
                if (itemsError) throw itemsError;
                
                return {
                  ...subsection,
                  items: itemsData || []
                };
              })
            );
            
            return {
              ...section,
              subsections: enrichedSubsections
            };
          })
        );
        
        setSections(enrichedSections);
        
        // Set active section to first one if not already set
        if (!activeSection && enrichedSections.length > 0) {
          setActiveSection(enrichedSections[0].id);
        }
      } else {
        setSections([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Error fetching eye care tab services data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeSection]);
  
  // Fetch data on initial load
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);
  
  // Section CRUD operations
  const addSection = async (newSection: NewSectionForm): Promise<boolean> => {
    try {
      const { data, error } = await (supabase as any)
        .from('csm_tab_eye_care_sections')
        .insert([newSection])
        .select();
      
      if (error) throw error;
      
      await fetchAllData();
      return true;
    } catch (err) {
      console.error('Error adding section:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };
  
  const updateSection = async (id: string, updates: Partial<EyeCareSection>): Promise<boolean> => {
    try {
      const { error } = await (supabase as any)
        .from('csm_tab_eye_care_sections')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchAllData();
      return true;
    } catch (err) {
      console.error('Error updating section:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };
  
  const deleteSection = async (id: string): Promise<boolean> => {
    try {
      // First delete all subsections and their items
      const { data: subsections } = await (supabase as any)
        .from('csm_tab_eye_care_subsections')
        .select('id')
        .eq('section_id', id);
      
      if (subsections && subsections.length > 0) {
        // Delete items for each subsection
        for (const subsection of subsections) {
          await (supabase as any)
            .from('csm_tab_eye_care_items')
            .delete()
            .eq('subsection_id', subsection.id);
        }
        
        // Delete all subsections
        await (supabase as any)
          .from('csm_tab_eye_care_subsections')
          .delete()
          .eq('section_id', id);
      }
      
      // Finally delete the section
      const { error } = await (supabase as any)
        .from('csm_tab_eye_care_sections')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchAllData();
      return true;
    } catch (err) {
      console.error('Error deleting section:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };
  
  // Subsection CRUD operations
  const addSubsection = async (newSubsection: NewSubsectionForm): Promise<boolean> => {
    try {
      const { data, error } = await (supabase as any)
        .from('csm_tab_eye_care_subsections')
        .insert([newSubsection])
        .select();
      
      if (error) throw error;
      
      await fetchAllData();
      return true;
    } catch (err) {
      console.error('Error adding subsection:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };
  
  const updateSubsection = async (id: string, updates: Partial<EyeCareSubsection>): Promise<boolean> => {
    try {
      const { error } = await (supabase as any)
        .from('csm_tab_eye_care_subsections')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchAllData();
      return true;
    } catch (err) {
      console.error('Error updating subsection:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };
  
  const deleteSubsection = async (id: string): Promise<boolean> => {
    try {
      // First delete all items for this subsection
      await (supabase as any)
        .from('csm_tab_eye_care_items')
        .delete()
        .eq('subsection_id', id);
      
      // Then delete the subsection
      const { error } = await (supabase as any)
        .from('csm_tab_eye_care_subsections')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchAllData();
      return true;
    } catch (err) {
      console.error('Error deleting subsection:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };
  
  // Item CRUD operations
  const addItem = async (newItem: NewItemForm): Promise<boolean> => {
    try {
      const { data, error } = await (supabase as any)
        .from('csm_tab_eye_care_items')
        .insert([newItem])
        .select();
      
      if (error) throw error;
      
      await fetchAllData();
      return true;
    } catch (err) {
      console.error('Error adding item:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };
  
  const updateItem = async (id: string, updates: Partial<EyeCareItem>): Promise<boolean> => {
    try {
      const { error } = await (supabase as any)
        .from('csm_tab_eye_care_items')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchAllData();
      return true;
    } catch (err) {
      console.error('Error updating item:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };
  
  const deleteItem = async (id: string): Promise<boolean> => {
    try {
      const { error } = await (supabase as any)
        .from('csm_tab_eye_care_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchAllData();
      return true;
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };
  
  // Image upload helper
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const imageUrl = await uploadWebsiteImage(file);
      return imageUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      return null;
    }
  };
  
  // Find section by id
  const getSectionById = (id: string): EyeCareSection | undefined => {
    return sections.find(section => section.id === id);
  };
  
  // Find subsection by id
  const getSubsectionById = (id: string): EyeCareSubsection | undefined => {
    for (const section of sections) {
      if (section.subsections) {
        const subsection = section.subsections.find(sub => sub.id === id);
        if (subsection) return subsection;
      }
    }
    return undefined;
  };
  
  // Find item by id
  const getItemById = (id: string): EyeCareItem | undefined => {
    for (const section of sections) {
      if (section.subsections) {
        for (const subsection of section.subsections) {
          if (subsection.items) {
            const item = subsection.items.find(item => item.id === id);
            if (item) return item;
          }
        }
      }
    }
    return undefined;
  };

  return {
    sections,
    isLoading,
    error,
    activeSection,
    setActiveSection,
    fetchAllData,  // Renamed from refreshData for clarity
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
    getSectionById,
    getSubsectionById,
    getItemById
  };
};

export default useEyeCareTabServicesLatest;
