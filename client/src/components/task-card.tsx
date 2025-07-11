import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ExternalLink, StickyNote, Save, X } from "lucide-react";
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
    enabled: !!user && !!roadmapHistoryId,
  });

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
    if (!showNotes && taskProgress?.notes) {
      setNotes(taskProgress.notes);
      setTempNotes(taskProgress.notes);
    }
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
    <div className="group p-4 rounded-xl bg-gradient-to-r from-white to-gray-50 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <Checkbox 
            checked={isChecked}
            onCheckedChange={handleTaskToggle}
            className="mt-1"
          />
        </div>
        <div className={`flex-shrink-0 w-10 h-10 ${itemColor} rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
          <ItemIcon className="text-sm" size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className={`text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors duration-200 ${isChecked ? 'line-through text-gray-500' : ''}`}>
              {item.label}
            </h4>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${itemColor}`}>
                {item.type}
              </span>
              {user && roadmapHistoryId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNotesToggle}
                  className={`p-1 h-6 w-6 ${(notes || taskProgress?.notes) ? 'text-purple-600' : 'text-gray-400'} hover:text-purple-700`}
                >
                  <StickyNote size={12} />
                </Button>
              )}
              {item.link && (
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-800 transition-colors duration-200"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
          {item.description && (
            <p className={`text-sm text-gray-600 leading-relaxed ${isChecked ? 'line-through text-gray-400' : ''}`}>
              {item.description}
            </p>
          )}
          
          {/* Notes Section */}
          {showNotes && (
            <Card className="mt-3 p-3 bg-purple-50 border-purple-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-800">Task Notes</span>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveNotes}
                      disabled={updateTaskMutation.isPending}
                      className="h-6 px-2 text-xs bg-purple-600 text-white hover:bg-purple-700"
                    >
                      <Save size={10} className="mr-1" />
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNotes(false)}
                      className="h-6 px-2 text-xs text-gray-600 hover:text-gray-800"
                    >
                      <X size={10} />
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  placeholder="Add your notes, thoughts, or progress details..."
                  className="text-sm resize-none h-20 bg-white border-purple-200 focus:border-purple-400"
                />
              </div>
            </Card>
          )}
          
          {/* Show existing notes preview */}
          {!showNotes && (notes || taskProgress?.notes) && (
            <div className="mt-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-700 line-clamp-2">
                📝 {notes || taskProgress?.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}