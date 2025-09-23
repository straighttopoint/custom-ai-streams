import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  sanitizeInput, 
  validatePassword, 
  authRateLimiter, 
  logSecurityEvent,
  SecurityError 
} from '@/lib/security';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Rate limiting check
      const clientIP = 'signup_' + (navigator.userAgent || 'unknown');
      if (authRateLimiter.isBlocked(clientIP)) {
        const remainingTime = Math.ceil(authRateLimiter.getRemainingTime(clientIP) / 1000 / 60);
        throw new SecurityError(`Too many signup attempts. Try again in ${remainingTime} minutes.`, 'RATE_LIMITED');
      }

      // Input validation and sanitization
      const sanitizedEmail = sanitizeInput.email(email);
      const sanitizedFullName = sanitizeInput.text(fullName);
      
      // Password validation
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new SecurityError(passwordValidation.errors[0], 'WEAK_PASSWORD');
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: sanitizedFullName
          }
        }
      });

      if (error) {
        authRateLimiter.recordAttempt(clientIP);
        logSecurityEvent('SIGNUP_FAILED', { 
          email: sanitizedEmail, 
          error: error.message 
        });
        
        toast({
          title: "Signup Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        logSecurityEvent('SIGNUP_SUCCESS', { email: sanitizedEmail });
        toast({
          title: "Success!",
          description: "Please check your email to confirm your account.",
        });
      }

      return { error };
    } catch (error: any) {
      const clientIP = 'signup_' + (navigator.userAgent || 'unknown');
      authRateLimiter.recordAttempt(clientIP);
      
      logSecurityEvent('SIGNUP_ERROR', { 
        error: error.message,
        code: error.code 
      });
      
      toast({
        title: "Signup Error",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Rate limiting check
      const clientIP = 'signin_' + (navigator.userAgent || 'unknown');
      if (authRateLimiter.isBlocked(clientIP)) {
        const remainingTime = Math.ceil(authRateLimiter.getRemainingTime(clientIP) / 1000 / 60);
        throw new SecurityError(`Too many login attempts. Try again in ${remainingTime} minutes.`, 'RATE_LIMITED');
      }

      // Input sanitization
      const sanitizedEmail = sanitizeInput.email(email);

      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password
      });

      if (error) {
        authRateLimiter.recordAttempt(clientIP);
        logSecurityEvent('SIGNIN_FAILED', { 
          email: sanitizedEmail, 
          error: error.message 
        });
        
        toast({
          title: "Login Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        logSecurityEvent('SIGNIN_SUCCESS', { email: sanitizedEmail });
      }

      return { error };
    } catch (error: any) {
      const clientIP = 'signin_' + (navigator.userAgent || 'unknown');
      authRateLimiter.recordAttempt(clientIP);
      
      logSecurityEvent('SIGNIN_ERROR', { 
        error: error.message,
        code: error.code 
      });
      
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Rate limiting check
      const clientIP = 'google_signin_' + (navigator.userAgent || 'unknown');
      if (authRateLimiter.isBlocked(clientIP)) {
        const remainingTime = Math.ceil(authRateLimiter.getRemainingTime(clientIP) / 1000 / 60);
        throw new SecurityError(`Too many login attempts. Try again in ${remainingTime} minutes.`, 'RATE_LIMITED');
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        authRateLimiter.recordAttempt(clientIP);
        logSecurityEvent('GOOGLE_SIGNIN_FAILED', { error: error.message });
        
        toast({
          title: "Google Sign In Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        logSecurityEvent('GOOGLE_SIGNIN_SUCCESS', {});
      }

      return { error };
    } catch (error: any) {
      const clientIP = 'google_signin_' + (navigator.userAgent || 'unknown');
      authRateLimiter.recordAttempt(clientIP);
      
      logSecurityEvent('GOOGLE_SIGNIN_ERROR', { 
        error: error.message,
        code: error.code 
      });
      
      toast({
        title: "Google Sign In Error",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
      logSecurityEvent('SIGNOUT_SUCCESS', {});
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      logSecurityEvent('SIGNOUT_ERROR', { error: error.message });
      toast({
        title: "Sign Out Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};