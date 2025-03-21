
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (name: string, username: string, password: string, email: string) => Promise<void>;
  logout: () => void;
}

// Mock user data for demo purposes
const MOCK_USERS = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    username: 'demo',
    password: 'password'
  }
];

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = localStorage.getItem('collection_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('collection_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find user (in a real app, this would be an API call)
    const foundUser = MOCK_USERS.find(
      u => u.username === username && u.password === password
    );
    
    if (!foundUser) {
      setIsLoading(false);
      throw new Error('Invalid credentials');
    }
    
    // Create user object without password
    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    
    // Store in localStorage for persistence
    localStorage.setItem('collection_user', JSON.stringify(userWithoutPassword));
    setIsLoading(false);
  };

  const register = async (name: string, username: string, password: string, email: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if username is taken (in a real app, this would be an API call)
    if (MOCK_USERS.some(u => u.username === username)) {
      setIsLoading(false);
      throw new Error('Username already exists');
    }
    
    // Create new user (in a real app, this would be stored in a database)
    const newUser = {
      id: String(MOCK_USERS.length + 1),
      name,
      username,
      password,
      email
    };
    
    // Add to mock database
    MOCK_USERS.push(newUser);
    
    // Login the new user
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    
    // Store in localStorage for persistence
    localStorage.setItem('collection_user', JSON.stringify(userWithoutPassword));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('collection_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
