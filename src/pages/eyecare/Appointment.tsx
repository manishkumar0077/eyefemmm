import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, CheckCircle, Clock, MapPin, Phone } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EyeCareNavbar from "@/components/EyeCareNavbar";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import { useManualHolidays } from "@/hooks/useManualHolidays";
import { InsuranceProviders } from "@/components/InsuranceProviders";

const EyeCareAppointment = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    time: "",
    reason: "",
    additionalInfo: "",
    age: "",
    gender: ""
  });
  const {
    manualHolidays,
    holidayForDate,
    loading: holidayLoading
  } = useManualHolidays('eye');
  const isHolidayDate = (date: Date) => !!holidayForDate(date);
  const getHolidayReasonForDate = (date: Date) => holidayForDate(date)?.reason || "";
  const selectedDateHolidayReason = date && isHolidayDate(date) ? getHolidayReasonForDate(date) : "";
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      id,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };
  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && isHolidayDate(selectedDate)) {
      const reason = getHolidayReasonForDate(selectedDate);
      const doctorSpecific = manualHolidays.find(h => h.date.getFullYear() === selectedDate.getFullYear() && h.date.getMonth() === selectedDate.getMonth() && h.date.getDate() === selectedDate.getDate() && h.doctor === 'eye');
      toast({
        title: "Date Unavailable",
        description: doctorSpecific ? `Dr. Sanjeev Lehri is unavailable on this date: ${reason}. Please select another date.` : `The clinic is closed on this date: ${reason}. Please select another date.`,
        variant: "destructive"
      });
      return;
    }
    setDate(selectedDate);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast({
        title: "Please select a date",
        description: "A date is required to book an appointment",
        variant: "destructive"
      });
      return;
    }
    if (!formData.time) {
      toast({
        title: "Please select a time slot",
        description: "A time slot is required to book an appointment",
        variant: "destructive"
      });
      return;
    }
    if (!formData.reason) {
      toast({
        title: "Please select a reason for visit",
        description: "A reason is required to book an appointment",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const formattedDate = format(date, "PPP");
      const ageNumber = formData.age ? parseInt(formData.age) : null;
      const {
        data: appointmentData,
        error: dbError
      } = await supabase.from('appointments').insert({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        date: formattedDate,
        time: formData.time,
        reason: formData.reason,
        additional_info: formData.additionalInfo,
        specialty: "eyecare",
        clinic: "Eyefem Eye Care Clinic",
        doctor: "Sanjeev Lehri",
        status: "pending",
        age: ageNumber,
        gender: formData.gender || null
      }).select();
      if (dbError) {
        throw new Error(dbError.message);
      }
      console.log("Appointment stored in database:", appointmentData);
      toast({
        title: "Processing your appointment",
        description: "Please wait while we prepare your confirmation..."
      });
      const {
        data,
        error
      } = await supabase.functions.invoke("send-appointment", {
        body: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          date: formattedDate,
          time: formData.time,
          reason: formData.reason,
          additionalInfo: formData.additionalInfo,
          specialty: "eyecare",
          clinic: "Eyefem Eye Care Clinic",
          doctor: "Sanjeev Lehri",
          age: ageNumber,
          gender: formData.gender || null
        }
      });
      if (error) {
        console.error("Error invoking edge function:", error);
        throw new Error("Failed to send email notifications: " + error.message);
      }
      console.log("Appointment submission response:", data);
      setFormSubmitted(true);
      toast({
        title: "Appointment Request Submitted",
        description: "We'll contact you shortly to confirm your appointment.",
        variant: "default"
      });
    } catch (error) {
      console.error("Error submitting appointment:", error);
      toast({
        title: "Error Submitting Appointment",
        description: "There was a problem submitting your appointment request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://static.elfsight.com/platform/platform.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  return <PageTransition>
      <div className="min-h-screen flex flex-col">
        <EyeCareNavbar />

        <main className="flex-grow pt-16 sm:pt-20">
          <section className="bg-gradient-eyecare text-white py-10 sm:py-12 md:py-16 lg:py-24">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="text-center max-w-4xl mx-auto" data-aos="fade-up">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                  Book Your Appointment
                </h1>
                <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 md:mb-8 text-white/90">
                  Schedule a consultation with Dr. Sanjeev Lehri and take the first 
                  step towards better eye health and improved vision.
                </p>
              </div>
            </div>
          </section>

          <section className="py-8 sm:py-12 md:py-16 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
                <div data-aos="fade-right">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-eyecare">Contact Information</h2>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-eyecare shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold mb-1">Our Location</h3>
                        <p className="text-gray-600 text-sm sm:text-base">
                          11, W Patel Nagar Rd, Block 25, East Patel Nagar<br />
                          Patel Nagar, New Delhi, Delhi 110008
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 sm:gap-4">
                      <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-eyecare shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold mb-1">Phone</h3>
                        <p className="text-gray-600 text-sm sm:text-base">+91 9811150984</p>
                        <p className="text-gray-600 text-sm sm:text-base">+011 25815000</p>
                        <p className="text-gray-600 text-sm sm:text-base">+011 25815001</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 sm:gap-4">
                      <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-eyecare shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold mb-1">Working Hours</h3>
                        <p className="text-gray-600 text-sm sm:text-base">Monday to Saturday: 10:00 AM - 1:00 PM & 6:00 PM - 8:00 PM</p>
                        <p className="text-gray-600 text-sm sm:text-base">Sunday: Closed</p>
                        <p className="text-gray-600 italic text-xs sm:text-sm mt-1">Note: Morning timings may vary depending on surgery schedules. Please call before visiting.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 sm:mt-8 md:mt-12">
                    <div className="rounded-xl overflow-hidden h-[250px] sm:h-[300px] md:h-[350px] shadow-lg hover:shadow-xl transition-shadow border-2 border-eyecare/20 hover:border-eyecare/50">
                      <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.524060690657!2d77.17232637455771!3d28.644023183560474!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d02953eb38bb1%3A0xa0ea631720ea3a2b!2sClinic%20Eye%20Fem!5e0!3m2!1sen!2sin!4v1744354879831!5m2!1sen!2sin!4v1744354879831!5m2!1sen!2sin" width="100%" height="100%" style={{
                      border: 0
                    }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Clinic Eye Fem Location" className="w-full h-full object-cover"></iframe>
                    </div>
                  </div>
                </div>
                
                <div data-aos="fade-left" className="mt-10 lg:mt-0">
                  {!formSubmitted ? <>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-eyecare">Request an Appointment</h2>
                      
                      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-1 sm:space-y-2">
                            <Label htmlFor="firstName" className="text-sm sm:text-base">First Name</Label>
                            <Input id="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Enter your first name" className="h-9 sm:h-10" />
                          </div>
                          
                          <div className="space-y-1 sm:space-y-2">
                            <Label htmlFor="lastName" className="text-sm sm:text-base">Last Name</Label>
                            <Input id="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Enter your last name" className="h-9 sm:h-10" />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-1 sm:space-y-2">
                            <Label htmlFor="age" className="text-sm sm:text-base">Age</Label>
                            <Input id="age" type="number" value={formData.age} onChange={handleChange} required placeholder="Enter your age" min="1" max="120" className="h-9 sm:h-10" />
                          </div>
                          
                          <div className="space-y-1 sm:space-y-2">
                            <Label className="text-sm sm:text-base">Gender</Label>
                            <Select onValueChange={value => handleSelectChange("gender", value)} required>
                              <SelectTrigger className="w-full h-9 sm:h-10">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-1 sm:space-y-2">
                            <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleChange} required placeholder="Enter your email address" className="h-9 sm:h-10" />
                          </div>
                          
                          <div className="space-y-1 sm:space-y-2">
                            <Label htmlFor="phone" className="text-sm sm:text-base">Phone Number</Label>
                            <Input id="phone" value={formData.phone} onChange={handleChange} required placeholder="Enter your phone number" className="h-9 sm:h-10" />
                          </div>
                        </div>
                        
                        <div className="space-y-1 sm:space-y-2">
                          <Label className="text-sm sm:text-base">Preferred Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={`w-full h-9 sm:h-10 justify-start text-left font-normal text-sm sm:text-base ${!date ? "text-muted-foreground" : ""}`}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Select your preferred date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateSelect}
                                initialFocus
                                disabled={(date) => isHolidayDate(date) || date < new Date() || date.getDay() === 0}
                              />
                              {date && isHolidayDate(date) && (
                                <div className="px-4 py-2 text-red-500 text-sm">
                                  Notice: {selectedDateHolidayReason}
                                </div>
                              )}
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="space-y-1 sm:space-y-2">
                          <Label className="text-sm sm:text-base">Preferred Time</Label>
                          <Select onValueChange={value => handleSelectChange("time", value)}>
                            <SelectTrigger className="w-full h-9 sm:h-10">
                              <SelectValue placeholder="Select time slot" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Morning (10 AM - 12 PM)">Morning (10 AM - 12 PM)</SelectItem>
                              <SelectItem value="Afternoon (12 PM - 3 PM)">Afternoon (12 PM - 3 PM)</SelectItem>
                              <SelectItem value="Evening (3 PM - 6 PM)">Evening (3 PM - 6 PM)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-1 sm:space-y-2">
                          <Label className="text-sm sm:text-base">Reason for Visit</Label>
                          <Select onValueChange={value => handleSelectChange("reason", value)}>
                            <SelectTrigger className="w-full h-9 sm:h-10">
                              <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Routine Eye Examination">Routine Eye Examination</SelectItem>
                              <SelectItem value="Cataract Consultation">Cataract Consultation</SelectItem>
                              <SelectItem value="LASIK / Refractive Surgery">LASIK / Refractive Surgery</SelectItem>
                              <SelectItem value="Glaucoma Check-up">Glaucoma Check-up</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-1 sm:space-y-2">
                          <Label htmlFor="additionalInfo" className="text-sm sm:text-base">Additional Information</Label>
                          <Textarea id="additionalInfo" value={formData.additionalInfo} onChange={handleChange} placeholder="Please provide any additional details about your condition or requirements." rows={3} className="text-sm sm:text-base" />
                        </div>
                        
                        <Button type="submit" className="mac-btn eyecare-btn w-full h-10 sm:h-12 mt-2 sm:mt-4" disabled={isLoading}>
                          {isLoading ? "Submitting..." : "Submit Appointment Request"}
                        </Button>
                      </form>
                    </> : <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                        <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
                      </div>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4 text-eyecare">Thank You!</h2>
                      <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-4 sm:mb-6">
                        Your appointment request has been successfully submitted. We've sent you a confirmation 
                        email with the details. Our team will contact you shortly to confirm your appointment.
                      </p>
                      
                      <Link to="/eyecare">
                        <Button className="mac-btn eyecare-btn h-10 sm:h-12 text-sm sm:text-base">
                          Return to Eye Care Home
                        </Button>
                      </Link>
                    </div>}
                </div>
              </div>
            </div>
          </section>

          <section className="py-10 sm:py-12 md:py-16 px-4 bg-gray-50">
            <div className="container mx-auto max-w-6xl text-center" data-aos="fade-up">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 md:mb-6 text-eyecare">
                Insurance Information
              </h2>
              <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 md:mb-8 text-gray-600 max-w-3xl mx-auto">
                We accept most major insurance plans. Please contact our office to verify 
                your insurance coverage before your appointment.
              </p>
              
              <InsuranceProviders />
            </div>
          </section>
        </main>

        <Footer />
        {/* Elfsight WhatsApp Chat | Untitled WhatsApp Chat */}
        <div className="elfsight-app-a33bc770-938d-4a29-a90b-1d1514e16817" data-elfsight-app-lazy></div>
      </div>
    </PageTransition>;
};

export default EyeCareAppointment;
