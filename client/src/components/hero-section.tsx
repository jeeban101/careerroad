import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onGetStarted?: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const scrollToRoadmapBuilder = () => {
    document.getElementById('roadmap-builder')?.scrollIntoView({ behavior: 'smooth' });
    onGetStarted?.();
  };

  return (
    <section className="bg-gradient-to-br from-[hsl(var(--brand-indigo))] to-[hsl(var(--brand-purple))] text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Confused about your<br />
            <span className="text-[hsl(var(--brand-amber))]">career path?</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-indigo-100">
            Find and customize your personalized career roadmap.<br />
            From where you are to where you want to be.
          </p>
          <div className="flex justify-center">
            <Button 
              onClick={scrollToRoadmapBuilder}
              className="bg-white text-[hsl(var(--brand-indigo))] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Build My Roadmap
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
