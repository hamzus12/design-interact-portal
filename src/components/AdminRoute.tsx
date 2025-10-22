
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Route protégée pour les administrateurs
 * Vérifie le rôle depuis Supabase (sécurisé)
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAdmin, loading } = useUserRole();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!isAdmin) {
    return <Navigate to="/sign-in" replace />;
  }
  
  return <>{children}</>;
};

export default AdminRoute;
