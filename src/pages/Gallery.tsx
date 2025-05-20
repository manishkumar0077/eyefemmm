import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Menu, X } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import { useClinicImages } from "@/hooks/useClinicImages";

const Gallery = () => {
  const { images, isLoading } = useClinicImages();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Close mobile menu when navigating to a different page
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  
  // Handle Escape key press to close the dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage !== null) {
        setSelectedImage(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);
  
  const handlePrevious = () => {
    setSelectedImage(prev => prev === null ? null : prev === 0 ? images.length - 1 : prev - 1);
  };
  
  const handleNext = () => {
    setSelectedImage(prev => prev === null ? null : prev === images.length - 1 ? 0 : prev + 1);
  };
  
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/6c43213d-6d60-4790-b8ff-d662e634ee59.png" 
                alt="EyeFem Clinic" 
                className="h-14 w-auto object-contain" 
              />
              <span className="font-bold text-xl">
              </span>
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
              <Link to="/gallery" className="text-gray-800 hover:text-primary transition-colors">Gallery</Link>
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
              </nav>
            </div>
          )}
        </header>

        <main className="flex-grow pt-24">
          <section className="py-10 sm:py-12 md:py-16 px-4">
            <div className="container mx-auto max-w-6xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 sm:mb-8 md:mb-12" data-aos="fade-up">
                Our Clinic Gallery
              </h1>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3">Loading gallery...</span>
                </div>
              ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4" data-aos="fade-up">
                  {images.map((image, index) => (
                    <div 
                      key={image.id} 
                      className={`relative group cursor-pointer rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''}`} 
                      onClick={() => setSelectedImage(index)} 
                      data-aos="fade-up" 
                      data-aos-delay={index * 50}
                    >
                    <div className="relative aspect-square w-full">
                        <img 
                          src={image.src} 
                          alt={image.title} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                          loading="lazy"
                        />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 opacity-70 transition-opacity duration-300 flex items-end">
                        <div className="p-2 sm:p-3 text-white transform translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0 transition-transform duration-300">
                          <h3 className="text-xs sm:text-sm font-semibold">{image.title}</h3>
                          <p className="text-xs text-white/90 hidden xs:block">{image.description}</p>
                        </div>
                      </div>
                    </div>
                    </div>
                  ))}
              </div>
              )}
            </div>
          </section>

          <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="max-w-[95vw] sm:max-w-4xl bg-black/95 border-none p-0 sm:p-6" aria-describedby="gallery-image-description">
              <span id="gallery-image-description" className="sr-only">Gallery image viewer</span>
              {selectedImage !== null && images[selectedImage] && (
                <div className="relative">
                  <img 
                    src={images[selectedImage].src} 
                    alt={images[selectedImage].title} 
                    className="w-full h-auto max-h-[80vh] object-contain" 
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 bg-black/60 text-white">
                    <h3 className="text-base sm:text-xl font-semibold">
                      {images[selectedImage].title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/90">
                      {images[selectedImage].description}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 p-1 sm:p-2 rounded-full bg-black/60 hover:bg-black/80 border-none text-white" 
                    onClick={e => {
                e.stopPropagation();
                handlePrevious();
                    }}
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 p-1 sm:p-2 rounded-full bg-black/60 hover:bg-black/80 border-none text-white" 
                    onClick={e => {
                e.stopPropagation();
                handleNext();
                    }}
                  >
                    <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Gallery;
