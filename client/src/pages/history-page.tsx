import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Target, Calendar, TrendingUp, CheckCircle, ArrowLeft, Book, Wrench, CheckSquare, Users, Brain, Hammer, Rocket, ExternalLink, ChevronDown, ChevronUp, Trash2, Edit, StickyNote, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { UserRoadmapHistory, UserRoadmapProgress, RoadmapItem } from "@shared/schema";
import Header from "@/components/header";
import TaskCard from "@/components/task-card";
import InteractiveSkillRoadmap from "@/components/interactive-skill-roadmap";
import { courseOptions, roleOptions } from "@/data/roadmapTemplates";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

// Helper functions for styling
const getItemIcon = (type: string) => {
  switch (type) {
    case "resource": return Book;
    case "tool": return Wrench;
    case "task": return CheckSquare;
    case "community": return Users;
    default: return Book;
  }
};

const getItemColor = (type: string) => {
  switch (type) {
    case "resource": return "bg-blue-600 border-blue-400 text-white";
    case "tool": return "bg-purple-600 border-purple-400 text-white";
    case "task": return "bg-emerald-600 border-emerald-400 text-white";
    case "community": return "bg-amber-600 border-amber-400 text-white";
    default: return "bg-blue-600 border-blue-400 text-white";
  }
};

const getPhaseIcon = (index: number) => {
  const icons = [Brain, Hammer, Rocket];
  return icons[index % icons.length];
};

const getPhaseColor = (index: number) => {
  const colors = ["bg-blue-500", "bg-emerald-500", "bg-purple-500"];
  return colors[index % colors.length];
};

export default function HistoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRoadmap, setSelectedRoadmap] = useState<UserRoadmapHistory | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([0]));
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Delete roadmap mutation
  const deleteRoadmapMutation = useMutation({
    mutationFn: async (roadmapId: number) => {
      await apiRequest('DELETE', `/api/user-roadmap-history/${roadmapId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-roadmap-history"] });
      if (selectedRoadmap) {
        setSelectedRoadmap(null);
      }
      toast({
        title: "Roadmap Deleted",
        description: "Your roadmap has been successfully removed.",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Could not delete the roadmap. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { data: history, isLoading: historyLoading, error: historyError } = useQuery({
    queryKey: ["/api/user-roadmap-history"],
    enabled: !!user,
    retry: false,
  });

  // Helper functions for task tracking
  const togglePhase = (phaseIndex: number) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseIndex)) {
      newExpanded.delete(phaseIndex);
    } else {
      newExpanded.add(phaseIndex);
    }
    setExpandedPhases(newExpanded);
  };

  const handleTaskCheck = (phaseIndex: number, itemIndex: number, checked: boolean) => {
    const key = `${phaseIndex}-${itemIndex}`;
    const newChecked = new Set(checkedItems);
    if (checked) {
      newChecked.add(key);
    } else {
      newChecked.delete(key);
    }
    setCheckedItems(newChecked);
  };

  // Debug logging
  console.log('History Page - User:', user);
  console.log('History Page - Data:', history);
  console.log('History Page - Loading:', historyLoading);
  console.log('History Page - Error:', historyError);

  if (historyLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Header />
        <div className="container max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <Target className="h-16 w-16 text-purple-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Your Career Journey</h2>
              <p className="text-gray-600 mb-6">
                No roadmaps yet? Generate your first personalized career roadmap to start tracking your progress and building your future.
              </p>
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Generate Your First Roadmap
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show selected roadmap in full interactive mode
  if (selectedRoadmap) {
    // If it's a skill roadmap, render it with InteractiveSkillRoadmap
    if (selectedRoadmap.roadmapType === 'skill') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedRoadmap(null)}
              className="mb-6 text-gray-300 hover:text-white"
            >
              ← Back to History
            </Button>
            <InteractiveSkillRoadmap skillRoadmap={selectedRoadmap} fromHistory={true} />
          </div>
        </div>
      );
    }

    // For career roadmaps, show the career roadmap view
    const phases = selectedRoadmap.phases;
    const courseLabel = courseOptions.find(c => c.value === selectedRoadmap.currentCourse)?.label || selectedRoadmap.currentCourse;
    const roleLabel = roleOptions.find(r => r.value === selectedRoadmap.targetRole)?.label || selectedRoadmap.targetRole;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Header />
        <div className="container max-w-6xl mx-auto p-6">
          {/* Back Button */}
          <Button 
            onClick={() => setSelectedRoadmap(null)}
            variant="ghost" 
            className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Roadmaps
          </Button>

          {/* Roadmap Header */}
          <div className="bg-gray-900/80 rounded-2xl shadow-lg p-8 mb-8 border border-purple-500/20 backdrop-blur-glass">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Your Career Roadmap</h1>
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-200">{courseLabel}</span>
                  <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                  <span className="text-lg font-semibold text-gray-200">{roleLabel}</span>
                </div>
              </div>
            </div>

            {/* Phases Timeline */}
            <div className="space-y-8">
              {phases.map((phase, phaseIndex) => {
                const PhaseIcon = getPhaseIcon(phaseIndex);
                const phaseColor = getPhaseColor(phaseIndex);
                const isExpanded = expandedPhases.has(phaseIndex);

                return (
                  <div key={phaseIndex} className="relative">
                    {/* Phase Header */}
                    <div 
                      className={`${phaseColor} text-white p-6 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg`}
                      onClick={() => togglePhase(phaseIndex)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <PhaseIcon className="h-8 w-8" />
                          <div>
                            <h3 className="text-xl font-bold mb-2">Phase {phaseIndex + 1}</h3>
                            <h4 className="text-2xl font-semibold">{phase.title}</h4>
                            <p className="text-sm opacity-90 mt-1">{phase.duration_weeks} weeks</p>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-6 w-6" />
                        ) : (
                          <ChevronDown className="h-6 w-6" />
                        )}
                      </div>
                    </div>

                    {/* Phase Items */}
                    {isExpanded && (
                      <div className="mt-6 space-y-4">
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
                              roadmapHistoryId={selectedRoadmap.id}
                              onTaskCheck={handleTaskCheck}
                              user={user}
                              itemColor={itemColor}
                              ItemIcon={ItemIcon}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show roadmap list
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
        {Array.from({ length: 20 }).map((_, i) => (
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

      <div className="relative z-10">
        <Header />
        <div className="container max-w-6xl mx-auto p-6">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              My Career Roadmaps
            </h1>
            <p className="text-gray-300 text-lg">
              Track your progress and continue building your career journey
            </p>
          </div>

          {/* Roadmap Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {history.map((roadmap) => {
            const isSkillRoadmap = roadmap.roadmapType === 'skill';
            const courseLabel = courseOptions.find(c => c.value === roadmap.currentCourse)?.label || roadmap.currentCourse;
            const roleLabel = roleOptions.find(r => r.value === roadmap.targetRole)?.label || roadmap.targetRole;
            
            // For skill roadmaps, use skill and proficiency/timeframe
            const displayTitle = isSkillRoadmap 
              ? `Learn ${roadmap.skill || 'Skill'} in ${roadmap.timeFrame || 'N/A'}`
              : `${courseLabel} → ${roleLabel}`;
            const displayBadge = isSkillRoadmap 
              ? roadmap.skill || 'Skill Learning'
              : roleLabel;
            
            return (
              <Card 
                key={roadmap.id} 
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-purple-500/30 hover:border-purple-400/60 bg-gray-900/80 hover:bg-gray-800/90 backdrop-blur-glass hover:scale-105 transform shadow-lg"
                onClick={() => setSelectedRoadmap(roadmap)}
              >
                <CardHeader className="pb-3 relative">
                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600/20 hover:text-red-400 z-10 text-gray-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this roadmap?')) {
                        deleteRoadmapMutation.mutate(roadmap.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center justify-between pr-8">
                    <Badge variant="outline" className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-purple-200 border-purple-400/50 font-semibold">
                      {displayBadge}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(roadmap.createdAt), 'MMM dd')}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl text-white line-clamp-2 font-bold mt-2">
                    {displayTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Stats with icons */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 p-3 bg-blue-600/30 rounded-lg border border-blue-500/30">
                        <Brain className="h-5 w-5 text-blue-300" />
                        <div>
                          <div className="text-sm font-semibold text-blue-100">{roadmap.phases?.length || roadmap.skillContent?.stages?.length || 0}</div>
                          <div className="text-xs text-blue-200">{roadmap.roadmapType === 'career' ? 'Phases' : 'Stages'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-emerald-600/30 rounded-lg border border-emerald-500/30">
                        <CheckSquare className="h-5 w-5 text-emerald-300" />
                        <div>
                          <div className="text-sm font-semibold text-emerald-100">
                            {roadmap.phases?.reduce((total: number, phase: any) => total + (phase.items?.length || 0), 0) || 
                             roadmap.skillContent?.stages?.reduce((total: number, stage: any) => total + (stage.tasks?.length || 0), 0) || 0}
                          </div>
                          <div className="text-xs text-emerald-200">Tasks</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Last Accessed */}
                    <div className="flex items-center justify-between text-sm p-3 bg-gray-800/60 rounded-lg border border-gray-700/50">
                      <span className="text-gray-200 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Last viewed
                      </span>
                      <span className="font-semibold text-white">
                        {format(new Date(roadmap.lastAccessed), 'MMM dd')}
                      </span>
                    </div>
                    
                    {/* Action Button */}
                    <div className="pt-2">
                      <Button 
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 shimmer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRoadmap(roadmap);
                        }}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        View & Track Progress
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}