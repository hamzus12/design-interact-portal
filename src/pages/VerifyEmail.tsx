
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const VerifyEmail = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 py-16">
        <div className="w-full max-w-md animate-fade-in">
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            
            <div className="mt-4 text-center">
              <h1 className="mb-2 text-2xl font-bold text-gray-900">Verify your email</h1>
              <p className="mb-6 text-gray-600">
                We've sent a verification link to your email. Please check your inbox and click the link to complete your registration.
              </p>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  If you don't see the email, check your spam folder or try signing in with the email and password you provided.
                </p>
                
                <Button 
                  className="w-full"
                  onClick={() => navigate('/signin')}
                >
                  Go to Sign In
                </Button>
                
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/')}
                  >
                    Return to Home
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyEmail;
