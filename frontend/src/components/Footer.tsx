import { MapPin, Mail, Github, Twitter, Linkedin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-slate-800 text-slate-300 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-8 h-8 text-cyan-400" />
              <h3 className="text-2xl font-bold text-white">Vibe Navigator</h3>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-md">
              Discover your city's vibe with AI-powered recommendations. 
              Find places that match your mood and create unforgettable experiences.
            </p>
            <div className="flex gap-4 mt-6">
              <a 
                href="#" 
                className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center hover:bg-cyan-500 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center hover:bg-cyan-500 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center hover:bg-cyan-500 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Explore</h4>
            <ul className="space-y-3">
              <li>
                <a href="/" className="hover:text-cyan-400 transition-colors">
                  Search Places
                </a>
              </li>
              <li>
                <a href="/tour-planner" className="hover:text-cyan-400 transition-colors">
                  Plan Your Tour
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-cyan-400 transition-colors">
                About Us
                </a>
              </li>

            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="hover:text-cyan-400 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition-colors">
                  Trust Policy
                </a>
              </li>

            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © 2024 Vibe Navigator. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Mail className="w-4 h-4" />
            <span>hello@vibenavigator.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
};