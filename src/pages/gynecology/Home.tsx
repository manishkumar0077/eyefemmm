import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import GynecologyNavbar from "@/components/GynecologyNavbar";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import { useGynecologyServices } from "@/hooks/useGynecologyServices";
import { useFertilityTreatments } from "@/hooks/useFertilityTreatments";
import { useDoctorWhyChoose } from "@/hooks/useDoctorWhyChoose";
import { useServiceHighlights } from '@/hooks/useServiceHighlights';

const GynecologyHome = () => {
  const { services, isLoading } = useGynecologyServices();
  const { fertilityData, isLoading: isFertilityLoading } = useFertilityTreatments();
  const { choices, isLoading: isChoicesLoading } = useDoctorWhyChoose();
  const { highlights, isLoading: highlightsLoading } = useServiceHighlights();
  
  // Get the hero section data (assuming the first highlight is used for the hero)
  const heroData = highlights?.length > 0 ? highlights[0] : null;

  return <PageTransition>
      <div className="min-h-screen flex flex-col">
        <GynecologyNavbar />

        <main className="flex-grow pt-16">
          {/* Hero Section */}
          <section className="relative bg-gradient-gynecology text-white py-12 sm:py-16 md:py-24 lg:py-32">
            <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div data-aos="fade-right" data-aos-duration="900" className="order-2 md:order-1 text-center md:text-left">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
                    {heroData?.title || 'Women\'s Health & Fertility Care'}
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white/90 max-w-xl mx-auto md:mx-0">
                    {heroData?.description || 'Comprehensive gynecological and fertility services with personalized care by Dr. Nisha Bhatnagar.'}
                  </p>
                  <div className="flex flex-wrap gap-3 sm:gap-4 justify-center md:justify-start">
                    <Link to="/gynecology/appointment" className="w-full sm:w-auto">
                      <Button className="mac-btn bg-white text-gynecology hover:bg-white/90 w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3">
                        Book an Appointment
                      </Button>
                    </Link>
                    <Link to="/gynecology/health" className="w-full sm:w-auto">
                      <Button variant="outline" className="mac-btn bg-transparent border-white text-white hover:bg-white/10 w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3">
                        Women's Health Issues
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-xl mx-auto md:mx-0 max-w-sm sm:max-w-md md:max-w-full order-1 md:order-2 mb-6 md:mb-0" data-aos="fade-left" data-aos-duration="900">
                  <img alt="Women's Healthcare" className="w-full h-64 sm:h-80 md:h-full object-cover" src={heroData?.image_url || "https://www.twiniversity.com/wp-content/uploads/2018/07/featured-1024x1024.png"} loading="eager" />
                </div>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gray-50">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-10 sm:mb-12 md:mb-16" data-aos="fade-up" data-aos-duration="900">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                  Our Gynecology Services
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
                  We offer comprehensive care for all aspects of women's health, 
                  from routine check-ups to specialized fertility treatments.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {isLoading ? (
                  // Display loading placeholders
                  [...Array(6)].map((_, index) => (
                    <div key={index} className="glass-card rounded-xl p-5 sm:p-6 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
                      <div className="h-16 bg-gray-100 rounded"></div>
                    </div>
                  ))
                ) : services.length > 0 ? (
                  services.map((service, index) => (
                    <div 
                      key={service.id} 
                      className="glass-card rounded-xl p-5 sm:p-6 hover:shadow-lg transition-shadow h-full" 
                      data-aos="zoom-in" 
                      data-aos-delay={100 * (index + 1)}
                      data-aos-duration="700"
                    >
                      <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gynecology">{service.title}</h3>
                      <p className="text-sm sm:text-base text-gray-600">{service.description}</p>
                    </div>
                  ))
                ) : (
                  // Fallback data if no services are available
                  [{
                    title: "General Gynecology",
                    description: "Comprehensive care for all aspects of women's health, including routine check-ups and preventive care.",
                    delay: 100
                  }, {
                    title: "Fertility Treatments",
                    description: "Advanced fertility services including IVF, IUI, and other assisted reproductive technologies.",
                    delay: 200
                  }, {
                    title: "Obstetric Care",
                    description: "Complete prenatal, delivery, and postnatal care for expectant mothers.",
                    delay: 300
                  }, {
                    title: "Menopause Management",
                    description: "Specialized care to help women navigate the physical and emotional changes of menopause.",
                    delay: 400
                  }, {
                    title: "Gynecological Surgery",
                    description: "Minimally invasive surgical procedures for various gynecological conditions.",
                    delay: 500
                  }, {
                    title: "PCOS Treatment",
                    description: "Comprehensive management of Polycystic Ovary Syndrome and related hormonal disorders.",
                    delay: 600
                  }].map((item, index) => (
                    <div key={index} className="glass-card rounded-xl p-6 hover:shadow-lg transition-shadow" data-aos="zoom-in" data-aos-delay={item.delay} data-aos-duration="700">
                      <h3 className="text-xl font-bold mb-3 text-gynecology">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="text-center mt-12" data-aos="fade-up" data-aos-duration="900">
                <Link to="/gynecology/health">
                  <Button className="mac-btn gynecology-btn group">
                    Explore all women's health services
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Fertility Section */}
          <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
            <div className="container mx-auto max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="rounded-2xl overflow-hidden shadow-xl mx-auto md:mx-0 max-w-sm sm:max-w-md md:max-w-full mb-6 md:mb-0 order-1 md:order-1" data-aos="fade-right" data-aos-duration="900">
                  <img 
                    src={fertilityData?.image_url || "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"} 
                    alt="Fertility Treatment" 
                    className="w-full h-64 sm:h-80 md:h-auto object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80";
                    }} 
                  />
                </div>
                
                <div data-aos="fade-left" data-aos-duration="900" className="order-2 md:order-2 text-center md:text-left">
                  {isFertilityLoading ? (
                    // Loading state
                    <div className="space-y-4">
                      <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto md:mx-0 animate-pulse"></div>
                      <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
                      <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-6 bg-gray-100 rounded animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-6 text-gynecology">
                        {fertilityData?.title || 'Advanced Fertility Treatments'}
                  </h2>
                  <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-8 max-w-xl mx-auto md:mx-0">
                        {fertilityData?.description || 'Our fertility center offers state-of-the-art reproductive technologies and personalized care to help you achieve your family-building goals.'}
                  </p>
                  
                  <div className="space-y-3 sm:space-y-4 text-left max-w-lg mx-auto md:mx-0">
                        {(fertilityData?.treatments || [
                          "In Vitro Fertilization (IVF)", 
                          "Intrauterine Insemination (IUI)", 
                          "Egg and Sperm Freezing", 
                          "Preimplantation Genetic Testing", 
                          "Donor Egg and Sperm Programs"
                        ]).map((item, index) => (
                          <div key={index} className="flex items-start gap-2 sm:gap-3">
                        <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-gynecology shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base text-gray-700">{item}</span>
                          </div>
                        ))}
                  </div>
                    </>
                  )}
                  
                  <div className="mt-6 sm:mt-8">
                    <Link to="/gynecology/health" className="w-full sm:w-auto inline-block">
                      <Button className="mac-btn gynecology-btn w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3">
                        Learn More About Fertility Treatments
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Us Section */}
          <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gray-50">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-10 sm:mb-12 md:mb-16" data-aos="fade-up" data-aos-duration="900">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-gynecology">
                  Why Choose Dr. Nisha Bhatnagar?
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
                  Dr. Bhatnagar offers personalized care based on the latest 
                  medical advancements in women's health and fertility.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {isChoicesLoading ? (
                  // Loading state for benefits
                  [...Array(3)].map((_, index) => (
                    <div key={index} className="glass-card rounded-xl p-5 sm:p-6 animate-pulse">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full mx-auto mb-3 sm:mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded mb-3 w-3/4 mx-auto"></div>
                      <div className="h-16 bg-gray-100 rounded"></div>
                  </div>
                  ))
                ) : choices.length > 0 ? (
                  // Dynamic data from the hook
                  choices.map((choice, index) => (
                    <div 
                      key={choice.id} 
                      className="glass-card rounded-xl p-5 sm:p-6 text-center h-full" 
                      data-aos="zoom-in" 
                      data-aos-delay={(index + 1) * 100}
                      data-aos-duration="700"
                    >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gynecology rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        {getIconForChoice(index)}
                  </div>
                      <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{choice.title}</h3>
                      <p className="text-sm sm:text-base text-gray-600">{choice.description}</p>
                </div>
                  ))
                ) : (
                  // Fallback data
                  [
                    {
                      title: "Expert Care",
                      description: "With over 15 years of experience, Dr. Bhatnagar provides expert gynecological and fertility care based on the latest medical research."
                    },
                    {
                      title: "Personalized Approach",
                      description: "Each patient receives a customized treatment plan tailored to their specific health needs and family-building goals."
                    },
                    {
                      title: "Advanced Technology",
                      description: "Our clinic features state-of-the-art technology and the latest advancements in women's healthcare and fertility treatments."
                    }
                  ].map((item, index) => (
                    <div className="glass-card rounded-xl p-6 text-center" data-aos="zoom-in" data-aos-delay={(index + 1) * 100} data-aos-duration="700" key={index}>
                  <div className="w-16 h-16 bg-gynecology rounded-full flex items-center justify-center mx-auto mb-4">
                        {getIconForChoice(index)}
                  </div>
                      <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                </div>
                  ))
                )}
              </div>
              
              <div className="text-center mt-8 sm:mt-12" data-aos="fade-up" data-aos-duration="900">
                <Link to="/gynecology/doctor" className="w-full sm:w-auto inline-block">
                  <Button className="mac-btn gynecology-btn w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3">
                    Learn More About Dr. Bhatnagar
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-12 sm:py-16 px-4 sm:px-6 bg-gradient-gynecology text-white">
            <div className="container mx-auto max-w-5xl text-center" data-aos="fade-up" data-aos-duration="900">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                Take the First Step Towards Better Health
              </h2>
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white/90 max-w-3xl mx-auto px-2">
                Schedule an appointment with Dr. Nisha Bhatnagar today and begin 
                your journey to improved health and wellness.
              </p>
              <Link to="/gynecology/appointment" className="w-full sm:w-auto inline-block">
                <Button className="mac-btn px-6 sm:px-8 py-3 sm:py-4 md:py-6 text-base sm:text-lg bg-white text-gynecology hover:bg-white/90 w-full sm:w-auto">
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

// Helper function to get icons for the choices
const getIconForChoice = (index: number) => {
  const icons = [
    // Hospital/Building icon
    <svg key="hospital" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>,
    // Shield/Security icon
    <svg key="shield" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>,
    // Lab flask/technology icon
    <svg key="flask" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ];
  
  return icons[index % icons.length];
};

export default GynecologyHome;