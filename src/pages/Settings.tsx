
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, User, LogOut, Moon, Sun, Monitor } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ThemeMode, FontFamily } from '@/types';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme, font, setFont } = useTheme();
  const { toast } = useToast();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSaveProfile = () => {
    // In a real app, this would save to the server
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been updated successfully.',
      });
    }, 1000);
  };
  
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
    }
  };

  const fontOptions: { value: FontFamily; label: string }[] = [
    { value: 'inter', label: 'Inter (Default)' },
    { value: 'roboto', label: 'Roboto' },
    { value: 'playfair', label: 'Playfair Display' },
    { value: 'montserrat', label: 'Montserrat' },
    { value: 'opensans', label: 'Open Sans' },
  ];

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Manage your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={user?.username} 
                  disabled 
                  className="h-11 bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">
                  Username cannot be changed
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="h-11"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how CollectiblesVault looks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Theme</Label>
                  <RadioGroup 
                    value={theme} 
                    onValueChange={(value) => setTheme(value as ThemeMode)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light" className="flex items-center gap-1 cursor-pointer">
                        <Sun className="h-4 w-4" />
                        <span>Light</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark" className="flex items-center gap-1 cursor-pointer">
                        <Moon className="h-4 w-4" />
                        <span>Dark</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="system" />
                      <Label htmlFor="system" className="flex items-center gap-1 cursor-pointer">
                        <Monitor className="h-4 w-4" />
                        <span>System</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="font">Font</Label>
                  <Select 
                    value={font} 
                    onValueChange={(value) => setFont(value as FontFamily)}
                  >
                    <SelectTrigger id="font" className="h-10">
                      <SelectValue placeholder="Select a font" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                          className={`font-${option.value}`}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="pt-3 text-sm">
                    <p className={`font-${font} text-base`}>
                      The quick brown fox jumps over the lazy dog.
                    </p>
                    <p className={`font-${font} text-sm mt-1 text-muted-foreground`}>
                      Preview of the selected font
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Application</div>
                  <div className="font-medium">CollectiblesVault</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Version</div>
                  <div className="font-medium">1.0.0</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
