
import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useUserRole } from '@/context/UserContext';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { UserRoundCog, BookMarked, BriefcaseBusiness } from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const { user } = useUser();
  const { role, setRole } = useUserRole();
  
  const [bio, setBio] = useState(user?.publicMetadata?.bio as string || '');
  const [skills, setSkills] = useState(user?.publicMetadata?.skills as string || '');
  
  const handleSaveProfile = async () => {
    try {
      await user?.update({
        publicMetadata: {
          ...user.publicMetadata,
          bio,
          skills
        }
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleRoleChange = async (newRole: 'candidate' | 'recruiter' | 'admin') => {
    await setRole(newRole);
    toast.success(`Your role has been updated to ${newRole}`);
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">Manage your profile information and preferences</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Left sidebar with user photo and basic info */}
            <div className="md:col-span-1">
              <div className="rounded-lg bg-white p-6 shadow-md">
                <div className="mb-6 flex flex-col items-center">
                  <div className="mb-4 overflow-hidden rounded-full">
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || 'User'}
                      className="h-32 w-32 rounded-full object-cover"
                    />
                  </div>
                  <h2 className="text-xl font-semibold">{user.fullName}</h2>
                  <p className="text-gray-600">{user.primaryEmailAddress?.emailAddress}</p>
                  <div className="mt-2 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red capitalize">
                    {role}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="mb-3 font-semibold">Account Type</h3>
                  <RadioGroup defaultValue={role} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="candidate" 
                        id="candidate"
                        onClick={() => handleRoleChange('candidate')}
                      />
                      <Label htmlFor="candidate" className="flex items-center gap-2">
                        <BookMarked className="h-4 w-4" /> Candidate
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="recruiter" 
                        id="recruiter"
                        onClick={() => handleRoleChange('recruiter')}
                      />
                      <Label htmlFor="recruiter" className="flex items-center gap-2">
                        <BriefcaseBusiness className="h-4 w-4" /> Recruiter
                      </Label>
                    </div>
                    {role === 'admin' && (
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="admin" id="admin" />
                        <Label htmlFor="admin" className="flex items-center gap-2">
                          <UserRoundCog className="h-4 w-4" /> Administrator
                        </Label>
                      </div>
                    )}
                  </RadioGroup>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => user.update({ imageUrl: undefined })}
                >
                  Update Profile Picture
                </Button>
              </div>
            </div>

            {/* Main profile content */}
            <div className="md:col-span-2">
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-6 text-xl font-semibold">Profile Information</h2>

                <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      defaultValue={user.firstName || ''}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      defaultValue={user.lastName || ''}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="mt-1 min-h-32"
                    placeholder="Tell us about your professional experience, education, and career goals"
                  />
                </div>

                <div className="mb-6">
                  <Label htmlFor="skills">Skills & Expertise</Label>
                  <Textarea
                    id="skills"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="mt-1"
                    placeholder="List your key skills, separated by commas (e.g., JavaScript, React, Project Management)"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveProfile}
                    className="bg-red text-white hover:bg-red/90"
                  >
                    Save Changes
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

export default Profile;
