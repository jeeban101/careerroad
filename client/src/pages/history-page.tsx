import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Target, Calendar, TrendingUp, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { UserRoadmapHistory, UserRoadmapProgress } from "@shared/schema";
import Header from "@/components/header";

export default function HistoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRoadmap, setSelectedRoadmap] = useState<UserRoadmapHistory | null>(null);

  const { data: history, isLoading: historyLoading, error: historyError } = useQuery({
    queryKey: ["/api/user-roadmap-history"],
    enabled: !!user,
    retry: false,
  });

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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Roadmap History Found</h2>
            <p className="text-gray-600">
              Once you generate roadmaps, they'll appear here for easy access and progress tracking.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Debug Info: User {user?.id ? `ID: ${user.id}` : 'not found'}, 
              History: {history ? `${history.length} items` : 'null/undefined'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Roadmap History</h1>
          <p className="text-gray-600">
            Track your progress and revisit your career roadmaps
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* History List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Roadmaps ({history.length})
            </h2>
            
            {history.map((roadmap: UserRoadmapHistory) => {
              return (
                <Card 
                  key={roadmap.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedRoadmap?.id === roadmap.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedRoadmap(roadmap)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{roadmap.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {roadmap.accessCount || 1} views
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(roadmap.createdAt), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(roadmap.lastAccessed), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">0%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{roadmap.currentCourse}</span>
                        <span>→</span>
                        <span>{roadmap.targetRole}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Roadmap Details */}
          <div className="sticky top-6">
            {selectedRoadmap ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {selectedRoadmap.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {selectedRoadmap.phases.length} phases • 
                    {selectedRoadmap.phases.reduce((acc, phase) => acc + (phase.items?.length || 0), 0)} total tasks
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedRoadmap.phases.map((phase, phaseIndex) => (
                    <div key={phaseIndex} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{phase.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {phase.duration_weeks}w
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 pl-2">
                        {phase.items?.map((item, itemIndex) => {
                          return (
                            <div key={itemIndex} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-700">
                                {item.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Select a roadmap to view details and track progress
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}