import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EyeCareNavbar from "@/components/EyeCareNavbar";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import { useEyeCareTabServicesLatest } from '@/hooks/useEyeCareTabServicesLatest';
import { useEffect, useState, useRef } from "react";
import EyeTestimonialsSection from '@/components/EyeTestimonialsSection'; 
import { useEyeTestimonials } from '@/hooks/useEyeTestimonials';
import Testimonial from "@/components/Testimonial";

import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const EyeCareConditions: React.FC = () => {
  // Use our new hook to get the services data
  const { sections, isLoading, activeSection, setActiveSection } = useEyeCareTabServicesLatest();
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  
  // For tabs functionality on mobile
  const tabsListRef = useRef<HTMLDivElement>(null);
  
  // Removed scrolling arrows for cleaner mobile UI
  
  // Set active section when data loads
  useEffect(() => {
    if (!isLoading && sections.length > 0) {
      // Set the first section as active if no active section is set
      if (!activeSectionId) {
        setActiveSectionId(sections[0].id);
        setActiveSection(sections[0].id);
      }
    }
  }, [sections, isLoading, activeSectionId, setActiveSection]);
  
  // Update active section id when activeSection changes
  useEffect(() => {
    if (activeSection) {
      setActiveSectionId(activeSection);
    }
  }, [activeSection]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log("Image failed to load:", e.currentTarget.src);
    e.currentTarget.src = "/lovable-uploads/default-image.png";
  };

    const { testimonials, isLoading: testimonialsLoading } = useEyeTestimonials();

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <EyeCareNavbar />
        <main className="flex-grow pt-16 sm:pt-20">
          {/* Hero Section */}
          <section className="bg-gradient-eyecare text-white py-10 sm:py-16 md:py-24">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="text-center max-w-4xl mx-auto" data-aos="fade-up" data-aos-duration="900">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                  Eye Care Services & Treatments
                </h1>
                <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-8 text-white/90 px-2">
                  Comprehensive ophthalmology services, clinical eye care, and advanced surgical procedures designed to maintain and improve your vision.
                </p>
              </div>
            </div>
          </section>

          {/* Services Tabs Section */}
          <section className="py-8 px-0 sm:px-4">
            <div className="container mx-auto max-w-6xl">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-eyecare mb-4" />
                  <p className="text-gray-500 text-lg">Loading services...</p>
                </div>
              ) : sections.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-500 text-lg">No services found. Please check back later.</p>
                </div>
              ) : (
                <Tabs
                  defaultValue={activeSectionId || sections[0]?.id}
                  onValueChange={setActiveSection}
                  className="w-full"
                >
                  <div className="text-center mb-6 sm:mb-8 md:mb-10" data-aos="fade-up" data-aos-duration="900">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-6 text-eyecare">
                      Eye Care Services
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
                      Comprehensive eye care services to help maintain and improve your vision health.
                    </p>
                  </div>
                  <div className="flex items-center mb-4 sm:mb-6 md:mb-8 relative overflow-hidden">
                    {/* Mobile scroll indicator */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent sm:hidden"></div>
                    
                    <div
                      ref={tabsListRef}
                      className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent mx-auto flex-grow py-2 px-3 sm:px-6 -mx-2 sm:mx-0"
                    >
                      <TabsList className="bg-gray-100 flex space-x-1 sm:space-x-2 p-1.5 h-auto w-max min-w-full justify-start sm:justify-center rounded-full shadow-sm">
                        {sections.map((section) => (
                          <TabsTrigger
                            key={section.id}
                            value={section.id}
                            className="px-4 sm:px-5 py-2.5 rounded-full data-[state=active]:bg-eyecare data-[state=active]:text-white data-[state=active]:shadow-md text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eyecare/50 transition-all"
                          >
                            {section.title}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>
                  </div>

                {/* Dynamic Content Tabs */}
                {sections.map(section => (
                  <TabsContent key={section.id} value={section.id} className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="order-2 md:order-1">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-eyecare">{section.title}</h2>
                        <div className="space-y-4 sm:space-y-6">
                          {section.subsections && section.subsections.map(subsection => (
                            <div key={subsection.id} className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
                              <div className="flex items-center mb-3">
                                <div className="flex justify-center items-center w-10 h-10 rounded-full bg-blue-100 text-eyecare mr-3">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                                    <path d="m9 12 2 2 4-4"></path>
                                  </svg>
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold">{subsection.title}</h3>
                              </div>
                              {subsection.description && (
                                <p className="text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base ml-13">{subsection.description}</p>
                              )}
                              {subsection.items && subsection.items.length > 0 && (
                                <ul className="list-disc pl-5 sm:pl-6 space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base">
                                  {subsection.items.map(item => (
                                    <li key={item.id}>
                                      {item.label && (
                                        <span className="font-medium">{item.label}{item.description ? ':' : ''}</span>
                                      )}
                                      {item.description && (
                                        <p>{item.description}</p>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      {section.image_url && (
                        <div className="flex justify-center items-center order-1 md:order-2 mb-6 md:mb-0">
                          <div className="flex items-center justify-center h-80 w-full">
                            <div className="rounded-xl overflow-hidden shadow-lg w-full max-w-md h-80">
                              <img 
                                src={section.image_url} 
                                alt={`${section.title} image`} 
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={handleImageError}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
              )}
            </div>
          </section>



          {/* Success Stories Section */}
          {/* <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-emerald-50">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-10" data-aos="fade-up">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-6 text-eyecare">
                  Success Stories
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
                  Hear what our patients have to say about their experiences with Dr. Lehri
                </p>
              </div>
              
              <EyeTestimonialsSection
                title=""
                description=""
                bgColor="bg-transparent"
              />
            </div>
          </section> */}
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
                          ) : null}
                        </div>
                      </div>
                    </section>
        </main>
          {/* Call to Action Section */}
          <section className="py-10 sm:py-16 px-4 bg-gradient-eyecare text-white">
            <div className="container mx-auto max-w-5xl text-center" data-aos="fade-up" data-aos-duration="900">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                Ready to Take Care of Your Eye Health?
              </h2>
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white/90 max-w-3xl mx-auto px-2">
                Schedule a consultation with Dr. Sanjeev Lehri to discuss your symptoms 
                and explore treatment options tailored to your needs.
              </p>
              <Link to="/eyecare/appointment">
                <Button className="mac-btn px-6 py-4 sm:px-8 sm:py-6 text-base sm:text-lg bg-white text-eyecare hover:bg-white/90 w-full sm:w-auto">
                  Book Your Consultation
                </Button>
              </Link>
            </div>
          </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default EyeCareConditions;
