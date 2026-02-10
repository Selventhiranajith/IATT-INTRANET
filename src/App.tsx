import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Layout
import { MainLayout } from "./components/layout/MainLayout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import ManualAttendance from "./pages/ManualAttendance";
import ApplyLeave from "./pages/ApplyLeave";
import ViewAttendance from "./pages/ViewAttendance";
import EmployeePage from "./pages/Employee";
import LMS from "./pages/LMS";
import ProductionTracking from "./pages/ProductionTracking";
import Products from "./pages/Products";
import Documents from "./pages/Documents";
import HRPolicy from "./pages/HRPolicy";
import Ideas from "./pages/Ideas";
import Holidays from "./pages/Holidays";
import Birthday from "./pages/Birthday";
import AccountSettings from "./pages/AccountSettings";
import UserManagement from "./pages/UserManagement";
import SystemSettings from "./pages/SystemSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean; superAdminOnly?: boolean }> = ({
  children,
  adminOnly = false,
  superAdminOnly = false
}) => {
  const { isAuthenticated, isAdmin, isSuperAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (superAdminOnly && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// App Routes Component
const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Route */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="events" element={<Events />} />

        {/* Attendance & Leave */}
        <Route path="attendance/manual" element={<ManualAttendance />} />
        <Route path="attendance/apply-leave" element={<ApplyLeave />} />
        <Route path="attendance/employee" element={<EmployeePage />} />
        <Route path="attendance/bio" element={
          <ProtectedRoute adminOnly>
            <ViewAttendance />
          </ProtectedRoute>
        } />
        <Route path="attendance/view-manual" element={
          <ProtectedRoute adminOnly>
            <ViewAttendance />
          </ProtectedRoute>
        } />
        <Route path="attendance/view-leave" element={
          <ProtectedRoute adminOnly>
            <ViewAttendance />
          </ProtectedRoute>
        } />

        {/* Projects & Products */}
        <Route path="projects/lms" element={<LMS />} />
        <Route path="projects/production" element={<ProductionTracking />} />
        <Route path="projects/products" element={<Products />} />
        <Route path="projects/documents" element={<Documents />} />

        {/* New Documents Sections */}
        <Route path="documents/admin" element={<Documents section="admin" />} />
        <Route path="documents/management" element={<Documents section="management" />} />

        {/* Miscellaneous */}
        <Route path="misc/hr-policy" element={<HRPolicy />} />
        <Route path="misc/ideas" element={<Ideas />} />
        <Route path="misc/holidays" element={
          <ProtectedRoute adminOnly>
            <Holidays />
          </ProtectedRoute>
        } />
        <Route path="misc/birthday" element={
          <ProtectedRoute adminOnly>
            <Birthday />
          </ProtectedRoute>
        } />

        {/* System Administration (SuperAdmin Only) */}
        <Route path="admin/users" element={
          <ProtectedRoute superAdminOnly>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="admin/settings" element={
          <ProtectedRoute superAdminOnly>
            <SystemSettings />
          </ProtectedRoute>
        } />

        {/* Account Settings */}
        <Route path="settings" element={<AccountSettings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
