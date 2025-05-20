import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Award, BookOpen, Calendar, FileText, MapPin, Quote, School, Star, ThumbsUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import GynecologyNavbar from "@/components/GynecologyNavbar";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import ElfsightReviews from "@/components/ElfsightReviews";
import { useDeviceType } from "@/hooks/use-mobile";
import Testimonial from "@/components/Testimonial";
import { useDoctorGyne } from "@/hooks/useDoctorGyne";
import { useDoctorGyneMessage } from "@/hooks/useDoctorGyneMessage";
import { useGyneQualifications } from "@/hooks/useGyneQualifications";
import { useGyneExpertise, iconMap } from "@/hooks/useGyneExpertise";
import { useGyneAdvancedProcedures } from "@/hooks/useGyneAdvancedProcedures";
import { Loader2 } from "lucide-react";
import { useGynecologyProcedures } from "@/hooks/useGynecologyProcedures";

// Type for formatted description
interface FormattedDescription {
  introText: string;
  bulletPoints: string[];
  conclusionText: string;
}

const GynecologyDoctor = () => {
  const [selectedRating, setSelectedRating] = useState<number | null>(5);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const { isMobile, isTablet } = useDeviceType();
  const { doctor, isLoading: isDocLoading, error: docError } = useDoctorGyne();
  const { message, isLoading: isMsgLoading, error: msgError } = useDoctorGyneMessage();
  const { qualifications, isLoading: isQualLoading, error: qualError } = useGyneQualifications();
  const { expertise, isLoading: isExpLoading, error: expError } = useGyneExpertise();
  const { procedure, isLoading: isProcLoading, error: procError } = useGyneAdvancedProcedures();
  const { 
    procedures, 
    isLoading: isProcListLoading, 
    error: procListError,
    refreshData: refreshProcedures 
  } = useGynecologyProcedures();

  // Refresh procedures data when the component mounts
  useEffect(() => {
    refreshProcedures();
  }, []);

  // Use a fallback if there's an error or loading is still in progress
  const doctorData = doctor || {
    name: "Dr. Nisha Bhatnagar",
    title: "Senior Gynecologist & Fertility Specialist",
    description: "With over 15 years of experience, Dr. Nisha Bhatnagar is a renowned gynecologist specializing in women's health, fertility treatments, and reproductive medicine."
  };
  
  // Use a fallback for the message as well
  const messageData = message || {
    doctor_name: "Dr. Nisha Bhatnagar",
    heading: "A Message From Dr. Nisha Bhatnagar",
    message_1: "I believe that every woman deserves personalized care that addresses not just her physical health, but her emotional well-being too. My mission has always been to combine advanced medical techniques with compassion to support women through all life stages.",
    message_2: "Whether you're seeking general gynecological care, struggling with fertility, or navigating menopause, my team and I are committed to providing you with an exceptional experience and the best possible outcomes for your health.",
    signature: "- Dr. Nisha Bhatnagar"
  };

  // Use a fallback for the advanced procedures
  const procedureData = procedure || {
    title: "Advanced Procedures",
    subtitle: "Dr. Bhatnagar specializes in advanced gynecological procedures using cutting-edge technology",
    description: "Dr. Bhatnagar utilizes the latest technology in gynecology to provide precise diagnoses and effective treatments. Her clinic features state-of-the-art equipment including:\n• 4D Ultrasound imaging for detailed fetal assessment\n• Hysteroscopy for minimally invasive diagnosis and treatment\n• Advanced IVF laboratory equipment\n• Laparoscopic surgery tools for minimally invasive procedures\n• Colposcopy for detailed cervical examination\nThese advanced technologies enable Dr. Bhatnagar to provide the highest standard of care while minimizing discomfort and recovery time for her patients."
  };

  // Function to format description with bullet points
  const formatDescription = (description: string): FormattedDescription => {
    if (!description) {
      return {
        introText: "",
        bulletPoints: [],
        conclusionText: ""
      };
    }
    
    const parts = description.split(/•/g);
    // First part is usually intro text, rest are bullet points
    const introText = parts[0].trim();
    const bulletPoints = parts.slice(1).map(part => part.trim()).filter(part => part);
    
    // Extract the conclusion if it exists (typically the last paragraph after bullet points)
    let conclusionText = "";
    if (bulletPoints.length > 0) {
      const lastItem = bulletPoints[bulletPoints.length - 1];
      const conclusionSplit = lastItem.split('\n');
      if (conclusionSplit.length > 1) {
        // If the last bullet point contains a newline, the text after might be a conclusion
        const lastBullet = conclusionSplit[0];
        conclusionText = conclusionSplit.slice(1).join('\n').trim();
        bulletPoints[bulletPoints.length - 1] = lastBullet;
      }
    }
    
    return { introText, bulletPoints, conclusionText };
  };
  
  const formattedProcedure = formatDescription(procedureData.description);

  return <PageTransition>
      <div className="min-h-screen flex flex-col">
        <GynecologyNavbar />

        <main className="flex-grow pt-16 sm:pt-20">
          {/* Hero Section */}
          <section className="bg-gradient-gynecology text-white py-10 sm:py-12 md:py-20">
            <div className="container mx-auto px-4 max-w-6xl">
              {isDocLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-white" />
                    <p className="mt-4 text-white font-medium">Loading doctor information...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
                  <div data-aos="fade-right" data-aos-duration="900" className="order-2 md:order-1 text-center md:text-left">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6">
                      {doctorData.name}
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl mb-2 sm:mb-3 md:mb-4 text-white/90">
                      {doctorData.title}
                    </p>
                    <p className="text-sm sm:text-base mb-4 sm:mb-6 md:mb-8 text-white/80">
                      {doctorData.description}
                    </p>
                    <Link to="/gynecology/appointment" className="block w-full md:w-auto">
                      <Button className="mac-btn bg-white text-gynecology hover:bg-white/90 w-full md:w-auto px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base">
                        Book an Appointment with Dr. Bhatnagar
                      </Button>
                    </Link>
                  </div>
                  <div className="flex items-center justify-center rounded-full overflow-hidden border-4 border-white shadow-xl w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[300px] md:h-[300px] mx-auto transition-all duration-300 hover:shadow-2xl hover:scale-105 order-1 md:order-2 mb-6 md:mb-0" data-aos="fade-left" data-aos-duration="900">
                    <img 
                      src={doctor?.image_url || "/lovable-uploads/doctor-default.jpg"} 
                      alt={`Dr. ${doctor?.name || 'Nisha Bhatnagar'}`} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                      loading="eager"
                      onError={(e) => {
                        e.currentTarget.src = "/lovable-uploads/doctor-default.jpg";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Personal Message Section */}
          <section className="py-12 md:py-16 px-4 bg-gradient-to-br from-pink-50 to-purple-50">
            <div className="container mx-auto max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">
                <div className="md:col-span-5 order-2 md:order-1" data-aos="fade-right">
                  <div className="relative">
                    <div className="absolute -left-4 -top-4 text-gynecology opacity-20">
                      <Quote size={60} />
                    </div>
                    <Card className="bg-white/80 backdrop-blur-sm border border-gynecology/20 shadow-lg rounded-xl p-6 md:p-8 hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-0 space-y-4">
                        {isMsgLoading ? (
                          <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-gynecology" />
                          </div>
                        ) : (
                          <>
                            <h2 className="text-2xl md:text-3xl font-bold text-gynecology mb-4 md:mb-6 relative">{messageData.heading}</h2>
                            <p className="text-gray-700 text-base md:text-lg leading-relaxed italic">
                              "{messageData.message_1}"
                            </p>
                            <p className="text-gray-700 text-base md:text-lg leading-relaxed italic">
                              "{messageData.message_2}"
                            </p>
                            <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-200">
                              <p className="text-gynecology font-semibold text-right">{messageData.signature}</p>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <div className="md:col-span-7 order-1 md:order-2" data-aos="fade-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {isProcListLoading ? (
                      <div className="col-span-2 flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gynecology" />
                      </div>
                    ) : procedures.length >= 2 ? (
                      // Display first two procedures if available
                      procedures.slice(0, 2).map((procedure) => (
                        <div key={procedure.id} className="overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                          <div className="flex items-center justify-center w-full h-60 sm:h-64 md:h-80 overflow-hidden">
                            <img 
                              src={procedure.image_url} 
                              alt={procedure.alt_text}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                            />
                          </div>
                          <div className="p-3 md:p-4 bg-white">
                            <h3 className="font-bold text-base md:text-lg text-gynecology">{procedure.title}</h3>
                            <p className="text-gray-600 text-sm md:text-base">{procedure.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      // Fallback content in case there are not enough procedures
                      <>
                        <div className="overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                          <div className="flex items-center justify-center w-full h-60 sm:h-64 md:h-80 overflow-hidden">
                            <img alt={`${doctorData.name} with patient`} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" src="/lovable-uploads/88fc1285-14f9-49ca-94a9-c42489a1f862.jpg" />
                          </div>
                          <div className="p-3 md:p-4 bg-white">
                            <h3 className="font-bold text-base md:text-lg text-gynecology">Patient Consultation</h3>
                            <p className="text-gray-600 text-sm md:text-base">Providing personalized care and attention</p>
                          </div>
                        </div>
                        <div className="overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                          <div className="flex items-center justify-center w-full h-60 sm:h-64 md:h-80 overflow-hidden">
                            <img alt={`${doctorData.name} examining patient`} src="/lovable-uploads/f5cf3ae1-141c-4de3-910e-c93d2ec4cf0e.jpg" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                          </div>
                          <div className="p-3 md:p-4 bg-white">
                            <h3 className="font-bold text-base md:text-lg text-gynecology">Comprehensive Women's Care</h3>
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

          {/* Special Procedures Section */}
          {/* <section className="py-16 px-4 bg-gray-50">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12" data-aos="fade-up">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gynecology">
                  {procedureData.title}
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  {procedureData.subtitle}
                </p>
              </div>
              
              {isProcLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-12 w-12 animate-spin text-gynecology" />
                    <p className="mt-4 text-gray-600 font-medium">Loading advanced procedures...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                    <img 
                      src={procedure?.image_url || "/lovable-uploads/0716c0a3-c007-438d-8ef0-5fbe8d302c42.png"} 
                      alt="Advanced gynecological procedure" 
                      className="w-full h-72 object-cover transition-transform duration-500 hover:scale-110" 
                      onError={(e) => {
                        e.currentTarget.src = "/lovable-uploads/0716c0a3-c007-438d-8ef0-5fbe8d302c42.png";
                      }}
                    />
                    <div className="p-4 bg-white">
                      <h3 className="font-bold text-lg text-gynecology">State-of-the-art Ultrasound</h3>
                      <p className="text-gray-600">High-resolution imaging for accurate diagnosis and monitoring</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {formattedProcedure.introText && (
                      <p className="text-lg text-gray-700">
                        {formattedProcedure.introText}
                      </p>
                    )}
                    
                    {formattedProcedure.bulletPoints && formattedProcedure.bulletPoints.length > 0 && (
                      <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        {formattedProcedure.bulletPoints.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    )}
                    
                    {formattedProcedure.conclusionText && (
                      <p className="text-lg text-gray-700">
                        {formattedProcedure.conclusionText}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section> */}

          {/* Doctor Images Gallery Section */}
          <section className="py-16 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12" data-aos="fade-up" data-aos-duration="900">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gynecology">
                  Dr. Bhatnagar at Work
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Providing specialized women's healthcare with a compassionate approach
                </p>
              </div>
              
              {isProcListLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : procedures.length > 2 ? (
                // Display remaining procedures if there are more than 2
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {procedures.slice(2).map((procedure) => (
                    <div key={procedure.id} className="overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                      <div className="flex items-center justify-center w-full h-60 sm:h-64 md:h-80 overflow-hidden">
                        <img 
                          src={procedure.image_url} 
                          alt={procedure.alt_text}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                        />
                      </div>
                      <div className="p-4 bg-white">
                        <h3 className="font-bold text-lg text-gynecology">{procedure.title}</h3>
                        <p className="text-gray-600">{procedure.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Fallback content if no additional procedures
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="rounded-xl overflow-hidden shadow-xl" data-aos="fade-right">
                    <div className="flex items-center justify-center w-full h-60 sm:h-64 md:h-80 overflow-hidden">
                      <img 
                        alt="Advanced medical equipment" 
                        className="w-full h-full object-cover" 
                        src={procedure?.image_url || "/lovable-uploads/95d1a8c8-16b2-492c-9398-e078a1c517df.jpg"} 
                        onError={(e) => {
                          e.currentTarget.src = "/lovable-uploads/95d1a8c8-16b2-492c-9398-e078a1c517df.jpg";
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {isProcLoading ? (
                      <div className="col-span-2 flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gynecology" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formattedProcedure.introText && (
                          <p className="text-gray-700">
                            {formattedProcedure.introText}
                          </p>
                        )}
                        
                        {formattedProcedure.bulletPoints.length > 0 && (
                          <ul className="space-y-3 pl-1">
                            {formattedProcedure.bulletPoints.map((point, i) => (
                              <li key={i} className="flex items-start">
                                <span className="text-gynecology text-lg mr-2 mt-0.5">•</span>
                                <span className="text-gray-700">{point}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        {formattedProcedure.conclusionText && (
                          <p className="text-gray-700 pt-2">
                            {formattedProcedure.conclusionText}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Qualifications Section */}
          <section className="py-10 sm:py-12 md:py-16 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-8 sm:mb-10 md:mb-12" data-aos="fade-up" data-aos-duration="900">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 md:mb-6 text-gynecology">
                  Education & Qualifications
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                  Dr. Bhatnagar has trained at prestigious institutions and holds specialized certifications in gynecology and reproductive medicine.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                {isQualLoading ? (
                  <div className="col-span-2 flex justify-center items-center py-8 sm:py-10 md:py-12">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 animate-spin text-gynecology" />
                      <p className="mt-3 sm:mt-4 text-gray-600 font-medium text-sm sm:text-base">Loading qualifications...</p>
                    </div>
                  </div>
                ) : (
                  qualifications.map((qualification, index) => (
                    <div 
                      key={qualification.id}
                      className="glass-card rounded-xl p-4 sm:p-5 md:p-6 flex items-start gap-3 sm:gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300" 
                      data-aos="zoom-in" 
                      data-aos-delay={100 * (index + 1)}
                      data-aos-duration="700"
                    >
                      {qualification.type === 'degree' ? (
                        <School className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-gynecology shrink-0 mt-1" />
                      ) : (
                        <Award className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-gynecology shrink-0 mt-1" />
                      )}
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{qualification.degree_title}</h3>
                        <div className="text-gray-600 text-sm sm:text-base">
                          {qualification.institution.split('•').map((part, i) => (
                            <p key={i} className={i > 0 ? "mt-1 ml-2" : ""}>
                              {i > 0 ? <>• {part.trim()}</> : part.trim()}
                            </p>
                          ))}
                        </div>
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
              <div className="text-center mb-8 sm:mb-10 md:mb-12" data-aos="fade-up" data-aos-duration="900">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 md:mb-6 text-gynecology">
                  Areas of Expertise
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                  {doctorData.name} specializes in the following areas of women's health:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {isExpLoading ? (
                  <div className="col-span-1 sm:col-span-2 md:col-span-3 flex justify-center items-center py-8 sm:py-10 md:py-12">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 animate-spin text-gynecology" />
                      <p className="mt-3 sm:mt-4 text-gray-600 font-medium text-sm sm:text-base">Loading areas of expertise...</p>
                    </div>
                  </div>
                ) : (
                  expertise.map((item, index) => {
                    const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Star;
                    return (
                      <div 
                        key={item.id} 
                        className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        data-aos="zoom-in"
                        data-aos-delay={100 * (index + 1)}
                        data-aos-duration="700"
                      >
                        <div className="mb-3 sm:mb-4 text-gynecology">
                          <IconComponent className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gynecology">{item.title}</h3>
                        <p className="text-gray-600 text-sm sm:text-base">{item.description}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* Advanced Procedures Section */}
          <section className="py-10 sm:py-12 md:py-16 px-4 bg-gray-50">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-8 sm:mb-10 md:mb-12" data-aos="fade-up" data-aos-duration="900">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 md:mb-6 text-gynecology">
                  {procedureData.title}
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                  {procedureData.subtitle}
                </p>
              </div>
              
              {isProcLoading ? (
                <div className="flex justify-center items-center py-8 sm:py-10 md:py-12">
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 animate-spin text-gynecology" />
                    <p className="mt-3 sm:mt-4 text-gray-600 font-medium text-sm sm:text-base">Loading advanced procedures...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                    <img 
                      src={procedure?.image_url || "/lovable-uploads/0716c0a3-c007-438d-8ef0-5fbe8d302c42.png"} 
                      alt="Advanced gynecological procedure" 
                      className="w-full h-56 sm:h-64 md:h-72 object-cover transition-transform duration-500 hover:scale-110" 
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "/lovable-uploads/0716c0a3-c007-438d-8ef0-5fbe8d302c42.png";
                      }}
                    />
                    <div className="p-3 sm:p-4 bg-white">
                      <h3 className="font-bold text-base sm:text-lg text-gynecology">State-of-the-art Ultrasound</h3>
                      <p className="text-gray-600 text-sm sm:text-base">High-resolution imaging for accurate diagnosis and monitoring</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {formattedProcedure.introText && (
                      <p className="text-base sm:text-lg text-gray-700">
                        {formattedProcedure.introText}
                      </p>
                    )}
                    
                    {formattedProcedure.bulletPoints && formattedProcedure.bulletPoints.length > 0 && (
                      <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base">
                        {formattedProcedure.bulletPoints.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    )}
                    
                    {formattedProcedure.conclusionText && (
                      <p className="text-base sm:text-lg text-gray-700">
                        {formattedProcedure.conclusionText}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Reviews Section */}
          <section className="py-10 sm:py-12 md:py-16 px-4 bg-gray-50" id="reviews">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-6 sm:mb-8 md:mb-12" data-aos="fade-up" data-aos-duration="900">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 md:mb-6 text-gynecology">
                  Patient Reviews
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-4 sm:mb-6 md:mb-8">
                  Hear what our patients have to say about their experience with {doctorData.name}'s care
                </p>
                
                <div className="bg-white rounded-lg p-2 sm:p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300">
                  <ElfsightReviews appId="14b6d19f-9e0b-46aa-b1f5-ff4a7c1f8e5b" className="w-full" />
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-10 sm:py-12 md:py-16 px-4 bg-gradient-gynecology text-white">
            <div className="container mx-auto max-w-5xl text-center" data-aos="fade-up" data-aos-duration="900">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 md:mb-6">
              Schedule a Consultation with Dr. Bhatnagar              </h2>
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-7 md:mb-8 text-white/90 max-w-3xl mx-auto">
              Take the first step toward better health and fertility by booking an appointment with 
              Dr. Nisha Bhatnagar today.
              </p>
              <Link to="/gynecology/appointment" className="block w-full sm:w-auto inline-block mx-auto">
                <Button className="mac-btn px-4 py-2 sm:px-6 sm:py-4 md:px-8 md:py-6 text-base sm:text-lg bg-white text-gynecology hover:bg-white/90 w-full sm:w-auto">
                Book Your Appointment
                </Button>
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>;
};

export default GynecologyDoctor;
