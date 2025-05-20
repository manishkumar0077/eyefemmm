import { Mail, Linkedin, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import PageTransition from "@/components/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { useTypewriter, Cursor } from 'react-simple-typewriter';

const Developers = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [text] = useTypewriter({
    words: ['Meet Our Development Team', 'The Minds Behind Eyefem', 'Our Talented Team'],
    loop: true,
    delaySpeed: 2000,
  });

  const developers = [{
    name: "Sarthak Srivastava",
    email: "Sarthaksrivastava06052003@gmail.com",
    image: "/lovable-uploads/sarthak-new.jpg",
    role: "Backend Developer",
    linkedin: "https://www.linkedin.com/in/sarthak-srivastava-11044b271/",
    description: "Expert in building robust and scalable backend systems"
  }, {
    name: "Naman Verma",
    email: "Kr.naman007@gmail.com",
    image: "/lovable-uploads/naman-new.jpg",
    role: "Frontend Developer",
    linkedin: "https://www.linkedin.com/in/naman-verma-933184271/",
    description: "Specializing in creating beautiful and responsive user interfaces "
  }, {
    name: "Shubham Malhotra",
    email: "malhotrashubham144@gmail.com",
    image: "/lovable-uploads/shubham-new.jpg",
    role: "Lead Developer",
    linkedin: "https://www.linkedin.com/in/shubham-malhotra-302631291/",
    description: "Passionate about creating intuitive healthcare solutions"
  }];

  return (
    <PageTransition>
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/6c43213d-6d60-4790-b8ff-d662e634ee59.png"
                alt="EyeFem Logo"
                className="h-12 sm:h-14 md:h-16 w-auto"
              />
            </Link>

            {/* Mobile menu button */}
            <button 
              className="md:hidden flex items-center text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Desktop Nav */}
            <NavigationMenu className="hidden md:block">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/" className="text-sm font-medium text-gray-600 hover:text-primary px-4 py-2">
                    Home
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/specialties" className="text-sm font-medium text-gray-600 hover:text-primary px-4 py-2">
                    Specialties
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/eyecare" className="text-sm font-medium text-gray-600 hover:text-primary px-4 py-2">
                    Eye Care
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/gynecology" className="text-sm font-medium text-gray-600 hover:text-primary px-4 py-2">
                    Gynecology
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t py-3 px-4 shadow-lg animate-fade-in-down">
            <div className="flex flex-col space-y-3">
              <Link to="/" className="text-sm font-medium text-gray-600 hover:text-primary py-2 px-1" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/specialties" className="text-sm font-medium text-gray-600 hover:text-primary py-2 px-1" onClick={() => setMobileMenuOpen(false)}>Specialties</Link>
              <Link to="/eyecare" className="text-sm font-medium text-gray-600 hover:text-primary py-2 px-1" onClick={() => setMobileMenuOpen(false)}>Eye Care</Link>
              <Link to="/gynecology" className="text-sm font-medium text-gray-600 hover:text-primary py-2 px-1" onClick={() => setMobileMenuOpen(false)}>Gynecology</Link>
            </div>
          </div>
        )}
      </nav>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12 md:mb-16" data-aos="fade-up">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              <span>{text}</span>
              <Cursor cursorStyle="_" />
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2 sm:px-0">
            Built by aspiring developers during their college days, this website reflects the dedication and creativity behind Eyefem Healthcare's digital front.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-5xl mx-auto">
            {developers.map((dev, index) => (
              <Card 
                key={dev.name} 
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 max-w-sm mx-auto" 
                data-aos="fade-up" 
                data-aos-delay={index * 100}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src={dev.image} 
                    alt={dev.name} 
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <CardContent className="p-3 sm:p-4">
                  <h3 className="text-lg sm:text-xl font-bold mb-1">{dev.name}</h3>
                  <p className="text-primary font-medium text-xs sm:text-sm mb-1 sm:mb-2">{dev.role}</p>
                  <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">{dev.description}</p>
                  
                  <div className="flex items-center space-x-3">
                    <a 
                      href={`mailto:${dev.email}`} 
                      className="flex items-center text-gray-600 hover:text-primary transition-colors"
                      aria-label={`Email ${dev.name}`}
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                    <a 
                      href={dev.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center text-gray-600 hover:text-primary transition-colors"
                      aria-label={`LinkedIn profile of ${dev.name}`}
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-10 md:mt-12">
            <Link to="/" className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Developers;
