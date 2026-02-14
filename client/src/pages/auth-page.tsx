import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, Link } from "wouter";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className="mr-2">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  });

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerForm);
  };

  const handleGoogleSignIn = () => {
    const API_BASE = import.meta.env.VITE_APP_BACKEND_URL || "";
    const googleAuthUrl = `${API_BASE}/auth/google`;

    // Open in a centered popup window
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      googleAuthUrl,
      "google-auth",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
    );

    // Poll for popup close, then refetch user session
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      }
    }, 500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dark theme background with animated gradients */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,53,234,0.3),transparent_50%)] animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.3),transparent_50%)] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(16,185,129,0.2),transparent_50%)] animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Matrix-like background effect */}
      <div className="matrix-bg">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="matrix-char"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          >
            {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
          </div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-foreground">Welcome to CareerRoad</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your account or create a new one
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-background/80 dark:bg-white/10 border border-purple-500/20 backdrop-blur-glass">
              <TabsTrigger value="login" className="text-foreground data-[state=active]:bg-purple-600 data-[state=active]:text-white">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="text-foreground data-[state=active]:bg-purple-600 data-[state=active]:text-white">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="bg-card/80 dark:bg-white/5 border border-purple-500/20 backdrop-blur-glass">
                <CardHeader>
                  <CardTitle className="text-foreground">Sign In</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Enter your email and password to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Google Sign-In */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mb-4 bg-background dark:bg-white/10 border-purple-500/30 text-foreground hover:bg-purple-500/10"
                    onClick={handleGoogleSignIn}
                  >
                    <GoogleIcon />
                    Sign in with Google
                  </Button>

                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-purple-500/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card/80 dark:bg-white/5 px-2 text-muted-foreground">or continue with email</span>
                    </div>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-foreground">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        placeholder="Enter your email"
                        className="bg-background dark:bg-white/10 border-purple-500/30 text-foreground placeholder:text-muted-foreground focus:border-purple-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-foreground">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        placeholder="Enter your password"
                        className="bg-background dark:bg-white/10 border-purple-500/30 text-foreground placeholder:text-muted-foreground focus:border-purple-400"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shimmer"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                    <div className="text-center mt-4">
                      <Link href="/reset-password">
                        <Button variant="link" className="text-muted-foreground hover:text-foreground text-sm">
                          Forgot your password?
                        </Button>
                      </Link>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="bg-card/80 dark:bg-white/5 border border-purple-500/20 backdrop-blur-glass">
                <CardHeader>
                  <CardTitle className="text-foreground">Create Account</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Sign up for a new account to get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Google Sign-Up */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mb-4 bg-background dark:bg-white/10 border-purple-500/30 text-foreground hover:bg-purple-500/10"
                    onClick={handleGoogleSignIn}
                  >
                    <GoogleIcon />
                    Sign up with Google
                  </Button>

                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-purple-500/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card/80 dark:bg-white/5 px-2 text-muted-foreground">or continue with email</span>
                    </div>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-firstName" className="text-foreground">First Name</Label>
                        <Input
                          id="register-firstName"
                          value={registerForm.firstName}
                          onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                          placeholder="First name"
                          className="bg-background dark:bg-white/10 border-purple-500/30 text-foreground placeholder:text-muted-foreground focus:border-purple-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-lastName" className="text-foreground">Last Name</Label>
                        <Input
                          id="register-lastName"
                          value={registerForm.lastName}
                          onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                          placeholder="Last name"
                          className="bg-background dark:bg-white/10 border-purple-500/30 text-foreground placeholder:text-muted-foreground focus:border-purple-400"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-foreground">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        placeholder="Enter your email"
                        className="bg-background dark:bg-white/10 border-purple-500/30 text-foreground placeholder:text-muted-foreground focus:border-purple-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-foreground">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        placeholder="Choose a password"
                        className="bg-background dark:bg-white/10 border-purple-500/30 text-foreground placeholder:text-muted-foreground focus:border-purple-400"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shimmer"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setLocation("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}