import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1500673922987-e212871fec22?w=1920&h=800&fit=crop"
          alt="Adventure awaits"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center animate-fade-in">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Ready for an
          <span className="block text-transparent bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text">
            Adventure?
          </span>
        </h2>
        
        <p className="text-slate-200 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
          Create a personalized tour that matches your perfect day out. From morning coffee to evening views.
        </p>

        <Button
          onClick={() => navigate('/tour-planner')}
          size="lg"
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold px-8 py-4 rounded-full text-lg shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 group"
        >
          Build My Personalized Tour
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </section>
  );
};
