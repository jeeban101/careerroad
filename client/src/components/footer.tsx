import { Route } from "lucide-react";
import { Twitter, Linkedin, Instagram } from "lucide-react";

export default function Footer() {
  const footerLinks = {
    product: [
      { name: "Features", href: "#" },
      { name: "Roadmaps", href: "#" },
      { name: "Pricing", href: "#" }
    ],
    support: [
      { name: "Help Center", href: "#" },
      { name: "Contact Us", href: "#" },
      { name: "FAQ", href: "#" }
    ]
  };

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Instagram, href: "#", label: "Instagram" }
  ];

  return (
    <footer className="w-full bg-gray-100 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Route className="text-gray-700 text-2xl mr-2" />
            <span className="font-bold text-xl text-gray-900">CareerRoad</span>
          </div>
          <p className="text-gray-600 mb-6">Your personalized roadmap to career success.</p>
          <div className="flex justify-center space-x-6 mb-6">
            {socialLinks.map(social => (
              <a 
                key={social.label}
                href={social.href} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={social.label}
              >
                <social.icon size={20} />
              </a>
            ))}
          </div>
          <p className="text-gray-400 text-sm">&copy; 2024 CareerRoad. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
