import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EyeCareNavbar from "@/components/EyeCareNavbar";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import { useEyeCareConditions } from '@/hooks/useEyeCareConditions';
import { useEyeCareWhyChoose } from '@/hooks/UseEyeCareWhyChoose';
import { useEyecareImages } from '@/hooks/useEyecareImages';
import { useEyecareHeroSection } from '@/hooks/useEyecareHeroSection';
import { useEffect } from 'react';
// import { useMiscEyefemImages } from '@/hooks/useMiscEyefemImage';

const EyeCareHome = () => {
  const { section, conditions, isLoading } = useEyeCareConditions();
  const { section: whyChooseSection, features, isLoading: whyChooseLoading } = useEyeCareWhyChoose();
  const { images, setCurrentCategory, refreshData } = useEyecareImages("home");
  const { heroSection, isLoading: heroLoading } = useEyecareHeroSection();
  // const { images, loading, error } = useMiscEyefemImages('homepage');
  
  // Ensure images are loaded when the component mounts
  useEffect(() => {
    console.log("Home component mounted, setting category and refreshing data");
    setCurrentCategory("home");
    refreshData();
  }, []);
  
  useEffect(() => {
    console.log("Home images updated:", images);
  }, [images]);
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log("Image failed to load:", e.currentTarget.src);
    e.currentTarget.src = "/lovable-uploads/default-image.png";
  };

  const getImageUrl = (index: number, defaultAlt: string) => {
    if (images && images.length > index) {
      console.log(`Using image at index ${index}:`, images[index].image_url);
      return {
        url: images[index].image_url,
        alt: images[index].title || defaultAlt
      };
    }
    console.log(`No image at index ${index}, using default`);
    return {
      url: "/lovable-uploads/default-image.png",
      alt: defaultAlt
    };
  };

  const heroImage = getImageUrl(0, "Eye Examination");
  const clinicImage = getImageUrl(1, "Modern Eye Clinic");

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <EyeCareNavbar />

        <main className="flex-grow pt-16 sm:pt-20">
          {/* Hero Section */}
          <section className="relative bg-gradient-eyecare text-white py-12 sm:py-16 md:py-24 lg:py-32">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div data-aos="fade-right">
                  <h1 
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6" 
                    data-editable="true" 
                    data-selector="eyecare-home-h1"
                  >
                    {heroSection?.title || "Advanced Eye Care Services"}
                  </h1>
                  <p 
                    className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white/90" 
                    data-editable="true" 
                    data-selector="eyecare-home-hero-p"
                  >
                    {heroSection?.subtitle || "Experience the highest quality of eye care with our state-of-the-art technology and the expertise of Dr. Sanjeev Lehri."}
                  </p>
                  <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 sm:gap-4">
                    <Link to="/eyecare/appointment" className="w-full sm:w-auto">
                      <Button 
                        className="mac-btn bg-white text-eyecare hover:bg-white/90 w-full sm:w-auto text-xs sm:text-sm md:text-base px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3" 
                        data-editable="true" 
                        data-selector="eyecare-home-button-1"
                      >
                        Book an Appointment
                      </Button>
                    </Link>
                    <Link to="/eyecare/conditions" className="w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        className="mac-btn bg-transparent border-white text-white hover:bg-white/10 w-full sm:w-auto text-xs sm:text-sm md:text-base px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3"
                        data-editable="true" 
                        data-selector="eyecare-home-button-2"
                      >
                        Explore Treatments
                      </Button>
                    </Link>
                  </div>
                </div>
                <div 
                  className="rounded-2xl overflow-hidden shadow-xl" 
                  data-aos="fade-left"
                >
                  {heroLoading ? (
                    <div className="bg-gray-300 animate-pulse w-full h-64 md:h-96"></div>
                  ) : (
                    <img 
                      src={heroSection?.image_url || heroImage.url} 
                      alt={heroSection?.title || heroImage.alt}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                      data-editable="true" 
                      data-selector="eyecare-home-hero-img"
                    />
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Common Eye Problems Section */}
          <section className="py-10 sm:py-16 md:py-20 px-4 bg-white">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-8 sm:mb-10 md:mb-14">
                <h2 
                  className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4"
                  data-editable="true" 
                  data-selector="eyecare-conditions-heading"
                >
                  {section?.heading || "Common Eye Problems We Treat"}
                </h2>
                <p 
                  className="text-gray-600 text-sm sm:text-base max-w-3xl mx-auto px-2"
                  data-editable="true" 
                  data-selector="eyecare-conditions-description"
                >
                  {section?.description || "Our eye care center specializes in diagnosing and treating a wide range of eye conditions."}
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {isLoading ? (
                  // Loading state
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-lg p-6 animate-pulse h-48"></div>
                  ))
                ) : conditions.length > 0 ? (
                  // Dynamic conditions from database
                  conditions.map((condition, index) => (
                    <div 
                      key={condition.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100"
                      data-aos="fade-up" 
                      data-aos-delay={100 * (index % 3)}
                    >
                      <h3 
                        className="text-xl font-bold mb-3 text-blue-600"
                        data-editable="true" 
                        data-selector={`eyecare-condition-${condition.id}-title`}
                      >
                        {condition.title}
                      </h3>
                      <p 
                        className="text-gray-600"
                        data-editable="true" 
                        data-selector={`eyecare-condition-${condition.id}-description`}
                      >
                        {condition.description}
                      </p>
                    </div>
                  ))
                ) : (
                  // Fallback static content
                  [
                    "Cataracts",
                    "Glaucoma",
                    "Diabetic Retinopathy",
                    "Dry Eye Syndrome",
                    "Age-related Macular Degeneration",
                    "Refractive Errors"
                  ].map((title, index) => (
                    <div 
                      key={index}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100"
                      data-aos="fade-up" 
                      data-aos-delay={100 * (index % 3)}
                    >
                      <h3 className="text-xl font-bold mb-3 text-blue-600">
                        {title}
                      </h3>
                      <p className="text-gray-600">
                        {/* Generic descriptions for fallback */}
                        {title === "Cataracts" && "Clouding of the eye's natural lens that affects vision."}
                        {title === "Glaucoma" && "A group of eye conditions that damage the optic nerve."}
                        {title === "Diabetic Retinopathy" && "Damage to the retina caused by diabetes complications."}
                        {title === "Dry Eye Syndrome" && "A condition where tears aren't able to provide adequate lubrication."}
                        {title === "Age-related Macular Degeneration" && "A leading cause of vision loss among older adults."}
                        {title === "Refractive Errors" && "Vision problems like myopia, hyperopia, and astigmatism."}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Why Choose Us Section */}
          <section className="py-20 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div data-aos="fade-right">
                  <h2 
                    className="text-3xl md:text-4xl font-bold mb-6"
                    data-editable="true" 
                    data-selector="eyecare-home-why-choose-h2"
                  >
                    {whyChooseSection?.heading || "Why Choose Our Eye Care Center?"}
                  </h2>
                  <p 
                    className="text-lg text-gray-600 mb-8"
                    data-editable="true" 
                    data-selector="eyecare-home-why-choose-p"
                  >
                    {whyChooseSection?.description || 
                      "We provide comprehensive eye care services with a focus on patient comfort, cutting-edge technology, and personalized treatment plans."}
                  </p>
                  
                  <div className="space-y-4">
                    {whyChooseLoading ? (
                      // Loading state
                      Array(5).fill(0).map((_, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse shrink-0 mt-0.5" />
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                        </div>
                      ))
                    ) : features.length > 0 ? (
                      // Dynamic features from database
                      features.map((feature) => (
                        <div key={feature.id} className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 text-eyecare shrink-0 mt-0.5" />
                          <span 
                            className="text-gray-700"
                            data-editable="true" 
                            data-selector={`eyecare-home-feature-${feature.id}`}
                          >{feature.feature_text}</span>
                        </div>
                      ))
                    ) : (
                      // Fallback static content
                      [
                        "State-of-the-art diagnostic equipment",
                        "Experienced ophthalmologists and staff",
                        "Comprehensive eye examinations",
                        "Advanced surgical procedures",
                        "Personalized treatment plans"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-6 w-6 text-eyecare shrink-0 mt-0.5" />
                          <span 
                            className="text-gray-700"
                            data-editable="true" 
                            data-selector={`eyecare-home-feature-${index + 1}`}
                          >{item}</span>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="mt-8">
                    <Link to="/eyecare/doctor">
                      <Button 
                        className="mac-btn eyecare-btn"
                        data-editable="true" 
                        data-selector="eyecare-home-meet-doctor-btn"
                      >
                        Meet Dr. Sanjeev Lehri
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <div 
                  className="rounded-2xl overflow-hidden shadow-xl" 
                  data-aos="fade-left"
                >
                  {whyChooseLoading ? (
                    <div className="bg-gray-300 animate-pulse w-full h-64 md:h-96"></div>
                  ) : (
                    <img 
                      src={whyChooseSection?.image_url || clinicImage.url} 
                      alt={whyChooseSection?.heading || clinicImage.alt}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                      data-editable="true" 
                      data-selector="eyecare-home-clinic-img"
                    />
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 px-4 bg-gradient-eyecare text-white">
            <div className="container mx-auto max-w-5xl text-center" data-aos="fade-up">
              <h2 
                className="text-3xl md:text-4xl font-bold mb-6"
                data-editable="true" 
                data-selector="eyecare-home-cta-h2"
              >
                Take the First Step Towards Better Vision
              </h2>
              <p 
                className="text-xl mb-8 text-white/90 max-w-3xl mx-auto"
                data-editable="true" 
                data-selector="eyecare-home-cta-p"
              >
                Schedule an appointment with our eye care specialists today and experience 
                the difference of personalized, expert care.
              </p>
              <Link to="/eyecare/appointment">
                <Button 
                  className="mac-btn px-8 py-6 text-lg bg-white text-eyecare hover:bg-white/90"
                  data-editable="true" 
                  data-selector="eyecare-home-cta-btn"
                >
                  Book Your Appointment
                </Button>
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default EyeCareHome;
