
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AuthPage from "./components/AuthPage";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import SystemAdminDashboard from "./pages/SystemAdminDashboard";
import CaseDetails from "./pages/CaseDetails";
import DocumentViewer from "./pages/DocumentViewer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={
        user ? <Navigate to="/" /> : <AuthPage />
      } />
      <Route path="/login" element={
        user ? <Navigate to="/" /> : <Login />
      } />
      <Route path="/" element={
        user && profile ? (
          profile.role === 'admin' ? <Navigate to="/admin" /> :
          profile.role === 'doctor' ? <Navigate to="/doctor" /> :
          profile.role === 'system-admin' ? <Navigate to="/system-admin" /> :
          <Index />
        ) : <Index />
      } />
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/doctor" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <DoctorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/system-admin" element={
        <ProtectedRoute allowedRoles={['system-admin']}>
          <SystemAdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/case/:id" element={
        <ProtectedRoute>
          <CaseDetails />
        </ProtectedRoute>
      } />
      <Route path="/document/:id" element={
        <ProtectedRoute>
          <DocumentViewer />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
