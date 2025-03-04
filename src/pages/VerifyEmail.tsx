
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSignIn } from '@clerk/clerk-react';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, setActive } = useSignIn();

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter the verification code from your email",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Attempt to verify the code
      const result = await signIn?.attemptEmailAddressVerification({
        code: verificationCode,
      });
      
      if (result?.status === 'complete') {
        await setActive?.({ session: result.createdSessionId });
        toast({
          title: "Success!",
          description: "Your email has been verified successfully.",
        });
        navigate('/profile');
      } else {
        toast({
          title: "Verification failed",
          description: "Please check the code and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Error",
        description: "There was a problem verifying your email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                We've sent a verification code to your email. Please enter it below to complete your registration.
              </p>
              
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="text-center tracking-wider text-lg"
                    maxLength={6}
                  />
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Verifying..." : "Verify Code"}
                </Button>
                
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/signup')}
                    type="button"
                    disabled={isSubmitting}
                  >
                    Go back to sign up
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyEmail;
