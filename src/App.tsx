import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Home from '@/pages/Home';
import Jobs from '@/pages/Jobs';
import JobDetail from '@/pages/JobDetail';
import Dashboard from '@/pages/Dashboard';
import Candidates from '@/pages/Candidates';
import About from '@/pages/About';
import CreateJobPersona from '@/pages/CreateJobPersona';
import EditJobPersona from '@/pages/EditJobPersona';
import MyApplications from '@/pages/MyApplications';
import { AuthProvider } from '@/context/AuthContext';
import { UserProvider } from '@/context/UserContext';
import { JobPersonaProvider } from '@/context/JobPersonaContext';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/context/LanguageContext';
import { DatabaseProvider } from '@/context/DatabaseContext';
import { QueryClient } from 'react-query';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <QueryClient>
      <AuthProvider>
        <UserProvider>
          <DatabaseProvider>
            <JobPersonaProvider>
              <LanguageProvider>
                <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                  <BrowserRouter>
                    <Toaster />
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/jobs" element={<Jobs />} />
                      <Route path="/job/:id" element={<JobDetail />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/candidates" element={<Candidates />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/create-job-persona" element={<CreateJobPersona />} />
                      <Route path="/edit-job-persona" element={<EditJobPersona />} />
                      <Route path="/my-applications" element={<MyApplications />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                    </Routes>
                  </BrowserRouter>
                </ThemeProvider>
              </LanguageProvider>
            </JobPersonaProvider>
          </DatabaseProvider>
        </UserProvider>
      </AuthProvider>
    </QueryClient>
  );
}

export default App;
