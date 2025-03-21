
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import RegisterForm from '@/components/RegisterForm';
import { PackageOpen, ArrowLeft } from 'lucide-react';

const Register: React.FC = () => {
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
            <h1 className="text-2xl font-semibold mb-2">Create an Account</h1>
            <p className="text-muted-foreground">Start managing your collection today</p>
          </div>
          
          <RegisterForm />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Log in
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

export default Register;
