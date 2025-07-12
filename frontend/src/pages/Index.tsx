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
          <div className="text-slate-600">
            Sorry for the inconvenience! Our AI heroes are currently fetching the latest locations just for you.
            <br />
            <br />
            Please check back in about <strong>5 minutes</strong>, or explore our other features in the meantime!
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
