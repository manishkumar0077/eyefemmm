import { useLocation } from 'react-router-dom';
import React from 'react';

const WhatsAppWidget: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  // Eye Care pages check
  if (pathname.startsWith('/eyecare')) {
    return <div className="elfsight-app-a33bc770-938d-4a29-a90b-1d1514e16817" data-elfsight-app-lazy></div>;
  }

  // Gynecology pages check
  if (pathname.startsWith('/gynecology')) {
    return <div className="elfsight-app-f5987c20-7de0-4b19-a688-ad23bc2c6457" data-elfsight-app-lazy></div>;
  }

  // Render nothing on other pages
  return null;
};

export default WhatsAppWidget; 