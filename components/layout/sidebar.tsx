'use client';

import { ShoppingCart, LogOut, User } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';
import { Button } from '@/components/ui/button';

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="w-64 bg-card border-r min-h-screen p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <ShoppingCart className="h-6 w-6 text-primary" />
        <h1 className="text-l font-bold">Intidaya Dashboard</h1>
      </div>
      
      <nav className="space-y-2 flex-1">
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md"
        >
          <ShoppingCart className="h-4 w-4" />
          Dashboard
        </a>
      </nav>

      {/* User info and logout */}
      <div className="border-t pt-4 mt-auto">
        <div className="flex items-center gap-2 mb-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{user?.user_name}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="w-full flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar; 