import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Wand2, List, Clock, Wrench } from "lucide-react";
import { courseOptions, roleOptions, getRoadmapKey } from "@/data/roadmapTemplates";
import { RoadmapTemplate } from "@shared/schema";
import { Progress } from "@/components/ui/progress";

interface RoadmapBuilderProps {
  onRoadmapGenerated: (roadmap: RoadmapTemplate) => void;
}

interface FormData {
  currentCourse: string;
  targetRole: string;
}

export default function RoadmapBuilder({ onRoadmapGenerated }: RoadmapBuilderProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const form = useForm<FormData>({
    defaultValues: {
      currentCourse: "",
      targetRole: ""
    }
  });

  const { data: templates } = useQuery({
    queryKey: ['/api/roadmap-templates'],
    queryFn: async () => {
      const response = await fetch('/api/roadmap-templates');
      return response.json() as Promise<RoadmapTemplate[]>;
    }
  });

  const onSubmit = async (data: FormData) => {
    if (!data.currentCourse || !data.targetRole) {
      return;
    }

    setIsGenerating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const key = getRoadmapKey(data.currentCourse, data.targetRole);
    const template = templates?.find(t => t.key === key);
    
    if (template) {
      onRoadmapGenerated(template);
      // Scroll to roadmap display
      setTimeout(() => {
        document.getElementById('roadmap-display')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    
    setIsGenerating(false);
  };

  return (
    <section id="roadmap-builder" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Build Your Roadmap</h2>
          <p className="text-xl text-gray-600">Choose your starting point and destination</p>
        </div>
        
        <Card className="mb-8">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="currentCourse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Course/Degree</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your current course" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {courseOptions.map(course => (
                              <SelectItem key={course.value} value={course.value}>
                                {course.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="targetRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Career Role</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your dream role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roleOptions.map(role => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-[hsl(var(--brand-indigo))] hover:bg-[hsl(var(--brand-indigo))]/90 py-4 px-6 text-lg font-semibold"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-5 w-5" />
                        Generate My Roadmap
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Sample Roadmap Preview */}
        <Card className="border-l-4 border-[hsl(var(--brand-indigo))]">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <div className="w-8 h-8 bg-[hsl(var(--brand-indigo))] rounded-full flex items-center justify-center mr-3">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              Sample Roadmap Preview
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[hsl(var(--brand-indigo))] rounded-full flex items-center justify-center mr-4">
                    <List className="text-white text-sm" size={16} />
                  </div>
                  <div>
                    <h4 className="font-semibold">Skill checklists</h4>
                    <p className="text-sm text-gray-600">Track your progress step by step</p>
                  </div>
                </div>
                <div className="w-24">
                  <Progress value={75} className="h-2" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[hsl(var(--brand-purple))] rounded-full flex items-center justify-center mr-4">
                    <Clock className="text-white text-sm" size={16} />
                  </div>
                  <div>
                    <h4 className="font-semibold">Milestone timelines</h4>
                    <p className="text-sm text-gray-600">Clear deadlines and phases</p>
                  </div>
                </div>
                <div className="w-24">
                  <Progress value={50} className="h-2" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[hsl(var(--brand-emerald))] rounded-full flex items-center justify-center mr-4">
                    <Wrench className="text-white text-sm" size={16} />
                  </div>
                  <div>
                    <h4 className="font-semibold">Tools & Resources</h4>
                    <p className="text-sm text-gray-600">Curated learning materials</p>
                  </div>
                </div>
                <div className="w-24">
                  <Progress value={25} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
