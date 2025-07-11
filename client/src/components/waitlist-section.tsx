import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Rocket, Check } from "lucide-react";
import { insertWaitlistEntrySchema, InsertWaitlistEntry } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function WaitlistSection() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<InsertWaitlistEntry>({
    resolver: zodResolver(insertWaitlistEntrySchema),
    defaultValues: {
      name: "",
      email: "",
      college: "",
      confusion: ""
    }
  });

  const mutation = useMutation({
    mutationFn: (data: InsertWaitlistEntry) => 
      apiRequest("POST", "/api/waitlist", data),
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Welcome to CareerRoad!",
        description: "You've been added to our waitlist. We'll be in touch soon!",
      });
      setTimeout(() => {
        setIsSubmitted(false);
        form.reset();
      }, 3000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: InsertWaitlistEntry) => {
    mutation.mutate(data);
  };

  const colleges = [
    "IIT Delhi", "BITS Pilani", "DU", "Christ University", "SRCC"
  ];

  return (
    <section className="w-full max-w-4xl mx-auto mb-12 relative">
      <div className="text-center mb-8">
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mb-6 backdrop-blur-glass border border-purple-500/30">
          <Rocket className="h-4 w-4 text-purple-300 mr-2" />
          <span className="text-sm font-medium text-purple-200">Join the Future of Career Planning</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Get Early Access</h2>
        <p className="text-gray-300">Be among the first to experience AI-powered career guidance</p>
      </div>
      
      <Card className="shadow-lg backdrop-blur-glass border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Your Name"
                          className="h-14 text-lg bg-white/10 border-2 border-purple-400/30 rounded-lg text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          placeholder="Your Email"
                          className="h-14 text-lg bg-white/10 border-2 border-purple-400/30 rounded-lg text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className={`w-full py-4 px-6 text-lg font-semibold h-14 rounded-lg shimmer transition-all duration-300 transform hover:scale-105 ${
                    isSubmitted 
                      ? 'bg-green-600 hover:bg-green-600' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  }`}
                  disabled={mutation.isPending || isSubmitted}
                >
                  {mutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Joining...
                    </>
                  ) : isSubmitted ? (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Welcome to CareerRoad!
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-2 h-5 w-5" />
                      Join Waitlist
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
}
