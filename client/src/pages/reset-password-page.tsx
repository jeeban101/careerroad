import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { resetPasswordSchema, resetPasswordRequestSchema } from "@shared/schema";
import { Link } from "wouter";
import { ArrowLeft, Mail, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { z } from "zod";

export default function ResetPasswordPage() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [token, setToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  // Get token from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get("token");
  
  if (urlToken && step === "request") {
    setToken(urlToken);
    setStep("reset");
  }

  const requestForm = useForm<z.infer<typeof resetPasswordRequestSchema>>({
    resolver: zodResolver(resetPasswordRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || "",
      newPassword: "",
    },
  });

  const onRequestSubmit = async (data: z.infer<typeof resetPasswordRequestSchema>) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/reset-password-request", data);
      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Password Reset Initiated",
          description: "Check your email for reset instructions",
          variant: "default",
        });
        
        // For development, show token and allow direct reset
        if (result.token) {
          setToken(result.token);
          setStep("reset");
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to initiate password reset",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/reset-password", {
        ...data,
        token: token || data.token,
      });
      const result = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        toast({
          title: "Password Reset Successful",
          description: "Your password has been updated",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reset password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900/80 border-purple-500/20 backdrop-blur-glass">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-white">Password Reset Complete</CardTitle>
            <CardDescription className="text-gray-300">
              Your password has been successfully updated
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/auth">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Sign In with New Password
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                Return to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900/80 border-purple-500/20 backdrop-blur-glass">
        <CardHeader>
          <div className="flex items-center space-x-2 mb-4">
            <Link href="/auth">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 bg-purple-600 rounded-full flex items-center justify-center">
              {step === "request" ? (
                <Mail className="h-6 w-6 text-white" />
              ) : (
                <Lock className="h-6 w-6 text-white" />
              )}
            </div>
            <CardTitle className="text-white">
              {step === "request" ? "Reset Password" : "Set New Password"}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {step === "request" 
                ? "Enter your email to receive reset instructions" 
                : "Enter your new password below"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {step === "request" ? (
            <Form {...requestForm}>
              <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4">
                <FormField
                  control={requestForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter your email"
                          className="bg-gray-800/60 border-gray-700 text-white placeholder-gray-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {isLoading ? "Sending..." : "Send Reset Email"}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                <FormField
                  control={resetForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">New Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter new password"
                          className="bg-gray-800/60 border-gray-700 text-white placeholder-gray-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}