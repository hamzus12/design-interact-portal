
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Jobs from '@/pages/Jobs';
import JobDetail from '@/pages/JobDetail';
import AddJob from '@/pages/AddJob';
import EditJob from '@/pages/EditJob';
import Dashboard from '@/pages/Dashboard';
import Candidates from '@/pages/Candidates';
import About from '@/pages/About';
import CreateJobPersona from '@/pages/CreateJobPersona';
import EditJobPersona from '@/pages/EditJobPersona';
import MyApplications from '@/pages/MyApplications';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import Chat from '@/pages/Chat';
import Profile from '@/pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from '@/pages/NotFound';
import InterviewPractice from '@/pages/InterviewPractice';
import AdminRoute from '@/components/AdminRoute';
import { AuthProvider } from '@/context/AuthContext';
import { UserProvider } from '@/context/UserContext';
import { JobPersonaProvider } from '@/context/JobPersonaContext';
import { ThemeProvider } from 'next-themes';
import { LanguageProvider } from '@/context/LanguageContext';
import { DatabaseProvider } from '@/context/DatabaseContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <BrowserRouter>
          <AuthProvider>
            <UserProvider>
              <JobPersonaProvider>
                <LanguageProvider>
                  <DatabaseProvider>
                    <Toaster />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/signin" element={<SignIn />} />
                      <Route path="/signup" element={<SignUp />} />
                      <Route path="/jobs" element={<Jobs />} />
                      <Route path="/job/:id" element={<JobDetail />} />
                      <Route path="/add-job" element={<AddJob />} />
                      <Route path="/edit-job/:id" element={<EditJob />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/candidates" element={<Candidates />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/create-job-persona" element={<CreateJobPersona />} />
                      <Route path="/edit-job-persona" element={<EditJobPersona />} />
                      <Route path="/my-applications" element={<MyApplications />} />
                      <Route path="/interview-practice" element={<InterviewPractice />} />
                      <Route path="/admin-dashboard" element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      } />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/chat/:id" element={<Chat />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </DatabaseProvider>
                </LanguageProvider>
              </JobPersonaProvider>
            </UserProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
