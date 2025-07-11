import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, Link } from "wouter";

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
            <h2 className="mt-6 text-3xl font-bold text-white">Welcome to CareerRoad</h2>
            <p className="mt-2 text-sm text-gray-300">
              Sign in to your account or create a new one
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/10 border border-purple-500/20 backdrop-blur-glass">
              <TabsTrigger value="login" className="text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="bg-white/5 border border-purple-500/20 backdrop-blur-glass">
                <CardHeader>
                  <CardTitle className="text-white">Sign In</CardTitle>
                  <CardDescription className="text-gray-300">
                    Enter your email and password to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-gray-200">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        placeholder="Enter your email"
                        className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-gray-200">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        placeholder="Enter your password"
                        className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400"
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
                        <Button variant="link" className="text-gray-400 hover:text-white text-sm">
                          Forgot your password?
                        </Button>
                      </Link>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="bg-white/5 border border-purple-500/20 backdrop-blur-glass">
                <CardHeader>
                  <CardTitle className="text-white">Create Account</CardTitle>
                  <CardDescription className="text-gray-300">
                    Sign up for a new account to get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-firstName" className="text-gray-200">First Name</Label>
                        <Input
                          id="register-firstName"
                          value={registerForm.firstName}
                          onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                          placeholder="First name"
                          className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-lastName" className="text-gray-200">Last Name</Label>
                        <Input
                          id="register-lastName"
                          value={registerForm.lastName}
                          onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                          placeholder="Last name"
                          className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-gray-200">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        placeholder="Enter your email"
                        className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-gray-200">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        placeholder="Choose a password"
                        className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400"
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
              className="text-gray-300 hover:text-white"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}