import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface DoctorSpeciality {
  id: number;
  name: string;
  specialization: string;
  image_url: string;
}

interface Props {
  onSelectDoctor?: (doctor: DoctorSpeciality) => void;
}

const SpecialitiesSpecialtyChoice: React.FC<Props> = ({ onSelectDoctor }) => {
  const [specialities, setSpecialities] = useState<DoctorSpeciality[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchDoctorSpecialities();
  }, []);
  
  const fetchDoctorSpecialities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('csm_doctors_profile_specilities')
        .select('*')
        .order('id', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log("Fetched doctor specialties:", data);
        setSpecialities(data);
        
        // Select the first one by default
        setSelectedDoctorId(data[0].id);
        if (onSelectDoctor) {
          onSelectDoctor(data[0]);
        }
      } else {
        // No data found, use defaults
        console.log("No doctor specialties found in database, using defaults");
        const defaultDoctors = [
          {
            id: -1,
            name: 'Dr. Sanjeev Lehri',
            specialization: 'Ophthalmologist & Eye Surgeon',
            image_url: '/lovable-uploads/4f0ab2f1-cfac-48ce-9d14-205a833d4973.png'
          },
          {
            id: -2,
            name: 'Dr. Nisha Bhatnagar',
            specialization: 'Gynecologist & Fertility Specialist',
            image_url: '/lovable-uploads/8205aaa8-556e-4663-be5d-9619f8b8ddeb.png'
          }
        ];
        setSpecialities(defaultDoctors);
        setSelectedDoctorId(defaultDoctors[0].id);
        if (onSelectDoctor) {
          onSelectDoctor(defaultDoctors[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching doctor specialities:', err);
      setError('Failed to load doctor specialties');
      
      // Use defaults on error
      const defaultDoctors = [
        {
          id: -1,
          name: 'Dr. Sanjeev Lehri',
          specialization: 'Ophthalmologist & Eye Surgeon',
          image_url: '/lovable-uploads/4f0ab2f1-cfac-48ce-9d14-205a833d4973.png'
        },
        {
          id: -2,
          name: 'Dr. Nisha Bhatnagar',
          specialization: 'Gynecologist & Fertility Specialist',
          image_url: '/lovable-uploads/8205aaa8-556e-4663-be5d-9619f8b8ddeb.png'
        }
      ];
      setSpecialities(defaultDoctors);
      setSelectedDoctorId(defaultDoctors[0].id);
      if (onSelectDoctor) {
        onSelectDoctor(defaultDoctors[0]);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleDoctorSelect = (doctor: DoctorSpeciality) => {
    setSelectedDoctorId(doctor.id);
    if (onSelectDoctor) {
      onSelectDoctor(doctor);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Our Doctors</h3>
        <div className="space-y-2">
          {specialities.map((doctor) => (
            <Button
              key={doctor.id}
              variant={selectedDoctorId === doctor.id ? "default" : "outline"}
              className="w-full justify-start text-left h-auto py-3 px-4"
              onClick={() => handleDoctorSelect(doctor)}
            >
              <div>
                <div className="font-medium">{doctor.name}</div>
                <div className="text-xs opacity-70">{doctor.specialization}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center">
        {selectedDoctorId !== null && (
          <div className="text-center">
            {specialities
              .filter(doctor => doctor.id === selectedDoctorId)
              .map(doctor => (
                <div key={doctor.id} className="space-y-4">
                  <div className="mx-auto w-40 h-40 overflow-hidden rounded-full border-2 border-primary/30">
                    <img
                      src={doctor.image_url}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{doctor.name}</h4>
                    <p className="text-primary">{doctor.specialization}</p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialitiesSpecialtyChoice; 