import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

interface HeroSectionProps {
  onGetStarted?: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const scrollToRoadmapBuilder = () => {
    document.getElementById('roadmap-builder')?.scrollIntoView({ behavior: 'smooth' });
    onGetStarted?.();
  };

  return (
    <section className="text-center mb-12 max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
        Confused about your<br />
        <span className="text-gray-700">career path?</span>
      </h1>
      <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Find and customize your career roadmap.
      </p>
      <Button 
        onClick={scrollToRoadmapBuilder}
        variant="ghost"
        className="text-gray-500 hover:text-gray-700 p-2"
      >
        <ArrowDown className="h-6 w-6" />
      </Button>
    </section>
  );
}
