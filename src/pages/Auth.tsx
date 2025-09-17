import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useSecureForm } from "@/hooks/useSecureForm";
import { validatePassword } from "@/lib/security";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  
  const signInForm = useSecureForm(
    { email: '', password: '' },
    {
      email: { required: true },
      password: { required: true }
    }
  );
  
  const signUpForm = useSecureForm(
    { email: '', password: '', fullName: '' },
    {
      email: { required: true },
      password: { 
        required: true,
        validator: (value: string) => {
          const validation = validatePassword(value);
          return validation.isValid ? null : validation.errors[0];
        }
      },
      fullName: { required: true }
    }
  );

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signInForm.validateAllFields()) {
      return;
    }
    
    signInForm.setIsSubmitting(true);
    const values = signInForm.getValues();
    
    const { error } = await signIn(values.email, values.password);
    
    if (!error) {
      navigate("/dashboard");
    }
    
    signInForm.setIsSubmitting(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signUpForm.validateAllFields()) {
      return;
    }
    
    signUpForm.setIsSubmitting(true);
    const values = signUpForm.getValues();
    
    const { error } = await signUp(values.email, values.password, values.fullName);
    
    if (!error) {
      signUpForm.reset();
    }
    
    signUpForm.setIsSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    signInForm.setIsSubmitting(true);
    signUpForm.setIsSubmitting(true);
    await signInWithGoogle();
    signInForm.setIsSubmitting(false);
    signUpForm.setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to Letusdify</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <input type="hidden" name="csrf_token" value={signInForm.csrfToken} />
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    {...signInForm.getFieldProps('email')}
                  />
                  {signInForm.fields.email.error && (
                    <p className="text-sm text-destructive">{signInForm.fields.email.error}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    {...signInForm.getFieldProps('password')}
                  />
                  {signInForm.fields.password.error && (
                    <p className="text-sm text-destructive">{signInForm.fields.password.error}</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={signInForm.isSubmitting || signInForm.hasErrors}
                >
                  {signInForm.isSubmitting ? "Signing In..." : "Sign In"}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full" 
                  onClick={handleGoogleSignIn}
                  disabled={signInForm.isSubmitting || signUpForm.isSubmitting}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <input type="hidden" name="csrf_token" value={signUpForm.csrfToken} />
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    {...signUpForm.getFieldProps('fullName')}
                  />
                  {signUpForm.fields.fullName.error && (
                    <p className="text-sm text-destructive">{signUpForm.fields.fullName.error}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    {...signUpForm.getFieldProps('email')}
                  />
                  {signUpForm.fields.email.error && (
                    <p className="text-sm text-destructive">{signUpForm.fields.email.error}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    {...signUpForm.getFieldProps('password')}
                  />
                  {signUpForm.fields.password.error && (
                    <div className="text-sm text-destructive">{signUpForm.fields.password.error}</div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={signUpForm.isSubmitting || signUpForm.hasErrors}
                >
                  {signUpForm.isSubmitting ? "Creating Account..." : "Sign Up"}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full" 
                  onClick={handleGoogleSignIn}
                  disabled={signInForm.isSubmitting || signUpForm.isSubmitting}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;