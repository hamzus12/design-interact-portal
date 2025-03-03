
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import Layout from '@/components/Layout/Layout';

const SignUp = () => {
  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 py-16">
        <div className="w-full max-w-md animate-fade-in">
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <div className="text-center">
              <h1 className="mb-2 text-2xl font-bold text-gray-900">Create Your Account</h1>
              <p className="mb-6 text-gray-600">Join Jovie to find your perfect job</p>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first-name" className="mb-2 block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <Input
                    id="first-name"
                    placeholder="John"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="last-name" className="mb-2 block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <Input
                    id="last-name"
                    placeholder="Doe"
                    className="w-full"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters with one uppercase, one number, and one special character.
                </p>
              </div>
              
              <div className="flex items-start">
                <Checkbox id="terms" className="data-[state=checked]:bg-red data-[state=checked]:border-red mt-1" />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="/terms" className="text-red hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-red hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
              
              <Button type="submit" className="w-full bg-red text-white hover:bg-red/90">
                Create Account
              </Button>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">Or sign up with</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full">
                  Google
                </Button>
                <Button variant="outline" className="w-full">
                  LinkedIn
                </Button>
              </div>
            </div>
            
            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/signin" className="font-medium text-red hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignUp;
