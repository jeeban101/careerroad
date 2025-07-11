import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Target, Calendar, TrendingUp, CheckCircle, ArrowLeft, Book, Wrench, CheckSquare, Users, Brain, Hammer, Rocket, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { UserRoadmapHistory, UserRoadmapProgress, RoadmapItem } from "@shared/schema";
import Header from "@/components/header";
import TaskCard from "@/components/task-card";
import { courseOptions, roleOptions } from "@/data/roadmapTemplates";

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
    case "resource": return "bg-blue-50 border-blue-200 text-blue-600";
    case "tool": return "bg-purple-50 border-purple-200 text-purple-600";
    case "task": return "bg-emerald-50 border-emerald-200 text-emerald-600";
    case "community": return "bg-amber-50 border-amber-200 text-amber-600";
    default: return "bg-blue-50 border-blue-200 text-blue-600";
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
    const phases = selectedRoadmap.phases;
    const courseLabel = courseOptions.find(c => c.value === selectedRoadmap.currentCourse)?.label || selectedRoadmap.currentCourse;
    const roleLabel = roleOptions.find(r => r.value === selectedRoadmap.targetRole)?.label || selectedRoadmap.targetRole;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Header />
        <div className="container max-w-6xl mx-auto p-6">
          {/* Back Button */}
          <Button 
            onClick={() => setSelectedRoadmap(null)}
            variant="ghost" 
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Roadmaps
          </Button>

          {/* Roadmap Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Career Roadmap</h1>
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-700">{courseLabel}</span>
                  <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                  <span className="text-lg font-semibold text-gray-700">{roleLabel}</span>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      <div className="container max-w-6xl mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Career Roadmaps
          </h1>
          <p className="text-gray-600 text-lg">
            Track your progress and continue building your career journey
          </p>
        </div>

        {/* Roadmap Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {history.map((roadmap) => {
            const courseLabel = courseOptions.find(c => c.value === roadmap.currentCourse)?.label || roadmap.currentCourse;
            const roleLabel = roleOptions.find(r => r.value === roadmap.targetRole)?.label || roadmap.targetRole;
            
            return (
              <Card 
                key={roadmap.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200 bg-white"
                onClick={() => setSelectedRoadmap(roadmap)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
                      {roleLabel}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(roadmap.createdAt), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl text-gray-900 line-clamp-2">
                    {courseLabel} → {roleLabel}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Phases</span>
                      <span className="font-semibold text-gray-900">{roadmap.phases.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Tasks</span>
                      <span className="font-semibold text-gray-900">
                        {roadmap.phases.reduce((total, phase) => total + phase.items.length, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last Accessed</span>
                      <span className="font-semibold text-gray-900">
                        {format(new Date(roadmap.lastAccessed), 'MMM dd')}
                      </span>
                    </div>
                    <div className="pt-2">
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRoadmap(roadmap);
                        }}
                      >
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
  );
}