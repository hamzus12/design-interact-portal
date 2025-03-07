
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DatabaseProvider } from "./context/DatabaseContext";
import { UserProvider, useUserRole } from "./context/UserContext";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import EditJob from "./pages/EditJob";
import Candidates from "./pages/Candidates";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import VerifyEmail from "./pages/VerifyEmail";
import AddJob from "./pages/AddJob";
import ManageUsers from "./pages/ManageUsers";
import MyApplications from "./pages/MyApplications";
import { ReactNode } from "react";

const queryClient = new QueryClient();

// Protected route component using Clerk
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isLoading } = useUserRole();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/signin" replace />
      </SignedOut>
    </>
  );
};

// Role-based protected route component
const RoleProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: ReactNode, 
  allowedRoles: string[] 
}) => {
  const { role, isLoading } = useUserRole();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  return (
    <>
      <SignedIn>
        {allowedRoles.includes(role) ? (
          children
        ) : (
          <Navigate to="/dashboard" replace />
        )}
      </SignedIn>
      <SignedOut>
        <Navigate to="/signin" replace />
      </SignedOut>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UserProvider>
        <DatabaseProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/job/:id" element={<JobDetail />} />
              <Route path="/candidates" element={<Candidates />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/* Add Verification routes */}
              <Route path="/signup/verify-email-address" element={<VerifyEmail />} />
              
              {/* Protected routes for all authenticated users */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-applications" 
                element={
                  <RoleProtectedRoute allowedRoles={['candidate']}>
                    <MyApplications />
                  </RoleProtectedRoute>
                } 
              />
              
              {/* Protected routes for recruiters and admins */}
              <Route 
                path="/add-job" 
                element={
                  <RoleProtectedRoute allowedRoles={['recruiter', 'admin']}>
                    <AddJob />
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path="/edit-job/:id" 
                element={
                  <RoleProtectedRoute allowedRoles={['recruiter', 'admin']}>
                    <EditJob />
                  </RoleProtectedRoute>
                } 
              />
              
              {/* Admin-only routes */}
              <Route 
                path="/manage-users" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <ManageUsers />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DatabaseProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
