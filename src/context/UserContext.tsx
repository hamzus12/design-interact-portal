import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { userIdService } from '@/services/UserIdService';

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
      
      // Clear cache and sync with database
      userIdService.invalidateUserCache(authUser.id);
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
      
      // Clear user cache on sign out
      if (user?.id) {
        userIdService.invalidateUserCache(user.id);
      }
      
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
  
  // Function to sync user data to Supabase database using the centralized service
  const syncUserToDatabase = async () => {
    if (!authUser?.id) return;
    
    try {
      setIsSyncing(true);
      
      // Use the centralized service to ensure user exists
      const dbUserId = await userIdService.ensureUserExists(authUser);
      
      if (dbUserId) {
        console.log("User data synced with database successfully");
      } else {
        console.error("Failed to sync user data with database");
      }
    } catch (error: any) {
      console.error('Error syncing user to database:', error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Sync user to database when they are authenticated
  useEffect(() => {
    if (authUser?.id && !authLoading) {
      syncUserToDatabase();
    }
  }, [authUser?.id, authLoading]);

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
