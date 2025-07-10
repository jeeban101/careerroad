import { useState } from "react";
import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
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
      <Header />
      <HeroSection />
      <FeaturesSection />
      <RoadmapBuilder onRoadmapGenerated={handleRoadmapGenerated} />
      {selectedRoadmap && (
        <RoadmapDisplay 
          roadmap={selectedRoadmap} 
          onFork={handleForkRoadmap}
          onShare={handleShareRoadmap}
        />
      )}
      <WaitlistSection />
      <Footer />
      <CustomizationModal 
        isOpen={showCustomization} 
        onClose={() => setShowCustomization(false)}
        roadmap={selectedRoadmap}
      />
    </div>
  );
}
