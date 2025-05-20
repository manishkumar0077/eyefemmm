import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Shield, Beaker, Heart, Loader2, AlertTriangle, Menu, X } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useDepartments } from "@/hooks/useDepartments";
import { useWhyChooseUs } from "@/hooks/useWhyChooseUs";
import { supabase } from '@/integrations/supabase/client';

interface DoctorSpeciality {
  id: number;
  name: string;
  specialization: string;
  image_url: string;
}

const SpecialtyChoice = () => {
  const [hoverEyeCare, setHoverEyeCare] = useState(false);
  const [hoverGynecology, setHoverGynecology] = useState(false);
  const [specialities, setSpecialities] = useState<DoctorSpeciality[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Close mobile menu when navigating to a different page
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  
  // Use the hooks for dynamic data
  const { departments, departmentServices, isLoading } = useDepartments();
  const { benefitCards, isLoading: whyChooseUsLoading } = useWhyChooseUs();

  // Get departments data
  const eyeCareDept = departments.find(d => d.department.toLowerCase().includes('eye'));
  const gynecologyDept = departments.find(d => d.department.toLowerCase().includes('gyn'));
  
  // Get services for each department
  const eyeCareServices = departmentServices[eyeCareDept?.department || 'Eye Care'] || [];
  const gynecologyServices = departmentServices[gynecologyDept?.department || 'Gynecology'] || [];

  // Default doctors as fallback
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
  
  useEffect(() => {
    fetchDoctorSpecialities();
  }, []);
  
  // Helper function to ensure image URLs are properly formatted
  const formatImageUrl = (url: string) => {
    if (!url) return '';
    
    // If it's already an absolute URL (starts with http or https)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's a relative path
    if (url.startsWith('/')) {
      // For local development, prepend the base URL
      return url;
    }
    
    return url;
  };
  
  const fetchDoctorSpecialities = async () => {
    setLoading(true);
    try {
      // First, check if the table exists by examining its structure
      const { data: tableInfo, error: tableError } = await supabase
        .from('csm_doctors_profile_specilities' as any)
        .select('*')
        .limit(1);
        
      if (tableError) {
        setDebugInfo(`Table error: ${tableError.message}`);
        throw new Error(`Table error: ${tableError.message}`);
      }
      
      // Fetch all data from the table
      const { data, error } = await supabase
        .from('csm_doctors_profile_specilities' as any)
        .select('*');
        
      if (error) {
        setDebugInfo(`Fetch error: ${error.message}`);
        throw new Error(`Fetch error: ${error.message}`);
      }
      
      setDebugInfo(`Data fetched: ${JSON.stringify(data)}`);
      
      if (data && data.length > 0) {
        console.log("Fetched doctor specialties:", data);
        
        // Process the image URLs and handle null safety
        const processedData = data ? data.map(doctor => {
          // Ensure doctor is an object and not null
          if (doctor && typeof doctor === 'object') {
            return {
              id: typeof doctor.id === 'number' ? doctor.id : 0,
              name: typeof doctor.name === 'string' ? doctor.name : '',
              specialization: typeof doctor.specialization === 'string' ? doctor.specialization : '',
              image_url: formatImageUrl(typeof doctor.image_url === 'string' ? doctor.image_url : '')
            };
          }
          // Fallback for null/undefined doctors
          return { id: 0, name: '', specialization: '', image_url: '' };
        }) : [];
        
        // Safety check to ensure we have processed data
        if (processedData.length > 0) {
          setSpecialities(processedData);
          setSelectedDoctorId(Number(processedData[0].id));
        } else {
          // Use default data if nothing was returned
          setDebugInfo("Using default specialties as processed data was empty");
          // Default data handling is already in the else branch below
        }
        
        // State updates are now handled in the if/else block above
      } else {
        setDebugInfo("No data found in database, using defaults");
        console.log("No doctor specialties found in database, using defaults");
        setSpecialities(defaultDoctors);
        setSelectedDoctorId(defaultDoctors[0].id);
      }
    } catch (err) {
      console.error('Error fetching doctor specialities:', err);
      setError(`Failed to load doctor specialties: ${err.message}`);
      
      // Use defaults on error
      setSpecialities(defaultDoctors);
      setSelectedDoctorId(defaultDoctors[0].id);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDoctorSelect = (doctorId: number) => {
    setSelectedDoctorId(doctorId);
  };
  
  const getSelectedDoctor = () => {
    return specialities.find(doctor => doctor.id === selectedDoctorId);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Use a fallback image if the original fails to load
    e.currentTarget.src = '/lovable-uploads/default-doctor.png';
    e.currentTarget.onerror = null; // Prevent infinite loop
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/6c43213d-6d60-4790-b8ff-d662e634ee59.png"
                alt="EyeFem Clinic"
                className="h-14 sm:h-16 w-auto"
              />
            </Link>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden flex items-center" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-800" />
              ) : (
                <Menu className="h-6 w-6 text-gray-800" />
              )}
            </button>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-800 hover:text-primary transition-colors">Home</Link>
              <Link to="/specialties" className="text-gray-800 hover:text-primary transition-colors">Our Specialties</Link>
              <Link to="/eyecare" className="text-gray-800 hover:text-primary transition-colors">Eye Care</Link>
              <Link to="/gynecology" className="text-gray-800 hover:text-primary transition-colors">Gynecology</Link>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white shadow-md py-4 px-6 absolute w-full">
              <nav className="flex flex-col space-y-4">
                <Link to="/" className="text-gray-800 hover:text-primary transition-colors py-2" onClick={closeMobileMenu}>
                  Home
                </Link>
                <Link to="/specialties" className="text-gray-800 hover:text-primary transition-colors py-2" onClick={closeMobileMenu}>
                  Our Specialties
                </Link>
                <Link to="/eyecare" className="text-gray-800 hover:text-primary transition-colors py-2" onClick={closeMobileMenu}>
                  Eye Care
                </Link>
                <Link to="/gynecology" className="text-gray-800 hover:text-primary transition-colors py-2" onClick={closeMobileMenu}>
                  Gynecology
                </Link>
              </nav>
            </div>
          )}
        </header>

        <main className="flex-grow pt-16 sm:pt-24">
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white py-10 sm:py-12 md:py-16 px-4">
            <div className="container mx-auto max-w-4xl text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4" data-aos="fade-up">
                Choose Your Specialty
              </h1>
              <p className="text-base sm:text-lg md:text-xl px-2" data-aos="fade-up" data-aos-delay="100">
                Select the medical specialty that matches your healthcare needs. Our expert doctors 
                are ready to provide you with specialized care.
              </p>
            </div>
          </div>

          <div className="py-8 sm:py-12 md:py-16 px-4 bg-white">
            <div className="container mx-auto max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Eye Care Department Card - Dynamically populated but with original styling */}
                <div 
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                  data-aos="fade-up"
                  data-aos-delay="100"
                  onMouseEnter={() => setHoverEyeCare(true)}
                  onMouseLeave={() => setHoverEyeCare(false)}
                >
                  <div className={`bg-gradient-to-r from-blue-400 to-blue-500 p-6 text-white transition-all duration-300 ${hoverEyeCare ? 'scale-105' : ''}`}>
                    <h2 className="text-2xl font-bold">{eyeCareDept?.department || "Eye Care"}</h2>
                    <p className="text-white/90">{eyeCareDept?.tagline || "Expert treatment for all eye conditions"}</p>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3">{eyeCareDept?.doctor_name || "Dr. Sanjeev Lehri"}</h3>
                    <p className="text-gray-600 mb-6">
                      {eyeCareDept?.doctor_bio || 
                        "Specialist in treating cataracts, glaucoma, refractive errors, and other eye conditions using the latest technology and techniques."}
                    </p>

                    <div className="space-y-2 mb-6">
                      {isLoading ? (
                        // Loading state
                        Array(4).fill(0).map((_, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-blue-100 rounded-full animate-pulse"></div>
                            <div className="w-32 h-4 bg-gray-100 rounded animate-pulse"></div>
                          </div>
                        ))
                      ) : eyeCareServices.length > 0 ? (
                        // Dynamic services
                        eyeCareServices.map(service => (
                          <div key={service.id} className="flex items-center gap-2">
                            <Check className="text-blue-500 h-5 w-5" />
                            <span>{service.service}</span>
                          </div>
                        ))
                      ) : (
                        // Fallback static content
                        <>
                          <div className="flex items-center gap-2">
                            <Check className="text-blue-500 h-5 w-5" />
                            <span>Cataract Surgery</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="text-blue-500 h-5 w-5" />
                            <span>Glaucoma Management</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="text-blue-500 h-5 w-5" />
                            <span>Refractive Error Correction</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="text-blue-500 h-5 w-5" />
                            <span>Retinal Disorder Treatment</span>
                          </div>
                        </>
                      )}
                    </div>

                    <Link 
                      to={eyeCareDept?.link_url || "/eyecare"} 
                      className={`w-full block text-center py-3 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors group flex items-center justify-center ${hoverEyeCare ? 'bg-blue-600' : ''}`}
                    >
                      {eyeCareDept?.link_text || "Visit Eye Care Department"}
                      <ArrowRight className={`ml-2 transition-transform duration-300 ${hoverEyeCare ? 'translate-x-1' : ''}`} size={18} />
                    </Link>
                  </div>
                </div>

                {/* Gynecology Department Card - Dynamically populated but with original styling */}
                <div 
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                  data-aos="fade-up"
                  data-aos-delay="200"
                  onMouseEnter={() => setHoverGynecology(true)}
                  onMouseLeave={() => setHoverGynecology(false)}
                >
                  <div className={`bg-gradient-to-r from-[#D946EF] to-[#d94991] p-6 text-white transition-all duration-300 ${hoverGynecology ? 'scale-105' : ''}`}>
                    <h2 className="text-2xl font-bold">{gynecologyDept?.department || "Gynecology"}</h2>
                    <p className="text-white/90">{gynecologyDept?.tagline || "Comprehensive women's healthcare"}</p>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3">{gynecologyDept?.doctor_name || "Dr. Nisha Bhatnagar"}</h3>
                    <p className="text-gray-600 mb-6">
                      {gynecologyDept?.doctor_bio || 
                        "Expert in women's health, fertility treatments, and IVF with a compassionate approach to address all gynecological concerns."}
                    </p>

                    <div className="space-y-2 mb-6">
                      {isLoading ? (
                        // Loading state
                        Array(4).fill(0).map((_, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-pink-100 rounded-full animate-pulse"></div>
                            <div className="w-32 h-4 bg-gray-100 rounded animate-pulse"></div>
                          </div>
                        ))
                      ) : gynecologyServices.length > 0 ? (
                        // Dynamic services
                        gynecologyServices.map(service => (
                          <div key={service.id} className="flex items-center gap-2">
                            <Check className="text-[#d94991] h-5 w-5" />
                            <span>{service.service}</span>
                          </div>
                        ))
                      ) : (
                        // Fallback static content
                        <>
                          {[
                            "Fertility Treatments",
                            "In Vitro Fertilization (IVF)",
                            "Women's Health Consultations",
                            "Reproductive Health Care"
                          ].map((service, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Check className="text-[#d94991] h-5 w-5" />
                              <span>{service}</span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>

                    <Link 
                      to={gynecologyDept?.link_url || "/gynecology"} 
                      className={`w-full block text-center py-3 px-4 bg-[#d94991] text-white rounded-md hover:bg-[#c73a7c] transition-colors group flex items-center justify-center ${hoverGynecology ? 'bg-[#c73a7c]' : ''}`}
                    >
                      {gynecologyDept?.link_text || "Visit Gynecology Department"}
                      <ArrowRight className={`ml-2 transition-transform duration-300 ${hoverGynecology ? 'translate-x-1' : ''}`} size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Doctors section - Preserved from original */}
          <div className="py-8 sm:py-12 md:py-16 px-4 bg-gray-50">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 md:mb-12" data-aos="fade-up">
                Our Expert Doctors
              </h2>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[1, 2].map(i => (
                    <div key={i} className="text-center" data-aos="fade-up" data-aos-delay={i * 100}>
                      <div className="mb-6 mx-auto w-32 h-32 rounded-full overflow-hidden bg-gray-200 animate-pulse"></div>
                      <div className="w-48 h-5 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
                      <div className="w-36 h-4 bg-gray-100 rounded mx-auto mb-4 animate-pulse"></div>
                      <div className="w-56 h-10 bg-gray-200 rounded-md mx-auto animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center text-red-500 flex items-center justify-center gap-2">
                  <AlertTriangle size={20} />
                  <p>Error loading doctor data. Please refresh the page.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {specialities.slice(0, 2).map((doctor, index) => {
                    // Define styling based on specialty type (eye care vs gynecology)
                    const isEyeDoctor = doctor.specialization.toLowerCase().includes('ophthalm') ||
                                        doctor.specialization.toLowerCase().includes('eye');
                    
                    const styling = isEyeDoctor 
                      ? {
                          borderColor: 'border-blue-200',
                          hoverBorderColor: 'group-hover:border-blue-400',
                          textColor: 'group-hover:text-blue-600',
                          buttonClass: 'border-blue-500 text-blue-500 hover:bg-blue-50 group-hover:bg-blue-500 group-hover:text-white',
                          path: '/eyecare/doctor'
                        }
                      : {
                          borderColor: 'border-[#d94991]/20',
                          hoverBorderColor: 'group-hover:border-[#d94991]',
                          textColor: 'group-hover:text-[#d94991]',
                          buttonClass: 'border-[#d94991] text-[#d94991] hover:bg-[#d94991]/10 group-hover:bg-[#d94991] group-hover:text-white',
                          path: '/gynecology/doctor'
                        };

                    return (
                      <div key={doctor.id} className="text-center group" data-aos="fade-up" data-aos-delay={100 * (index + 1)}>
                        <div className={`mb-6 mx-auto w-32 h-32 rounded-full overflow-hidden border-4 ${styling.borderColor} transition-all duration-300 ${styling.hoverBorderColor} group-hover:shadow-lg`}>
                          <img 
                            src={doctor.image_url} 
                            alt={doctor.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={handleImageError}
                          />
                        </div>
                        <h3 className={`text-xl font-bold mb-2 transition-colors ${styling.textColor}`}>
                          {doctor.name}
                        </h3>
                        <p className="text-gray-600 mb-4">{doctor.specialization}</p>
                        <Link to={styling.path}>
                          <Button 
                            variant="outline" 
                            className={styling.buttonClass}
                          >
                            View Profile & Reviews
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* Why Choose Us section - Dynamic data with original styling */}
          <div className="py-8 sm:py-12 md:py-16 px-4 bg-white">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 md:mb-12" data-aos="fade-up">
                Why Choose Us
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8" data-aos="fade-up" data-aos-delay="100">
                {whyChooseUsLoading ? (
                  // Loading state
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                      <div className="w-12 h-12 rounded-full bg-gray-200 mb-4"></div>
                      <div className="w-32 h-5 bg-gray-200 rounded mb-2"></div>
                      <div className="w-full h-4 bg-gray-100 rounded"></div>
                    </div>
                  ))
                ) : benefitCards.length > 0 ? (
                  // Dynamic cards from database with original styling
                  benefitCards.map((card, index) => {
                    let colorClass = "bg-blue-100 text-blue-700";
                    
                    if (card.title.toLowerCase().includes('tech')) {
                      colorClass = "bg-purple-100 text-purple-700";
                    } else if (card.title.toLowerCase().includes('patient') || 
                               card.title.toLowerCase().includes('care')) {
                      colorClass = "bg-pink-100 text-pink-700";
                    }
                    
                    return (
                      <div 
                        key={card.id}
                        className="glass-card rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-gradient-to-b hover:from-white hover:to-gray-50"
                        data-aos="fade-up"
                        data-aos-delay={100 * (index + 1)}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4 ${colorClass}`}>
                          {index + 1}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                        <p className="text-gray-600">{card.description}</p>
                      </div>
                    );
                  })
                ) : (
                  // Fallback static content
                  [
                    {
                      title: "Expert Specialists",
                      description: "Our doctors are leaders in their fields with extensive experience and specialized training.",
                      color: "bg-blue-100 text-blue-700"
                    },
                    {
                      title: "Advanced Technology",
                      description: "We utilize the latest medical technology for diagnosis and treatment to ensure optimal outcomes.",
                      color: "bg-purple-100 text-purple-700"
                    },
                    {
                      title: "Patient-centered Care",
                      description: "Our approach focuses on your individual needs, comfort, and comprehensive well-being.",
                      color: "bg-pink-100 text-pink-700"
                    }
                  ].map((item, index) => (
                    <div 
                      key={index}
                      className="glass-card rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-gradient-to-b hover:from-white hover:to-gray-50"
                      data-aos="fade-up"
                      data-aos-delay={100 * (index + 1)}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4 ${item.color}`}>
                        {index + 1}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default SpecialtyChoice;
