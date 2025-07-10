import { useState } from "react";
import RoadmapBuilder from "@/components/roadmap-builder";
import RoadmapDisplay from "@/components/roadmap-display";
import CustomizationModal from "@/components/customization-modal";
import EmailModal from "@/components/email-modal";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { RoadmapTemplate } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapTemplate | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleRoadmapGenerated = (roadmap: RoadmapTemplate) => {
    setSelectedRoadmap(roadmap);
  };

  const handleForkRoadmap = () => {
    setShowCustomization(true);
  };

  const handleShareRoadmap = () => {
    setShowEmailModal(true);
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
              </h1>
              <p className="text-gray-600 mt-2">Let's continue building your career path</p>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              Log Out
            </Button>
          </div>
          
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
  );
}
