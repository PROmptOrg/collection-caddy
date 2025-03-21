
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, PackageOpen } from 'lucide-react';

const Welcome: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
      <div className="w-full max-w-3xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center mb-6 animate-fade-in">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <PackageOpen className="h-10 w-10 text-primary" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight animate-slide-in-down">
            CollectionCaddy
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-in-up">
            Manage your collections with elegance and precision. Track items, create categories, and generate insightful reports.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto animate-fade-in">
            <Link to="/register">
              <Button variant="default" size="lg" className="w-full h-14 text-lg relative group overflow-hidden">
                <span className="relative z-10 flex items-center justify-center w-full transition-transform group-hover:translate-x-1">
                  Register
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 bg-primary/80 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
              </Button>
            </Link>
            
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full h-14 text-lg relative group overflow-hidden border-2">
                <span className="relative z-10 transition-transform group-hover:translate-x-1">
                  Log in
                </span>
                <span className="absolute inset-0 bg-background/80 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
              </Button>
            </Link>
          </div>
          
          {isAuthenticated && (
            <div className="mt-6 animate-fade-in">
              <Link to="/dashboard">
                <Button variant="link" className="text-primary/80 hover:text-primary" size="sm">
                  Continue to Dashboard
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Welcome;
