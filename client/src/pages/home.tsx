import { useState } from "react";
import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import RoadmapBuilder from "@/components/roadmap-builder";
import RoadmapDisplay from "@/components/roadmap-display";
import WaitlistSection from "@/components/waitlist-section";
import Footer from "@/components/footer";
import CustomizationModal from "@/components/customization-modal";
import { RoadmapTemplate } from "@shared/schema";

export default function Home() {
  const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapTemplate | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);

  const handleRoadmapGenerated = (roadmap: RoadmapTemplate) => {
    setSelectedRoadmap(roadmap);
  };

  const handleForkRoadmap = () => {
    setShowCustomization(true);
  };

  const handleShareRoadmap = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My CareerRoad Roadmap',
        text: 'Check out my personalized career roadmap!',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Roadmap link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
          <HeroSection />
          <RoadmapBuilder onRoadmapGenerated={handleRoadmapGenerated} />
          {selectedRoadmap && (
            <RoadmapDisplay 
              roadmap={selectedRoadmap} 
              onFork={handleForkRoadmap}
              onShare={handleShareRoadmap}
            />
          )}
          <WaitlistSection />
        </main>
        <Footer />
        <CustomizationModal 
          isOpen={showCustomization} 
          onClose={() => setShowCustomization(false)}
          roadmap={selectedRoadmap}
        />
      </div>
    </div>
  );
}
