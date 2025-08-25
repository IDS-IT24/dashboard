'use client';

import { ShoppingCart, LogOut, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-context';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const { user, logout } = useAuth();

  return (
    <div className={`bg-card border-r min-h-screen flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <ShoppingCart className="h-6 w-6 text-primary flex-shrink-0" />
            {!isCollapsed && <h1 className="text-l font-bold">Intidaya Dashboard</h1>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0 hover:bg-primary/10"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <nav className="space-y-2 flex-1 p-4">
        <a
          href="/"
          className={`flex items-center gap-3 px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Omzet' : undefined}
        >
          <ShoppingCart className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>Omzet</span>}
        </a>
      </nav>

      {/* User info and logout */}
      <div className="border-t p-4 mt-auto">
        {!isCollapsed && (
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium truncate">{user?.user_name}</span>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className={`flex items-center gap-2 ${isCollapsed ? 'w-full justify-center' : 'w-full'}`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar; 