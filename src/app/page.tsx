
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plane } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export default function LoginPage() {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp'>('signIn');

  const formSchema = authMode === 'signIn' ? signInSchema : signUpSchema;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      ...(authMode === 'signUp' && { name: '' }),
    },
  });

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);
  
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      toast({
        title: 'Login Successful',
        description: "Welcome back! You've been successfully signed in.",
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Could not sign you in with Google. Please try again.',
      });
    }
  };

  const handleEmailAuth = async (values: z.infer<typeof formSchema>) => {
    try {
      if (authMode === 'signIn') {
        const { email, password } = values as z.infer<typeof signInSchema>;
        await signInWithEmail(email, password);
        toast({
          title: 'Login Successful',
          description: "Welcome back!",
        });
      } else {
        const { name, email, password } = values as z.infer<typeof signUpSchema>;
        await signUpWithEmail(email, password, name);
        toast({
          title: 'Account Created',
          description: 'Your account has been created successfully.',
        });
      }
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Email auth error:', error);
      toast({
        variant: 'destructive',
        title: authMode === 'signIn' ? 'Login Failed' : 'Sign Up Failed',
        description: error.message || 'An unexpected error occurred. Please try again.',
      });
    }
  };

  if (loading || (!loading && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Plane className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center items-center gap-2">
            <Plane className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">TaskPilot</CardTitle>
          </div>
          <CardDescription>
            {authMode === 'signIn'
              ? 'Sign in to your account to access your projects'
              : 'Create an account to get started'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEmailAuth)} className="space-y-4">
              {authMode === 'signUp' && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting 
                  ? (authMode === 'signIn' ? 'Signing In...' : 'Creating Account...')
                  : (authMode === 'signIn' ? 'Sign In' : 'Create Account')
                }
              </Button>
            </form>
          </Form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            Login with Google
          </Button>

          <div className="mt-4 text-center text-sm">
            <button
              onClick={() => {
                setAuthMode(authMode === 'signIn' ? 'signUp' : 'signIn');
                form.reset();
              }}
              className="underline"
            >
              {authMode === 'signIn'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
