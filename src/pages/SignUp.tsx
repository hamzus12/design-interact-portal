
import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { LoadingButton } from '@/components/ui/loading-button';
import { UserPlus, Mail, Lock, User, Users, Briefcase } from 'lucide-react';

const SignUp = () => {
  const { signUp, loading, user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'candidate'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
    
    // Clear role error if it exists
    if (errors.role) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.role;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
      };
      
      await signUp(formData.email, formData.password, userData);
    }
  };

  // Redirect if already signed in - AFTER all hooks
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] hero-gradient flex items-center justify-center py-16">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xl mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Join JobFinder
            </h1>
            <p className="text-gray-600 mt-2">Create your account and start your journey</p>
          </div>

          <Card className="glass-card rounded-2xl border-0 shadow-2xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-gray-800">Create Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input 
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`pl-10 h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                          errors.firstName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                        }`}
                      />
                    </div>
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input 
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`pl-10 h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                          errors.lastName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                        }`}
                      />
                    </div>
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input 
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`pl-10 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                        errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input 
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`pl-10 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                        errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input 
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`pl-10 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                        errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-gray-700">I am a</Label>
                  <Select
                    value={formData.role}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger id="role" className={`h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.role ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="candidate" className="rounded-lg">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-blue-500" />
                          <span>Job Seeker</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="recruiter" className="rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-indigo-500" />
                          <span>Recruiter</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                </div>
                
                <LoadingButton 
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  isLoading={loading}
                  loadingText="Creating Account..."
                  icon={<UserPlus className="h-5 w-5" />}
                >
                  Create Account
                </LoadingButton>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col pt-6">
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/signin" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                  Sign in here
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
