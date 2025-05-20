import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export interface InsuranceProvider {
  id: string;
  name: string;
  provider_type: 'featured' | 'insurance';
  image: string | null;
  sort_order: number;
  created_at: string;
}

// Helper function to safely cast database results to our expected type
const safeProviderCast = (item: any): InsuranceProvider => {
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

export const useInsuranceProviders = () => {
  const [providers, setProviders] = useState<InsuranceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get featured providers
  const featuredProviders = providers
    .filter(provider => provider.provider_type === 'featured')
    .sort((a, b) => a.sort_order - b.sort_order);

  // Get insurance providers
  const insuranceProviders = providers
    .filter(provider => provider.provider_type === 'insurance')
    .map(provider => provider.name);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      // Fetch all providers from csm_insurance_panel_providers table
      const { data, error: fetchError } = await supabase
        .from('csm_insurance_panel_providers')
        .select('*')
        .order('sort_order');
      
      if (fetchError) throw fetchError;
      
      // Safely cast the data to our expected type
      const typedData = (data || []).map(safeProviderCast);
      setProviders(typedData);
    } catch (err) {
      console.error('Error fetching insurance providers:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const addProvider = async (newProvider: Omit<InsuranceProvider, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('csm_insurance_panel_providers')
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

  const updateProvider = async (id: string, updates: Partial<Omit<InsuranceProvider, 'id' | 'created_at'>>) => {
    try {
      const { error } = await supabase
        .from('csm_insurance_panel_providers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setProviders(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
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
      const { error } = await supabase
        .from('csm_insurance_panel_providers')
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
      const filePath = `insurance-providers/${fileName}`;
      
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
