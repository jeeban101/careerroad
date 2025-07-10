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
    <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Early Access</h2>
          <p className="text-xl text-gray-300">
            Join 1000+ students who are already planning their career journey
          </p>
        </div>
        
        <Card className="shadow-2xl">
          <CardContent className="p-8 text-gray-900">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter your full name"
                            className="border-gray-300 focus:ring-2 focus:ring-[hsl(var(--brand-indigo))] focus:border-transparent"
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
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email"
                            placeholder="Enter your email"
                            className="border-gray-300 focus:ring-2 focus:ring-[hsl(var(--brand-indigo))] focus:border-transparent"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="college"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College/University</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter your college name"
                          className="border-gray-300 focus:ring-2 focus:ring-[hsl(var(--brand-indigo))] focus:border-transparent"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confusion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What career are you most confused about?</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={3}
                          placeholder="Tell us what you're struggling with..."
                          className="border-gray-300 focus:ring-2 focus:ring-[hsl(var(--brand-indigo))] focus:border-transparent"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className={`w-full py-4 px-6 text-lg font-semibold ${
                      isSubmitted 
                        ? 'bg-[hsl(var(--brand-emerald))] hover:bg-[hsl(var(--brand-emerald))]' 
                        : 'bg-[hsl(var(--brand-indigo))] hover:bg-[hsl(var(--brand-indigo))]/90'
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
        
        {/* Social Proof */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-6">Trusted by students from</p>
          <div className="flex justify-center space-x-8 opacity-60">
            {colleges.map(college => (
              <span key={college} className="text-lg font-medium">{college}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
