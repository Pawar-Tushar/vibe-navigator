import { Search, Sparkles, Map, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Search,
    title: "Tell Us Your Vibe",
    description: "Search by mood, place, or feeling like 'cozy', 'romantic', or 'green space'.",
    color: "text-cyan-500"
  },
  {
    icon: Sparkles,
    title: "Get AI-Powered Insights",
    description: "We analyze thousands of reviews to find the real vibe of each location.",
    color: "text-amber-500"
  },
  {
    icon: Map,
    title: "Explore Your Plan",
    description: "Discover a smartly crafted tour—or build one with our AI Agent.",
    color: "text-emerald-500"
  }
];

export const HowItWorksSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4">
            How It Works
          </h2>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto">
            Three simple steps to discover your perfect city adventure
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-12">
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className="text-center group animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <step.icon className={`w-10 h-10 ${step.color}`} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-cyan-400 to-amber-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                {step.title}
              </h3>
              
              <p className="text-slate-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Documentation CTA */}
        <div className="text-center">
            <p className="text-slate-600 text-base mb-6">⚠️ This is an MVP version with limited city and category support.{" "}</p>
          <Button
            onClick={() => navigate("/about")}
            variant="outline"
            className="inline-flex items-center text-slate-700 hover:text-cyan-500 border border-slate-300 hover:border-cyan-500 transition-all duration-300"
          >
            <FileText className="w-5 h-5 mr-2" />
            Project Documentation
          </Button>
        </div>
      </div>
    </section>
  );
};
