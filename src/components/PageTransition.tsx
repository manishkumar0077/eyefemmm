
import React, { ReactNode, useEffect } from 'react';
import AOS from 'aos';

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  useEffect(() => {
    // Refresh AOS when the component mounts to ensure animations work on page changes
    AOS.refresh();
  }, []);

  return (
    <div 
      data-aos="fade-in" 
      data-aos-duration="600" 
      className="w-full min-h-screen"
    >
      {children}
    </div>
  );
};

export default PageTransition;
