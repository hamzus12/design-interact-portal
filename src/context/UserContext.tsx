
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRoleState] = useState<UserRole>('guest');
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch user profile from our public.users table - optimized
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        const userProfile = {
          id: data.id,
          email: data.email || '',
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          role: (data.role as UserRole) || 'candidate',
          profileImage: data.profile_image,
          bio: data.bio,
          resumeUrl: data.resume_url
        };
        
        setUser(userProfile);
        setRoleState((data.role as UserRole) || 'candidate');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setIsLoading(false);
    }
  };

  // Listen for auth state changes - optimized to reduce lag
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    
    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      if (session && session.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setRoleState('guest');
        setIsLoading(false);
      }
    }).catch(error => {
      console.error('Error getting session:', error);
      if (mounted) setIsLoading(false);
    });

    // Set up a listener for future auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        if (session && session.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setRoleState('guest');
          setIsLoading(false);
        }
      }
    );

    // Clean up
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Function to update user role
  const setRole = async (newRole: UserRole) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setRoleState(newRole);
      setUser(prev => prev ? { ...prev, role: newRole } : null);
      
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
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setRoleState('guest');
      
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
    } finally {
      setIsLoading(false);
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
