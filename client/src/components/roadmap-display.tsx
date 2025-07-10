import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { GitBranch, Share2, Brain, Hammer, Rocket, Book, Wrench, CheckSquare, Users } from "lucide-react";
import { RoadmapTemplate, RoadmapItem } from "@shared/schema";
import { courseOptions, roleOptions } from "@/data/roadmapTemplates";

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
      return "bg-blue-50 border-blue-200 text-[hsl(var(--brand-indigo))]";
    case "tool":
      return "bg-purple-50 border-purple-200 text-[hsl(var(--brand-purple))]";
    case "task":
      return "bg-emerald-50 border-emerald-200 text-[hsl(var(--brand-emerald))]";
    case "community":
      return "bg-amber-50 border-amber-200 text-[hsl(var(--brand-amber))]";
    default:
      return "bg-blue-50 border-blue-200 text-[hsl(var(--brand-indigo))]";
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

  const courseLabel = courseOptions.find(c => c.value === roadmap.currentCourse)?.label || roadmap.currentCourse;
  const roleLabel = roleOptions.find(r => r.value === roadmap.targetRole)?.label || roadmap.targetRole;

  const handleItemCheck = (phaseIndex: number, itemIndex: number, checked: boolean) => {
    const key = `${phaseIndex}-${itemIndex}`;
    const newCheckedItems = new Set(checkedItems);
    if (checked) {
      newCheckedItems.add(key);
    } else {
      newCheckedItems.delete(key);
    }
    setCheckedItems(newCheckedItems);
  };

  const totalWeeks = roadmap.phases?.reduce((sum, phase) => sum + phase.duration_weeks, 0) || 0;

  return (
    <section id="roadmap-display" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Career Roadmap</h2>
          <p className="text-xl text-gray-600">
            {courseLabel} → {roleLabel}
          </p>
          <div className="flex justify-center mt-6 space-x-4">
            <Button 
              onClick={onFork}
              className="bg-[hsl(var(--brand-purple))] hover:bg-[hsl(var(--brand-purple))]/90 text-white px-6 py-3 font-semibold"
            >
              <GitBranch className="mr-2 h-4 w-4" />
              Fork & Customize
            </Button>
            <Button 
              onClick={onShare}
              className="bg-[hsl(var(--brand-emerald))] hover:bg-[hsl(var(--brand-emerald))]/90 text-white px-6 py-3 font-semibold"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Roadmap
            </Button>
          </div>
        </div>

        {/* Roadmap Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
          
          {!roadmap.phases || roadmap.phases.length === 0 ? (
            <Card className="border border-gray-200">
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No roadmap phases available. Please try generating a new roadmap.</p>
              </CardContent>
            </Card>
          ) : (
            roadmap.phases.map((phase, phaseIndex) => {
              const PhaseIcon = getPhaseIcon(phaseIndex);
              const phaseColor = getPhaseColor(phaseIndex);
              
              return (
                <div key={phaseIndex} className="mb-12 relative">
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 w-16 h-16 ${phaseColor} rounded-full flex items-center justify-center relative z-10`}>
                      <PhaseIcon className="text-white text-xl" size={24} />
                    </div>
                    <Card className="ml-8 flex-1 border border-gray-200">
                      <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-2xl font-bold text-gray-900">
                            Phase {phaseIndex + 1}: {phase.title}
                          </h3>
                          <span className={`${phaseColor} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                            {phase.duration_weeks} weeks
                          </span>
                        </div>
                        <div className="space-y-4">
                          {phase.items.map((item, itemIndex) => {
                            const ItemIcon = getItemIcon(item.type);
                            const itemColor = getItemColor(item.type);
                            const itemKey = `${phaseIndex}-${itemIndex}`;
                            const isChecked = checkedItems.has(itemKey);
                            
                            return (
                              <div key={itemIndex} className={`flex items-start p-4 ${itemColor} rounded-lg border ${isChecked ? 'opacity-75' : ''}`}>
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(checked) => handleItemCheck(phaseIndex, itemIndex, checked as boolean)}
                                  className="mt-1 mr-4"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center mb-2">
                                    <ItemIcon className={`mr-2 ${getItemColor(item.type).split(' ')[2]}`} size={16} />
                                    <span className="font-medium capitalize">{item.type}</span>
                                  </div>
                                  <p className="text-gray-700">{item.label}</p>
                                  {item.description && (
                                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                  )}
                                  {item.link && (
                                    <a 
                                      href={item.link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className={`${getItemColor(item.type).split(' ')[2]} hover:underline text-sm`}
                                    >
                                      View Resource →
                                    </a>
                                  )}
                                </div>
                              </div>
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

        {/* Progress Summary */}
        <Card className="bg-gradient-to-r from-[hsl(var(--brand-indigo))] to-[hsl(var(--brand-purple))] text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
            <p className="text-lg mb-6">
              This roadmap will take approximately {Math.ceil(totalWeeks / 4)} months to complete
            </p>
            <div className="flex justify-center space-x-4">
              <Button className="bg-white text-[hsl(var(--brand-indigo))] px-6 py-3 font-semibold hover:bg-gray-100">
                <div className="w-4 h-4 bg-[hsl(var(--brand-indigo))] rounded-full mr-2"></div>
                Start Now
              </Button>
              <Button 
                variant="outline" 
                className="border-white text-white px-6 py-3 font-semibold hover:bg-white hover:text-[hsl(var(--brand-indigo))]"
              >
                <div className="w-4 h-4 border-2 border-white rounded mr-2"></div>
                Save for Later
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
