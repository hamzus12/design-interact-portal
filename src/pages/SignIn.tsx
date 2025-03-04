
import React from 'react';
import { Link } from 'react-router-dom';
import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import Layout from '@/components/Layout/Layout';

const SignIn = () => {
  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 py-16">
        <div className="w-full max-w-md animate-fade-in">
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <div className="text-center">
              <h1 className="mb-2 text-2xl font-bold text-gray-900">Welcome Back</h1>
              <p className="mb-6 text-gray-600">Sign in to your account to continue</p>
            </div>
            
            <ClerkSignIn 
              routing="path" 
              path="/signin" 
              signUpUrl="/signup"
              redirectUrl="/dashboard"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignIn;
