import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ClinicImage {
  id: number;
  src: string;
  title: string;
  description: string;
  created_at: string;
}

// Default gallery images for initial display
const DEFAULT_IMAGES = [
  "/lovable-uploads/a08d0445-8225-402a-b810-89ee25b6c797.png",
  "/lovable-uploads/633b1e49-2697-4a52-b9ce-dab2b0697470.png",
  "/lovable-uploads/84db2222-4685-4d10-a3a8-261d22ffd9cf.png",
  "/lovable-uploads/6afce018-fb88-41f5-9ab6-fd592164cbf4.png",
  "/lovable-uploads/c11fd1b0-c517-495f-b9fe-27cdd1d92b52.png",
  "/lovable-uploads/9cee8b7e-a312-406f-9026-cd834d82d4fc.png",
  "/lovable-uploads/c70188d0-b50b-4be3-9031-d2cb46c95428.png"
];

const DEFAULT_TITLES = [
  "Reception Area", "Waiting Area Seating", "Clinic Interior", 
  "Patient Lounge", "Ultrasound Examination", "Laser Surgery", 
  "Dr. Nisha Bhatnagar"
];

const DEFAULT_DESCRIPTIONS = [
  "Comfortable waiting area with educational posters",
  "Spacious and comfortable seating arrangements",
  "Well-lit and organized reception area",
  "Comfortable seating area for patients",
  "State-of-the-art ultrasound services",
  "Advanced MEL 80 laser equipment",
  "Our expert gynecologist"
];

export const useClinicImages = () => {
  const [images, setImages] = useState<ClinicImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // Keep track of display order locally
  const [displayOrder, setDisplayOrder] = useState<number[]>([]);

  useEffect(() => {
    fetchImages();
  }, []);
  
  // Convert file to data URL (for temporary storage until permissions are fixed)
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  const fetchImages = async () => {
    setIsLoading(true);
    try {
      // Fetch images from Supabase database
      const { data, error } = await supabase
        .from('csm_clinic_images')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      
      if (data && data.length > 0) {
        setImages(data);
        // Initialize display order with image IDs
        setDisplayOrder(data.map(img => img.id));
      } else {
        // No data in database, use defaults
        const defaultImages = getDefaultImages();
        setImages(defaultImages);
        setDisplayOrder(defaultImages.map(img => img.id));
      }
    } catch (err) {
      console.error('Error fetching gallery images:', err);
      const defaultImages = getDefaultImages();
      setImages(defaultImages);
      setDisplayOrder(defaultImages.map(img => img.id));
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };
  
  const getDefaultImages = (): ClinicImage[] => {
    return DEFAULT_IMAGES.map((src, index) => ({
      id: -(index + 1),
      src,
      title: DEFAULT_TITLES[index] || `Clinic Image ${index + 1}`,
      description: DEFAULT_DESCRIPTIONS[index] || "",
      created_at: new Date().toISOString(),
    }));
  };
  
  const uploadImage = async (file: File, imageData: Pick<ClinicImage, 'title' | 'description'>) => {
    try {
      // TEMP WORKAROUND: Use data URL while Supabase storage permissions are fixed
      const dataUrl = await fileToDataURL(file);
      
      // Get the highest ID first to avoid conflicts
      const { data: maxIdData } = await supabase
        .from('csm_clinic_images')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
      
      // Let PostgreSQL handle the ID
      // Don't explicitly set the ID field and it will auto-increment
      const { data: insertData, error: insertError } = await supabase
        .from('csm_clinic_images')
        .insert([{
          src: dataUrl,
          title: imageData.title,
          description: imageData.description || '',
          // The ID field is omitted intentionally to let PostgreSQL auto-increment
        }])
        .select();
      
      if (insertError) {
        console.error("Database insert error:", insertError);
        toast.error("Failed to save image data: " + insertError.message);
        return false;
      }
      
      // Update local state with the new image
      if (insertData && insertData.length > 0) {
        const newImage = insertData[0];
        setImages(prevImages => [...prevImages, newImage]);
        // Add to display order
        setDisplayOrder(prev => [...prev, newImage.id]);
        toast.success("Image added successfully");
        
        // Show advice about Supabase storage permissions
        toast.info(
          "To fix Supabase storage permissions, go to Supabase dashboard → Storage → website-images bucket → Policies → Add a policy for INSERT operations", 
          { duration: 8000 }
        );
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error("An unexpected error occurred");
      return false;
    }
  };
  
  const updateImage = async (id: number, data: Partial<ClinicImage>) => {
    try {
      // Skip database update for default images
      if (id < 0) {
        toast.warning("Cannot update default images");
        return false;
      }
      
      const { error } = await supabase
        .from('csm_clinic_images')
        .update({
          title: data.title,
          description: data.description
        })
        .eq('id', id);
      
      if (error) {
        console.error("Update error:", error);
        toast.error("Failed to update image: " + error.message);
        return false;
      }
      
      // Update local state
      setImages(prevImages => 
        prevImages.map(img => 
          img.id === id ? { ...img, ...data } : img
        )
      );
      
      toast.success("Image updated successfully");
      return true;
    } catch (err) {
      console.error('Error updating image:', err);
      toast.error("An unexpected error occurred");
      return false;
    }
  };
  
  const deleteImage = async (id: number) => {
    try {
      // Skip database deletion for default images
      if (id < 0) {
        toast.warning("Cannot delete default images");
        return false;
      }
      
      // Get the image to find its URL
      const imageToDelete = images.find(img => img.id === id);
      if (!imageToDelete) return false;
      
      const { error } = await supabase
        .from('csm_clinic_images')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete image: " + error.message);
        return false;
      }
      
      // Update local state
      setImages(prevImages => prevImages.filter(img => img.id !== id));
      // Update display order
      setDisplayOrder(prev => prev.filter(item => item !== id));
      
      toast.success("Image deleted successfully");
      return true;
    } catch (err) {
      console.error('Error deleting image:', err);
      toast.error("An unexpected error occurred");
      return false;
    }
  };
  
  const reorderImages = async (imageIds: number[]) => {
    try {
      // Only manage order locally
      setDisplayOrder(imageIds);
      toast.success("Images reordered");
      return true;
    } catch (err) {
      console.error('Error reordering images:', err);
      toast.error("An unexpected error occurred");
      return false;
    }
  };
  
  // Get the sorted images based on current display order
  const sortedImages = [...images].sort((a, b) => {
    const aIndex = displayOrder.indexOf(a.id);
    const bIndex = displayOrder.indexOf(b.id);
    
    if (aIndex === -1) return 1;  // Items not in displayOrder go at the end
    if (bIndex === -1) return -1;
    
    return aIndex - bIndex;
  });
  
  return {
    images: sortedImages,
    isLoading,
    error,
    updateImage,
    deleteImage,
    uploadImage,
    reorderImages
  };
}; 