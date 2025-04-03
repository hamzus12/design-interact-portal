
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DatabaseProvider } from "./context/DatabaseContext";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { Suspense, ReactNode, lazy } from "react";
import { useAuth } from "./context/AuthContext";

// Pages with standard loading
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import VerifyEmail from "./pages/VerifyEmail";

// Lazy-loaded pages for better performance
const EditJob = lazy(() => import("./pages/EditJob"));
const Candidates = lazy(() => import("./pages/Candidates"));
const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const Contact = lazy(() => import("./pages/Contact"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const AddJob = lazy(() => import("./pages/AddJob"));
const ManageUsers = lazy(() => import("./pages/ManageUsers"));
const MyApplications = lazy(() => import("./pages/MyApplications"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Protected route component
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <PageLoader />;
  }
  
  return user ? children : <Navigate to="/signin" replace />;
};

// Role-based protected route component
const RoleProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: ReactNode, 
  allowedRoles: string[] 
}) => {
  const { user, loading } = useAuth();
  const userRole = user?.user_metadata?.role || 'candidate';
  
  if (loading) {
    return <PageLoader />;
  }
  
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  return allowedRoles.includes(userRole) ? children : <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/about" element={
      <Suspense fallback={<PageLoader />}>
        <About />
      </Suspense>
    } />
    <Route path="/jobs" element={<Jobs />} />
    <Route path="/job/:id" element={<JobDetail />} />
    <Route path="/candidates" element={
      <Suspense fallback={<PageLoader />}>
        <Candidates />
      </Suspense>
    } />
    <Route path="/blog" element={
      <Suspense fallback={<PageLoader />}>
        <Blog />
      </Suspense>
    } />
    <Route path="/contact" element={
      <Suspense fallback={<PageLoader />}>
        <Contact />
      </Suspense>
    } />
    <Route path="/signin" element={<SignIn />} />
    <Route path="/signup" element={<SignUp />} />
    
    {/* Add Verification routes */}
    <Route path="/signup/verify-email-address" element={<VerifyEmail />} />
    
    {/* Protected routes for all authenticated users */}
    <Route 
      path="/dashboard" 
      element={
        <ProtectedRoute>
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/profile" 
      element={
        <ProtectedRoute>
          <Suspense fallback={<PageLoader />}>
            <Profile />
          </Suspense>
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/my-applications" 
      element={
        <RoleProtectedRoute allowedRoles={['candidate']}>
          <Suspense fallback={<PageLoader />}>
            <MyApplications />
          </Suspense>
        </RoleProtectedRoute>
      } 
    />
    
    {/* Protected routes for recruiters and admins */}
    <Route 
      path="/add-job" 
      element={
        <RoleProtectedRoute allowedRoles={['recruiter', 'admin']}>
          <Suspense fallback={<PageLoader />}>
            <AddJob />
          </Suspense>
        </RoleProtectedRoute>
      } 
    />
    <Route 
      path="/edit-job/:id" 
      element={
        <RoleProtectedRoute allowedRoles={['recruiter', 'admin']}>
          <Suspense fallback={<PageLoader />}>
            <EditJob />
          </Suspense>
        </RoleProtectedRoute>
      } 
    />
    
    {/* Admin-only routes */}
    <Route 
      path="/manage-users" 
      element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <Suspense fallback={<PageLoader />}>
            <ManageUsers />
          </Suspense>
        </RoleProtectedRoute>
      } 
    />
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <UserProvider>
              <DatabaseProvider>
                <AppRoutes />
              </DatabaseProvider>
            </UserProvider>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
