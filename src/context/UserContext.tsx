
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

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
  const { user: authUser, signOut: authSignOut, loading: authLoading } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Map Supabase user to our UserProfile structure
  const user: UserProfile | null = authUser ? {
    id: authUser.id,
    email: authUser.email || '',
    firstName: authUser.user_metadata?.first_name || '',
    lastName: authUser.user_metadata?.last_name || '',
    role: (authUser.user_metadata?.role as UserRole) || 'candidate',
    profileImage: authUser.user_metadata?.avatar_url,
    bio: authUser.user_metadata?.bio as string,
    resumeUrl: authUser.user_metadata?.resumeUrl as string
  } : null;
  
  const isLoading = authLoading || isSyncing;
  const role = user?.role || 'guest';

  // Function to update user role in Supabase user metadata
  const setRole = async (newRole: UserRole) => {
    if (!authUser) return;
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          ...authUser.user_metadata,
          role: newRole
        }
      });
      
      if (error) throw error;
      
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
      await authSignOut();
      
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
        // Create new user - this should normally be handled by the database trigger
        // but we're adding it here as a fallback
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
    if (user?.id && !authLoading) {
      syncUserToDatabase();
    }
  }, [user?.id, authLoading]);

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
