import Header from '@/components/header';
import HeroSection from '@/components/hero-section';
import FeaturesSection from '@/components/features-section';
import TestimonialsSection from '@/components/testimonials-section';
import WaitlistSection from '@/components/waitlist-section';
import Footer from '@/components/footer';

import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();
  
  const handleGetStarted = () => {
    setLocation('/auth');
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
        <HeroSection onGetStarted={handleGetStarted} />
        <FeaturesSection />
        <TestimonialsSection />
        <WaitlistSection />
        <Footer />
      </div>
    </div>
  );
}