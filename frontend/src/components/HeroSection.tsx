import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
  isLoading: boolean; 
}

export const HeroSection = ({ searchQuery, setSearchQuery, onSearch, isLoading }: HeroSectionProps) => {
    const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&h=1080&fit=crop&crop=center"
          alt="Foggy mountain summit"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-float">
        <MapPin className="w-8 h-8 text-cyan-400 opacity-60" />
      </div>
      <div className="absolute top-32 right-16 animate-float" style={{ animationDelay: '1s' }}>
        <MapPin className="w-6 h-6 text-amber-400 opacity-60" />
      </div>
      <div className="absolute bottom-32 left-20 animate-float" style={{ animationDelay: '2s' }}>
        <MapPin className="w-7 h-7 text-cyan-400 opacity-60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
          Discover Your City's
          <span className="block text-cyan-400">Vibe</span>
        </h1>

        <p className="text-slate-200 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
          Go beyond ratings. Find places that match your mood from quiet, aesthetic cafes to nature-filled parks.
          Let AI guide your adventure.
        </p>

        {/* Search Bar */}
        <form onSubmit={onSearch} className="max-w-md mx-auto mb-8">
          <div className="relative group">
            <Input
              type="text"
              placeholder="Search 'cafes in Pune' or 'lively spots'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading}
              className="w-full pl-12 pr-4 py-4 text-lg rounded-full bg-white/95 backdrop-blur-sm border-0 shadow-2xl focus:shadow-cyan-500/25 focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
            <Button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full px-6 py-2 shadow-lg transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Loading...
                </div>
              ) : (
                "Explore"
              )}
            </Button>
          </div>
        </form>

        {/* Quick Suggestions */}
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <span className="text-slate-300">Try This:</span>
          {[
            "🌳 Parks in Pune",
            "☕ Cafes in Mumbai",
            "🍸 Bars in Mumbai",
            "📚 Bookstores in Bangalore",
            "🌊 Beach in Goa"
          ]
          .map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setSearchQuery(suggestion.slice(2))}
              className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              {suggestion}
            </button>
          ))}
        </div>
         <div className="mt-10 flex justify-center">
  <Button
    onClick={() => navigate('/tour-planner')}
    size="lg"
    className="bg-transparent border border-cyan-500 hover:bg-cyan-600 hover:text-white text-cyan-600 font-bold px-6 py-3 rounded-full text-base sm:text-lg shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 group w-full max-w-xs sm:max-w-sm md:max-w-md"
  >
    Build My Personalized Tour
    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
  </Button>
</div>
      </div>
    </section>
  );
};
