
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  syncUserToDatabase: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isLoaded: clerkLoaded, user: clerkUser } = useUser();
  const { isLoaded: authLoaded, getToken } = useAuth();
  const { signOut: clerkSignOut } = useClerk();
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Map Clerk user to our UserProfile structure
  const user: UserProfile | null = clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    firstName: clerkUser.firstName || '',
    lastName: clerkUser.lastName || '',
    role: (clerkUser.unsafeMetadata?.role as UserRole) || 'candidate',
    profileImage: clerkUser.imageUrl,
    bio: clerkUser.unsafeMetadata?.bio as string,
    resumeUrl: clerkUser.unsafeMetadata?.resumeUrl as string
  } : null;
  
  const isLoading = !clerkLoaded || !authLoaded || isSyncing;
  const role = user?.role || 'guest';

  // Function to update user role in Clerk metadata
  const setRole = async (newRole: UserRole) => {
    if (!clerkUser) return;
    
    try {
      await clerkUser.update({
        unsafeMetadata: {
          ...clerkUser.unsafeMetadata,
          role: newRole
        }
      });
      
      toast({
        title: "Role Updated",
        description: `Your role has been updated to ${newRole}.`
      });
      
      // Sync with database
      await syncUserToDatabase();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update role. Please try again.",
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
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Function to sync user data to Supabase database
  const syncUserToDatabase = async () => {
    if (!user?.id) return;
    
    try {
      setIsSyncing(true);
      
      // Check if user exists in our users table
      const { data: existingUser, error: userLookupError } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (userLookupError) {
        throw new Error(userLookupError.message);
      }
      
      if (existingUser) {
        // Update existing user
        const { error: updateError } = await supabase
          .from('users')
          .update({
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            role: user.role
          })
          .eq('user_id', user.id);
        
        if (updateError) {
          throw new Error(updateError.message);
        }
      } else {
        // Create new user
        const { error: createError } = await supabase
          .from('users')
          .insert({
            user_id: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            role: user.role
          });
        
        if (createError) {
          throw new Error(createError.message);
        }
      }
      
      console.log("User data synced with database successfully");
    } catch (error: any) {
      console.error('Error syncing user to database:', error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Sync user to database when they are authenticated
  useEffect(() => {
    if (user?.id) {
      syncUserToDatabase();
    }
  }, [user?.id]);

  return (
    <UserContext.Provider value={{ 
      user, 
      role, 
      setRole, 
      isLoading, 
      signOut,
      syncUserToDatabase
    }}>
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
