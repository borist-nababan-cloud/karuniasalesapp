import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROLES } from '@/lib/roles';
import { useAuthStore } from '@/stores/authStore';

interface SalesGuardProps {
  children: React.ReactNode;
}

export const SalesGuard: React.FC<SalesGuardProps> = ({ children }) => {
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  // If not authenticated at all, let the main router handle it (or redirect to login)
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Jika role bukan SALES (3), blokir akses
  if (user?.role_id !== ROLES.SALES) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};
