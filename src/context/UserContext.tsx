
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';
import { toast } from '@/components/ui/use-toast';

// Define the possible user roles
export type UserRole = 'candidate' | 'recruiter' | 'admin' | 'guest';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profileImage?: string;
  bio?: string;
  resumeUrl?: string;
}

interface UserContextType {
  user: UserProfile | null;
  role: UserRole;
  setRole: (role: UserRole) => Promise<void>;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isLoaded: clerkLoaded, user: clerkUser } = useUser();
  const { isLoaded: authLoaded, getToken } = useAuth();
  const { signOut: clerkSignOut } = useClerk();
  
  // Map Clerk user to our UserProfile structure
  const user: UserProfile | null = clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    firstName: clerkUser.firstName || '',
    lastName: clerkUser.lastName || '',
    role: (clerkUser.publicMetadata?.role as UserRole) || 'candidate',
    profileImage: clerkUser.imageUrl,
    bio: clerkUser.publicMetadata?.bio as string,
    resumeUrl: clerkUser.publicMetadata?.resumeUrl as string
  } : null;
  
  const isLoading = !clerkLoaded || !authLoaded;
  const role = user?.role || 'guest';

  // Function to update user role in Clerk metadata
  const setRole = async (newRole: UserRole) => {
    if (!clerkUser) return;
    
    try {
      await clerkUser.update({
        publicMetadata: {
          ...clerkUser.publicMetadata,
          role: newRole
        }
      });
      
      toast({
        title: "Role Updated",
        description: `Your role has been updated to ${newRole}.`
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Function to sign out
  const signOut = async () => {
    try {
      await clerkSignOut();
      
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully."
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <UserContext.Provider value={{ user, role, setRole, isLoading, signOut }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserRole = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserProvider');
  }
  return context;
};
