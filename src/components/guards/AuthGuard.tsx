import { ReactNode } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoading, isAuthenticated } = useRequireAuth();

  // Mostrar loading mientras verifica auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  // Si no está autenticado, useRequireAuth ya redirige
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}