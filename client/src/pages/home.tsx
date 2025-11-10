import { useState } from "react";
import RoadmapBuilder from "@/components/roadmap-builder";
import SkillRoadmapBuilder from "@/components/skill-roadmap-builder";
import RoadmapDisplay from "@/components/roadmap-display";
import SkillRoadmapDisplay from "@/components/skill-roadmap-display";
import CustomizationModal from "@/components/customization-modal";
import EmailModal from "@/components/email-modal";
import Header from "@/components/header";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoadmapTemplate, SkillRoadmapContent } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  
  // Debug: Log user state
  console.log('Home - user:', user, 'isLoggedIn:', !!user);
  const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapTemplate | null>(null);
  const [selectedSkillRoadmap, setSelectedSkillRoadmap] = useState<any>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleRoadmapGenerated = (roadmap: RoadmapTemplate) => {
    setSelectedRoadmap(roadmap);
    setSelectedSkillRoadmap(null);
  };

  const handleSkillRoadmapGenerated = (skillRoadmap: any) => {
    setSelectedSkillRoadmap(skillRoadmap);
    setSelectedRoadmap(null);
  };

  const handleForkRoadmap = () => {
    setShowCustomization(true);
  };

  const handleShareRoadmap = () => {
    setShowEmailModal(true);
  };



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
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
                </h1>
                <p className="text-gray-300 mt-2">Let's continue building your career path</p>
              </div>
            </div>
            
            <Tabs defaultValue="career" className="w-full">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Choose your goal:</h2>
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white/10 border border-purple-500/30">
                  <TabsTrigger 
                    value="career"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
                    data-testid="tab-career"
                  >
                    Career Roadmap
                  </TabsTrigger>
                  <TabsTrigger 
                    value="skill"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
                    data-testid="tab-skill"
                  >
                    Build Skill
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="career" className="mt-0">
                <div className="grid gap-8">
                  <RoadmapBuilder onRoadmapGenerated={handleRoadmapGenerated} />
                  
                  {selectedRoadmap && (
                    <RoadmapDisplay 
                      roadmap={selectedRoadmap} 
                      onFork={handleForkRoadmap}
                      onShare={handleShareRoadmap}
                    />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="skill" className="mt-0">
                <div className="grid gap-8">
                  <SkillRoadmapBuilder onSkillRoadmapGenerated={handleSkillRoadmapGenerated} />
                  
                  {selectedSkillRoadmap && (
                    <SkillRoadmapDisplay skillRoadmap={selectedSkillRoadmap} />
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <CustomizationModal 
          isOpen={showCustomization} 
          onClose={() => setShowCustomization(false)}
          roadmap={selectedRoadmap}
        />

        <EmailModal 
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          roadmap={selectedRoadmap!}
        />
      </div>
    </div>
  );
}
