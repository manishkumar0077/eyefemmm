
import React from 'react';

interface TestimonialProps {
  name: string;
  text?: string;
  content?: string; // For backward compatibility
  image?: string;
  role?: string;
  initial?: string; // For backward compatibility
  bgColor?: string; // For backward compatibility
  textColor?: string; // For backward compatibility
}

const Testimonial: React.FC<TestimonialProps> = ({ 
  name, 
  text, 
  content, 
  image, 
  role, 
  initial, 
  bgColor = "bg-blue-100", 
  textColor = "text-blue-600" 
}) => {
  // Use content if text is not provided (backward compatibility)
  const testimonialContent = text || content || "";
  
  // Generate a consistent background color based on the initial
  const getColorClass = (initialChar: string) => {
    const colors = [
      { bg: 'bg-blue-100', textColor: 'text-blue-600' },
      { bg: 'bg-green-100', textColor: 'text-green-600' },
      { bg: 'bg-purple-100', textColor: 'text-purple-600' },
      { bg: 'bg-amber-100', textColor: 'text-amber-600' },
      { bg: 'bg-pink-100', textColor: 'text-pink-600' }
    ];
    
    // Simple hash function to pick a color based on the initial
    const charCode = (initialChar || 'A').charCodeAt(0);
    const colorIndex = charCode % colors.length;
    return colors[colorIndex];
  };
  
  const { bg, textColor: dynamicTextColor } = getColorClass(initial || name.charAt(0));
  
  return (
    <div className="bg-white shadow-md rounded-xl p-6">
      <div className="flex items-start mb-4">
        {image ? (
          <div className="flex-shrink-0 mr-4">
            <img 
              src={image} 
              alt={name} 
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>
        ) : (
          <div className="flex-shrink-0 mr-4">
            <div className={`w-12 h-12 rounded-full ${bg} ${dynamicTextColor} flex items-center justify-center text-xl font-medium`}>
              {initial || name.charAt(0)}
            </div>
          </div>
        )}
        <div>
          <h3 className="font-semibold text-lg">{name}</h3>
          {role && <p className="text-gray-600 text-sm">{role}</p>}
        </div>
      </div>
      <p className="text-gray-700 italic">{testimonialContent}</p>
    </div>
  );
};

export default Testimonial;
