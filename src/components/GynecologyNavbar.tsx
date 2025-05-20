import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Heart } from "lucide-react";

const GynecologyNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { path: "/gynecology", label: "Overview" },
    { path: "/gynecology/health", label: "Women's Health" },
    { path: "/gynecology/doctor", label: "Dr. Nisha Bhatnagar" },
    { path: "/gynecology/appointment", label: "Book Appointment" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link
            to="/gynecology"
            className="flex items-center space-x-2"
          >
            <img 
              src="/lovable-uploads/6c43213d-6d60-4790-b8ff-d662e634ee59.png"
              alt="EyeFem Clinic"
              className="h-16 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors hover:text-gynecology ${
                  location.pathname === link.path
                    ? "text-gynecology font-semibold"
                    : "text-gray-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/"
              className="text-gray-600 transition-colors hover:text-gynecology"
            >
              Home
            </Link>
          </div>

          {/* Mobile Nav Toggle */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-600 hover:text-gynecology"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block transition-colors hover:text-gynecology ${
                  location.pathname === link.path
                    ? "text-gynecology font-semibold"
                    : "text-gray-600"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/"
              className="block text-gray-600 transition-colors hover:text-gynecology"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default GynecologyNavbar;
