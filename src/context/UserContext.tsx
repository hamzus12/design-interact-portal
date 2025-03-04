
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';

// Define the possible user roles
export type UserRole = 'candidate' | 'recruiter' | 'admin' | 'guest';

interface UserContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [role, setRole] = useState<UserRole>('guest');
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useClerk();

  useEffect(() => {
    if (!isLoaded) return;

    const fetchUserRole = async () => {
      setIsLoading(true);
      
      if (!isSignedIn) {
        setRole('guest');
        setIsLoading(false);
        return;
      }
      
      // Here you would normally fetch the role from your database
      // For now, we'll get it from metadata or use a default
      const userRole = user?.unsafeMetadata?.role as UserRole || 'candidate';
      setRole(userRole);
      setIsLoading(false);
    };

    fetchUserRole();
  }, [isLoaded, isSignedIn, user]);

  // Function to update the role in Clerk's metadata
  const updateRole = async (newRole: UserRole) => {
    if (user) {
      try {
        await user.update({
          unsafeMetadata: { ...user.unsafeMetadata, role: newRole },
        });
        setRole(newRole);
      } catch (error) {
        console.error('Failed to update role:', error);
      }
    }
  };

  return (
    <UserContext.Provider value={{ role, setRole: updateRole, isLoading }}>
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
