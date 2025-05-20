import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import AOS from "aos";
import "aos/dist/aos.css";
import "react-quill/dist/quill.snow.css"; // Add Quill CSS
import "@/styles/quill-editor.css"; // Add our custom Quill styles

// Import pages
import LandingPage from "@/pages/LandingPage";
import SpecialtyChoice from "@/pages/SpecialtyChoice";
import NotFound from "@/pages/NotFound";
import Developers from "@/pages/Developers";
import Gallery from "@/pages/Gallery";

// EyeCare pages
import EyeCareHome from "@/pages/eyecare/Home";
import EyeCareConditions from "@/pages/eyecare/Conditions";
import EyeCareDoctor from "@/pages/eyecare/Doctor";
import EyeCareAppointment from "@/pages/eyecare/Appointment";

// Gynecology pages
import GynecologyHome from "@/pages/gynecology/Home";
import GynecologyHealth from "@/pages/gynecology/Health";
import GynecologyDoctor from "@/pages/gynecology/Doctor";
import GynecologyAppointment from "@/pages/gynecology/Appointment";

// Admin pages
import AdminLogin from "@/pages/admin/Login";
import ForgotPassword from "@/pages/admin/ForgotPassword";
import ResetPassword from "@/pages/admin/ResetPassword";
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy-loaded pages to improve initial load time
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const ExportData = lazy(() => import('@/pages/admin/ExportData'));

// Auth Provider
import { AuthProvider } from '@/hooks/useAuth';
import EditContent from "./pages/admin/EditContent";

// Initialize AOS
AOS.init({
  duration: 800,
  once: true,
});

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/specialties" element={<SpecialtyChoice />} />
          <Route path="/gallery" element={<Gallery />} />

          {/* Developers page */}
          <Route path="/developers" element={<Developers />} />

          {/* EyeCare routes */}
          <Route path="/eyecare" element={<EyeCareHome />} />
          <Route path="/eyecare/conditions" element={<EyeCareConditions />} />
          <Route path="/eyecare/doctor" element={<EyeCareDoctor />} />
          <Route path="/eyecare/appointment" element={<EyeCareAppointment />} />

          {/* Gynecology routes */}
          <Route path="/gynecology" element={<GynecologyHome />} />
          <Route path="/gynecology/health" element={<GynecologyHealth />} />
          <Route path="/gynecology/doctor" element={<GynecologyDoctor />} />
          <Route path="/gynecology/appointment" element={<GynecologyAppointment />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />
          <Route path="/admin/dashboard" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            </Suspense>
          } />
          <Route path="/admin/export-data" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <ProtectedRoute>
                <ExportData />
              </ProtectedRoute>
            </Suspense>
          } />
          <Route path="/admin/edit-content" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <ProtectedRoute>
                <EditContent />
              </ProtectedRoute>
            </Suspense>
          } />
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;
