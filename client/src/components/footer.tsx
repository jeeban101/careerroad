import { Route, Sparkles, Github, Mail, Globe } from "lucide-react";

export default function Footer() {
  const footerLinks = {
    product: [
      { name: "AI Roadmaps", href: "#" },
      { name: "Career Paths", href: "#" },
      { name: "Progress Tracking", href: "#" },
      { name: "Success Stories", href: "#" }
    ],
    support: [
      { name: "Help Center", href: "#" },
      { name: "Contact Us", href: "#" },
      { name: "FAQ", href: "#" },
      { name: "Community", href: "#" }
    ],
    company: [
      { name: "About Us", href: "#" },
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Careers", href: "#" }
    ]
  };

  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Mail, href: "#", label: "Email" },
    { icon: Globe, href: "#", label: "Website" }
  ];

  return (
    <footer className="w-full backdrop-blur-glass border-t border-white/10 py-16 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <Route className="text-purple-400 text-2xl mr-2 glow-pulse" />
              <span className="font-bold text-xl text-white">CareerRoad</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Transform your career confusion into a clear, AI-powered roadmap to success.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map(social => (
                <a 
                  key={social.label}
                  href={social.href} 
                  className="text-gray-400 hover:text-purple-400 transition-colors p-2 rounded-lg hover:bg-white/10"
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map(link => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map(link => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map(link => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Sparkles className="h-4 w-4 text-purple-400 mr-2" />
              <span className="text-gray-400 text-sm">
                Powered by advanced AI technology for personalized career guidance
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              &copy; 2025 CareerRoad. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
