import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Target, Clock, Zap } from "lucide-react";
import { SkillRoadmapContent } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface SkillRoadmapBuilderProps {
  onSkillRoadmapGenerated: (roadmap: any) => void;
}

interface FormData {
  skill: string;
  proficiencyLevel: string;
  timeFrame: string;
}

const proficiencyLevels = [
  { value: "I don't know anything about it", label: "I don't know anything about it" },
  { value: "I have heard and know the gist of it", label: "I have heard and know the gist of it" },
  { value: "I used to know it but not done it lately", label: "I used to know it but not done it lately" },
  { value: "I am an expert and want to learn more", label: "I am an expert and want to learn more" },
];

const timeFrames = [
  { value: "24 hr", label: "24 hours" },
  { value: "48 hr", label: "48 hours" },
  { value: "3 days", label: "3 days" },
  { value: "1 week", label: "1 week" },
  { value: "2 weeks", label: "2 weeks" },
  { value: "4 weeks", label: "4 weeks" },
  { value: "3 months", label: "3 months" },
  { value: "6 months", label: "6 months" },
];

export default function SkillRoadmapBuilder({ onSkillRoadmapGenerated }: SkillRoadmapBuilderProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<FormData>({
    defaultValues: {
      skill: "",
      proficiencyLevel: "",
      timeFrame: ""
    }
  });

  const generateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/generate-skill-roadmap", data);
      if (response instanceof Response) {
        const jsonData = await response.json();
        return jsonData;
      }
      return response;
    },
    onSuccess: async (skillRoadmap) => {
      // Auto-save to history if user is logged in and update roadmap with database ID
      let updatedRoadmap = skillRoadmap;
      
      if (user && skillRoadmap) {
        try {
          const saveResponse = await apiRequest("POST", "/api/user-roadmap-history", {
            roadmapType: "skill",
            skill: skillRoadmap.skill,
            proficiencyLevel: skillRoadmap.proficiencyLevel,
            timeFrame: skillRoadmap.timeFrame,
            title: skillRoadmap.title,
            skillContent: skillRoadmap.skillContent
          });
          
          const savedData = await saveResponse.json();
          
          // Update roadmap with database ID
          updatedRoadmap = {
            ...skillRoadmap,
            id: savedData.id
          };
          
          toast({
            title: "Skill Roadmap Generated!",
            description: "Your skill roadmap has been automatically saved to your history.",
          });
        } catch (error) {
          console.error("Failed to save skill roadmap to history:", error);
          toast({
            title: "Skill Roadmap Generated!",
            description: "Roadmap generated successfully but couldn't save to history.",
            variant: "destructive",
          });
        }
      }
      
      // Pass the updated roadmap (with database ID) to parent
      onSkillRoadmapGenerated(updatedRoadmap);
      
      setTimeout(() => {
        document.getElementById('skill-roadmap-display')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  });

  const onSubmit = async (data: FormData) => {
    if (!data.skill || !data.proficiencyLevel || !data.timeFrame) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to generate your skill roadmap.",
        variant: "destructive",
      });
      return;
    }
    
    generateMutation.mutate(data);
  };

  return (
    <section id="skill-roadmap-builder" className="w-full max-w-4xl mx-auto mb-12">
      <Card className="mb-8 shadow-lg bg-white/5 backdrop-blur-glass border border-purple-500/20">
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="skill"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white text-sm font-medium">Choose your skill</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., React.js, SQL, Machine Learning"
                        {...field}
                        className="h-14 text-lg bg-white/10 border-2 border-purple-500/30 rounded-lg text-white placeholder:text-gray-400"
                        data-testid="input-skill"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="proficiencyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white text-sm font-medium">Current level of proficiency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger 
                          className="h-14 text-lg bg-white/10 border-2 border-purple-500/30 rounded-lg text-white"
                          data-testid="select-proficiency"
                        >
                          <SelectValue placeholder="Select your current level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {proficiencyLevels.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeFrame"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white text-sm font-medium">By when do you want to learn this?</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger 
                          className="h-14 text-lg bg-white/10 border-2 border-purple-500/30 rounded-lg text-white"
                          data-testid="select-timeframe"
                        >
                          <SelectValue placeholder="Select your timeline" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeFrames.map(time => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-6 text-lg font-semibold rounded-lg h-14 shimmer"
                  disabled={generateMutation.isPending}
                  data-testid="button-generate-skill-roadmap"
                >
                  {generateMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Generating your skill roadmap...
                    </>
                  ) : (
                    "Generate Skill Roadmap"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Sample Preview */}
      <Card className="border-2 border-purple-500/20 shadow-lg bg-white/5 backdrop-blur-glass">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold mb-6 text-center text-white">
            What You'll Get
          </h3>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-white/10 rounded-lg">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-4 glow-pulse">
                <Target className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">• Progressive Learning Stages</h4>
              </div>
            </div>
            <div className="flex items-center p-4 bg-white/10 rounded-lg">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-4 glow-pulse">
                <Clock className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">• Time-bound Milestones</h4>
              </div>
            </div>
            <div className="flex items-center p-4 bg-white/10 rounded-lg">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4 glow-pulse">
                <Zap className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">• Actionable Tasks & Resources</h4>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
