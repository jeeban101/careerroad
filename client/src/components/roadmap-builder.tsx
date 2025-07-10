import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { List, Clock, Wrench, CheckCircle } from "lucide-react";
import { courseOptions, roleOptions } from "@/data/roadmapTemplates";
import { RoadmapTemplate } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";

interface RoadmapBuilderProps {
  onRoadmapGenerated: (roadmap: RoadmapTemplate) => void;
}

interface FormData {
  currentCourse: string;
  targetRole: string;
  customCourse?: string;
  customRole?: string;
}

export default function RoadmapBuilder({ onRoadmapGenerated }: RoadmapBuilderProps) {
  const [showCustomCourse, setShowCustomCourse] = useState(false);
  const [showCustomRole, setShowCustomRole] = useState(false);
  
  const form = useForm<FormData>({
    defaultValues: {
      currentCourse: "",
      targetRole: "",
      customCourse: "",
      customRole: ""
    }
  });

  const generateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/generate-roadmap", data);
      // If response is a Response object, parse it as JSON
      if (response instanceof Response) {
        const jsonData = await response.json();
        return jsonData as RoadmapTemplate;
      }
      return response as RoadmapTemplate;
    },
    onSuccess: (roadmap) => {
      onRoadmapGenerated(roadmap);
      setTimeout(() => {
        document.getElementById('roadmap-display')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  });

  const onSubmit = async (data: FormData) => {
    const currentCourse = data.currentCourse === 'custom' ? data.customCourse : data.currentCourse;
    const targetRole = data.targetRole === 'custom' ? data.customRole : data.targetRole;
    
    if (!currentCourse || !targetRole) {
      return;
    }
    
    generateMutation.mutate({
      currentCourse: currentCourse || '',
      targetRole: targetRole || ''
    });
  };

  return (
    <section id="roadmap-builder" className="w-full max-w-4xl mx-auto mb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose your goal:</h2>
      </div>
      
      <Card className="mb-8 shadow-lg">
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="currentCourse"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        setShowCustomCourse(value === 'custom');
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 text-lg bg-white border-2 border-gray-200 rounded-lg">
                            <SelectValue placeholder="Current course" />
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
                      {showCustomCourse && (
                        <FormField
                          control={form.control}
                          name="customCourse"
                          render={({ field }) => (
                            <FormItem className="mt-2">
                              <FormControl>
                                <Input
                                  placeholder="Enter your course name"
                                  {...field}
                                  className="h-12 text-lg bg-white border-2 border-gray-200 rounded-lg"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetRole"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        setShowCustomRole(value === 'custom');
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 text-lg bg-white border-2 border-gray-200 rounded-lg">
                            <SelectValue placeholder="Desired role" />
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
                      {showCustomRole && (
                        <FormField
                          control={form.control}
                          name="customRole"
                          render={({ field }) => (
                            <FormItem className="mt-2">
                              <FormControl>
                                <Input
                                  placeholder="Enter your desired role"
                                  {...field}
                                  className="h-12 text-lg bg-white border-2 border-gray-200 rounded-lg"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      )}
                    </FormItem>
                  )}
                />
              </div>
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white py-4 px-6 text-lg font-semibold rounded-lg h-14"
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Generating your roadmap...
                    </>
                  ) : (
                    "Show Roadmap"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Sample Roadmap Preview */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">
            Sample Roadmap
          </h3>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center mr-4">
                <List className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">• Skill checklists</h4>
                </div>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center mr-4">
                <CheckCircle className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">• Milestone timelines</h4>
                </div>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center mr-4">
                <Wrench className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">• Tools & Resources</h4>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
