import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import GynecologyNavbar from "@/components/GynecologyNavbar";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import { useDoctorTreatments } from "@/hooks/useDoctorTreatments";
import { useTestimonials } from "@/hooks/useTestimonials";
import { useFaqs } from "@/hooks/useFaqs";
import { Loader2 } from "lucide-react";
import Testimonial from "@/components/Testimonial";

const GynecologyHealth = () => {
  const { treatments, isLoading: isTreatmentsLoading } = useDoctorTreatments();
  const { testimonials, isLoading: isTestimonialsLoading } = useTestimonials();
  const { faqs, isLoading: isFaqsLoading } = useFaqs();
  const [activeTab, setActiveTab] = useState("ivf");

  useEffect(() => {
    if (treatments.length > 0) {
      setActiveTab(treatments[0].id);
    }
  }, [treatments]);

  return <PageTransition>
      <div className="min-h-screen flex flex-col">
        <GynecologyNavbar />

        <main className="flex-grow pt-20">
          {/* Hero Section */}
          <section className="bg-gradient-gynecology text-white py-12 sm:py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
              <div className="text-center max-w-4xl mx-auto" data-aos="fade-up" data-aos-duration="900">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                  Gynae & Obs Services and Treatments
                </h1>
                <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white/90 px-2">
                  Comprehensive gynecological and obstetric care with advanced treatments 
                  and personalized attention for every patient.
                </p>
              </div>
            </div>
          </section>

          {/* Health Services Tabs Section */}
          <section className="py-8 px-0 sm:px-4">
            <div className="container mx-auto max-w-6xl">
              {isTreatmentsLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-gynecology mb-4" />
                  <p className="text-gray-500 text-lg">Loading treatments...</p>
                </div>
              ) : treatments.length > 0 ? (
                <Tabs 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                  defaultValue={treatments[0]?.id || "ivf"}
                  className="w-full"
                >
                  <div className="text-center mb-6 sm:mb-8 md:mb-10" data-aos="fade-up" data-aos-duration="900">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-6 text-gynecology">
                      Gynecology Services &amp; Treatments
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
                      Comprehensive gynecological and fertility services to help you achieve your health goals.
                    </p>
                  </div>
                  <div className="flex items-center mb-4 sm:mb-6 md:mb-8 relative overflow-hidden">
                    {/* Mobile scroll indicator */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent sm:hidden"></div>
                    
                    <div
                      className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent mx-auto flex-grow py-2 px-3 sm:px-6 -mx-2 sm:mx-0"
                    >
                      <TabsList className="bg-gray-100 flex space-x-1 sm:space-x-2 p-1.5 h-auto w-max min-w-full justify-start sm:justify-center rounded-full shadow-sm">
                        {treatments.map(treatment => (
                          <TabsTrigger 
                            key={treatment.id} 
                            value={treatment.id}
                            className="px-4 sm:px-5 py-2.5 rounded-full data-[state=active]:bg-gynecology data-[state=active]:text-white data-[state=active]:shadow-md text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gynecology/50 transition-all"
                          >
                            {treatment.title.split('(')[0].trim()}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>
                  </div>

                  {treatments.map((treatment, index) => (
                    <TabsContent key={treatment.id} value={treatment.id} className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="order-2 md:order-1">
                          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gynecology">{treatment.title}</h2>
                          <p className="text-sm sm:text-base text-gray-700 mb-5">
                            {treatment.description}
                          </p>
                          
                          <div className="space-y-4 sm:space-y-6">
                            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
                              <div className="flex items-center mb-3">
                                <div className="flex justify-center items-center w-10 h-10 rounded-full bg-pink-100 text-gynecology mr-3">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                                    <path d="m9 12 2 2 4-4"></path>
                                  </svg>
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gynecology">
                                  {treatment.title.includes("IVF") 
                                    ? "Our IVF Services Include:" 
                                    : treatment.title.includes("IUI") 
                                      ? "When IUI is Recommended:"
                                      : treatment.title.includes("Hysteroscopy")
                                        ? "Common Conditions Treated:"
                                        : treatment.title.includes("Laparoscopic")
                                          ? "Our Laparoscopic Services:"
                                          : "We Specialize in Managing:"}
                                </h3>
                              </div>
                              
                              <ul className="list-disc pl-5 sm:pl-6 space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base">
                                {treatment.bullet_points.map((point, index) => (
                                  <li key={index}>{point.replace('• ', '')}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          <div className="mt-6">
                            <Link to="/gynecology/appointment" className="w-full sm:w-auto inline-block">
                              <Button className="mac-btn gynecology-btn w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3">
                                {treatment.button_text}
                              </Button>
                            </Link>
                          </div>
                        </div>
                        
                        <div className="flex justify-center items-center order-1 md:order-2 mb-6 md:mb-0">
                          <div className="flex items-center justify-center h-80 w-full">
                            <div className="rounded-xl overflow-hidden shadow-lg w-full max-w-md h-80">
                              <img 
                                alt={`${treatment.title} Treatment`} 
                                className="w-full h-full object-cover" 
                                src={treatment.image_url || getImageForTreatment(treatment.title)}
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.src = getImageForTreatment(treatment.title);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                // Fallback to static content - preserved from original file
                <Tabs defaultValue="ivf" className="w-full">
                  <div className="text-center mb-6 sm:mb-8 md:mb-10" data-aos="fade-up" data-aos-duration="900">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-6 text-gynecology">
                      Gynecology Services &amp; Treatments
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
                      Comprehensive gynecological and fertility services to help you achieve your health goals.
                    </p>
                  </div>
                  
                  <div className="flex items-center mb-4 sm:mb-6 md:mb-8 relative overflow-hidden">
                    {/* Mobile scroll indicator */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent sm:hidden"></div>
                    
                    <div
                      className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent mx-auto flex-grow py-2 px-3 sm:px-6 -mx-2 sm:mx-0"
                    >
                      <TabsList className="bg-gray-100 flex space-x-1 sm:space-x-2 p-1.5 h-auto w-max min-w-full justify-start sm:justify-center rounded-full shadow-sm">
                        {[
                          { id: "ivf", label: "IVF" },
                          { id: "iui", label: "IUI" },
                          { id: "hysteroscopy", label: "Hysteroscopy" },
                          { id: "laparoscopy", label: "Laparoscopy" },
                          { id: "pregnancy", label: "Pregnancy" }
                        ].map((item) => (
                          <TabsTrigger 
                            key={item.id}
                            value={item.id} 
                            className="px-4 sm:px-5 py-2.5 rounded-full data-[state=active]:bg-gynecology data-[state=active]:text-white data-[state=active]:shadow-md text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gynecology/50 transition-all"
                          >
                            {item.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>
                  </div>

                  <TabsContent value="ivf" className="mt-6 sm:mt-8">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="w-full h-1 bg-gynecology"></div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        {/* Image Section - Right on desktop, top on mobile */}
                        <div className="flex justify-center items-center order-1 md:order-2 mb-6 md:mb-0">
                          <div className="flex items-center justify-center h-80 w-full">
                            <div className="rounded-xl overflow-hidden shadow-lg w-full max-w-md h-80">
                              <img 
                                alt="IVF Treatment" 
                                className="w-full h-full object-cover" 
                                src="/lovable-uploads/519353d5-cc84-4d60-b215-a3bcf0f6db39.jpg"
                                loading="lazy" 
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Content Section - Left on desktop, bottom on mobile */}
                        <div className="order-2 md:order-1 p-5 sm:p-6 md:p-8">
                          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gynecology">In Vitro Fertilization (IVF)</h2>
                          <p className="text-sm sm:text-base text-gray-700 mb-5">
                            IVF is an advanced fertility treatment that helps couples achieve pregnancy 
                            when other methods have been unsuccessful. Our state-of-the-art facility 
                            provides comprehensive IVF care with high success rates.
                          </p>
                          
                          <div className="mb-6">
                            <div className="flex items-center mb-3">
                              <div className="flex justify-center items-center w-8 h-8 rounded-full bg-pink-100 text-gynecology mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                                  <path d="m9 12 2 2 4-4"></path>
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold text-gynecology">Our IVF Services Include:</h3>
                            </div>
                            
                            <ul className="list-disc pl-10 space-y-1 text-gray-700 text-sm sm:text-base">
                              <li>Controlled Ovarian Stimulation</li>
                              <li>Egg Retrieval</li>
                              <li>Sperm Processing</li>
                              <li>Embryo Culture and Transfer</li>
                              <li>Blastocyst Culture</li>
                              <li>Embryo Freezing</li>
                              <li>Genetic Testing Options</li>
                            </ul>
                          </div>
                          
                          <div>
                            <Link to="/gynecology/appointment" className="w-full sm:w-auto inline-block">
                              <Button className="mac-btn gynecology-btn w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3">
                                Schedule IVF Consultation
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  
                  <TabsContent value="hysteroscopy" className="mt-6 sm:mt-8">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="w-full h-1 bg-gynecology"></div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        {/* Image Section - Right on desktop, top on mobile */}
                        <div className="flex justify-center items-center order-1 md:order-2 mb-6 md:mb-0">
                          <div className="flex items-center justify-center h-80 w-full">
                            <div className="rounded-xl overflow-hidden shadow-lg w-full max-w-md h-80">
                              <img 
                                alt="Hysteroscopy Procedure" 
                                className="w-full h-full object-cover" 
                                src="/lovable-uploads/bf3365de-daab-4d50-a8ca-410647e0995b.jpg"
                                loading="lazy" 
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Content Section - Left on desktop, bottom on mobile */}
                        <div className="order-2 md:order-1 p-5 sm:p-6 md:p-8">
                          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gynecology">Hysteroscopy</h2>
                          <p className="text-sm sm:text-base text-gray-700 mb-5">
                            Hysteroscopy is a minimally invasive procedure that allows
                            direct visualization of the uterine cavity. It's both diagnostic
                            and therapeutic, enabling us to identify and treat various
                            uterine conditions.
                          </p>
                          
                          <div className="mb-6">
                            <div className="flex items-center mb-3">
                              <div className="flex justify-center items-center w-8 h-8 rounded-full bg-pink-100 text-gynecology mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                                  <path d="m9 12 2 2 4-4"></path>
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold text-gynecology">Common Conditions Treated:</h3>
                            </div>
                            
                            <ul className="list-disc pl-10 space-y-1 text-gray-700 text-sm sm:text-base">
                              <li>Uterine Polyps</li>
                              <li>Submucous Fibroids</li>
                              <li>Uterine Septum</li>
                              <li>Adhesions (Ashermans Syndrome)</li>
                              <li>Abnormal Uterine Bleeding</li>
                              <li>Recurrent Pregnancy Loss</li>
                            </ul>
                          </div>
                          
                          <div>
                            <Link to="/gynecology/appointment" className="w-full sm:w-auto inline-block">
                              <Button className="mac-btn gynecology-btn w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3">
                                Schedule Consultation
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="iui" className="mt-6 sm:mt-8">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="w-full h-1 bg-gynecology"></div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        {/* Image Section - Right on desktop, top on mobile */}
                        <div className="flex justify-center items-center order-1 md:order-2 mb-6 md:mb-0">
                          <div className="flex items-center justify-center h-80 w-full">
                            <div className="rounded-xl overflow-hidden shadow-lg w-full max-w-md h-80">
                              <img 
                                alt="IUI Treatment" 
                                className="w-full h-full object-cover" 
                                src="/lovable-uploads/47a70484-57b8-4968-839f-3f81f98e326f.jpg"
                                loading="lazy" 
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Content Section - Left on desktop, bottom on mobile */}
                        <div className="order-2 md:order-1 p-5 sm:p-6 md:p-8">
                          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gynecology">Intrauterine Insemination (IUI)</h2>
                          <p className="text-sm sm:text-base text-gray-700 mb-5">
                            IUI is a fertility treatment that involves placing sperm directly into a woman's uterus
                            to facilitate fertilization. The goal is to increase the number of sperm that reach the
                            fallopian tubes and subsequently increase the chance of fertilization.
                          </p>
                          
                          <div className="mb-6">
                            <div className="flex items-center mb-3">
                              <div className="flex justify-center items-center w-8 h-8 rounded-full bg-pink-100 text-gynecology mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                                  <path d="m9 12 2 2 4-4"></path>
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold text-gynecology">When IUI is Recommended:</h3>
                            </div>
                            
                            <ul className="list-disc pl-10 space-y-1 text-gray-700 text-sm sm:text-base">
                              <li>Unexplained Infertility</li>
                              <li>Mild Male Factor Infertility</li>
                              <li>Cervical Factor Infertility</li>
                              <li>Mild Endometriosis</li>
                              <li>Ovulatory Disorders</li>
                              <li>Use of Donor Sperm</li>
                            </ul>
                          </div>
                          
                          <div>
                            <Link to="/gynecology/appointment" className="w-full sm:w-auto inline-block">
                              <Button className="mac-btn gynecology-btn w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3">
                                Schedule IUI Consultation
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Other static tabs (laparoscopy, pregnancy) would follow the same pattern */}
                </Tabs>
              )}
            </div>
          </section>

          {/* Success Stories Section */}
          <section className="py-12 sm:py-16 px-4 sm:px-6 bg-gray-50">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-8 sm:mb-10" data-aos="fade-up" data-aos-duration="900">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gynecology">
                  Success Stories
                </h2>
                <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-2">
                  Read what our patients have to say about their experience with Dr. Nisha Bhatnagar
                </p>
              </div>
              
              {isTestimonialsLoading ? (
                <div className="flex justify-center items-center py-12 sm:py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-gynecology" />
                </div>
              ) : testimonials.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8" data-aos="fade-up" data-aos-delay="200">
                  {testimonials.map((testimonial, index) => (
                    <Testimonial 
                      key={testimonial.id}
                      initial={testimonial.initials || testimonial.author.charAt(0)} 
                      name={testimonial.author} 
                      role="Patient" 
                      content={testimonial.quote}
                      bgColor="bg-pink-100"
                      textColor="text-pink-700"
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-12 sm:py-16 px-4 sm:px-6">
            <div className="container mx-auto max-w-4xl">
              <div className="text-center mb-8 sm:mb-12" data-aos="fade-up" data-aos-duration="900">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-6 text-gynecology">
                  Frequently Asked Questions
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
                  Find answers to common questions about women's health concerns and treatments.
                </p>
              </div>

              {isFaqsLoading ? (
                <div className="flex justify-center items-center py-10 sm:py-16">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-gynecology" />
                </div>
              ) : faqs.length > 0 ? (
                <Accordion type="single" collapsible className="w-full" data-aos="fade-up" data-aos-duration="900">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={faq.id} value={`item-${index + 1}`}>
                      <AccordionTrigger className="text-left text-sm sm:text-base font-medium">{faq.question}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm sm:text-base text-gray-700">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                // Fallback static FAQs from original file
                <Accordion type="single" collapsible className="w-full" data-aos="fade-up" data-aos-duration="900">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-left">When should I see a gynecologist?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-700">
                        Women should begin seeing a gynecologist for annual check-ups around age 21, or earlier 
                        if they become sexually active. You should also consult a gynecologist if you experience 
                        abnormal symptoms such as irregular periods, pelvic pain, unusual discharge, or if you're 
                        planning to become pregnant.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-left">How long does it usually take to get pregnant?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-700">
                        For most couples, it takes about 6-12 months of active trying to conceive. However, this 
                        varies widely based on factors such as age, overall health, and frequency of intercourse. 
                        If you're under 35 and have been trying for over a year without success, or over 35 and 
                        have been trying for 6 months, we recommend scheduling a fertility consultation.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-left">What are the success rates for IVF treatment?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-700">
                        IVF success rates vary based on multiple factors, primarily the woman's age. For women under 
                        35, our clinic has a success rate of approximately 45-50% per embryo transfer. The success rate 
                        gradually decreases with age. During your consultation, we'll provide personalized success 
                        rate estimates based on your specific situation.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-left">How is PCOS diagnosed and treated?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-700">
                        PCOS is diagnosed through a combination of medical history, physical examination, blood tests 
                        to check hormone levels, and ultrasound to examine the ovaries. Treatment depends on your 
                        specific symptoms and whether you're trying to conceive. It may include lifestyle changes, 
                        medications to regulate periods and reduce symptoms, and fertility treatments if needed.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger className="text-left">What should I expect during my first gynecology appointment?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-700">
                        Your first appointment will typically include a detailed discussion of your medical history 
                        and any concerns you may have. Depending on your age and needs, it may also include a physical 
                        examination, a breast exam, and possibly a pelvic exam. We strive to make every patient feel 
                        comfortable and informed throughout the process.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          </section>

          {/* Call to Action */}
          <section className="py-12 sm:py-16 px-4 sm:px-6 bg-gradient-gynecology text-white">
            <div className="container mx-auto max-w-5xl text-center" data-aos="fade-up" data-aos-duration="900">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Take Control of Your Health Today 
              </h2>
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white/90 max-w-3xl mx-auto px-2">
              Whether you're seeking general gynecological care, struggling with fertility, or 
              experiencing specific women's health issues, we're here to help.
              </p>
              <Link to="/gynecology/appointment" className="w-full sm:w-auto inline-block">
                <Button className="mac-btn px-6 sm:px-8 py-3 sm:py-4 md:py-6 text-base sm:text-lg bg-white text-gynecology hover:bg-white/90 w-full sm:w-auto">
                Schedule Your Consultation
                </Button>
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>;
};

// Helper function to get images based on treatment type (kept from current file for fallbacks)
const getImageForTreatment = (title: string) => {
  if (title.includes("IVF")) {
    return "/lovable-uploads/519353d5-cc84-4d60-b215-a3bcf0f6db39.jpg";
  } else if (title.includes("IUI")) {
    return "/lovable-uploads/47a70484-57b8-4968-839f-3f81f98e326f.jpg";
  } else if (title.includes("Hysteroscopy")) {
    return "/lovable-uploads/bf3365de-daab-4d50-a8ca-410647e0995b.jpg";
  } else if (title.includes("Laparoscopic")) {
    return "/lovable-uploads/bc65b119-7b9f-48c1-8ff3-16aee3475f1c.jpg";
  } else if (title.includes("High Risk") || title.includes("Pregnancy")) {
    return "/lovable-uploads/c9f8cc79-a746-4d28-bcc9-eb05cac776e2.jpg";
  }
  // Default image
  return "/lovable-uploads/519353d5-cc84-4d60-b215-a3bcf0f6db39.jpg";
};

export default GynecologyHealth;
