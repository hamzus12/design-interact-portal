
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUserRole } from '@/context/UserContext';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import ProfileForm, { ProfileFormData } from '@/components/Profile/ProfileForm';
import ProfileHeader from '@/components/Profile/ProfileHeader';
import { validateForm } from '@/utils/formValidation';
import { useUserMetadata } from '@/hooks/useUserMetadata';

const Profile = () => {
  const { user } = useAuth();
  const { role, setRole } = useUserRole();
  const { updateMetadata, isUpdating } = useUserMetadata();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    skills: '',
    role: role
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        email: user.email || '',
        bio: user.user_metadata?.bio || '',
        skills: user.user_metadata?.skills || '',
        role: role
      });
    }
  }, [user, role]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when edited
    if (formErrors[name as keyof ProfileFormData]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ProfileFormData];
        return newErrors;
      });
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value as typeof role }));
    
    // Clear role error if it exists
    if (formErrors.role) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.role;
        return newErrors;
      });
    }
  };

  const validateProfileData = () => {
    const validationResult = validateForm(formData, {
      firstName: { required: true, minLength: 2 },
      lastName: { required: true, minLength: 2 },
      email: {}, 
      bio: { maxLength: 500 },
      skills: { maxLength: 200 },
      role: {}
    });
    
    setFormErrors(validationResult.errors);
    return validationResult.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileData()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Update role if changed
      if (formData.role !== role) {
        await setRole(formData.role);
      }

      // Update user metadata
      if (user) {
        await updateMetadata({
          first_name: formData.firstName,
          last_name: formData.lastName,
          bio: formData.bio,
          skills: formData.skills
        });
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile.",
        variant: "destructive"
      });
    }
  };

  const getInitials = () => {
    return ((user?.user_metadata?.first_name || '')[0] || '') + ((user?.user_metadata?.last_name || '')[0] || '');
  };

  // Check if the current user is an admin
  const isAdmin = role === 'admin';

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="bg-slate-50 rounded-t-lg">
              <ProfileHeader
                title={isEditing ? 'Edit Profile' : 'Profile'}
                description="Manage your account details and preferences"
                imageUrl={user?.user_metadata?.avatar_url}
                initials={getInitials()}
              />
            </CardHeader>
            <CardContent className="pt-6">
              <ProfileForm
                formData={formData}
                formErrors={formErrors}
                isEditing={isEditing}
                isAdmin={isAdmin}
                isSubmitting={isUpdating}
                onSubmit={handleSubmit}
                onCancel={() => setIsEditing(false)}
                handleInputChange={handleInputChange}
                handleRoleChange={handleRoleChange}
              />
            </CardContent>
            {!isEditing && (
              <CardFooter className="flex justify-end">
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
