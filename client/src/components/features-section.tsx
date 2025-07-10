import { MapPin, CheckCircle, Users } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: MapPin,
      title: "Personalized Roadmaps",
      description: "Get step-by-step guidance tailored to your current course and dream role",
      bgColor: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-100",
      iconBg: "bg-[hsl(var(--brand-indigo))]"
    },
    {
      icon: CheckCircle,
      title: "Track Progress",
      description: "Check off completed skills, tools, and milestones as you progress",
      bgColor: "from-emerald-50 to-green-50",
      borderColor: "border-emerald-100",
      iconBg: "bg-[hsl(var(--brand-emerald))]"
    },
    {
      icon: Users,
      title: "Share & Customize",
      description: "Fork roadmaps, customize steps, and share with your network",
      bgColor: "from-amber-50 to-orange-50",
      borderColor: "border-amber-100",
      iconBg: "bg-[hsl(var(--brand-amber))]"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why CareerRoad?</h2>
          <p className="text-xl text-gray-600">Everything you need to navigate your career journey</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className={`text-center p-8 rounded-2xl bg-gradient-to-br ${feature.bgColor} border ${feature.borderColor}`}>
              <div className={`w-16 h-16 ${feature.iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
                <feature.icon className="text-white text-2xl" size={24} />
              </div>
              <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
