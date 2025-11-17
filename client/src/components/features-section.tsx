import { Brain, Map, BookmarkCheck, Sparkles, Target, TrendingUp } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Advanced AI analyzes your background, skills, and aspirations to create personalized career roadmaps that adapt to your unique journey",
      gradientBg: "from-purple-500/20 to-blue-500/20",
      borderColor: "border-purple-500/30",
      iconBg: "from-purple-500 to-blue-500"
    },
    {
      icon: Target,
      title: "Goal-Oriented Pathways",
      description: "Clear, actionable milestones with detailed timelines, resources, and skill requirements to systematically achieve your career objectives",
      gradientBg: "from-emerald-500/20 to-teal-500/20",
      borderColor: "border-emerald-500/30",
      iconBg: "from-emerald-500 to-teal-500"
    },
    {
      icon: TrendingUp,
      title: "Smart Progress Tracking",
      description: "Monitor your advancement with intelligent tracking systems, milestone celebrations, and adaptive roadmap adjustments",
      gradientBg: "from-pink-500/20 to-orange-500/20",
      borderColor: "border-pink-500/30",
      iconBg: "from-pink-500 to-orange-500"
    }
  ];

  return (
    <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="floating absolute top-10 left-1/4 opacity-20">
          <Sparkles className="h-6 w-6 text-purple-400 glow-pulse" />
        </div>
        <div className="floating absolute bottom-20 right-1/4 opacity-20" style={{ animationDelay: '3s' }}>
          <Map className="h-5 w-5 text-blue-400 glow-pulse" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full mb-6 backdrop-blur-glass border border-purple-500/30">
            <Sparkles className="h-4 w-4 text-purple-300 mr-2" />
            <span className="text-sm font-medium text-purple-200">Powered by Advanced AI</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white">
            Why Choose <span className="gradient-text">CareerRoad</span>?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto px-4">
            Everything you need to transform career confusion into a clear, actionable path to success
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`text-center p-4 sm:p-6 lg:p-8 rounded-2xl bg-gradient-to-br ${feature.gradientBg} border ${feature.borderColor} backdrop-blur-glass card-hover shimmer`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.iconBg} rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 pulse-glow`}>
                <feature.icon className="text-white" size={24} />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-white">{feature.title}</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Enhanced statistics section */}
        <div className="mt-12 sm:mt-16 lg:mt-20 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
            <div className="backdrop-blur-glass rounded-xl p-4 sm:p-6 border border-purple-500/20">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-2">10K+</div>
              <div className="text-sm sm:text-base text-purple-300">Career Paths Generated</div>
            </div>
            <div className="backdrop-blur-glass rounded-xl p-4 sm:p-6 border border-blue-500/20">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-2">95%</div>
              <div className="text-sm sm:text-base text-blue-300">Success Rate</div>
            </div>
            <div className="backdrop-blur-glass rounded-xl p-4 sm:p-6 border border-emerald-500/20">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-2">50+</div>
              <div className="text-sm sm:text-base text-emerald-300">Career Fields</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
