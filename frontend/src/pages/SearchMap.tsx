import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { ArrowLeft, Grid, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchLocations } from "@/api/app.api";
import "leaflet/dist/leaflet.css";

const customIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function SearchMap() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<any[]>([]);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [vibeFilters, setVibeFilters] = useState<string[]>([]);

  const query = searchParams.get("q") || "";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const lower = query.toLowerCase();
        const cityMatch = lower.match(/in (\w+)/);
        const city = cityMatch ? cityMatch[1] : "pune";
        const category = lower.split(" in ")[0] || "cafe";

        const data = await fetchLocations(city, category);

        const transformed = data.map((item: any) => ({
          id: item._id,
          name: item.name,
          location: item.address || item.city,
          coordinates: item.coordinates,
          rating: item.rating || (Math.random() * 1.5 + 3.5).toFixed(1),
          vibes: item.ai_analysis?.emojis?.split(" ") || [],
          tags: item.ai_analysis?.vibe_tags || [],
          summary: item.ai_analysis?.vibe_summary || "No description available.",
        }));

        setResults(transformed);

        // Extract all unique vibes
        const allVibes = [...new Set(transformed.flatMap((item) => item.tags || []))];
        setVibeFilters(allVibes);
      } catch (err) {
        console.error("Error fetching locations:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query]);

  const toggleVibe = (vibe: string) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  const filteredResults = selectedVibes.length
    ? results.filter((r) => r.vibes?.some((v) => selectedVibes.includes(v)))
    : results;

  const center = filteredResults[0]?.coordinates
    ? [filteredResults[0].coordinates.lat, filteredResults[0].coordinates.lon]
    : [18.5204, 73.8567]; // default to Pune

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
            <Link to={`/search?q=${query}`}>
              <Button variant="outline" size="sm" className="rounded-full">
                <Grid className="w-4 h-4 mr-1" />
                Grid
              </Button>
            </Link>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mt-4">
            Map Results for: <span className="text-cyan-600">"{query}"</span>
          </h1>

          {vibeFilters.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto mt-3 pb-1">
              <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
              {vibeFilters.map((vibe) => (
                <Badge
                  key={vibe}
                  onClick={() => toggleVibe(vibe)}
                  variant={selectedVibes.includes(vibe) ? "default" : "outline"}
                  className={`cursor-pointer whitespace-nowrap transition ${
                    selectedVibes.includes(vibe)
                      ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                      : "hover:bg-cyan-50"
                  }`}
                >
                  {vibe}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map View */}
      <div className="relative h-[calc(100vh-120px)] max-w-6xl mx-auto">
        {loading ? (
          <p className="text-center text-slate-500 pt-10">Loading map...</p>
        ) : (
          <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full z-0">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {filteredResults.map((place) => (
              <Marker
                key={place.id}
                position={[place.coordinates.lat, place.coordinates.lon]}
                icon={customIcon}
                eventHandlers={{
                  click: () => setSelectedPlace(place),
                }}
              />
            ))}
          </MapContainer>
        )}

        {/* Floating Info Card */}
        {selectedPlace && (
          <div className="absolute bottom-0 left-0 right-0 md:bottom-4 md:left-auto md:right-4 md:w-[340px] z-50">
            <div className="bg-white shadow-xl rounded-t-2xl md:rounded-xl p-5 border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-slate-800">{selectedPlace.name}</h3>
                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm font-medium">
                  ⭐ {selectedPlace.rating}
                </span>
              </div>
              <p className="text-slate-500 text-sm mb-2">{selectedPlace.location}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {selectedPlace.vibes.map((vibe: string) => (
                  <Badge key={vibe} variant="secondary" className="text-xs">
                    {vibe}
                  </Badge>
                ))}
              </div>
              <p className="text-slate-600 text-sm mb-2">
                <strong>Summary:</strong> {selectedPlace.summary}
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedPlace.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    
  );
}
