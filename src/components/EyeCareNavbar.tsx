
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const EyeCareNavbar = () => {
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
    { path: "/eyecare", label: "Overview" },
    { path: "/eyecare/conditions", label: "Conditions & Treatments" },
    { path: "/eyecare/doctor", label: "Dr. Sanjeev Lehri" },
    { path: "/eyecare/appointment", label: "Book Appointment" },
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
        <div className="flex justify-between items-center py-3">
          <Link
            to="/eyecare"
            className="flex items-center"
          >
            <div className="h-14 w-auto flex items-center">
              <img 
                src="/lovable-uploads/6c43213d-6d60-4790-b8ff-d662e634ee59.png"
                alt="EyeFem Clinic"
                className="h-14 w-auto object-contain"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors hover:text-eyecare ${
                  location.pathname === link.path
                    ? "text-eyecare font-semibold"
                    : "text-gray-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/"
              className="text-gray-600 transition-colors hover:text-eyecare"
            >
              Home
            </Link>
          </div>

          {/* Mobile Nav Toggle */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-600 hover:text-eyecare"
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
                className={`block transition-colors hover:text-eyecare ${
                  location.pathname === link.path
                    ? "text-eyecare font-semibold"
                    : "text-gray-600"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/"
              className="block text-gray-600 transition-colors hover:text-eyecare"
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

export default EyeCareNavbar;
