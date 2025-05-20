import { MessageCircle } from "lucide-react";
import Testimonial from "@/components/Testimonial";
import { useEyeTestimonials } from '@/hooks/useEyeTestimonials';

interface EyeTestimonialsSectionProps {
  title?: string;
  description?: string;
  bgColor?: string;
}

export const EyeTestimonialsSection = ({
  title = "Success Stories",
  description = "Read what our patients have to say about their experience with Dr. Sanjeev Lehri",
  bgColor = "bg-gray-50"
}: EyeTestimonialsSectionProps) => {
  const { testimonials, isLoading } = useEyeTestimonials();
  
  return (
    <section className={`py-16 px-4 ${bgColor}`}>
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-eyecare">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {description}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8" data-aos="fade-up" data-aos-delay="200">
          {isLoading ? (
            // Loading state
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-6 rounded-lg bg-gray-100 animate-pulse h-64">
                <div className="w-12 h-12 rounded-full bg-gray-200 mb-4"></div>
                <div className="h-4 bg-gray-200 w-24 mb-3"></div>
                <div className="h-3 bg-gray-200 w-16 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 w-full"></div>
                  <div className="h-3 bg-gray-200 w-full"></div>
                  <div className="h-3 bg-gray-200 w-2/3"></div>
                </div>
              </div>
            ))
          ) : testimonials.length > 0 ? (
            // Dynamic testimonials from database
            testimonials.slice(0, 3).map(testimonial => (
              <Testimonial 
                key={testimonial.id}
                initial={testimonial.initial} 
                name={testimonial.name} 
                role={testimonial.role} 
                content={testimonial.content}
                bgColor="bg-blue-100"
                textColor="text-blue-700"
              />
            ))
          ) : (
            // Fallback static testimonials
            <>
              <Testimonial 
                initial="J" 
                name="Jatin" 
                role="Patient" 
                content="Dr. Sanjeev Lehri is a wonderful eye doctor. They're not only highly professional and knowledgeable but also incredibly kind and compassionate. I felt very well cared for during my appointment. I highly recommend!"
                bgColor="bg-blue-100"
                textColor="text-blue-700"
              />
              
              <Testimonial 
                initial="S" 
                name="Swarnima Vardhan" 
                role="Patient" 
                content="I have consulted with him several times. He is a very professional and genuine doctor. Highly recommend Dr Lehri."
                bgColor="bg-blue-100"
                textColor="text-blue-700"
              />
              
              <Testimonial 
                initial="A" 
                name="Ankita Deshmukh" 
                role="Patient" 
                content="He is not only a good doctor but moreover he is a wonderful person! Extremely satisfied with the consultation."
                bgColor="bg-blue-100"
                textColor="text-blue-700"
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default EyeTestimonialsSection; 