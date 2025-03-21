
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import LoginForm from '@/components/LoginForm';
import { PackageOpen, ArrowLeft } from 'lucide-react';

const Login: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md p-8 glass-card">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <PackageOpen className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to manage your collection</p>
          </div>
          
          <LoginForm />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </div>
          
          <div className="mt-8 text-center">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
