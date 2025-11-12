import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { GitBranch, Share2, Brain, Hammer, Rocket, Book, Wrench, CheckSquare, Users, Save, Heart, Bookmark, Star, Kanban } from "lucide-react";
import TaskCard from "@/components/task-card";
import { RoadmapTemplate, RoadmapItem, UserRoadmapProgress } from "@shared/schema";
import { courseOptions, roleOptions } from "@/data/roadmapTemplates";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import EmailModal from "@/components/email-modal";

interface RoadmapDisplayProps {
  roadmap: RoadmapTemplate;
  onFork: () => void;
  onShare: () => void;
}

const getItemIcon = (type: string) => {
  switch (type) {
    case "resource":
      return Book;
    case "tool":
      return Wrench;
    case "task":
      return CheckSquare;
    case "community":
      return Users;
    default:
      return Book;
  }
};

const getItemColor = (type: string) => {
  switch (type) {
    case "resource":
      return "bg-blue-600 border-blue-400 text-white";
    case "tool":
      return "bg-purple-600 border-purple-400 text-white";
    case "task":
      return "bg-emerald-600 border-emerald-400 text-white";
    case "community":
      return "bg-amber-600 border-amber-400 text-white";
    default:
      return "bg-blue-600 border-blue-400 text-white";
  }
};

const getPhaseIcon = (index: number) => {
  const icons = [Brain, Hammer, Rocket];
  return icons[index % icons.length];
};

const getPhaseColor = (index: number) => {
  const colors = [
    "bg-[hsl(var(--brand-indigo))]",
    "bg-[hsl(var(--brand-emerald))]",
    "bg-[hsl(var(--brand-purple))]"
  ];
  return colors[index % colors.length];
};

export default function RoadmapDisplay({ roadmap, onFork, onShare }: RoadmapDisplayProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [roadmapHistoryId, setRoadmapHistoryId] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const courseLabel = courseOptions.find(c => c.value === roadmap.currentCourse)?.label || roadmap.currentCourse;
  const roleLabel = roleOptions.find(r => r.value === roadmap.targetRole)?.label || roadmap.targetRole;

  // Initialize roadmapHistoryId from roadmap.id if it exists (for pre-saved roadmaps)
  useEffect(() => {
    if ((roadmap as any).id && !roadmapHistoryId) {
      setRoadmapHistoryId((roadmap as any).id);
    }
  }, [(roadmap as any).id]);

  // Manual save roadmap to history
  const saveToHistoryMutation = useMutation({
    mutationFn: async (roadmapData: any) => {
      const response = await apiRequest('POST', '/api/user-roadmap-history', roadmapData);
      return response.json();
    },
    onSuccess: (data) => {
      setRoadmapHistoryId(data.id);
      queryClient.invalidateQueries({ queryKey: ['/api/user-roadmap-history'] });
      toast({
        title: "Roadmap Saved!",
        description: "Your roadmap has been saved to your history.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('Failed to save roadmap to history:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save roadmap. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSaveToHistory = () => {
    if (!user) {
      setShowEmailModal(true);
      return;
    }

    saveToHistoryMutation.mutate({
      currentCourse: roadmap.currentCourse,
      targetRole: roadmap.targetRole,
      title: roadmap.title,
      phases: roadmap.phases
    });
  };

  // Update task progress
  const updateTaskProgressMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', '/api/update-task-progress', data);
    },
    onSuccess: () => {
      toast({
        title: "Progress Updated",
        description: "Task progress has been saved",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update task progress",
        variant: "destructive",
      });
    }
  });

  // Generate Kanban board from roadmap
  const generateKanbanMutation = useMutation({
    mutationFn: async (historyId: number) => {
      const response = await apiRequest('POST', `/api/roadmaps/${historyId}/generate-kanban`, {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Kanban Board Created!",
        description: "Your roadmap has been converted into actionable tasks.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/kanban/boards'] });
      navigate(`/kanban/${data.boardId}`);
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate Kanban board. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to generate Kanban:", error);
    }
  });

  const handleGenerateKanban = () => {
    if (!user) {
      setShowEmailModal(true);
      return;
    }

    if (!roadmapHistoryId) {
      toast({
        title: "Save Required",
        description: "Please save the roadmap first before generating Kanban board.",
        variant: "destructive",
      });
      return;
    }

    generateKanbanMutation.mutate(roadmapHistoryId);
  };

  const handleItemCheck = (phaseIndex: number, itemIndex: number, checked: boolean) => {
    const key = `${phaseIndex}-${itemIndex}`;
    const newCheckedItems = new Set(checkedItems);
    if (checked) {
      newCheckedItems.add(key);
    } else {
      newCheckedItems.delete(key);
    }
    setCheckedItems(newCheckedItems);

    // Update progress in database if user is logged in and roadmap is saved
    if (user && roadmapHistoryId) {
      updateTaskProgressMutation.mutate({
        roadmapId: roadmapHistoryId,
        phaseIndex,
        taskIndex: itemIndex,
        completed: checked
      });
    }
  };

  const totalWeeks = roadmap.phases?.reduce((sum, phase) => sum + phase.duration_weeks, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16 animate-in fade-in duration-700">
          <div className="relative inline-block">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Your Career Roadmap
            </h2>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse shimmer"></div>
          </div>
          
          <div className="mt-8 p-6 bg-white/5 backdrop-blur-glass rounded-2xl shadow-lg border border-purple-500/20 inline-block animate-in slide-in-from-bottom duration-1000 delay-300">
            <div className="flex items-center justify-center space-x-4 text-lg md:text-xl">
              <span className="font-semibold text-white px-4 py-2 bg-blue-600/20 rounded-xl border border-blue-500/30">
                {courseLabel}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <div className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              </div>
              <span className="font-semibold text-white px-4 py-2 bg-purple-600/20 rounded-xl border border-purple-500/30">
                {roleLabel}
              </span>
            </div>
          </div>
          
          <div className="flex justify-center mt-8 space-x-4 animate-in slide-in-from-bottom duration-1000 delay-500">
            {user && !roadmapHistoryId && (
              <Button 
                onClick={handleSaveToHistory}
                disabled={saveToHistoryMutation.isPending}
                data-testid="button-save-roadmap"
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 shimmer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="mr-2 h-4 w-4" />
                {saveToHistoryMutation.isPending ? 'Saving...' : 'Save to History'}
              </Button>
            )}
            {user && roadmapHistoryId && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
                <Bookmark className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-300">
                  Saved to History
                </span>
              </div>
            )}
            <Button 
              onClick={handleGenerateKanban}
              disabled={generateKanbanMutation.isPending || !roadmapHistoryId}
              data-testid="button-generate-kanban"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 shimmer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Kanban className="mr-2 h-4 w-4" />
              {generateKanbanMutation.isPending ? 'Generating...' : 'Generate Kanban Board'}
            </Button>
            <Button 
              onClick={onFork}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 shimmer"
            >
              <GitBranch className="mr-2 h-4 w-4" />
              Fork & Customize
            </Button>
            <Button 
              onClick={onShare}
              className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 shimmer"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Roadmap
            </Button>
          </div>
        </div>

        {/* Enhanced Roadmap Timeline */}
        <div className="relative">
          {/* Enhanced Timeline Line */}
          <div className="absolute left-10 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 via-pink-400 to-blue-400 rounded-full opacity-70"></div>
          <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-pink-500 to-blue-500 rounded-full animate-pulse"></div>
          
          {!roadmap.phases || roadmap.phases.length === 0 ? (
            <Card className="border border-purple-500/20 animate-in fade-in duration-500 bg-white/5 backdrop-blur-glass">
              <CardContent className="p-8 text-center">
                <p className="text-gray-300">No roadmap phases available. Please try generating a new roadmap.</p>
              </CardContent>
            </Card>
          ) : (
            roadmap.phases.map((phase, phaseIndex) => {
              const PhaseIcon = getPhaseIcon(phaseIndex);
              const phaseColor = getPhaseColor(phaseIndex);
              
              return (
                <div 
                  key={phaseIndex} 
                  className="mb-16 relative animate-in slide-in-from-left duration-700"
                  style={{ animationDelay: `${phaseIndex * 200}ms` }}
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 w-20 h-20 ${phaseColor} rounded-2xl flex items-center justify-center relative z-10 shadow-2xl border-4 border-white/20 transform transition-all duration-300 hover:scale-110 hover:rotate-3`}>
                      <PhaseIcon className="text-white text-2xl" size={28} />
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl opacity-30 animate-pulse"></div>
                    </div>
                    <Card className="ml-8 flex-1 border-2 border-purple-500/20 shadow-xl bg-gray-900/70 backdrop-blur-glass hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 rounded-2xl overflow-hidden hover:border-purple-400/40">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400"></div>
                      <CardContent className="p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                          <div>
                            <div className="flex items-center mb-2">
                              <span className="text-sm font-semibold text-purple-200 bg-purple-600/30 px-3 py-1 rounded-full border border-purple-500/30">
                                Phase {phaseIndex + 1}
                              </span>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                              {phase.title}
                            </h3>
                          </div>
                          <div className={`${phaseColor} text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg w-fit border border-white/20`}>
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                              </svg>
                              <span>{phase.duration_weeks} weeks</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {phase.items.map((item, itemIndex) => {
                            const ItemIcon = getItemIcon(item.type);
                            const itemColor = getItemColor(item.type);
                            const itemKey = `${phaseIndex}-${itemIndex}`;
                            const isChecked = checkedItems.has(itemKey);
                            
                            return (
                              <TaskCard
                                key={itemIndex}
                                item={item}
                                phaseIndex={phaseIndex}
                                itemIndex={itemIndex}
                                isChecked={isChecked}
                                roadmapHistoryId={roadmapHistoryId}
                                onTaskCheck={handleItemCheck}
                                user={user}
                                itemColor={itemColor}
                                ItemIcon={ItemIcon}
                              />
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Enhanced Progress Summary */}
        <div className="mt-16 animate-in slide-in-from-bottom duration-1000 delay-700">
          <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white border-0 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
            <CardContent className="p-12 text-center relative z-10">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h3>
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                    </svg>
                    <span className="text-xl font-semibold">
                      {Math.ceil(totalWeeks / 4)} months journey
                    </span>
                  </div>
                </div>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                  This comprehensive roadmap will guide you step-by-step towards your career goals with practical skills and real-world experience.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  onClick={() => window.open('mailto:', '_blank')}
                  className="bg-white text-indigo-600 px-8 py-4 font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 rounded-xl shadow-lg"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-indigo-600 rounded-full animate-pulse"></div>
                    <span>Start Your Journey</span>
                  </div>
                </Button>
                <Button 
                  onClick={() => setShowEmailModal(true)}
                  className="bg-white/20 backdrop-blur-sm border-2 border-white/50 text-white px-8 py-4 font-bold text-lg hover:bg-white/30 hover:border-white transition-all duration-300 transform hover:scale-105 rounded-xl shadow-lg"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <span className="text-white">Send to Email</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <EmailModal 
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        roadmap={roadmap}
      />
    </div>
  );
}
