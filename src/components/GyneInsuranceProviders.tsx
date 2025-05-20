import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useGyneInsuranceProviders, GyneInsuranceProvider } from "@/hooks/useGyneInsuranceProviders";
import { Loader2 } from "lucide-react";

// Fallback data in case the API fails
const fallbackInsuranceProviders = [
  "Central Government Health Scheme (CGHS)",
  "Delhi Government Employees Health Scheme (DGEHS)",
  "Municipal Corporation of Delhi (MCD)",
  "New Delhi Municipal Council (NDMC)",
  "North Delhi Power Limited (TPDDL)",
  "Delhi Transport Corporation (DTC)",
  "Delhi Transco Limited (DTL)",
  "Delhi Jal Board (DJB)",
  "Delhi Development Authority (DDA)",
  "Food Corporation of India (FCI)",
  "Indraprastha Power Gen. Co. Ltd (IPGCL)",
  "Mahanagar Telephone Nigam Limited (MTNL)",
  "Delhi Cantonment hospital (DCB)",
  "Delhi University (DU)",
  "Bharat Heavy Electricals Limited (BHEL)",
  "Sports Authority of India Ltd. (SAI)",
  "Press Council of India (PCI)",
  "Jawahar Lal Nehru University (JNU)",
  "Indian Agricultural Research Institute (IARI)",
  "Indian Agricultural Statics Research Institute",
  "Indian Council of Agricultural Research",
  "Indian Urban Arts Commission (IUAC)",
  "Nation Institute of Fashion Technology (NIFT)",
  "Inter-University Accelerator Centre (IUAC)",
  "Delhi Electricity Regulatory Commission (DERC)",
  "National Institute of Public Corporation & Child Development",
  "Bajaj Allianz General Ins. Co. Ltd",
  "Alankit Health Care Ltd.",
  "Family Health Plan Limited (FHPL)",
  "Medsave Insurance TPA Pvt. Ltd.",
  "Paramount Health Insurance TPA Pvt. Ltd.",
  "Genins India Ltd.",
  "HDFC ERGO General Insurance",
  "Heritage Health Insurance TPA Pvt. Ltd.",
  "Raksha Health Insurance TPA Pvt. Ltd.",
  "Vidal Health Insurance TPA Pvt, Ltd.",
  "Manipal Cigna Healthcare Ltd."
];

const fallbackFeaturedProviders = [
  {
    id: "1",
    name: "Central Government Health Scheme (CGHS)",
    image_url: "/lovable-uploads/22774699-5502-4b25-994c-eeb2d3cf91ff.png",
    sort_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    name: "Delhi Government Employees Health Scheme (DGEHS)",
    image_url: "/lovable-uploads/2b09fcb1-f9aa-4d77-92b3-845e510b2f97.png",
    sort_order: 2,
    created_at: new Date().toISOString()
  },
  {
    id: "3",
    name: "Municipal Corporation of Delhi (MCD)",
    image_url: "/lovable-uploads/7541ab82-360c-4f9c-af5e-152356a67736.png",
    sort_order: 3,
    created_at: new Date().toISOString()
  },
  {
    id: "4",
    name: "New Delhi Municipal Council (NDMC)",
    image_url: "/lovable-uploads/0f493370-27f4-4d29-b3f9-da336d50b1ea.png",
    sort_order: 4,
    created_at: new Date().toISOString()
  }
];

interface InsuranceProvidersProps {
  variant?: 'eyecare' | 'gynecology';
}

export function GyneInsuranceProviders({ variant = 'eyecare' }: InsuranceProvidersProps) {
  // Get providers from the hook with fallback to hardcoded data in case of error
  const { featuredProviders, insuranceProviders, isLoading, error } = useGyneInsuranceProviders();
  
  // Use fallback data if there's an error or no data
  const hasFeaturedProviders = !error && featuredProviders && featuredProviders.length > 0;
  const hasInsuranceProviders = !error && insuranceProviders && insuranceProviders.length > 0;

  const buttonClass = variant === 'eyecare' 
    ? "bg-[#3989d2] hover:bg-[#2f7ac0] text-white" 
    : "bg-[#d94991] hover:bg-[#c13a7c] text-white";

  const titleClass = variant === 'eyecare' 
    ? "text-[#3989d2]"
    : "text-[#d94991]";

  if (isLoading) {
    return (
      <div className="space-y-6 flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {hasFeaturedProviders ? (
          featuredProviders.map((provider) => (
            <div key={provider.id} className="text-center p-4 rounded-xl border border-gray-200 bg-white transition-shadow duration-300 hover:shadow-lg">
              <div className="mb-3 h-24 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                <img
                  src={provider.image}
                  alt={provider.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <h3 className="font-semibold text-gray-700">{provider.name}</h3>
            </div>
          ))
        ) : (
          // Fallback featured providers
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center p-4 rounded-xl border border-gray-200 bg-white transition-shadow duration-300 hover:shadow-lg">
              <div className="mb-3 h-24 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                <img
                  src="/providers/aetna.png"
                  alt="Aetna"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <h3 className="font-semibold text-gray-700">Aetna</h3>
            </div>
            <div className="text-center p-4 rounded-xl border border-gray-200 bg-white transition-shadow duration-300 hover:shadow-lg">
              <div className="mb-3 h-24 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                <img
                  src="/providers/cigna.png"
                  alt="Cigna"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <h3 className="font-semibold text-gray-700">Cigna</h3>
            </div>
            <div className="text-center p-4 rounded-xl border border-gray-200 bg-white transition-shadow duration-300 hover:shadow-lg">
              <div className="mb-3 h-24 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                <img
                  src="/providers/united.png"
                  alt="United Healthcare"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <h3 className="font-semibold text-gray-700">United Healthcare</h3>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center mt-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button className={buttonClass}>
              View All Insurance Vendors
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className={`text-2xl font-bold mb-4 ${titleClass}`}>
                Insurance Vendors
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              {hasInsuranceProviders ? (
                insuranceProviders.map((provider, index) => (
                  <motion.div
                    key={provider}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <span className="text-gray-700">
                      {index + 1}. {provider}
                    </span>
                  </motion.div>
                ))
              ) : (
                fallbackInsuranceProviders.map((provider, index) => (
                  <motion.div
                    key={provider}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <span className="text-gray-700">
                      {index + 1}. {provider}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
