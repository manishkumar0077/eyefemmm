
import { ReactNode } from 'react';

interface HeroShapeProps {
  className?: string;
  children?: ReactNode;
}

const HeroShape = ({ className, children }: HeroShapeProps) => {
  return (
    <div 
      className={`absolute opacity-40 animate-float ${className}`}
      data-aos="fade-in"
      data-aos-duration="1000"
    >
      {children || (
        <div className="bg-white/10 backdrop-blur-md rounded-full w-20 h-20 md:w-32 md:h-32"></div>
      )}
    </div>
  );
};

export default HeroShape;
