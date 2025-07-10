import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Save, X } from "lucide-react";
import { RoadmapTemplate, RoadmapPhase, RoadmapItem } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadmap: RoadmapTemplate | null;
}

export default function CustomizationModal({ isOpen, onClose, roadmap }: CustomizationModalProps) {
  const [customPhases, setCustomPhases] = useState<RoadmapPhase[]>([]);
  const [newStepText, setNewStepText] = useState("");
  const [activePhase, setActivePhase] = useState<number | null>(null);
  const { toast } = useToast();

  // Initialize custom phases when roadmap changes
  useState(() => {
    if (roadmap?.phases) {
      setCustomPhases(JSON.parse(JSON.stringify(roadmap.phases)));
    }
  }, [roadmap]);

  const mutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest("POST", "/api/custom-roadmaps", data),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your customized roadmap has been saved.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save customization. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDeleteItem = (phaseIndex: number, itemIndex: number) => {
    const newPhases = [...customPhases];
    newPhases[phaseIndex].items.splice(itemIndex, 1);
    setCustomPhases(newPhases);
  };

  const handleAddItem = (phaseIndex: number) => {
    if (!newStepText.trim()) return;
    
    const newPhases = [...customPhases];
    const newItem: RoadmapItem = {
      type: "task",
      label: newStepText.trim(),
      description: "Custom step added by user"
    };
    
    newPhases[phaseIndex].items.push(newItem);
    setCustomPhases(newPhases);
    setNewStepText("");
    setActivePhase(null);
  };

  const handleSave = () => {
    if (!roadmap) return;
    
    const customRoadmap = {
      originalTemplateId: roadmap.id,
      title: `${roadmap.title} (Customized)`,
      phases: customPhases,
      createdAt: new Date().toISOString()
    };
    
    mutation.mutate(customRoadmap);
  };

  if (!roadmap) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Customize Your Roadmap</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {customPhases.map((phase, phaseIndex) => (
            <Card key={phaseIndex} className="bg-gray-50">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">
                  Phase {phaseIndex + 1}: {phase.title}
                </h4>
                <div className="space-y-3">
                  {phase.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between p-3 bg-white rounded border">
                      <span className="flex-1">{item.label}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(phaseIndex, itemIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {activePhase === phaseIndex ? (
                    <div className="flex gap-2">
                      <Input
                        value={newStepText}
                        onChange={(e) => setNewStepText(e.target.value)}
                        placeholder="Enter new step..."
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddItem(phaseIndex);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddItem(phaseIndex)}
                        disabled={!newStepText.trim()}
                      >
                        Add
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActivePhase(null);
                          setNewStepText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full border-2 border-dashed border-gray-300 text-gray-600 hover:border-[hsl(var(--brand-indigo))] hover:text-[hsl(var(--brand-indigo))]"
                      onClick={() => setActivePhase(phaseIndex)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Step
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex space-x-4 pt-6 border-t">
          <Button
            onClick={handleSave}
            className="flex-1 bg-[hsl(var(--brand-indigo))] hover:bg-[hsl(var(--brand-indigo))]/90"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
