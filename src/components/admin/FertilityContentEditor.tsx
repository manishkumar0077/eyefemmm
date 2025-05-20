import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Save, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export interface FertilityTreatment {
  id?: string;
  title: string;
  description: string;
  treatments: string[];
  image_url?: string;
}

const DEFAULT_FERTILITY_DATA = {
  title: 'Advanced Fertility Treatments',
  description: 'Our fertility center offers state-of-the-art reproductive technologies and personalized care to help you achieve your family-building goals.',
  treatments: [
    'In Vitro Fertilization (IVF)',
    'Intrauterine Insemination (IUI)',
    'Egg and Sperm Freezing',
    'Preimplantation Genetic Testing',
    'Donor Egg and Sperm Programs'
  ]
};

const FertilityContentEditor = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FertilityTreatment>(DEFAULT_FERTILITY_DATA);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('csm_gynecology_fertility')
        .select('*')
        .single();
      
      if (error) {
        // If no data exists yet or other error, use default data
        if (error.code === 'PGRST116') {
          console.info('No fertility data found, using default data');
          setFormData(DEFAULT_FERTILITY_DATA);
        } else {
          console.error('Error fetching fertility content:', error);
        }
        return;
      }

      if (data) {
        setFormData({
          id: data.id,
          title: data.title || DEFAULT_FERTILITY_DATA.title,
          description: data.description || DEFAULT_FERTILITY_DATA.description,
          treatments: Array.isArray(data.treatments) && data.treatments.length > 0 
            ? data.treatments 
            : DEFAULT_FERTILITY_DATA.treatments,
          image_url: data.image_url
        });
        setImagePreview(data.image_url || null);
      }
    } catch (err) {
      console.error('Error in fetching fertility content:', err);
      // Use default data on error
      setFormData(DEFAULT_FERTILITY_DATA);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert file to data URL as fallback
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { id, ...dataToSave } = formData;
      
      // Filtering out empty treatments
      const filteredTreatments = formData.treatments.filter(treatment => treatment.trim() !== '');
      
      // Handle image upload if a new file is selected
      let image_url = formData.image_url;
      if (imageFile) {
        try {
          // Upload to website-images bucket
          const fileName = `fertility-${Date.now()}.${imageFile.name.split('.').pop()}`;
          
          const { error: uploadError } = await supabase.storage
            .from('website-images')
            .upload(`uploads/${fileName}`, imageFile);
          
          if (uploadError) {
            console.error("Upload error:", uploadError);
            // Fallback to data URL
            image_url = await fileToDataURL(imageFile);
          } else {
            const { data: urlData } = supabase.storage
              .from('website-images')
              .getPublicUrl(`uploads/${fileName}`);
              
            if (urlData?.publicUrl) {
              image_url = urlData.publicUrl;
            }
          }
        } catch (uploadErr) {
          console.error('Error uploading image:', uploadErr);
          // Fallback to data URL
          image_url = await fileToDataURL(imageFile);
        }
      }
      
      let result;
      
      if (id) {
        // Update existing record
        result = await supabase
          .from('csm_gynecology_fertility')
          .update({ 
            title: formData.title,
            description: formData.description,
            treatments: filteredTreatments,
            image_url: image_url
          })
          .eq('id', id);
      } else {
        // Insert new record
        result = await supabase
          .from('csm_gynecology_fertility')
          .insert({ 
            title: formData.title,
            description: formData.description,
            treatments: filteredTreatments,
            image_url: image_url
          });
      }
      
      if (result.error) throw result.error;
      
      toast.success('Fertility section content saved successfully!');
      setImageFile(null);
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Error saving fertility content:', err);
      toast.error('Failed to save fertility content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTreatmentChange = (index: number, value: string) => {
    const updatedTreatments = [...formData.treatments];
    updatedTreatments[index] = value;
    setFormData({ ...formData, treatments: updatedTreatments });
  };

  const addTreatment = () => {
    setFormData({
      ...formData,
      treatments: [...formData.treatments, '']
    });
  };

  const removeTreatment = (index: number) => {
    const updatedTreatments = [...formData.treatments];
    updatedTreatments.splice(index, 1);
    setFormData({ ...formData, treatments: updatedTreatments });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, image_url: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return <div className="p-6 flex justify-center items-center">
      <div className="flex flex-col items-center space-y-2">
        <div className="animate-spin h-8 w-8 border-2 border-gynecology border-t-transparent rounded-full"></div>
        <span className="text-gynecology">Loading fertility content...</span>
      </div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input 
            value={formData.title} 
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter section title"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea 
            value={formData.description} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter section description"
            rows={4}
          />
        </div>

        {/* Image Upload Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Section Image</label>
          <div className="flex items-center">
            <div 
              className="rounded-lg overflow-hidden border-2 border-gray-200 shadow-md w-32 h-24 mr-6 flex-shrink-0 relative cursor-pointer group"
              onClick={handleImageClick}
            >
              {imagePreview ? (
                <>
                  <img 
                    src={imagePreview} 
                    alt="Fertility Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/lovable-uploads/default-image.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Upload className="h-6 w-6 text-gray-400" />
                </div>
              )}
              
              {imagePreview && (
                <button 
                  type="button"
                  className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 text-white" 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="fertility-image"
            />
            
            <div>
              <p className="text-sm text-gray-500">
                Click to upload an image. Recommended size: 800x600 pixels.
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Treatments</label>
          <div className="space-y-3">
            {formData.treatments.map((treatment, index) => (
              <div key={index} className="flex gap-2">
                <Input 
                  value={treatment} 
                  onChange={(e) => handleTreatmentChange(index, e.target.value)}
                  placeholder="Enter treatment name"
                  className="flex-grow"
                />
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="icon"
                  onClick={() => removeTreatment(index)}
                  disabled={formData.treatments.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={addTreatment}
            >
              <Plus className="h-4 w-4" />
              Add Treatment
            </Button>
          </div>
        </div>
      </div>
      
      <Button 
        className="w-full bg-gynecology hover:bg-gynecology/90"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            Saving...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </span>
        )}
      </Button>
    </div>
  );
};

export default FertilityContentEditor; 