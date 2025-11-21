import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { GitBranch, Share2, Brain, Hammer, Rocket, Book, Wrench, CheckSquare, Users, Save, Bookmark, Kanban, ChevronDown, ChevronUp } from "lucide-react";
import TaskCard from "@/components/task-card";
import type { RoadmapTemplate, RoadmapPhase } from "@shared/schema";
import { courseOptions, roleOptions } from "@/data/roadmapTemplates";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import EmailModal from "@/components/email-modal";
import Header from "@/components/header";

interface RoadmapDisplayProps {
  roadmap: RoadmapTemplate;
  onFork: () => void;
  onShare: () => void;
  historyId?: number;
}

// Match History Page UI helpers
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

export default function RoadmapDisplay({ roadmap, onFork, onShare, historyId }: RoadmapDisplayProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([0]));
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [roadmapHistoryId, setRoadmapHistoryId] = useState<number | null>(historyId || null);

  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const courseLabel = courseOptions.find(c => c.value === roadmap.currentCourse)?.label || roadmap.currentCourse;
  const roleLabel = roleOptions.find(r => r.value === roadmap.targetRole)?.label || roadmap.targetRole;
  const phases: RoadmapPhase[] = Array.isArray(roadmap?.phases) ? (roadmap.phases as RoadmapPhase[]) : [];

  // Save roadmap to history
  const saveToHistoryMutation = useMutation({
    mutationFn: async (roadmapData: any) => {
      const response = await apiRequest("POST", "/api/user-roadmap-history", roadmapData);
      return response.json();
    },
    onSuccess: (data) => {
      setRoadmapHistoryId(data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/user-roadmap-history"] });
      toast({
        title: "Roadmap Saved",
        description: "Your roadmap has been saved to your history.",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save roadmap. Please try again.",
        variant: "destructive",
      });
    },
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
      phases: roadmap.phases,
    });
  };

  // Update task progress
  const updateTaskProgressMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/update-task-progress", data);
    },
    onSuccess: () => {
      toast({
        title: "Progress Updated",
        description: "Task progress has been saved",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task progress",
        variant: "destructive",
      });
    },
  });

  // Generate Kanban board from roadmap
  const generateKanbanMutation = useMutation({
    mutationFn: async (historyId: number) => {
      const response = await apiRequest("POST", `/api/roadmaps/${historyId}/generate-kanban`, {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Kanban Board Created",
        description: "Your roadmap has been converted into actionable tasks.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/kanban/boards"] });
      navigate(`/kanban/${data.boardId}`);
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate Kanban board. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateKanban = () => {
    if (!user) {
      setShowEmailModal(true);
      return;
    }
    if (!roadmapHistoryId) {
      toast({
        title: "Save Required",
        description: "Please save the roadmap first before generating a Kanban board.",
        variant: "destructive",
      });
      return;
    }
    generateKanbanMutation.mutate(roadmapHistoryId);
  };

  const handleTaskCheck = (phaseIndex: number, itemIndex: number, checked: boolean) => {
    const key = `${phaseIndex}-${itemIndex}`;
    const newChecked = new Set(checkedItems);
    if (checked) newChecked.add(key);
    else newChecked.delete(key);
    setCheckedItems(newChecked);

    if (user && roadmapHistoryId) {
      updateTaskProgressMutation.mutate({
        roadmapId: roadmapHistoryId,
        phaseIndex,
        taskIndex: itemIndex,
        completed: checked,
      });
    }
  };

  const togglePhase = (phaseIndex: number) => {
    const next = new Set(expandedPhases);
    if (next.has(phaseIndex)) next.delete(phaseIndex);
    else next.add(phaseIndex);
    setExpandedPhases(next);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      <div className="container max-w-6xl mx-auto p-6">
        {/* Roadmap Header */}
        <div className="bg-gray-900/80 rounded-2xl shadow-lg p-8 mb-6 border border-purple-500/20 backdrop-blur-glass">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Career Roadmap
            </h1>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-200">{courseLabel}</span>
                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                <span className="text-lg font-semibold text-gray-200">{roleLabel}</span>
              </div>
            </div>
          </div>

          {/* Action buttons (kept from original component, styled to fit this UI) */}
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            {user && !roadmapHistoryId && (
              <Button
                onClick={handleSaveToHistory}
                disabled={saveToHistoryMutation.isPending}
                data-testid="button-save-roadmap"
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Save className="mr-2 h-4 w-4" />
                {saveToHistoryMutation.isPending ? "Saving..." : "Save to History"}
              </Button>
            )}
            {user && roadmapHistoryId && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
                <Bookmark className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-300">Saved to History</span>
              </div>
            )}
            <Button
              onClick={handleGenerateKanban}
              disabled={generateKanbanMutation.isPending}
              data-testid="button-generate-kanban"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Kanban className="mr-2 h-4 w-4" />
              {generateKanbanMutation.isPending ? "Generating..." : "Generate Kanban Board"}
            </Button>
            <Button
              onClick={onFork}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <GitBranch className="mr-2 h-4 w-4" />
              Fork & Customize
            </Button>
            <Button
              onClick={onShare}
              className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white px-6 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Roadmap
            </Button>
          </div>
        </div>

        {/* Phases Timeline - matches the History Page selected career view UI */}
        <div className="space-y-8">
          {phases.length === 0 ? (
            <div className="text-center text-gray-300 py-12 bg-gray-900/70 border border-gray-800 rounded-xl">
              No roadmap phases available. Please try generating a new roadmap.
            </div>
          ) : (
            phases.map((phase, phaseIndex) => {
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
                          <h3 className="text-xl font-bold mb-1">Phase {phaseIndex + 1}</h3>
                          <h4 className="text-2xl font-semibold">{phase.title}</h4>
                          <p className="text-sm opacity-90 mt-1">{phase.duration_weeks} weeks</p>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                    </div>
                  </div>

                  {/* Phase Items */}
                  {isExpanded && (
                    <div className="mt-6 space-y-4">
                      {(Array.isArray(phase.items) ? phase.items : []).map((item, itemIndex) => {
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
            })
          )}
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
