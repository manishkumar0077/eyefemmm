import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { uploadWebsiteImage } from '@/integrations/supabase/storage';

// Add the eyecare tab services table type to the existing Supabase client types
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
        csm_eyecare_tab_services_2: {
          Row: {
            id: number;
            tab_key: string;
            section_title: string;
            description: string;
            image_url: string;
            display_order: number;
          };
          Insert: {
            id?: number;
            tab_key: string;
            section_title: string;
            description: string;
            image_url: string;
            display_order: number;
          };
          Update: {
            id?: number;
            tab_key?: string;
            section_title?: string;
            description?: string;
            image_url?: string;
            display_order?: number;
          };
        };
      };
    };
  }
}

export interface TabService {
  id: number;
  tab_key: string;
  section_title: string;
  description: string;
  image_url: string;
  display_order: number;
}

export interface OrganizedTabData {
  tab_key: string;
  title: string;
  services: TabService[];
}

type OrganizedData = Record<string, OrganizedTabData>;

export const useEyeCareTabServices = () => {
  const [services, setServices] = useState<TabService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [organizedData, setOrganizedData] = useState<OrganizedData>({});
  const [activeTab, setActiveTab] = useState<string>('clinical');

  // Fetch data from Supabase
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use 'any' type to bypass TypeScript errors while maintaining runtime functionality
      const { data, error } = await (supabase as any)
        .from('csm_eyecare_tab_services_2')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      
      setServices(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Error fetching eye care tab services:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper function to get human-readable tab titles
  const getTabTitle = (tabKey: string): string => {
    switch (tabKey) {
      case 'clinical': return 'Clinical Services';
      case 'surgical': return 'Surgical Procedures';
      case 'refractive': return 'Refractive Surgery';
      default: return tabKey.charAt(0).toUpperCase() + tabKey.slice(1);
    }
  };

  // Organize the data by tab_key for easier consumption by components
  const organizeData = useCallback(() => {
    const organized: OrganizedData = {};
    
    // Initialize with default tabs even if they don't have data yet
    ['clinical', 'surgical', 'refractive'].forEach(tabKey => {
      organized[tabKey] = {
        tab_key: tabKey,
        title: getTabTitle(tabKey),
        services: []
      };
    });
    
    // Group services by tab_key
    services.forEach(service => {
      if (organized[service.tab_key]) {
        organized[service.tab_key].services.push({...service});
      } else {
        organized[service.tab_key] = {
          tab_key: service.tab_key,
          title: getTabTitle(service.tab_key),
          services: [{...service}]
        };
      }
    });
    
    // Sort services within each tab by display_order
    Object.keys(organized).forEach(tabKey => {
      organized[tabKey].services.sort((a, b) => 
        (a.display_order || 0) - (b.display_order || 0)
      );
    });
    
    setOrganizedData(organized);
  }, [services]);

  // Fetch data on initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Organize data whenever services change
  useEffect(() => {
    organizeData();
  }, [services, organizeData]);

  const addService = async (newService: Omit<TabService, 'id'>): Promise<boolean> => {
    try {
      // Using 'any' cast to bypass TypeScript errors
      const { error } = await (supabase as any)
        .from('csm_eyecare_tab_services_2')
        .insert([newService]);
      
      if (error) throw error;
      
      await fetchData();
      return true;
    } catch (err) {
      console.error('Error adding service:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };

  const updateService = async (id: number, updates: Partial<TabService>): Promise<boolean> => {
    try {
      // Using 'any' cast to bypass TypeScript errors
      const { error } = await (supabase as any)
        .from('csm_eyecare_tab_services_2')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchData();
      return true;
    } catch (err) {
      console.error('Error updating service:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };

  const deleteService = async (id: number): Promise<boolean> => {
    try {
      // Using 'any' cast to bypass TypeScript errors
      const { error } = await (supabase as any)
        .from('csm_eyecare_tab_services_2')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchData();
      return true;
    } catch (err) {
      console.error('Error deleting service:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // Upload the image to the website-images bucket
      const imageUrl = await uploadWebsiteImage(file);
      return imageUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { 
    services,
    organizedData,
    isLoading, 
    error,
    activeTab,
    setActiveTab,
    addService,
    updateService,
    deleteService,
    uploadImage,
    refreshData: fetchData,
    getTabTitle
  };
};
