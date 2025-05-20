import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Award, BookOpen, Calendar, FileText, MapPin, Quote, School, Star, ThumbsUp, Check, Phone, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import EyeCareNavbar from "@/components/EyeCareNavbar";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import ElfsightReviews from "@/components/ElfsightReviews";
import { useDeviceType } from "@/hooks/use-mobile";
import Testimonial from "@/components/Testimonial";
import { useDoctorProfile } from '@/hooks/useDoctorProfile';
import { useDoctorMessage } from '@/hooks/useDoctorMessage';
import { useDoctorQualifications } from '@/hooks/useDoctorQualifications';
// import { useDoctorExpertise } from '@/hooks/useDoctorExpertise';
import { useEyeTestimonials } from '@/hooks/useEyeTestimonials';
import { useDoctorGallery } from '@/hooks/useDoctorGallery';
import { useEyeCareProcedures } from '@/hooks/useEyeCareProcedures';
import { useEyeCareDetails } from '@/hooks/useEyeCareDetails';
import EyeTestimonialsSection from '@/components/EyeTestimonialsSection';
import { useDoctorExpertise, iconMap } from "@/hooks/useDoctorExpertise";
import { Loader2 } from "lucide-react";

const EyeCareDoctor = () => {
  const [selectedRating, setSelectedRating] = useState<number | null>(5);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const {
    isMobile,
    isTablet
  } = useDeviceType();
  
  
  const { profile, isLoading: profileLoading } = useDoctorProfile();
  const { message, isLoading: messageLoading } = useDoctorMessage();
  const { qualifications, isLoading: qualificationsLoading } = useDoctorQualifications();
  const { expertise, isLoading: expertiseLoading } = useDoctorExpertise();
  const { testimonials, isLoading: testimonialsLoading } = useEyeTestimonials();
  const { galleryItems, isLoading: galleryLoading } = useDoctorGallery();
  const { procedures, isLoading: proceduresLoading } = useEyeCareProcedures();
  const { details, isLoading: detailsLoading } = useEyeCareDetails();
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/lovable-uploads/default-image.png";
  };
  
  return <PageTransition>
      <div className="min-h-screen flex flex-col">
        <EyeCareNavbar />

        <main className="flex-grow pt-16 sm:pt-20">
          {/* Hero Section */}
          <section className="bg-gradient-eyecare text-white py-10 sm:py-12 md:py-20">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
                <div data-aos="fade-right" data-aos-duration="900" className="order-2 md:order-1 text-center md:text-left">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6">
                    {profileLoading ? "Dr. Sanjeev Lehri" : profile?.full_name || "Dr. Sanjeev Lehri"}
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl mb-2 sm:mb-3 md:mb-4 text-white/90">
                    {profileLoading ? "Senior Ophthalmologist & Eye Surgeon" : profile?.title || "Senior Ophthalmologist & Eye Surgeon"}
                  </p>
                  <p className="text-sm sm:text-base mb-4 sm:mb-6 md:mb-8 text-white/80">
                    {profileLoading 
                      ? "With over 20 years of experience, Dr. Sanjeev Lehri is a renowned ophthalmologist specializing in cataract surgery, LASIK, glaucoma management, and corneal diseases." 
                      : profile?.description || "With over 20 years of experience, Dr. Sanjeev Lehri is a renowned ophthalmologist specializing in cataract surgery, LASIK, glaucoma management, and corneal diseases."}
                  </p>
                  <Link to="/eyecare/appointment" className="block w-full md:w-auto">
                    <Button className="mac-btn bg-white text-eyecare hover:bg-white/90 w-full md:w-auto px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base">
                      Book an Appointment with Dr. Lehri
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center justify-center rounded-full overflow-hidden border-4 border-white shadow-xl w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[300px] md:h-[300px] mx-auto transition-all duration-300 hover:shadow-2xl hover:scale-105 order-1 md:order-2 mb-6 md:mb-0" data-aos="fade-left" data-aos-duration="900">
                  <img 
                    src={profile?.image_url || "https://i.ibb.co/jPnBTf4N/pppp.jpg"} 
                    alt="Dr Sanjeev Lehri eyecare" 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    loading="eager"
                    onError={(e) => { e.currentTarget.src = "https://i.ibb.co/jPnBTf4N/pppp.jpg"; }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Personal Message Section */}
          <section className="py-10 sm:py-12 md:py-16 px-4 bg-gradient-to-br from-blue-50 to-emerald-50">
            <div className="container mx-auto max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">
                <div className="md:col-span-5 order-2 md:order-1 mt-8 md:mt-0" data-aos="fade-right" data-aos-duration="900">
                  <div className="relative">
                    <div className="absolute -left-2 sm:-left-4 -top-2 sm:-top-4 text-eyecare opacity-20">
                      <Quote size={isMobile ? 40 : 60} />
                    </div>
                    <Card className="bg-white/80 backdrop-blur-sm border border-eyecare/20 shadow-lg rounded-xl p-4 sm:p-6 md:p-8 hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-0 space-y-3 sm:space-y-4">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-eyecare mb-3 sm:mb-4 md:mb-6 relative">
                          {messageLoading ? "A Message From Dr. Lehri" : message?.title || "A Message From Dr. Lehri"}
                        </h2>
                        <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed italic">
                          "{messageLoading 
                            ? "I believe that every patient deserves personalized care and the highest quality treatment. My mission has always been to combine advanced technology with compassion to restore and preserve the precious gift of sight."
                            : message?.message_1 || "I believe that every patient deserves personalized care and the highest quality treatment. My mission has always been to combine advanced technology with compassion to restore and preserve the precious gift of sight."}"
                        </p>
                        <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed italic">
                          "{messageLoading
                            ? "Whether you're coming in for a routine check-up or a specialized procedure, my team and I are committed to providing you with an exceptional experience and the best possible outcomes for your vision health."
                            : message?.message_2 || "Whether you're coming in for a routine check-up or a specialized procedure, my team and I are committed to providing you with an exceptional experience and the best possible outcomes for your vision health."}"
                        </p>
                        <div className="mt-3 sm:mt-4 md:mt-6 pt-2 sm:pt-3 md:pt-4 border-t border-gray-200">
                          <p className="text-eyecare font-semibold text-right">- {messageLoading ? "Dr. Sanjeev Lehri" : message?.author || "Dr. Sanjeev Lehri"}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <div className="md:col-span-7 order-1 md:order-2" data-aos="fade-left" data-aos-duration="900">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {galleryLoading ? (
                      [1, 2].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-48 md:h-64 bg-gray-200 rounded-lg mb-2"></div>
                          <div className="p-3 md:p-4 bg-white">
                            <div className="h-5 bg-gray-200 w-3/4 mb-2 rounded"></div>
                            <div className="h-4 bg-gray-100 w-full rounded"></div>
                          </div>
                        </div>
                      ))
                    ) : galleryItems?.length >= 2 ? (
                      galleryItems.slice(0, 2).map((item, index) => (
                        <div key={item.id} className="overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                          <img 
                            src={item.image_url} 
                            alt={item.alt_text} 
                            className="w-full h-48 md:h-64 object-cover transition-transform duration-500 hover:scale-110" 
                            onError={handleImageError}
                          />
                          <div className="p-3 md:p-4 bg-white">
                            <h3 className="font-bold text-base md:text-lg text-eyecare">{item.title}</h3>
                            <p className="text-gray-600 text-sm md:text-base">{item.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                    <div className="overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                      <img src="/lovable-uploads/8254b67b-a23f-4dd5-b85d-c09b407f859c.png" alt="Dr. Lehri with patient" className="w-full h-48 md:h-64 object-cover transition-transform duration-500 hover:scale-110" />
                      <div className="p-3 md:p-4 bg-white">
                        <h3 className="font-bold text-base md:text-lg text-eyecare">Patient Consultation</h3>
                        <p className="text-gray-600 text-sm md:text-base">Providing personalized care and attention</p>
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                      <img src="/lovable-uploads/dd1fa9b7-e87a-4a71-b85e-8eda19f05600.png" alt="Dr. Lehri examining patient" className="w-full h-48 md:h-64 object-cover transition-transform duration-500 hover:scale-110" />
                      <div className="p-3 md:p-4 bg-white">
                        <h3 className="font-bold text-base md:text-lg text-eyecare">Comprehensive Eye Care</h3>
                        <p className="text-gray-600 text-sm md:text-base">Using the latest techniques for better outcomes</p>
                      </div>
                    </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Doctor Images Gallery Section */}
          <section className="py-10 sm:py-12 md:py-16 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-6 sm:mb-8 md:mb-12" data-aos="fade-up" data-aos-duration="900">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 md:mb-6 text-eyecare">
                  Dr. Lehri at Work
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
                  Providing specialized eye care with state-of-the-art equipment
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {galleryLoading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-64 bg-gray-200 rounded-lg mb-2"></div>
                      <div className="h-6 bg-gray-200 w-3/4 rounded mb-2"></div>
                      <div className="h-4 bg-gray-100 w-full rounded"></div>
                    </div>
                  ))
                ) : galleryItems?.length >= 5 ? (
                  galleryItems.slice(2, 5).map((item, index) => (
                    <div key={item.id} className="overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                      <img 
                        src={item.image_url} 
                        alt={item.alt_text} 
                        className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110"
                        onError={handleImageError} 
                      />
                      <div className="p-4 bg-white">
                        <h3 className="font-bold text-lg text-eyecare">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                <div className="overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                  <img src="/lovable-uploads/fb9680b4-f1d5-45ff-a9dd-2b5e8f7a9e9e.png" alt="Dr. Lehri examining patient" className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110" />
                  <div className="p-4 bg-white">
                    <h3 className="font-bold text-lg text-eyecare">Eye Examination</h3>
                    <p className="text-gray-600">Advanced eye testing with latest technology</p>
                  </div>
                </div>
                
                <div className="overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                  <img src="/lovable-uploads/8439fb25-8cd8-44e9-951a-7471a68ac611.png" alt="Dr. Lehri with equipment" className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110" />
                  <div className="p-4 bg-white">
                    <h3 className="font-bold text-lg text-eyecare">Advanced Technology</h3>
                    <p className="text-gray-600">Using cutting-edge medical equipment for eye care</p>
                  </div>
                </div>
                
                <div className="overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                  <img src="/lovable-uploads/4b048c7a-6e26-4b27-be01-fbafa965ea5d.png" alt="Dr. Sanjeev Lehri at microscope" className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110" />
                  <div className="p-4 bg-white">
                    <h3 className="font-bold text-lg text-eyecare">Precision Care</h3>
                    <p className="text-gray-600">Precise diagnostic and treatment procedures</p>
                  </div>
                </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Qualifications Section */}
          <section className="py-10 sm:py-12 md:py-16 px-4 bg-gray-50">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-6 sm:mb-8 md:mb-12" data-aos="fade-up" data-aos-duration="900">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-6 text-eyecare">
                  Education & Qualifications
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
                  Dr. Lehri has trained at some of the most prestigious institutions 
                  and continuously updates his skills with the latest techniques.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">
                {qualificationsLoading ? (
                  [1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse bg-white rounded-lg p-4 sm:p-6 shadow-md">
                      <div className="h-4 sm:h-5 bg-gray-200 rounded w-1/2 mb-3 sm:mb-4"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2 sm:mb-3"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))
                ) : (
                  qualifications?.map((qualification: any, index) => (
                    <div key={qualification.id} className="glass-card rounded-xl p-4 sm:p-5 md:p-6 flex items-start gap-3 sm:gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300" 
                      data-aos="zoom-in" 
                      data-aos-delay={100 * (index + 1)}
                      data-aos-duration="700"
                    >
                      <div className="mr-4 text-blue-500 flex-shrink-0">
                        {qualification.degree?.includes('Fellowship') || qualification.degree?.includes('Certified') ? (
                          <Award className="w-8 h-8" />
                        ) : (
                          <School className="w-8 h-8" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg sm:text-xl font-semibold text-eyecare mb-1">{qualification.degree}</h4>
                        <p className="text-sm sm:text-base text-gray-700 mb-1">{qualification.institution}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{qualification.years}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Expertise Section */}
          <section className="py-10 sm:py-12 md:py-16 px-4 bg-gray-50">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-6 sm:mb-8 md:mb-12" data-aos="fade-up" data-aos-duration="900">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-6 text-eyecare">
                  Areas of Expertise
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
                  Dr. Lehri specializes in a range of ophthalmological procedures and treatments
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {expertiseLoading ? (
                  <div className="col-span-3 flex justify-center items-center py-12">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-12 w-12 animate-spin text-eyecare" />
                      <p className="mt-4 text-gray-600 font-medium">Loading areas of expertise...</p>
                    </div>
                  </div>
                ) : (
                  expertise.map((item, index) => {
                    const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Star;
                    return (
                      <div 
                        key={item.id} 
                        className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        data-aos="fade-up"
                        data-aos-delay={100 * (index + 1)}
                      >
                        <div className="mb-4 text-eyecare">
                          <IconComponent className="h-10 w-10" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-eyecare">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* Patient Outcomes Section */}
          <section className="py-16 px-4 bg-gray-50">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12" data-aos="fade-up" data-aos-duration="900">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-eyecare">
                  Patient Outcomes & Success Stories
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Dr. Lehri has helped thousands of patients achieve better vision and eye health. 
                  Here are some highlights of his practice:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-card rounded-xl p-6 text-center hover:shadow-md hover:-translate-y-2 transition-all duration-300" data-aos="fade-up" data-aos-delay="100">
                  <div className="text-4xl font-bold text-eyecare mb-2">Exceptional</div>
                  <p className="text-xl font-semibold mb-2">Success Rate</p>
                  <p className="text-gray-600">Highly successful outcomes for routine cataract surgeries with standard IOLs</p>
                </div>
                
                <div className="glass-card rounded-xl p-6 text-center hover:shadow-md hover:-translate-y-2 transition-all duration-300" data-aos="fade-up" data-aos-delay="200">
                  <div className="text-4xl font-bold text-eyecare mb-2">Successful</div>
                  <p className="text-xl font-semibold mb-2">Procedures</p>
                  <p className="text-gray-600">Successful eye surgeries performed in his career</p>
                </div>
                
                <div className="glass-card rounded-xl p-6 text-center hover:shadow-md hover:-translate-y-2 transition-all duration-300" data-aos="fade-up" data-aos-delay="300">
                  <div className="text-4xl font-bold text-eyecare mb-2">Outstanding</div>
                  <p className="text-xl font-semibold mb-2">Patient Satisfaction</p>
                  <p className="text-gray-600">Highly appreciated by patients based on post-treatment feedback</p>
                </div>
              </div>
            </div>
          </section>

          {/* Patient Care Gallery Section */}
          <section className="py-16 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12" data-aos="fade-up" data-aos-duration="900">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-eyecare">
                  Advanced Eye Care
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Dr. Lehri uses the latest technology to provide comprehensive eye care services
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {proceduresLoading ? (
                  <div className="animate-pulse">
                    <div className="h-72 bg-gray-200 rounded-lg"></div>
                    <div className="p-4">
                      <div className="h-6 bg-gray-200 w-3/4 rounded mb-2"></div>
                      <div className="h-4 bg-gray-100 w-full rounded"></div>
                    </div>
                  </div>
                ) : procedures.length > 0 ? (
                  <div className="overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                    <img 
                      src={procedures[0].image_url} 
                      alt={procedures[0].alt_text} 
                      className="w-full h-72 object-cover transition-transform duration-500 hover:scale-110"
                      onError={handleImageError}
                    />
                    <div className="p-4 bg-white">
                      <h3 className="font-bold text-lg text-eyecare">{procedures[0].title}</h3>
                      <p className="text-gray-600">{procedures[0].description}</p>
                    </div>
                  </div>
                ) : (
                <div className="overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                  <img src="/lovable-uploads/fb9680b4-f1d5-45ff-a9dd-2b5e8f7a9e9e.png" alt="Advanced eye examination equipment" className="w-full h-72 object-cover transition-transform duration-500 hover:scale-110" />
                  <div className="p-4 bg-white">
                    <h3 className="font-bold text-lg text-eyecare">Advanced Diagnostic Testing</h3>
                    <p className="text-gray-600">Early detection of eye conditions with cutting-edge equipment</p>
                  </div>
                </div>
                )}
                
                {detailsLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 w-full rounded"></div>
                    <div className="h-4 bg-gray-200 w-5/6 rounded"></div>
                    <div className="pl-5 space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-4 bg-gray-100 w-5/6 rounded"></div>
                      ))}
                    </div>
                    <div className="h-4 bg-gray-200 w-full rounded"></div>
                  </div>
                ) : details?.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {/* Display paragraphs first */}
                    {details?.filter(item => item.type === 'paragraph')?.slice(0, 1)?.map(item => (
                      <p key={item.id} className="text-lg text-gray-700">{item.content}</p>
                    ))}
                    
                    {/* Display bullets in the middle */}
                    {details.filter(item => item.type === 'bullet')?.length > 0 && (
                      <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        {details.filter(item => item.type === 'bullet')?.map(item => (
                          <li key={item.id}>{item.content}</li>
                        ))}
                      </ul>
                    )}
                    
                    {/* Display the rest of paragraphs */}
                    {details.filter(item => item.type === 'paragraph')?.slice(1)?.map(item => (
                      <p key={item.id} className="text-lg text-gray-700">{item.content}</p>
                    ))}
                  </div>
                ) : (
                <div className="grid grid-cols-1 gap-4">
                  <p className="text-lg text-gray-700">
                    Dr. Lehri utilizes the latest technology in ophthalmology to provide precise diagnoses and
                    effective treatments. His clinic features state-of-the-art equipment for comprehensive
                    eye examinations, including:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>High-definition optical coherence tomography (OCT)</li>
                    <li>Advanced corneal topography</li>
                    <li>Digital fundus photography</li>
                    <li>Computerized visual field testing</li>
                    <li>Non-contact tonometry for glaucoma screening</li>
                  </ul>
                  <p className="text-lg text-gray-700">
                    This advanced technology enables Dr. Lehri to detect eye conditions at their earliest stages,
                    when treatment is most effective and less invasive.
                  </p>
                </div>
                )}
              </div>
            </div>
          </section>

          {/* Success Stories Section */}
          <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-emerald-50">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-10" data-aos="fade-up" data-aos-duration="900">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-eyecare">
                  Success Stories
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Hear what our patients have to say about their experiences with Dr. Lehri
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {testimonialsLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                      <div className="h-6 w-6 bg-gray-200 rounded-full mx-auto mb-2"></div>
                      <div className="h-4 bg-gray-200 w-3/4 mx-auto mb-4 rounded"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-100 w-full rounded"></div>
                        <div className="h-3 bg-gray-100 w-5/6 rounded"></div>
                        <div className="h-3 bg-gray-100 w-full rounded"></div>
                      </div>
                    </div>
                  ))
                ) : testimonials?.length > 0 ? (
                  testimonials.slice(0, 3).map((item, index) => (
                    <Testimonial 
                      key={item.id}
                      initial={item.name.charAt(0)}
                      name={item.name}
                      role="Patient"
                      content={item.content}
                      bgColor={index % 2 === 0 ? "bg-blue-100" : "bg-emerald-100"}
                      textColor={index % 2 === 0 ? "text-blue-700" : "text-emerald-700"}
                    />
                  ))
                ) : (
                  <>
                    <Testimonial 
                      initial="J"
                      name="Jatin"
                      role="Patient"
                      content="Dr. Sanjeev Lehri is a wonderful eye doctor. They're not only highly professional and knowledgeable but also incredibly kind and compassionate. I felt very well cared for during my appointment. I highly recommend!"
                      bgColor="bg-blue-100"
                      textColor="text-blue-700"
                    />
                    
                    <Testimonial 
                      initial="S"
                      name="Swarnima Vardhan"
                      role="Patient"
                      content="I have consulted with him several times. He is a very professional and genuine doctor. Highly recommend Dr Lehri."
                      bgColor="bg-emerald-100"
                      textColor="text-emerald-700"
                    />
                    
                    <Testimonial 
                      initial="A"
                      name="Ankita Deshmukh"
                      role="Patient"
                      content="He is not only a good doctor but moreover he is a wonderful person! Extremely satisfied with the consultation"
                      bgColor="bg-blue-100"
                      textColor="text-blue-700"
                    />
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Elfsight Reviews Section */}
          <section className="py-12 md:py-16 px-4 bg-gray-50" id="reviews">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-8 md:mb-12" data-aos="fade-up" data-aos-duration="900">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 text-eyecare">
                  Patient Reviews
                </h2>
                <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 md:mb-8">
                  Hear what our patients have to say about their experience with Dr. Lehri's care
                </p>
                
                {/* Elfsight Reviews Widget */}
                <div className="bg-white rounded-lg p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300">
                  <ElfsightReviews appId="198b0923-ba08-443e-b687-98acb8e16cb3" className="w-full" />
                </div>
              </div>
            </div>
          </section>


          {/* CTA Section */}
          <section className="py-16 px-4 bg-gradient-eyecare text-white">
            <div className="container mx-auto max-w-5xl text-center" data-aos="fade-up" data-aos-duration="900">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Schedule a Consultation with Dr. Lehri
              </h2>
              <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto">
              Take the first step toward better eye health and improved vision by booking an appointment with Dr. Sanjeev Lehri today.                </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Link to="/eyecare/appointment">
                  <Button className="mac-btn bg-white text-eyecare hover:bg-white/90 w-full md:w-auto">
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Your Appointment
                  </Button>
                </Link>
                {/* <Button variant="outline" className="mac-btn border-white text-white hover:bg-white/10 w-full md:w-auto">
                  <Phone className="mr-2 h-5 w-5" />
                  Call for Appointment
                </Button> */}
              </div>
            </div>
          </section>

          {/* Updated Qualifications Section */}
          {/* <section className="py-16 px-4 bg-gray-50">
            <div className="container mx-auto max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div data-aos="fade-right">
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">Qualifications & Training</h2>
                  
                  {qualificationsLoading ? (
                    <div className="space-y-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-start gap-3 animate-pulse">
                          <div className="h-6 w-6 bg-gray-200 rounded-full shrink-0 mt-0.5"></div>
                          <div>
                            <div className="h-5 bg-gray-200 w-32 mb-1 rounded"></div>
                            <div className="h-4 bg-gray-100 w-64 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : qualifications?.length > 0 ? (
                    <div className="space-y-4">
                      {qualifications.map((qual) => (
                        <div key={qual.id} className="flex items-start gap-3">
                          <Check className="h-6 w-6 text-eyecare shrink-0 mt-0.5" />
                          <div>
                            <h3 className="font-semibold text-lg">{qual.title}</h3>
                            <p className="text-gray-600">{qual.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Check className="h-6 w-6 text-eyecare shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-lg">MBBS</h3>
                          <p className="text-gray-600">All India Institute of Medical Sciences</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div data-aos="fade-left">
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">Achievements</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Check className="h-6 w-6 text-eyecare shrink-0 mt-0.5" />
                      <p className="text-gray-700">
                        <strong>20+ Years of Experience</strong> with over 10,000 successful surgeries
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-6 w-6 text-eyecare shrink-0 mt-0.5" />
                      <p className="text-gray-700">
                        <strong>Pioneered Advanced Techniques</strong> in micro-incision cataract surgery
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-6 w-6 text-eyecare shrink-0 mt-0.5" />
                      <p className="text-gray-700">
                        <strong>Published Research</strong> in leading ophthalmology journals
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-6 w-6 text-eyecare shrink-0 mt-0.5" />
                      <p className="text-gray-700">
                        <strong>Award-Winning</strong> eye care provider recognized for excellence in patient care
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section> */}
        </main>

        <Footer />
      </div>
    </PageTransition>;
};

export default EyeCareDoctor;
