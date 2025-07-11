import { Star, Quote, User, GraduationCap, Briefcase } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer at Google",
      education: "CS Student → Tech Lead",
      avatar: "SC",
      rating: 5,
      text: "CareerRoad's AI-powered roadmap transformed my unclear computer science path into a structured journey. The step-by-step guidance helped me land my dream job at Google within 18 months.",
      gradientBg: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30"
    },
    {
      name: "Marcus Rodriguez",
      role: "Product Manager at Meta",
      education: "Business Major → PM",
      avatar: "MR",
      rating: 5,
      text: "I was completely lost about transitioning from business to tech. CareerRoad's personalized roadmap gave me the confidence and clear direction I needed. The progress tracking kept me motivated every step of the way.",
      gradientBg: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500/30"
    },
    {
      name: "Aisha Patel",
      role: "Data Scientist at Netflix",
      education: "Math Graduate → ML Engineer",
      avatar: "AP",
      rating: 5,
      text: "The AI recommendations were spot-on! CareerRoad identified skills I didn't even know I needed and provided resources that actually helped me transition into data science. Game-changer!",
      gradientBg: "from-emerald-500/20 to-teal-500/20",
      borderColor: "border-emerald-500/30"
    }
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="floating absolute top-20 left-1/4 opacity-20">
          <Quote className="h-8 w-8 text-purple-400 glow-pulse" />
        </div>
        <div className="floating absolute bottom-20 right-1/4 opacity-20" style={{ animationDelay: '4s' }}>
          <Star className="h-6 w-6 text-yellow-400 glow-pulse" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full mb-6 backdrop-blur-glass border border-yellow-500/30">
            <Star className="h-4 w-4 text-yellow-300 mr-2" />
            <span className="text-sm font-medium text-yellow-200">Trusted by 10,000+ Career Changers</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Success <span className="gradient-text">Stories</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Real people, real transformations. See how CareerRoad helped them achieve their career goals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className={`p-8 rounded-2xl bg-gradient-to-br ${testimonial.gradientBg} border ${testimonial.borderColor} backdrop-blur-glass card-hover shimmer`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Quote */}
              <div className="relative mb-6">
                <Quote className="absolute -top-2 -left-2 h-8 w-8 text-purple-400/30" />
                <p className="text-gray-300 leading-relaxed pl-6">
                  "{testimonial.text}"
                </p>
              </div>

              {/* Profile */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mr-4 glow-pulse">
                  <span className="text-white font-semibold text-sm">{testimonial.avatar}</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold">{testimonial.name}</h4>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  <div className="flex items-center mt-1">
                    <GraduationCap className="h-3 w-3 text-gray-500 mr-1" />
                    <span className="text-gray-500 text-xs">{testimonial.education}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <div className="backdrop-blur-glass rounded-2xl p-8 border border-purple-500/20 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Write Your Success Story?
            </h3>
            <p className="text-gray-300 mb-6">
              Join thousands of professionals who've transformed their careers with AI-powered guidance.
            </p>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 shimmer">
              Start Your Journey Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}