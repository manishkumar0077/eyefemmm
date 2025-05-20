import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { uploadWebsiteImage } from '@/integrations/supabase/storage';

interface TabService {
  id: number;
  tab_key: string;
  section_title: string;
  description: string;
  image_url: string;
  display_order: number;
}

export const useEyeCareServices = () => {
  const [services, setServices] = useState<TabService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [organizedData, setOrganizedData] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<string>('clinical');

  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    if (services.length > 0) {
      organizeData();
    }
  }, [services]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Using any to bypass TypeScript errors with table name
      const { data, error } = await (supabase as any)
        .from('csm_eyecare_tab_services_2')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      
      console.log('Fetched eye care services:', data);
      setServices(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Error fetching eye care services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Organize the data by tab_key for easier consumption by components
  const organizeData = () => {
    const organized: Record<string, any> = {};
    
    // Group services by tab_key
    services.forEach(service => {
      if (!organized[service.tab_key]) {
        organized[service.tab_key] = {
          tab_key: service.tab_key,
          title: getTabTitle(service.tab_key),
          services: []
        };
      }
      
      organized[service.tab_key].services.push(service);
    });
    
    // Sort services within each tab by display_order
    for (const tabKey in organized) {
      organized[tabKey].services.sort((a: TabService, b: TabService) => 
        (a.display_order || 0) - (b.display_order || 0)
      );
    }
    
    setOrganizedData(organized);
  };

  // Helper function to get human-readable tab titles
  const getTabTitle = (tabKey: string): string => {
    switch (tabKey) {
      case 'clinical': return 'Clinical Services';
      case 'surgical': return 'Surgical Procedures';
      case 'refractive': return 'Refractive Surgery';
      default: return tabKey.charAt(0).toUpperCase() + tabKey.slice(1);
    }
  };

  const addService = async (newService: Omit<TabService, 'id'>): Promise<boolean> => {
    try {
      // Using any to bypass TypeScript errors with table name
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
      // Using any to bypass TypeScript errors with table name
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
      // Using any to bypass TypeScript errors with table name
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
    refreshData: fetchData 
  };
};