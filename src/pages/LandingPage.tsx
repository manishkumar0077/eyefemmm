import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Shield, Beaker, Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";
import HeroShape from "@/components/HeroShape";
import Footer from "@/components/Footer";
import { usePageContent } from "@/hooks/usePageContent";
import { useServiceCards } from "@/hooks/useServiceCards";
import { useWhyChooseUs } from "@/hooks/useWhyChooseUs";
import { useState, useEffect } from "react";

const LandingPage = () => {
  // For mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // For responsive behaviors based on screen size
  const [isMobile, setIsMobile] = useState(false);

  // Update mobile status based on window size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Handle mobile menu close when a link is clicked
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Fetch dynamic content for the hero section
  const { content, isLoading } = usePageContent('home_hero_section');
  
  // Default content as fallback
  const defaultHeading = "Specialized Healthcare for Your Unique Needs";
  const defaultDescription = "Experience world-class care in Eye Health and Women's Health with our team of specialists at Eyefem Healthcare.";

  // Add this hook call
  const { cards: serviceCards, isLoading: serviceCardsLoading } = useServiceCards();

  // Add this hook call near your other hooks
  const { 
    sectionContent: whyChooseUsSection, 
    benefitCards, 
    isLoading: whyChooseUsLoading 
  } = useWhyChooseUs();

  return <PageTransition>
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <div className="h-14 w-auto flex items-center">
              <img 
                src="/lovable-uploads/6c43213d-6d60-4790-b8ff-d662e634ee59.png" 
                alt="EyeFem Clinic" 
                className="h-14 w-auto object-contain" 
              />
            </div>
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
            <Link to="/" className="transition-colors text-white/0">Home</Link>
            <Link to="/gallery" className="text-gray-800 hover:text-primary transition-colors">Gallery</Link>
            <Link to="/specialties" className="text-gray-800 hover:text-primary transition-colors">Our Specialties</Link>
            <Link to="/eyecare" className="text-gray-800 hover:text-primary transition-colors">Eye Care</Link>
            <Link to="/gynecology" className="text-gray-800 hover:text-primary transition-colors">Gynecology</Link>
            <Link to="/specialties">
              <Button className="rounded-full px-5 py-2 bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-md py-4 px-6 absolute w-full">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-800 hover:text-primary transition-colors py-2" onClick={closeMobileMenu}>
                Home
              </Link>
              <Link to="/gallery" className="text-gray-800 hover:text-primary transition-colors py-2" onClick={closeMobileMenu}>
                Gallery
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
              <Link to="/specialties" onClick={closeMobileMenu}>
                <Button className="rounded-full px-5 py-2 bg-primary hover:bg-primary/90 w-full">
                  Get Started
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white pt-16">
        {/* Hero shapes positioned absolutely, hidden on small screens */}
        <HeroShape className="hidden sm:block top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2" />
        <HeroShape className="hidden sm:block top-3/4 left-1/5 -translate-y-1/2" />
        <HeroShape className="hidden sm:block top-2/3 right-1/4 translate-x-1/2" />
        <HeroShape className="hidden sm:block bottom-1/4 right-1/5" />

        <div className="relative z-10 text-center max-w-3xl mx-auto px-4 py-12 sm:py-0" data-aos="fade-up">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-white/20 rounded w-3/4 mx-auto mb-6"></div>
              <div className="h-6 bg-white/20 rounded w-full mx-auto mb-8"></div>
              <div className="h-12 bg-white/20 rounded-full w-48 mx-auto"></div>
            </div>
          ) : (
            <>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
                {content?.heading || defaultHeading}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-white/90 px-2">
                {content?.description || defaultDescription}
          </p>
          <Link to="/specialties">
            <Button className="rounded-full px-6 py-4 sm:px-8 sm:py-6 text-base sm:text-lg bg-white text-primary hover:bg-white/90">
              Get Started
            </Button>
          </Link>
            </>
          )}
        </div>
      </div>

      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 md:mb-16" data-aos="fade-up">
            Our Medical Specialties
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {serviceCardsLoading ? (
              // Loading state
              <>
                <div className="bg-gray-100 rounded-lg p-8 animate-pulse h-64"></div>
                <div className="bg-gray-100 rounded-lg p-8 animate-pulse h-64"></div>
              </>
            ) : serviceCards.length > 0 ? (
              // Render dynamic cards
              serviceCards.map((card) => (
                <div 
                  key={card.id} 
                  className={`${
                    card.title.toLowerCase().includes('eye') 
                      ? 'bg-blue-50' 
                      : 'bg-[#d94991]/10'
                  } rounded-lg p-8 shadow-md hover:shadow-lg transition-all duration-300`} 
                  data-aos="fade-up"
                >
                  <h3 className={`text-2xl font-bold ${
                    card.title.toLowerCase().includes('eye') 
                      ? 'text-blue-600' 
                      : 'text-[#d94991]'
                  } mb-4`}>
                    {card.title}
                  </h3>
                  <p className="text-gray-700 mb-6">{card.description}</p>
                  <Link to={`/${card.title.toLowerCase().replace(' ', '')}`}>
                    <Button className={`${
                      card.title.toLowerCase().includes('eye') 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-[#d94991] hover:bg-[#d94991]/90'
                    } text-white`}>
                      Explore {card.title}
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              // Fallback to static content if no cards found
              <>
            <div className="bg-blue-50 rounded-lg p-8 shadow-md hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="100">
              <h3 className="text-2xl font-bold text-blue-600 mb-4">Eye Care</h3>
              <p className="text-gray-700 mb-6">Advanced treatment for cataracts, glaucoma, refractive errors, and other eye conditions under the expert care of Dr. Sanjeev Lehri.</p>
              <Link to="/eyecare">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Explore Eye Care
                </Button>
              </Link>
            </div>
            
            <div className="bg-[#d94991]/10 rounded-lg p-8 shadow-md hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="200">
              <h3 className="text-2xl font-bold text-[#d94991] mb-4">Gynecology</h3>
              <p className="text-gray-700 mb-6">
                Comprehensive women's healthcare, including fertility treatments, IVF, and women's health concerns with Dr. Nisha Bhatnagar.
              </p>
              <Link to="/gynecology">
                <Button className="bg-[#d94991] hover:bg-[#d94991]/90 text-white">
                  Explore Gynecology
                </Button>
              </Link>
            </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          {whyChooseUsLoading ? (
            // Loading state
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 w-64 mx-auto rounded mb-4"></div>
              <div className="h-4 bg-gray-300 w-full max-w-lg mx-auto rounded mb-12"></div>
            </div>
          ) : (
            <>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-aos="fade-up">
                {whyChooseUsSection?.heading || "Why Choose Eyefem"}
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="100">
                {whyChooseUsSection?.description || 
                  "We combine medical expertise with a patient-centered approach to provide the best possible care."}
          </p>
            </>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {whyChooseUsLoading ? (
              // Loading state for cards
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg p-8 h-64 animate-pulse"></div>
              ))
            ) : benefitCards.length > 0 ? (
              // Dynamic benefit cards
              benefitCards.map((card, index) => {
                // Determine which icon to use based on card title
                let IconComponent = Shield;
                let iconColor = "text-blue-600";
                let bgColor = "bg-blue-100";
                
                if (card.title.toLowerCase().includes('tech')) {
                  IconComponent = Beaker;
                  iconColor = "text-purple-600";
                  bgColor = "bg-purple-100";
                } else if (card.title.toLowerCase().includes('patient') || 
                           card.title.toLowerCase().includes('care')) {
                  IconComponent = Heart;
                  iconColor = "text-pink-600";
                  bgColor = "bg-pink-100";
                }
                
                return (
                  <div 
                    key={card.id} 
                    className="bg-white rounded-lg p-8 text-center shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300" 
                    data-aos="fade-up" 
                    data-aos-delay={100 * (index + 1)}
                  >
                    <div className={`${bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6`}>
                      <IconComponent className={`${iconColor} h-8 w-8`} />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{card.title}</h3>
                    <p className="text-gray-600">
                      {card.description}
                    </p>
                  </div>
                );
              })
            ) : (
              // Fallback static content
              <>
            <div className="bg-white rounded-lg p-8 text-center shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300" data-aos="fade-up" data-aos-delay="100">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="text-blue-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Expert Specialists</h3>
              <p className="text-gray-600">
                Our doctors are leaders in their fields with years of experience and proven results.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-8 text-center shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300" data-aos="fade-up" data-aos-delay="200">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Beaker className="text-purple-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Advanced Technology</h3>
              <p className="text-gray-600">
                We utilize the latest medical technologies and procedures for better outcomes.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-8 text-center shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300" data-aos="fade-up" data-aos-delay="300">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="text-pink-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Patient-Centered Care</h3>
              <p className="text-gray-600">
                We focus on your unique needs with personalized treatment plans and support.
              </p>
            </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white">
        <div className="container mx-auto max-w-5xl text-center" data-aos="fade-up">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Ready to Experience Specialized Care?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white/90 max-w-3xl mx-auto px-2">
            Take the first step towards better health with our expert team of specialists.
          </p>
          <Link to="/specialties">
            <Button className="rounded-full px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg bg-white text-primary hover:bg-white/90 transform hover:scale-105 transition-transform duration-300 w-full sm:w-auto">
              Choose Your Specialty
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  </PageTransition>;
};

export default LandingPage;
