import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, Map, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { CTASection } from "@/components/CTASection";
import { fetchLocations } from "@/api/app.api";
import { Footer } from "@/components/Footer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [retryTimer, setRetryTimer] = useState<number | null>(null);
   const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const TARGET_CITIES = {
    "pune": {"categories": ["cafes", "parks", "bars", "bookstores", "historic places", "restaurants"]},
    "mumbai": {"categories": ["cafes", "parks", "bars", "bookstores", "historic places", "beach"]},
    "bangalore": {"categories": ["cafes", "parks", "bars", "bookstores", "historic places"]},
    "delhi": {"categories": ["cafes", "parks", "bars", "bookstores", "historic places"]},
    "noida": {"categories": ["cafes", "parks", "bars", "bookstores", "historic places"]},
    "goa": {"categories": ["cafes", "parks", "bars", "bookstores", "historic places", "beach"]},
}


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      const cityMatch = lower.match(/in ([a-z\s]+)/);
      const city = cityMatch ? cityMatch[1].trim() : "pune";
      const category = (lower.split(" in ")[0] || "cafe").trim();
      setIsLoading(true); 

      try {
        const locations = await fetchLocations(city, category);
        console.log("Fetched locations:", locations);

        if (Array.isArray(locations) && locations.length > 0) {
          navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        } else {
          // Show modal if no data
          setShowDialog(true);

          // const timer = window.setTimeout(() => {
          //   navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
          // }, 300000); 

          // setRetryTimer(timer);
        }
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      }
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
     setIsLoading(false);
    if (retryTimer) {
      clearTimeout(retryTimer);
      setRetryTimer(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <HeroSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        isLoading={isLoading}
      />
      <HowItWorksSection />
      <CTASection />
      <Footer/>
    <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>🚧 Data Not Found</DialogTitle>
        </DialogHeader>
        <div className="text-slate-600 space-y-4">
          <p>
            Sorry for the inconvenience! Our AI heroes are currently fetching the latest locations just for you.
          </p>

          <p>
            <strong>Note:</strong> This is an <strong>MVP prototype</strong>. We currently support only a limited set of cities and categories while we build out the full experience.
          </p>

          <div className="text-sm bg-slate-100 p-3 rounded-md border border-slate-300">
            <strong>Available cities:</strong> Pune, Mumbai, Bangalore, Delhi, Noida, Goa
            <br />
            <strong>Categories:</strong> Cafes, Parks, Bars, Bookstores, Historic Places{'\u00a0'}{TARGET_CITIES.goa.categories.includes("beach") && ", Beach"}
          </div>

          <p>
            Please check back in about <strong>5 minutes</strong>, or explore our other features in the meantime!
          </p>
        </div>
        <DialogFooter>
          <Button onClick={handleCloseDialog} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  );
};

export default Index;
