import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ExternalLink, StickyNote, Save, X, Link2, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { RoadmapItem } from "@shared/schema";

interface TaskCardProps {
  item: RoadmapItem;
  phaseIndex: number;
  itemIndex: number;
  isChecked: boolean;
  roadmapHistoryId: number | null;
  onTaskCheck: (phaseIndex: number, itemIndex: number, checked: boolean) => void;
  user: any;
  itemColor: string;
  ItemIcon: any;
}

export default function TaskCard({
  item,
  phaseIndex,
  itemIndex,
  isChecked,
  roadmapHistoryId,
  onTaskCheck,
  user,
  itemColor,
  ItemIcon
}: TaskCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [tempNotes, setTempNotes] = useState("");
  const { toast } = useToast();

  // Fetch existing task progress and notes
  const { data: taskProgress } = useQuery({
    queryKey: ["/api/task-progress", roadmapHistoryId, phaseIndex, itemIndex],
    queryFn: async () => {
      if (!user || !roadmapHistoryId) return null;
      try {
        const response = await fetch(`/api/roadmap-progress/${roadmapHistoryId}?phaseIndex=${phaseIndex}&taskIndex=${itemIndex}`);
        if (!response.ok) return null;
        return response.json();
      } catch (error) {
        return null;
      }
    },
    enabled: !!user && !!roadmapHistoryId && showNotes,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
  
  // When notes panel opens and query returns, seed local notes
  useEffect(() => {
    if (showNotes && taskProgress?.notes) {
      setNotes(taskProgress.notes);
      setTempNotes(taskProgress.notes);
    }
  }, [showNotes, taskProgress]);
  
  // Update task progress with notes
  const updateTaskMutation = useMutation({
    mutationFn: async (data: { completed: boolean; notes?: string }) => {
      await apiRequest('POST', '/api/update-task-progress', {
        roadmapId: roadmapHistoryId,
        phaseIndex,
        taskIndex: itemIndex,
        completed: data.completed,
        notes: data.notes
      });
    },
    onSuccess: () => {
      toast({
        title: "Progress Updated",
        description: "Task progress and notes saved successfully",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save progress",
        variant: "destructive",
      });
    }
  });

  const handleNotesToggle = () => {
    setShowNotes(!showNotes);
  };

  const handleSaveNotes = () => {
    setNotes(tempNotes);
    updateTaskMutation.mutate({
      completed: isChecked,
      notes: tempNotes
    });
    setShowNotes(false);
  };

  const handleTaskToggle = (checked: boolean) => {
    onTaskCheck(phaseIndex, itemIndex, checked);
    if (user && roadmapHistoryId) {
      updateTaskMutation.mutate({
        completed: checked,
        notes: notes || taskProgress?.notes
      });
    }
  };

  return (
    <div className="group p-4 rounded-xl bg-gray-800/60 border-2 border-gray-700/50 hover:border-purple-400/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.01] backdrop-blur-glass shimmer hover:bg-gray-800/80">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <Checkbox 
            checked={isChecked}
            onCheckedChange={handleTaskToggle}
            className="mt-1 h-5 w-5 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 transition-all duration-200 border-gray-400 data-[state=unchecked]:border-gray-400"
          />
        </div>
        <div className={`flex-shrink-0 w-12 h-12 ${itemColor} rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-md glow-pulse border border-white/20`}>
          <ItemIcon className="text-white" size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row items-start justify-between mb-2 gap-2">
            <div className="flex-1 min-w-0 pr-4">
              <h4 className={`text-sm font-semibold text-white break-words group-hover:text-purple-300 transition-colors duration-200 ${isChecked ? 'line-through text-gray-400' : ''}`}>
                {item.label}
              </h4>
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
              <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${itemColor} shadow-sm border border-white/20 whitespace-nowrap`}>
                {item.type}
              </span>
              
              {/* Enhanced Action Buttons */}
              {user && roadmapHistoryId && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNotesToggle}
                        className={`px-3 py-1 h-8 rounded-full text-xs font-medium transition-all duration-300 border-2 shimmer whitespace-nowrap ${
                          (notes || taskProgress?.notes) 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-500 hover:from-purple-600 hover:to-pink-600 shadow-lg' 
                            : 'bg-white/10 text-gray-300 border-gray-500 hover:border-purple-400 hover:text-purple-300 hover:bg-purple-500/20'
                        }`}
                      >
                        <StickyNote size={12} className="mr-1" />
                        {(notes || taskProgress?.notes) ? 'Edit Notes' : 'Add Notes'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">
                        {(notes || taskProgress?.notes) ? 'Click to edit your personal notes' : 'Click to add personal notes and track your progress'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {item.link && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3 py-1 h-8 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-2 border-blue-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg flex items-center space-x-1 shimmer whitespace-nowrap"
                      >
                        <ExternalLink size={12} />
                        <span>Open Resource</span>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">Click to open external learning resource in a new tab</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          {item.description && (
            <p className={`text-sm text-gray-200 leading-relaxed break-words ${isChecked ? 'line-through text-gray-500' : ''}`}>
              {item.description}
            </p>
          )}
          
          {/* Enhanced Notes Section */}
          {showNotes && (
            <div className="mt-4 p-4 bg-gray-800/80 border-2 border-purple-400/30 rounded-xl shadow-lg backdrop-blur-glass">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <StickyNote className="text-purple-300" size={16} />
                    <span className="text-sm font-semibold text-purple-200">Personal Notes & Progress</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSaveNotes}
                      disabled={updateTaskMutation.isPending}
                      className="h-8 px-3 text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 border-none shadow-md shimmer"
                    >
                      <Save size={12} className="mr-1" />
                      Save Notes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNotes(false)}
                      className="h-8 px-3 text-xs border-gray-500 text-gray-300 hover:text-white hover:bg-white/10"
                    >
                      <X size={12} />
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Textarea
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    placeholder="✨ Share your thoughts, progress updates, challenges, or helpful tips here..."
                    className="text-sm resize-none h-24 bg-gray-900/80 border-2 border-purple-400/30 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 rounded-lg shadow-sm placeholder:text-gray-400 text-white"
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {tempNotes.length} characters
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Enhanced Notes Preview */}
          {!showNotes && (notes || taskProgress?.notes) && (
            <div className="mt-3 p-3 bg-gray-800/60 rounded-lg border-2 border-emerald-400/30 shadow-sm backdrop-blur-glass">
              <div className="flex items-start space-x-2">
                <StickyNote className="text-emerald-300 flex-shrink-0 mt-0.5" size={14} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-emerald-200 mb-1">Your Notes:</p>
                  <p className="text-sm text-emerald-100 line-clamp-3 leading-relaxed">
                    {notes || taskProgress?.notes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
