import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TreatmentPoint {
  text: string;
}

export interface DoctorTreatment {
  id: string;
  title: string;
  description: string;
  bullet_points: string[];
  button_text: string;
  created_at: string;
  image_url?: string;
}

export const useDoctorTreatments = () => {
  const [treatments, setTreatments] = useState<DoctorTreatment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchTreatments();
  }, []);
  
  const fetchTreatments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('csm_doctor_treatments_1')
        .select('*')
        .order('created_at');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setTreatments(data);
      } else {
        // No data available, could insert default data here
        console.log('No treatment data found');
        setTreatments([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error(`Error fetching doctor treatments: ${err}`);
      // Set default data for UI even if database operations failed
      setTreatments(getDefaultTreatments());
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

  const getDefaultTreatments = (): DoctorTreatment[] => [
    {
      id: '1',
      title: 'In Vitro Fertilization (IVF)',
      description: 'IVF is an advanced fertility treatment that helps couples achieve pregnancy when other methods have been unsuccessful. Our state-of-the-art facility provides comprehensive IVF care with high success rates.',
      bullet_points: [
        '• Controlled Ovarian Stimulation',
        '• Egg Retrieval',
        '• Sperm Processing',
        '• Embryo Culture and Transfer',
        '• Blastocyst Culture',
        '• Embryo Freezing',
        '• Genetic Testing Options'
      ],
      button_text: 'Schedule IVF Consultation',
      created_at: new Date().toISOString(),
      image_url: '/lovable-uploads/519353d5-cc84-4d60-b215-a3bcf0f6db39.jpg'
    },
    {
      id: '2',
      title: 'Intrauterine Insemination (IUI)',
      description: 'IUI is a fertility treatment where prepared sperm is directly placed into the uterus during ovulation. Its a less invasive and more cost-effective option compared to IVF for suitable candidates.',
      bullet_points: [
        '• Unexplained Infertility',
        '• Mild Male Factor Infertility',
        '• Cervical Factor Infertility',
        '• Ovulatory Disorders',
        '• Single Women or Same-Sex Couples'
      ],
      button_text: 'Learn More About IUI',
      created_at: new Date().toISOString(),
      image_url: '/lovable-uploads/47a70484-57b8-4968-839f-3f81f98e326f.jpg'
    },
    {
      id: '3',
      title: 'Hysteroscopy',
      description: 'Hysteroscopy is a minimally invasive procedure that allows direct visualization of the uterine cavity. Its both diagnostic and therapeutic, enabling us to identify and treat various uterine conditions.',
      bullet_points: [
        '• Uterine Polyps',
        '• Submucous Fibroids',
        '• Uterine Septum',
        '• Adhesions (Ashermans Syndrome)',
        '• Abnormal Uterine Bleeding',
        '• Recurrent Pregnancy Loss'
      ],
      button_text: 'Schedule Consultation',
      created_at: new Date().toISOString(),
      image_url: '/lovable-uploads/bf3365de-daab-4d50-a8ca-410647e0995b.jpg'
    }
  ];

  const updateTreatment = async (id: string, data: Partial<DoctorTreatment>, imageFile?: File) => {
    try {
      const updateData = { ...data };
      
      // Handle image upload if provided
      if (imageFile) {
        try {
          // Upload to website-images bucket
          const fileName = `treatment-${Date.now()}.${imageFile.name.split('.').pop()}`;
          
          const { error: uploadError } = await supabase.storage
            .from('website-images')
            .upload(`uploads/${fileName}`, imageFile);
          
          if (uploadError) {
            console.error("Upload error:", uploadError);
            // Fallback to data URL
            updateData.image_url = await fileToDataURL(imageFile);
          } else {
            const { data: urlData } = supabase.storage
              .from('website-images')
              .getPublicUrl(`uploads/${fileName}`);
              
            if (urlData?.publicUrl) {
              updateData.image_url = urlData.publicUrl;
            }
          }
        } catch (uploadErr) {
          console.error('Error uploading image:', uploadErr);
        }
      }
      
      const { error } = await supabase
        .from('csm_doctor_treatments_1')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh the data
      await fetchTreatments();
      return true;
    } catch (err) {
      console.error(`Error updating treatment: ${err}`);
      return false;
    }
  };

  const addTreatment = async (treatment: Omit<DoctorTreatment, 'id' | 'created_at'>, imageFile?: File) => {
    try {
      const newTreatment = { ...treatment };
      
      // Handle image upload if provided
      if (imageFile) {
        try {
          // Upload to website-images bucket
          const fileName = `treatment-${Date.now()}.${imageFile.name.split('.').pop()}`;
          
          const { error: uploadError } = await supabase.storage
            .from('website-images')
            .upload(`uploads/${fileName}`, imageFile);
          
          if (uploadError) {
            console.error("Upload error:", uploadError);
            // Fallback to data URL
            newTreatment.image_url = await fileToDataURL(imageFile);
          } else {
            const { data: urlData } = supabase.storage
              .from('website-images')
              .getPublicUrl(`uploads/${fileName}`);
              
            if (urlData?.publicUrl) {
              newTreatment.image_url = urlData.publicUrl;
            }
          }
        } catch (uploadErr) {
          console.error('Error uploading image:', uploadErr);
        }
      }
      
      const { error } = await supabase
        .from('csm_doctor_treatments_1')
        .insert([newTreatment]);
      
      if (error) throw error;
      
      // Refresh the data
      await fetchTreatments();
      return true;
    } catch (err) {
      console.error(`Error adding treatment: ${err}`);
      return false;
    }
  };

  const deleteTreatment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('csm_doctor_treatments_1')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh the data
      await fetchTreatments();
      return true;
    } catch (err) {
      console.error(`Error deleting treatment: ${err}`);
      return false;
    }
  };

  return { 
    treatments, 
    isLoading, 
    error, 
    refreshTreatments: fetchTreatments,
    updateTreatment,
    addTreatment,
    deleteTreatment
  };
};