
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SignUp as ClerkSignUp } from '@clerk/clerk-react';
import { useToast } from '@/components/ui/use-toast';

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignUpComplete = () => {
    toast({
      title: "Success",
      description: "Your account has been created. Please check your email for verification.",
    });
    
    navigate('/signup/verify-email-address');
  };

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 py-16">
        <div className="w-full max-w-md animate-fade-in">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
            </CardHeader>
            <CardContent>
              <ClerkSignUp
                signInUrl="/signin"
                afterSignUpUrl="/signup/verify-email-address"
                appearance={{
                  elements: {
                    rootBox: "w-full mx-auto",
                    card: "shadow-none border-none",
                    formButtonPrimary: "bg-primary hover:bg-primary/90",
                  }
                }}
                afterSignUp={handleSignUpComplete}
              />
            </CardContent>
            <CardFooter className="flex flex-col">
              <p className="mt-2 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/signin" className="text-blue-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SignUp;
