import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LandingPageEditor } from "@/pages/admin/content-editors/LandingPageEditor";
import { ServiceCardsEditor } from "@/pages/admin/content-editors/ServiceCardsEditor";
import { WhyChooseUsEditor } from "@/pages/admin/content-editors/WhyChooseUsEditor";
import { DepartmentsEditor } from "@/pages/admin/content-editors/DepartmentsEditor";
import { EyeCareConditionsEditor } from "@/pages/admin/content-editors/EyeCareConditionsEditor";
import { EyeCareWhyChooseEditor } from "@/pages/admin/content-editors/EyeCareWhyChooseEditor";
// import { EyeCareServicesEditor } from "@/pages/admin/content-editors/EyeCareServicesEditor";
import { EyeCareTabServicesEditor } from "@/pages/admin/content-editors/EyeCareTabServicesEditor";
import { EyeCareTabServicesEditorLatest } from "@/pages/admin/content-editors/EyeCareTabServicesEditorLatest";
import { EyeTestimonialsEditor } from "@/pages/admin/content-editors/EyeTestimonialsEditor";
import { DoctorProfileEditor } from "@/pages/admin/content-editors/DoctorProfileEditor";
import { DoctorMessageEditor } from "@/pages/admin/content-editors/DoctorMessageEditor";
import { DoctorQualificationsEditor } from "@/pages/admin/content-editors/DoctorQualificationsEditor";
import { DoctorExpertiseEditor } from "@/pages/admin/content-editors/DoctorExpertiseEditor";
import { ServiceHighlightsEditor } from "@/pages/admin/content-editors/ServiceHighlightsEditor";
import { GynecologyServicesEditor } from "@/pages/admin/content-editors/GynecologyServicesEditor";
import FertilityContentEditor from "@/components/admin/FertilityContentEditor";
import { DoctorWhyChooseEditor } from "@/pages/admin/content-editors/DoctorWhyChooseEditor";
import { DoctorTreatmentsEditor } from "@/pages/admin/content-editors/DoctorTreatmentsEditor";
import { TestimonialsEditor } from "@/pages/admin/content-editors/TestimonialsEditor";
import { FaqsEditor } from "@/pages/admin/content-editors/FaqsEditor";
import { DoctorGyneEditor } from "@/pages/admin/content-editors/DoctorGyneEditor";
import { DoctorGyneMessageEditor } from "@/pages/admin/content-editors/DoctorGyneMessageEditor";
import { GyneQualificationsEditor } from "@/pages/admin/content-editors/GyneQualificationsEditor";
import { GyneExpertiseEditor } from "@/pages/admin/content-editors/GyneExpertiseEditor";
import { AdvancedProceduresEditor } from "@/pages/admin/content-editors/AdvancedProceduresEditor";
import { GalleryImagesEditor } from '@/pages/admin/content-editors/GalleryImagesEditor';
// import { EyecareImagesEditor } from '@/pages/admin/content-editors/EyecareImagesEditor';
import { EyecareHeroSectionEditor } from '@/pages/admin/content-editors/EyecareHeroSectionEditor';
import { BookOpen, Stethoscope, Eye, ImageIcon, UserRound, ListIcon } from 'lucide-react';
import { DoctorSpecialitiesEditor } from './content-editors/DoctorSpecialitiesEditor';
import { DoctorGalleryEditor } from "./content-editors/DoctorGalleryEditor";
import { EyeCareProcedureEditor } from "./content-editors/EyeCareProcedureEditor";
import { EyeCareDetailsEditor } from "./content-editors/EyeCareDetailsEditor";
import { GynecologyProceduresEditor } from "@/pages/admin/content-editors/GynecologyProceduresEditor";
import { InsuranceProvidersEditor } from "@/pages/admin/content-editors/InsuranceProvidersEditor";
import { GyneInsuranceProvidersEditor } from "@/pages/admin/content-editors/GyneInsuranceProvidersEditor";

const EditContent = () => {
  const [activeTab, setActiveTab] = useState("landing-page");
  const [activeCategory, setActiveCategory] = useState("general");

  // Group tabs by category
  const categories = {
    general: ["landing-page", "service-cards", "why-choose-us", "departments", "gallery-images", "doctor-specialities"],
    gynecology: [
      "service-highlights",
      "gynecology-services", 
      "fertility-section", 
      "doctor-why-choose",
      "doctor-treatments",
      "gynecology-procedures",
      "advanced-procedures",
      "doctor-gyne", 
      "doctor-gyne-message",
      "gyne-qualifications",
      "gyne-expertise",
      "testimonials",
      "faqs",
      "gyne-insurance-providers"
    ],
    eyecare: [
      "eyecare-hero",
      "eye-conditions", 
      "eyecare-why-choose", 
      "eyecare-services",
      "eyecare-tab-services",
      "eye-testimonials", 
      "doctor-profile",
      "doctor-message",
      "doctor-qualifications",
      "doctor-expertise",
      "doctor-gallery",
      "eye-care-procedures",
      "eye-care-details",
      "eye-insurance-providers"
      // "eyecare-images"
    ]
  };

  // Category labels and icons
  const categoryData = {
    general: {
      label: "General Content",
      icon: <BookOpen className="w-4 h-4 mr-2" />
    }, eyecare: {
      label: "Eye Care Department",
      icon: <Eye className="w-4 h-4 mr-2" />
    },
    gynecology: {
      label: "Gynecology Department",
      icon: <Stethoscope className="w-4 h-4 mr-2" />
    },
   
  };

  // Tab labels
  const tabLabels = {
    "landing-page": "Hero Section",
    "service-cards": "Service Cards",
    "why-choose-us": "Why Choose Us",
    "service-highlights": "Service Highlights",
    "gallery-images": "Gallery Images",
    "doctor-specialities": "Doctor Specialities",
    "gynecology-services": "Gynecology Services",
    "fertility-section": "Fertility Section",
    "doctor-why-choose": "Doctor Why Choose",
    "doctor-treatments": "Doctor Treatments",
    "advanced-procedures": "Advanced Procedures",
    "doctor-gyne": "Gyne Doctor Profile",
    "doctor-gyne-message": "Doctor's Message",
    "gyne-qualifications": "Doctor's Qualifications",
    "gyne-expertise": "Doctor's Expertise",
    "testimonials": "Testimonials",
    "faqs": "FAQs",
    "gyne-insurance-providers": "Gyne Insurance Providers",
    "departments": "Departments",
    "eyecare-hero": "Eyecare Hero Section",
    "eye-conditions": "Eye Conditions",
    "eyecare-why-choose": "Eyecare Why Choose",
    "eyecare-services": "Eyecare Services",
    "eye-testimonials": "Eye Testimonials",
    "doctor-profile": "Doctor Profile",
    "doctor-message": "Doctor's Message",
    "doctor-qualifications": "Doctor Qualifications",
    "doctor-expertise": "Doctor Expertise",
    "doctor-gallery": "Doctor Gallery",
    "eye-care-procedures": "Eye Care Procedures",
    "eye-care-details": "Eye Care Details",
    "gynecology-procedures": "Gynecology Procedures",
    // "eyecare-images": "Eyecare Images",
    "eyecare-tab-services": "Eyecare Tab Services",
    "eye-insurance-providers": "Eye Insurance Providers"
  };

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value);
    
    // Find which category contains this tab
    for (const [category, tabs] of Object.entries(categories)) {
      if (tabs.includes(value)) {
        setActiveCategory(category);
        break;
      }
    }
  };

  // Render the appropriate editor component based on active tab
  const renderEditor = (tab) => {
    const editorComponents = {
      "landing-page": <LandingPageEditor />,
      "service-cards": <ServiceCardsEditor />,
      "why-choose-us": <WhyChooseUsEditor />,
      "service-highlights": <ServiceHighlightsEditor />,
      "gallery-images": <GalleryImagesEditor />,
      "doctor-specialities": <DoctorSpecialitiesEditor />,
      "gynecology-services": <GynecologyServicesEditor />,
      "fertility-section": <FertilityContentEditor />,
      "doctor-why-choose": <DoctorWhyChooseEditor />,
      "doctor-treatments": <DoctorTreatmentsEditor />,
      "advanced-procedures": <AdvancedProceduresEditor />,
      "doctor-gyne": <DoctorGyneEditor />,
      "doctor-gyne-message": <DoctorGyneMessageEditor />,
      "gyne-qualifications": <GyneQualificationsEditor />,
      "gyne-expertise": <GyneExpertiseEditor />,
      "testimonials": <TestimonialsEditor />,
      "faqs": <FaqsEditor />,
      "gyne-insurance-providers": <GyneInsuranceProvidersEditor />,
      "departments": <DepartmentsEditor />,
      "eyecare-hero": <EyecareHeroSectionEditor />,
      "eye-conditions": <EyeCareConditionsEditor />,
      "eyecare-why-choose": <EyeCareWhyChooseEditor />,
      // "eyecare-services": <EyeCareServicesEditor />,
      "eye-testimonials": <EyeTestimonialsEditor />,
      "doctor-profile": <DoctorProfileEditor />,
      "doctor-message": <DoctorMessageEditor />,
      "doctor-qualifications": <DoctorQualificationsEditor />,
      "doctor-expertise": <DoctorExpertiseEditor />,
      "doctor-gallery": <DoctorGalleryEditor />,
      "eye-care-procedures": <EyeCareProcedureEditor />,
      "eye-care-details": <EyeCareDetailsEditor />,
      "eye-insurance-providers": <InsuranceProvidersEditor />,
      "gynecology-procedures": <GynecologyProceduresEditor />,
      // "eyecare-images": <EyecareImagesEditor />,
      "eyecare-tab-services": <EyeCareTabServicesEditorLatest />
    };
    
    return editorComponents[tab] || null;
  };
  
  // Get tab description
  const getTabDescription = (tab) => {
    const descriptions = {
      "landing-page": "Edit the hero section text on your landing page",
      "service-cards": "Edit the service cards displayed on your landing page",
      "why-choose-us": 'Edit the "Why Choose Us" section and benefit cards',
      "service-highlights": "Edit the highlights for gynecology services shown on the home page",
      "gallery-images": "Manage the clinic image gallery shown on the gallery page",
      "doctor-specialities": "Manage doctor profiles and specialities shown on specialty pages",
      "eyecare-services": "Edit the legacy services displayed on the eye care department home page",
      "eyecare-tab-services": "Edit the new tab-based services displayed on the eye care services page",
      "fertility-section": "Edit the fertility treatments section on the gynecology home page",
      "doctor-why-choose": 'Edit the "Why Choose Us" benefits displayed on the gynecology home page',
      "doctor-treatments": "Edit the treatments and procedures offered by Dr. Bhatnagar on the gynecology health page",
      "advanced-procedures": "Edit the Advanced Procedures section on Dr. Bhatnagar's doctor page",
      "doctor-gyne": "Edit Dr. Nisha Bhatnagar's profile information",
      "doctor-gyne-message": "Edit the personal message from Dr. Nisha Bhatnagar displayed on the doctor page",
      "gyne-qualifications": "Edit Dr. Nisha Bhatnagar's education, certifications, and registrations",
      "gyne-expertise": "Edit Dr. Nisha Bhatnagar's areas of expertise and specializations",
      "testimonials": "Edit the testimonials displayed on the gynecology health page",
      "faqs": "Edit the FAQs displayed on the gynecology health page",
      "gyne-insurance-providers": "Edit the insurance providers displayed on the gynecology health page",
      "departments": "Edit department information and services",
      "eyecare-hero": "Edit the Advanced Eye Care Services hero section on the Eyecare homepage",
      "eye-conditions": "Manage eye conditions section and individual condition cards",
      "eyecare-why-choose": 'Manage the "Why Choose Our Eye Care Center" section on the Eyecare homepage',
      // "eyecare-services": "Manage the services tabs, subsections and items displayed on the Eyecare conditions page",
      "eye-testimonials": "Manage patient testimonials for Dr. Sanjeev Lehri - displayed on both Doctor and Conditions pages",
      "doctor-profile": "Edit Dr. Sanjeev Lehri's profile information",
      "doctor-message": "Edit the personal message from Dr. Sanjeev Lehri displayed on the doctor page",
      "doctor-qualifications": "Manage Dr. Sanjeev Lehri's qualifications and training",
      "doctor-expertise": "Manage Dr. Sanjeev Lehri's areas of expertise",
      "doctor-gallery": "Manage the doctor's gallery images",
      "eye-care-procedures": "Manage eye care procedures",
      "eye-care-details": "Manage eye care details",
      "eye-insurance-providers": "Manage insurance providers and featured insurance partners",
      "gynecology-procedures": "Manage Dr. Nisha Bhatnagar's procedure images and information",
      "eyecare-images": "Manage image gallery for different eyecare sections organized by category"
    };
    
    return descriptions[tab] || "";
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl md:text-3xl font-bold mb-3">Edit Website Content</h1>
        <p className="text-gray-500 text-base md:text-lg">Manage text content throughout your website</p>
      </div>

      {/* Category Selection */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-medium mb-4">Select Content Category</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          {Object.entries(categoryData).map(([category, data]) => (
            <Button 
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              className={`px-4 py-2 text-sm md:text-base rounded-md transition-all duration-200 flex justify-center items-center
                ${activeCategory === category 
                  ? "bg-primary text-primary-foreground font-medium shadow-md" 
                  : "hover:bg-primary/10 hover:shadow-sm"
                }
              `}
              onClick={() => {
                setActiveCategory(category);
                // Set active tab to first tab in category
                setActiveTab(categories[category][0]);
              }}
            >
              {data.icon}
              {data.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border rounded-lg p-6 bg-muted/30 shadow-sm">
          <div className="mb-4 pl-2">
            <h3 className="font-medium text-lg text-primary">
              {categoryData[activeCategory].label} Options
            </h3>
          </div>
          
          {/* Group buttons by logical sections */}
          {activeCategory === 'general' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2 border-b pb-1">Home Page Content</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {['landing-page', 'service-cards', 'why-choose-us'].map((tabValue) => (
                    <Button
                      key={tabValue}
                      variant={activeTab === tabValue ? "default" : "outline"}
                      className={`py-2 px-3 text-sm h-auto whitespace-normal text-center flex items-center justify-center rounded-md
                        ${activeTab === tabValue 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-background hover:bg-muted"
                        }
                      `}
                      onClick={() => handleTabChange(tabValue)}
                    >
                      {tabLabels[tabValue]}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2 border-b pb-1">Other General Content</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {['departments', 'gallery-images', 'doctor-specialities'].map((tabValue) => (
                    <Button
                      key={tabValue}
                      variant={activeTab === tabValue ? "default" : "outline"}
                      className={`py-2 px-3 text-sm h-auto whitespace-normal text-center flex items-center justify-center rounded-md
                        ${activeTab === tabValue 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-background hover:bg-muted"
                        }
                      `}
                      onClick={() => handleTabChange(tabValue)}
                    >
                      {tabValue === "doctor-specialities" && <UserRound className="h-4 w-4 mr-1" />}
                      {tabLabels[tabValue]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'eyecare' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2 border-b pb-1">Department Home Page</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {['eyecare-hero', 'eye-conditions', 'eyecare-why-choose', 'eyecare-tab-services'].map((tabValue) => (
                    <Button
                      key={tabValue}
                      variant={activeTab === tabValue ? "default" : "outline"}
                      className={`py-2 px-3 text-sm h-auto whitespace-normal text-center flex items-center justify-center rounded-md
                        ${activeTab === tabValue 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-background hover:bg-muted"
                        }
                      `}
                      onClick={() => handleTabChange(tabValue)}
                    >
                      {tabLabels[tabValue]}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2 border-b pb-1">Doctor Profile</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {['doctor-profile', 'doctor-message', 'doctor-qualifications', 'doctor-expertise', 'doctor-gallery'].map((tabValue) => (
                    <Button
                      key={tabValue}
                      variant={activeTab === tabValue ? "default" : "outline"}
                      className={`py-2 px-3 text-sm h-auto whitespace-normal text-center flex items-center justify-center rounded-md
                        ${activeTab === tabValue 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-background hover:bg-muted"
                        }
                      `}
                      onClick={() => handleTabChange(tabValue)}
                    >
                      {tabLabels[tabValue]}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2 border-b pb-1">Other Eye Care Content</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {['eye-testimonials', 'eye-care-procedures', 'eye-care-details', 'eye-insurance-providers'].map((tabValue) => (
                    <Button
                      key={tabValue}
                      variant={activeTab === tabValue ? "default" : "outline"}
                      className={`py-2 px-3 text-sm h-auto whitespace-normal text-center flex items-center justify-center rounded-md
                        ${activeTab === tabValue 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-background hover:bg-muted"
                        }
                      `}
                      onClick={() => handleTabChange(tabValue)}
                    >
                      {tabLabels[tabValue]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'gynecology' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2 border-b pb-1">Department Home Page</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {['service-highlights', 'gynecology-services', 'fertility-section', 'doctor-why-choose', 'doctor-treatments'].map((tabValue) => (
                    <Button
                      key={tabValue}
                      variant={activeTab === tabValue ? "default" : "outline"}
                      className={`py-2 px-3 text-sm h-auto whitespace-normal text-center flex items-center justify-center rounded-md
                        ${activeTab === tabValue 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-background hover:bg-muted"
                        }
                      `}
                      onClick={() => handleTabChange(tabValue)}
                    >
                      {tabLabels[tabValue]}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2 border-b pb-1">Doctor Profile</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {['doctor-gyne', 'doctor-gyne-message', 'gyne-qualifications', 'gyne-expertise', 'advanced-procedures', 'gynecology-procedures'].map((tabValue) => (
                    <Button
                      key={tabValue}
                      variant={activeTab === tabValue ? "default" : "outline"}
                      className={`py-2 px-3 text-sm h-auto whitespace-normal text-center flex items-center justify-center rounded-md
                        ${activeTab === tabValue 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-background hover:bg-muted"
                        }
                      `}
                      onClick={() => handleTabChange(tabValue)}
                    >
                      {tabLabels[tabValue]}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2 border-b pb-1">Other Content</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {['testimonials', 'faqs', 'gyne-insurance-providers'].map((tabValue) => (
                    <Button
                      key={tabValue}
                      variant={activeTab === tabValue ? "default" : "outline"}
                      className={`py-2 px-3 text-sm h-auto whitespace-normal text-center flex items-center justify-center rounded-md
                        ${activeTab === tabValue 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-background hover:bg-muted"
                        }
                      `}
                      onClick={() => handleTabChange(tabValue)}
                    >
                      {tabLabels[tabValue]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <h2 className="text-xl font-medium">{tabLabels[activeTab]}</h2>
          <div className="h-4 w-px bg-gray-300"></div>
          <p className="text-gray-500 text-sm">{getTabDescription(activeTab)}</p>
        </div>
        
        {renderEditor(activeTab)}
      </div>
    </div>
  );
};

export default EditContent;