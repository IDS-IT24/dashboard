'use client';

import { useAuth } from './auth-context';
import { LoginForm } from './login-form';
import Dashboard from '@/components/dashboard/dashboard';
import Sidebar from '@/components/layout/sidebar';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Dashboard />
      </main>
    </div>
  );
} 