import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export interface GyneInsuranceProvider {
  id: string;
  name: string;
  provider_type: 'featured' | 'insurance';
  image: string | null;
  sort_order: number;
  created_at: string;
}

// Helper function to safely cast database results to our expected type
const safeProviderCast = (item: any): GyneInsuranceProvider => {
  return {
    id: item.id || '',
    name: item.name || '',
    provider_type: (item.provider_type === 'featured' || item.provider_type === 'insurance') 
      ? item.provider_type 
      : 'insurance',
    image: item.image || null,
    sort_order: typeof item.sort_order === 'number' ? item.sort_order : 0,
    created_at: item.created_at || new Date().toISOString()
  };
};

// Fallback data in case the table doesn't exist yet
const fallbackFeaturedProviders: GyneInsuranceProvider[] = [
  {
    id: "1",
    name: "Central Government Health Scheme (CGHS)",
    provider_type: "featured",
    image: "/lovable-uploads/22774699-5502-4b25-994c-eeb2d3cf91ff.png",
    sort_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    name: "Delhi Government Employees Health Scheme (DGEHS)",
    provider_type: "featured",
    image: "/lovable-uploads/2b09fcb1-f9aa-4d77-92b3-845e510b2f97.png",
    sort_order: 2,
    created_at: new Date().toISOString()
  },
  {
    id: "3",
    name: "Municipal Corporation of Delhi (MCD)",
    provider_type: "featured",
    image: "/lovable-uploads/7541ab82-360c-4f9c-af5e-152356a67736.png",
    sort_order: 3,
    created_at: new Date().toISOString()
  }
];

const fallbackInsuranceProviders: GyneInsuranceProvider[] = [
  {
    id: "4",
    name: "Central Government Health Scheme (CGHS)",
    provider_type: "insurance",
    image: null,
    sort_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: "5",
    name: "Delhi Government Employees Health Scheme (DGEHS)",
    provider_type: "insurance",
    image: null,
    sort_order: 2,
    created_at: new Date().toISOString()
  },
  {
    id: "6",
    name: "Municipal Corporation of Delhi (MCD)",
    provider_type: "insurance",
    image: null,
    sort_order: 3,
    created_at: new Date().toISOString()
  }
];

export const useGyneInsuranceProviders = () => {
  const [providers, setProviders] = useState<GyneInsuranceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isTableMissing, setIsTableMissing] = useState(false);

  // Get featured providers
  const featuredProviders = providers
    .filter(provider => provider.provider_type === 'featured')
    .sort((a, b) => a.sort_order - b.sort_order);

  // Get insurance providers
  const GyneInsuranceProviders = providers
    .filter(provider => provider.provider_type === 'insurance')
    .map(provider => provider.name);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      // Fetch all providers from csm_Gyne_insurance_panel_providers table
      const { data, error: fetchError } = await supabase
        .from('csm_gyne_insurance_panel_providers')
        .select('*')
        .order('sort_order');
      
      // Check if the error is a 404 (table not found) or a database connection error
      if (fetchError) {
        if (fetchError.code === '404' || 
            fetchError.message?.includes('not found') || 
            fetchError.message?.includes('does not exist')) {
          console.log('Table csm_Gyne_insurance_panel_providers does not exist yet, using fallback data');
          setIsTableMissing(true);
          
          // Use fallback data
          setProviders([...fallbackFeaturedProviders, ...fallbackInsuranceProviders]);
        } else {
          throw fetchError;
        }
      } else {
        // Table exists, reset the missing flag if it was set
        setIsTableMissing(false);
        
        // Safely cast the data to our expected type
        const typedData = (data || []).map(safeProviderCast);
        
        setProviders(typedData);
      }
    } catch (err) {
      console.error('Error fetching gynecology insurance providers:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Use fallback data when there's an error
      setProviders([...fallbackFeaturedProviders, ...fallbackInsuranceProviders]);
    } finally {
      setIsLoading(false);
    }
  };

  const addProvider = async (newProvider: Omit<GyneInsuranceProvider, 'id' | 'created_at'>) => {
    try {
      // Check if the table exists first
      if (isTableMissing) {
        toast.error('Cannot add provider: Database table does not exist yet');
        return false;
      }
      
      const { data, error } = await supabase
        .from('csm_gyne_insurance_panel_providers')
        .insert([{
          name: newProvider.name,
          provider_type: newProvider.provider_type,
          image: newProvider.image,
          sort_order: newProvider.sort_order
        }])
        .select();

      if (error) throw error;

      if (data) {
        // Cast the data to our expected type with proper provider_type value
        const newItem = safeProviderCast(data[0]);
        
        setProviders(prev => [...prev, newItem]);
        toast.success(`${newProvider.provider_type === 'featured' ? 'Featured' : 'Insurance'} provider added successfully`);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding provider:', err);
      toast.error('Failed to add provider');
      return false;
    }
  };

  const updateProvider = async (id: string, updates: Partial<Omit<GyneInsuranceProvider, 'id' | 'created_at'>>) => {
    try {
      // Check if the table exists first
      if (isTableMissing) {
        toast.error('Cannot update provider: Database table does not exist yet');
        return false;
      }
      
      const { error } = await supabase
        .from('csm_gyne_insurance_panel_providers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setProviders(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates, provider_type: updates.provider_type || item.provider_type } : item
      ));
      toast.success('Provider updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating provider:', err);
      toast.error('Failed to update provider');
      return false;
    }
  };

  const deleteProvider = async (id: string) => {
    try {
      // Check if the table exists first
      if (isTableMissing) {
        toast.error('Cannot delete provider: Database table does not exist yet');
        return false;
      }
      
      const { error } = await supabase
        .from('csm_gyne_insurance_panel_providers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProviders(prev => prev.filter(item => item.id !== id));
      toast.success('Provider deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting provider:', err);
      toast.error('Failed to delete provider');
      return false;
    }
  };

  // Upload image file and return the URL
  const uploadProviderImage = async (file: File): Promise<string | null> => {
    try {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
        return null;
      }

      // Create a unique file name
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `gyne-insurance-providers/${fileName}`;
      
      // Get content type based on file extension
      const getContentType = (ext: string): string => {
        const contentTypes: Record<string, string> = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'webp': 'image/webp',
          'svg': 'image/svg+xml'
        };
        return contentTypes[ext.toLowerCase()] || 'image/jpeg';
      };
      
      // Upload with proper content type
      const { error: uploadError } = await supabase.storage
        .from('website-images')
        .upload(filePath, file, {
          contentType: getContentType(fileExt),
          cacheControl: '3600'
        });
      
      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }
      
      // Get the public URL
      const { data } = supabase.storage
        .from('website-images')
        .getPublicUrl(filePath);
      
      if (!data || !data.publicUrl) {
        throw new Error('Failed to get public URL');
      }
      
      return data.publicUrl;
    } catch (err) {
      console.error('Error uploading provider image:', err);
      toast.error('Failed to upload image: ' + (err instanceof Error ? err.message : 'Unknown error'));
      return null;
    }
  };
  
  const insuranceProviders = providers
    .filter(provider => provider.provider_type === 'insurance')
    .map(provider => provider.name);

  return {
    providers,
    featuredProviders,
    insuranceProviders,
    isLoading,
    error,
    addProvider,
    updateProvider,
    deleteProvider,
    uploadProviderImage,
    refresh: fetchProviders
  };
};
