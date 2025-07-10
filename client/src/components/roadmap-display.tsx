import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { GitBranch, Share2, Brain, Hammer, Rocket, Book, Wrench, CheckSquare, Users } from "lucide-react";
import { RoadmapTemplate, RoadmapItem } from "@shared/schema";
import { courseOptions, roleOptions } from "@/data/roadmapTemplates";
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
  const [showEmailModal, setShowEmailModal] = useState(false);

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
    <section id="roadmap-display" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-in fade-in duration-700">
          <div className="relative inline-block">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 bg-clip-text text-transparent">
              Your Career Roadmap
            </h2>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
          
          <div className="mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 inline-block animate-in slide-in-from-bottom duration-1000 delay-300">
            <div className="flex items-center justify-center space-x-4 text-lg md:text-xl">
              <span className="font-semibold text-gray-800 px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
                {courseLabel}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <div className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              </div>
              <span className="font-semibold text-gray-800 px-4 py-2 bg-purple-50 rounded-xl border border-purple-200">
                {roleLabel}
              </span>
            </div>
          </div>
          
          <div className="flex justify-center mt-8 space-x-4 animate-in slide-in-from-bottom duration-1000 delay-500">
            <Button 
              onClick={onFork}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <GitBranch className="mr-2 h-4 w-4" />
              Fork & Customize
            </Button>
            <Button 
              onClick={onShare}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Roadmap
            </Button>
          </div>
        </div>

        {/* Enhanced Roadmap Timeline */}
        <div className="relative">
          {/* Enhanced Timeline Line */}
          <div className="absolute left-10 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-70"></div>
          <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
          
          {!roadmap.phases || roadmap.phases.length === 0 ? (
            <Card className="border border-gray-200 animate-in fade-in duration-500">
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No roadmap phases available. Please try generating a new roadmap.</p>
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
                    <div className={`flex-shrink-0 w-20 h-20 ${phaseColor} rounded-2xl flex items-center justify-center relative z-10 shadow-2xl border-4 border-white transform transition-all duration-300 hover:scale-110 hover:rotate-3`}>
                      <PhaseIcon className="text-white text-2xl" size={28} />
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl opacity-30 animate-pulse"></div>
                    </div>
                    <Card className="ml-8 flex-1 border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 rounded-2xl overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"></div>
                      <CardContent className="p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                          <div>
                            <div className="flex items-center mb-2">
                              <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                                Phase {phaseIndex + 1}
                              </span>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                              {phase.title}
                            </h3>
                          </div>
                          <div className={`${phaseColor} text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg w-fit`}>
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                              </svg>
                              <span>{phase.duration_weeks} weeks</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-4">
                          {phase.items.map((item, itemIndex) => {
                            const ItemIcon = getItemIcon(item.type);
                            const itemColor = getItemColor(item.type);
                            const itemKey = `${phaseIndex}-${itemIndex}`;
                            const isChecked = checkedItems.has(itemKey);
                            
                            return (
                              <div 
                                key={itemIndex} 
                                className={`group flex items-start p-5 ${itemColor} rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${isChecked ? 'opacity-75 scale-95' : ''} cursor-pointer`}
                                style={{ animationDelay: `${(phaseIndex * 200) + (itemIndex * 100)}ms` }}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(checked) => handleItemCheck(phaseIndex, itemIndex, checked as boolean)}
                                  className="mt-1 mr-4 transform transition-transform duration-200 hover:scale-110"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center mb-3">
                                    <div className={`p-2 rounded-lg mr-3 ${getItemColor(item.type).replace('bg-', 'bg-').replace('50', '100')} transition-colors duration-200 group-hover:scale-110`}>
                                      <ItemIcon className={`${getItemColor(item.type).split(' ')[2]}`} size={18} />
                                    </div>
                                    <span className="font-semibold capitalize text-sm px-3 py-1 bg-white/80 rounded-full text-gray-700 border">
                                      {item.type}
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-gray-700 transition-colors duration-200">
                                    {item.label}
                                  </h4>
                                  {item.description && (
                                    <p className="text-gray-600 mb-3 leading-relaxed">{item.description}</p>
                                  )}
                                  {item.link && (
                                    <a 
                                      href={item.link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200 hover:underline"
                                    >
                                      <span>View Resource</span>
                                      <svg className="w-4 h-4 transform transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
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
    </section>
  );
}
