
import { useEffect } from 'react';
import { useDeviceType } from '@/hooks/use-mobile';

interface ElfsightReviewsProps {
  appId: string;
  className?: string;
  maxHeight?: number;
}

const ElfsightReviews = ({ appId, className = "", maxHeight }: ElfsightReviewsProps) => {
  const { isMobile, isTablet } = useDeviceType();

  useEffect(() => {
    // Load Elfsight script if it hasn't been loaded already
    if (!document.querySelector('script[src="https://static.elfsight.com/platform/platform.js"]')) {
      const script = document.createElement('script');
      script.src = "https://static.elfsight.com/platform/platform.js";
      script.async = true;
      document.body.appendChild(script);
    }
    
    // Trigger Elfsight to initialize or reinitialize
    if (window.elfsight) {
      window.elfsight.reinstall();
    }
  }, []);

  // Determine height based on device and props
  const getHeight = () => {
    if (maxHeight) return maxHeight;
    if (isMobile) return 300;
    if (isTablet) return 400;
    return 500;
  };

  return (
    <div 
      className={`elfsight-app-${appId} ${className} w-full`} 
      data-elfsight-app-lazy
      style={{ 
        minHeight: `${getHeight()}px`, 
        maxWidth: '100%', 
        overflow: 'hidden' 
      }}
    ></div>
  );
};

export default ElfsightReviews;
