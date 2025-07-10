import Header from '@/components/header';
import HeroSection from '@/components/hero-section';
import FeaturesSection from '@/components/features-section';
import WaitlistSection from '@/components/waitlist-section';
import Footer from '@/components/footer';

import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();
  
  const handleGetStarted = () => {
    setLocation('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />
      <HeroSection onGetStarted={handleGetStarted} />
      <FeaturesSection />
      <WaitlistSection />
      <Footer />
    </div>
  );
}