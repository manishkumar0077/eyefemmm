
import { useState, useEffect } from "react";
import { Star, StarHalf, ChevronDown, Calendar, Clock } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

interface Review {
  id: string;
  author: string;
  rating: number;
  content: string;
  date: string;
  photoUrl?: string;
}

interface GoogleReviewsProps {
  doctorName: string;
  reviewUrl: string;
  showAll: boolean;
  selectedRating: number | null;
  color: "blue" | "purple";
  className?: string;
  onShowAllChange?: (showAll: boolean) => void;
  onRatingChange?: (rating: number | null) => void;
}

const GoogleReviews = ({ 
  doctorName, 
  reviewUrl, 
  showAll, 
  selectedRating, 
  color, 
  className, 
  onShowAllChange, 
  onRatingChange 
}: GoogleReviewsProps) => {
  // This would normally fetch from an API, but for demo purposes we'll use mock data
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"newest" | "highest">("newest");

  useEffect(() => {
    // In a real app, this would be a fetch from Google's API
    const fetchReviews = async () => {
      setLoading(true);
      try {
        // Here we would fetch real reviews from Google's API using the reviewUrl
        // For this demo, we're using mock data
        const mockReviews = generateMockReviews(doctorName);
        
        setTimeout(() => {
          setReviews(mockReviews);
          setLoading(false);
        }, 1000);
        
        // Example code for a real implementation (commented out):
        /*
        const response = await fetch('/api/google-reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: reviewUrl }),
        });
        const data = await response.json();
        setReviews(data.reviews);
        setLoading(false);
        */
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setLoading(false);
      }
    };

    fetchReviews();
  }, [doctorName, reviewUrl]);

  // Sort reviews based on date or rating
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return b.rating - a.rating;
    }
  });

  // Filter reviews based on selected rating
  const filteredReviews = selectedRating
    ? sortedReviews.filter(review => Math.round(review.rating) === selectedRating)
    : sortedReviews;
    
  // Limit number of reviews shown unless showAll is true
  const displayedReviews = showAll 
    ? filteredReviews
    : filteredReviews.slice(0, 4);
  
  const bgColorClass = color === "blue" ? "bg-blue-50" : "bg-purple-50";
  const borderColorClass = color === "blue" ? "border-blue-200" : "border-purple-200";
  const starColorClass = color === "blue" ? "text-blue-500" : "text-purple-500";
  const buttonColorClass = color === "blue" ? "border-blue-500 text-blue-500 hover:bg-blue-50" : "border-purple-500 text-purple-500 hover:bg-purple-50";
  const hoverColorClass = color === "blue" ? "hover:border-blue-300 hover:bg-blue-50" : "hover:border-purple-300 hover:bg-purple-50";
  
  // Format date to "X months/years ago" format
  const formatDate = (dateString: string): string => {
    const reviewDate = new Date(dateString);
    const now = new Date();
    
    const diffInMs = now.getTime() - reviewDate.getTime();
    const diffInYears = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 365));
    const diffInMonths = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInYears > 0) {
      return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
    } else if (diffInMonths > 0) {
      return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    } else if (diffInDays > 0) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return 'Today';
    }
  };
  
  const handleRatingClick = (rating: number | null) => {
    if (onRatingChange) {
      onRatingChange(selectedRating === rating ? null : rating);
    }
  };
  
  return (
    <div className={`${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <div className="flex items-center gap-2 mb-4 sm:mb-0 flex-wrap">
          {[5, 4, 3, 2, 1].map((rating) => (
            <button 
              key={rating}
              onClick={() => handleRatingClick(rating)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors 
              ${selectedRating === rating 
                ? color === "blue" ? "bg-blue-500 text-white" : "bg-purple-500 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {rating}⭐
            </button>
          ))}
          <button 
            onClick={() => handleRatingClick(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors 
            ${selectedRating === null
              ? color === "blue" ? "bg-blue-500 text-white" : "bg-purple-500 text-white" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            All
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <Select 
            value={sortBy} 
            onValueChange={(value) => setSortBy(value as "newest" | "highest")}
          >
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="highest">Highest rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-gray-900"></div>
        </div>
      ) : displayedReviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No reviews found for the selected rating.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedReviews.map((review) => (
            <div 
              key={review.id}
              className={`rounded-lg p-6 border ${bgColorClass} ${borderColorClass} shadow-sm transition-all duration-300 ${hoverColorClass} hover:shadow-md hover:-translate-y-1`}
            >
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white border ${borderColorClass} mr-3 font-bold`}>
                  {review.photoUrl ? (
                    <img src={review.photoUrl} alt={review.author} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    review.author.charAt(0)
                  )}
                </div>
                <div className="flex-grow">
                  <div className="font-medium">{review.author}</div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(review.date)}
                  </div>
                </div>
              </div>
              
              <div className="flex mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>
                    {i < Math.floor(review.rating) ? (
                      <Star className={`h-4 w-4 ${starColorClass} fill-current`} />
                    ) : i < Math.ceil(review.rating) && review.rating % 1 !== 0 ? (
                      <StarHalf className={`h-4 w-4 ${starColorClass} fill-current`} />
                    ) : (
                      <Star className={`h-4 w-4 text-gray-300`} />
                    )}
                  </span>
                ))}
              </div>
              
              <HoverCard>
                <HoverCardTrigger asChild>
                  <p className={`text-gray-700 ${review.content.length > 150 ? "cursor-pointer" : ""}`}>
                    {review.content.length > 150
                      ? `${review.content.substring(0, 150)}...`
                      : review.content}
                  </p>
                </HoverCardTrigger>
                {review.content.length > 150 && (
                  <HoverCardContent className="w-80">
                    <p className="text-sm">{review.content}</p>
                  </HoverCardContent>
                )}
              </HoverCard>
            </div>
          ))}
        </div>
      )}
      
      {/* Button to show all reviews */}
      {!showAll && filteredReviews.length > 4 && (
        <div className="text-center mt-6">
          <button
            onClick={() => onShowAllChange && onShowAllChange(true)}
            className={`border rounded-md px-4 py-2 transition-all ${buttonColorClass} hover:shadow-md flex items-center justify-center mx-auto`}
          >
            View All Reviews
            <ChevronDown className="ml-1 h-4 w-4" />
          </button>
        </div>
      )}
      
      {/* Link to Google reviews */}
      <div className="text-center mt-6">
        <a 
          href={reviewUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`text-sm ${color === "blue" ? "text-blue-600" : "text-purple-600"} hover:underline flex items-center justify-center gap-1 transition-all hover:opacity-80`}
        >
          See all reviews on Google
        </a>
      </div>
    </div>
  );
};

// Helper function to generate mock reviews
function generateMockReviews(doctorName: string): Review[] {
  const isEyeDoctor = doctorName.includes("Sanjay") || doctorName.includes("Sanjeev") || doctorName.includes("Lehri");
  
  const eyeDoctorReviews = [
    {
      id: "1",
      author: "Rajesh Kumar",
      rating: 5,
      content: "Dr. Lehri's expertise in cataract surgery transformed my vision completely. I had severe vision problems and couldn't see clearly, but after the surgery with him, I can now read and drive without glasses. The care I received was exceptional from consultation to post-operative follow-ups.",
      date: "2023-02-15"
    },
    {
      id: "2",
      author: "Priya Sharma",
      rating: 5,
      content: "After struggling with my vision for years, Dr. Lehri provided a clear diagnosis and effective treatment plan. His attention to detail and patient care are outstanding. I had visited several doctors before, but none could identify my specific condition accurately. Dr. Lehri took his time, ran comprehensive tests, and explained everything clearly.",
      date: "2023-03-20"
    },
    {
      id: "3",
      author: "Amit Patel",
      rating: 4.5,
      content: "Great experience with Dr. Lehri for my glaucoma treatment. Very knowledgeable and takes time to explain everything. The staff is also very helpful. He provided me with options and clearly explained the benefits and risks of each approach. My pressure readings have improved significantly since starting treatment with him.",
      date: "2023-04-10"
    },
    {
      id: "4",
      author: "Sneha Gupta",
      rating: 5,
      content: "Dr. Lehri performed LASIK surgery on me, and I couldn't be happier with the results. Professional team and state-of-the-art facilities. I was nervous before the procedure, but Dr. Lehri and his team made me feel comfortable throughout. The follow-up care has been excellent, and my vision is now perfect without glasses.",
      date: "2023-04-25"
    },
    {
      id: "5",
      author: "Vikram Singh",
      rating: 4,
      content: "Good doctor with extensive knowledge. Wait times can be long, but the quality of care is worth it. My retinal condition has improved significantly under his treatment plan. He detected early signs of retinal detachment that other doctors had missed during routine check-ups.",
      date: "2023-05-02"
    },
    {
      id: "6",
      author: "Meera Reddy",
      rating: 5,
      content: "Outstanding care from Dr. Lehri for my elderly mother's cataract surgery. He was patient, thorough, and the results are excellent. My mother is 82 years old and was very anxious, but Dr. Lehri took extra time to explain everything and put her at ease. The surgery went smoothly, and her vision has dramatically improved.",
      date: "2023-05-15"
    },
    {
      id: "7",
      author: "Arjun Malhotra",
      rating: 3.5,
      content: "Decent treatment but the clinic was very busy. Had to wait for over an hour despite having an appointment. Dr. Lehri is knowledgeable though and provided good medical advice for my chronic dry eyes. The prescribed treatment has helped somewhat, but I wish the clinic was better organized with appointments.",
      date: "2022-11-10"
    },
    {
      id: "8",
      author: "Kavita Joshi",
      rating: 5,
      content: "Dr. Lehri diagnosed my rare eye condition when three other doctors couldn't figure it out. I had strange visual symptoms for months and was getting increasingly worried. Dr. Lehri identified a rare form of uveitis and started treatment immediately. Forever grateful for his expertise and care.",
      date: "2022-08-20"
    }
  ];
  
  const gynecologistReviews = [
    {
      id: "1",
      author: "Neha Singh",
      rating: 5,
      content: "Dr. Bhatnagar is amazing! After struggling with fertility issues for years, her personalized care and expertise helped us conceive through IVF. We had almost given up hope after two failed cycles elsewhere, but her approach was different and tailored specifically to our situation. Now we have a beautiful baby girl!",
      date: "2023-03-15"
    },
    {
      id: "2",
      author: "Ritu Verma",
      rating: 5,
      content: "Extremely satisfied with Dr. Bhatnagar's care during my high-risk pregnancy. Her compassionate approach made the journey much easier. I had gestational diabetes and high blood pressure, but she monitored everything closely and helped me deliver a healthy baby. Her team was always available for my questions and concerns.",
      date: "2023-04-22"
    },
    {
      id: "3",
      author: "Pooja Mehta",
      rating: 4.5,
      content: "Dr. Bhatnagar is very thorough and takes time to listen. She helped diagnose and treat my PCOS effectively when other doctors couldn't. I had irregular periods and weight gain issues for years, and previous treatments weren't helping. Dr. Bhatnagar's holistic approach combining medication, diet changes, and lifestyle modifications has made a huge difference.",
      date: "2023-04-10"
    },
    {
      id: "4",
      author: "Anjali Kapoor",
      rating: 5,
      content: "After two failed IVF attempts elsewhere, Dr. Bhatnagar's protocol worked for us. Her knowledge and empathetic care are unmatched. She identified some underlying immunological factors that were affecting implantation and addressed them before our third cycle. We're now expecting twins and couldn't be happier!",
      date: "2023-03-05"
    },
    {
      id: "5",
      author: "Deepika Patel",
      rating: 4,
      content: "Good experience overall. The clinic can get busy, but Dr. Bhatnagar never rushes through appointments and addresses all concerns. I consulted her for recurring UTIs and endometriosis pain. The treatment plan has been effective, though I sometimes wish the waiting time was shorter.",
      date: "2023-02-15"
    },
    {
      id: "6",
      author: "Shalini Gupta",
      rating: 5,
      content: "Dr. Bhatnagar's expertise in reproductive health is exceptional. She helped me navigate complex fertility issues with clarity and compassion. I had a history of recurrent miscarriages, and she ordered comprehensive testing that revealed underlying thrombophilia. With proper treatment and monitoring, I finally had a successful pregnancy.",
      date: "2023-04-18"
    },
    {
      id: "7",
      author: "Meenakshi Sharma",
      rating: 3.5,
      content: "Decent doctor but the waiting times can be long. Treatment was effective though scheduling follow-ups was sometimes difficult. I went to her for menopause management, and the hormone therapy she prescribed has helped with my symptoms. The reception staff could be more organized with appointments.",
      date: "2022-12-10"
    },
    {
      id: "8",
      author: "Aarti Khanna",
      rating: 5,
      content: "After years of misdiagnosis, Dr. Bhatnagar correctly identified and treated my endometriosis. I suffered from debilitating pain for nearly a decade, and multiple doctors dismissed it as normal period pain. Dr. Bhatnagar listened to my symptoms, ordered the right tests, and performed laparoscopic surgery that confirmed stage 3 endometriosis. Her care has been life-changing.",
      date: "2022-10-12"
    }
  ];
  
  return isEyeDoctor ? eyeDoctorReviews : gynecologistReviews;
}

export default GoogleReviews;
