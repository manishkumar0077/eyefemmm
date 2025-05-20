import { Heart, Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
const Footer = () => {
  return <footer className="bg-gradient-to-r from-gray-50 to-gray-100 pt-12 pb-8 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8" data-aos="fade-up" data-aos-delay="100">
          {/* First column */}
          <div>
            <h3 className="text-xl font-bold mb-4">Eyefem</h3>
            <p className="text-gray-600 mb-4">
              Providing specialized healthcare services in Eye Care and Gynecology.
            </p>
            <div className="flex items-center gap-2 text-gray-600">
              <Heart size={16} className="text-red-500" />
              <span>Caring for your health since 2003</span>
            </div>
          </div>

          {/* Quick Links column */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/eyecare" className="text-gray-600 hover:text-eyecare transition-colors">
                  Eye Care
                </Link>
              </li>
              <li>
                <Link to="/gynecology" className="text-gray-600 hover:text-gynecology transition-colors">
                  Gynecology
                </Link>
              </li>
              <li>
                <Link to="/specialties" className="text-gray-600 hover:text-primary transition-colors">
                  Our Specialties
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us column */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin size={18} className="mt-1 shrink-0" />
                <span>1, W Patel Nagar Rd, Block 25, East Patel Nagar, Patel Nagar, Delhi, New Delhi, Delhi 110008</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone size={18} />
                <span>+91 9811150984</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Mail size={18} />
                <span>
                  <a href="mailto:slehri@gmail.com" className="hover:text-primary transition-colors underline">
                    slehri@gmail.com
                  </a>
                  <br />
                  <a href="mailto:drnishabhatnagar@gmail.com" className="hover:text-primary transition-colors underline">
                    drnishabhatnagar@gmail.com
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* Developed By column */}
          <div>
            <h3 className="text-xl font-bold mb-4">Engineered with care </h3>
            <p className="text-gray-600 mb-3">To ensure a reliable,<br/> accessible, and<br/>user-friendly digital presence.</p>
            <div className="text-gray-500 text-sm mb-2 font-medium">Website created by DevCubed</div>
            <Link to="/developers" className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2">
              Read more <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-gray-500" data-aos="fade-up">
          <p>© {new Date().getFullYear()} Eyefem Healthcare. All rights reserved.</p>
          <p className="text-sm mt-2">
            <Link to="#" className="hover:text-primary mx-2">Privacy Policy</Link> | 
            <Link to="#" className="hover:text-primary mx-2">Terms of Service</Link>
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;