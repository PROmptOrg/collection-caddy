
import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from './Navbar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // For welcome/login/register pages - no navbar
  if (!isAuthenticated || isAuthPage) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 page-transition">
          {children || <Outlet />}
        </main>
      </div>
    );
  }

  // For authenticated pages - with navbar
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container max-w-7xl py-8 px-4 sm:px-6 lg:px-8 page-transition">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default Layout;
