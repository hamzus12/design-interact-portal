
import React from 'react';
import { Link } from 'react-router-dom';
import { useUserRole } from '@/context/UserContext';
import { useJobPersona } from '@/context/JobPersonaContext';
import Layout from '@/components/Layout/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Briefcase, Users, PenLine, Eye, MessageSquare, Brain, User } from 'lucide-react';

const Dashboard = () => {
  const { user, role } = useUserRole();
  const { hasPersona } = useJobPersona();
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome, {user?.firstName || 'User'}!</h1>
          <p className="mt-2 text-gray-600">
            Manage your job search and applications from your personal dashboard
          </p>
        </div>

        {/* Main dashboard grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {/* Profile section - for all users */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Your Profile</CardTitle>
              </div>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600">
                Keep your profile updated to make the most of our platform's features.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to="/profile">View Profile</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* JobPersona AI section - for candidates only */}
          {role === 'candidate' && (
            <Card className="border-primary bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <CardTitle>JobPersona AI</CardTitle>
                </div>
                <CardDescription>Your AI-powered job hunting assistant</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600">
                  {hasPersona
                    ? "Your AI avatar is active and finding jobs that match your profile."
                    : "Create your AI avatar to automate your job search and application process."}
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={hasPersona ? "/job-persona" : "/create-job-persona"}>
                    {hasPersona ? "Manage JobPersona" : "Create JobPersona"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Applications section - for candidates */}
          {role === 'candidate' && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <CardTitle>My Applications</CardTitle>
                </div>
                <CardDescription>Track your job applications</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600">
                  View the status of your submitted applications and follow up on opportunities.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/my-applications">View Applications</Link>
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Browse Jobs - for all users */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-primary" />
                <CardTitle>Browse Jobs</CardTitle>
              </div>
              <CardDescription>Explore available opportunities</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600">
                Browse through hundreds of job listings that match your skills and preferences.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to="/jobs">Find Jobs</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Browse Candidates - for recruiters */}
          {(role === 'recruiter' || role === 'admin') && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle>Candidates</CardTitle>
                </div>
                <CardDescription>Find potential employees</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600">
                  Browse through candidate profiles and find the perfect match for your openings.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/candidates">Browse Candidates</Link>
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Post a Job - for recruiters */}
          {(role === 'recruiter' || role === 'admin') && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <PenLine className="h-5 w-5 text-primary" />
                  <CardTitle>Post a Job</CardTitle>
                </div>
                <CardDescription>Create a new job listing</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600">
                  Create a new job listing to find the perfect candidate for your company.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to="/add-job">Create Listing</Link>
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Manage Users - for admins */}
          {role === 'admin' && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle>Manage Users</CardTitle>
                </div>
                <CardDescription>Administrative controls</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600">
                  Review and manage platform users, roles, and permissions.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/manage-users">Manage Users</Link>
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Messages - for all users */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle>Messages</CardTitle>
              </div>
              <CardDescription>Your conversations</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600">
                Chat with recruiters or candidates about job opportunities and applications.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full" disabled>
                <Link to="/messages">Coming Soon</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
