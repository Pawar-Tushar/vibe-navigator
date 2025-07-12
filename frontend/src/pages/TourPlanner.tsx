import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateVibeTour } from "@/api/app.api";

const cities = ["Pune", "Mumbai", "Bangalore", "Delhi", "Noida"];

const vibeOptions = [
  { emoji: "🎨", label: "Aesthetic", color: "bg-pink-100 text-pink-800" },
  { emoji: "🎉", label: "Lively", color: "bg-orange-100 text-orange-800" },
  { emoji: "🌿", label: "Nature Escape", color: "bg-green-100 text-green-800" },
  { emoji: "💼", label: "Work & Focus", color: "bg-blue-100 text-blue-800" },
  { emoji: "❤️", label: "Romantic Date", color: "bg-red-100 text-red-800" },
  { emoji: "🍕", label: "Foodie Adventure", color: "bg-yellow-100 text-yellow-800" },
  { emoji: "🛍️", label: "Shopping Spree", color: "bg-purple-100 text-purple-800" },
  { emoji: "🏛️", label: "Cultural Heritage", color: "bg-indigo-100 text-indigo-800" }
];

export default function TourPlanner() {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [generatedTour, setGeneratedTour] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleVibe = (vibeLabel: string) => {
    setSelectedVibes((prev) =>
      prev.includes(vibeLabel)
        ? prev.filter((v) => v !== vibeLabel)
        : prev.length < 3
        ? [...prev, vibeLabel]
        : prev
    );
  };

  const handleGenerateTour = async () => {
    setIsGenerating(true);
    try {
      const tour = await generateVibeTour(selectedCity, selectedVibes);
      setGeneratedTour(tour);
    } catch (error) {
      console.error("Failed to generate tour:", error);
      alert("Oops! Something went wrong while generating your tour.");
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = selectedCity && selectedVibes.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">Create Your Perfect Day Out</h1>
          <p className="text-slate-500 mt-2">Tell us your preferences and we'll craft a personalized tour just for you.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!generatedTour ? (
          <div className="space-y-8">
            {/* City Selection */}
            <Card className="animate-fade-in">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Choose Your City</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {cities.map((city) => (
                    <Button
                      key={city}
                      variant={selectedCity === city ? "default" : "outline"}
                      onClick={() => setSelectedCity(city)}
                      className={`h-12 ${selectedCity === city ? "bg-cyan-500 hover:bg-cyan-600" : ""}`}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      {city}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Vibe Selection */}
            <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-slate-800">What's the vibe?</h2>
                  <span className="text-sm text-slate-500">Pick up to 3</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {vibeOptions.map((vibe) => (
                    <Button
                      key={vibe.label}
                      variant="outline"
                      onClick={() => toggleVibe(vibe.label)}
                      disabled={!selectedVibes.includes(vibe.label) && selectedVibes.length >= 3}
                      className={`h-16 flex-col gap-1 ${
                        selectedVibes.includes(vibe.label)
                          ? "bg-cyan-500 text-white border-cyan-500 hover:bg-cyan-600"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-2xl">{vibe.emoji}</span>
                      <span className="text-sm font-medium">{vibe.label}</span>
                    </Button>
                  ))}
                </div>
                {selectedVibes.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-sm text-slate-600">Selected:</span>
                    {selectedVibes.map((vibe) => (
                      <Badge key={vibe} variant="secondary">
                        {vibeOptions.find((v) => v.label === vibe)?.emoji} {vibe}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Card className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <CardContent className="p-6 text-center">
                <Button
                  onClick={handleGenerateTour}
                  disabled={!canGenerate || isGenerating}
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold px-8 py-4 rounded-full text-lg disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                      Crafting Your Perfect Day...
                    </>
                  ) : (
                    "Generate My Vibe Tour"
                  )}
                </Button>
                {!canGenerate && (
                  <p className="text-slate-500 text-sm mt-2">Please select a city and at least one vibe to continue</p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Tour Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
  <div>
    <h2 className="text-3xl font-bold text-cyan-600 mb-2">✨ Your Curated City Adventure</h2>
    <p className="text-slate-600 text-sm md:text-base">
      Explore a day designed to match your vibes and preferences. From cozy cafes to hidden gems this one’s made for you.
    </p>
  </div>
  <div className="text-right">
    <div className="flex items-center gap-1 text-amber-600 mb-1">
      <Clock className="w-4 h-4" />
      <span className="font-medium">{generatedTour.duration || "8 Hour"}</span>
    </div>
    <div className="flex items-center gap-1 text-slate-500">
      {/* <Star className="w-4 h-4" /> */}
      <span className="text-sm text-slate-600">
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",  // e.g., Saturday
          month: "short",   // e.g., Jul
          day: "numeric",   // e.g., 12
          // year: "numeric",  // e.g., 2025
        })}
      </span>

    </div>
  </div>
</div>

                <Button onClick={() => setGeneratedTour(null)} variant="outline" size="sm">
                  Plan Another Tour
                </Button>
              </CardContent>
            </Card>

            {/* AI-Generated Reply */}
            {generatedTour.reply && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Your Personalized Tour Narrative</h2>
                  <p className="text-slate-600 whitespace-pre-line">{generatedTour.reply}</p>
                </CardContent>
              </Card>
            )}
            {/* Source Reviews */}
            {Array.isArray(generatedTour.sources) && generatedTour.sources.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">What People Say</h2>
                  <div className="space-y-4">
                    {generatedTour.sources.map((source: any, idx: number) => (
                      <div key={idx} className="border border-slate-200 p-4 rounded-md">
                        <p className="text-slate-700 mb-2">"{source.review_text}"</p>
                        <div className="text-sm text-slate-500">
                          — {source.author}, <span className="italic">{source.location_name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
