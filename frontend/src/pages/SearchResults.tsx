import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Grid, Map, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchLocations } from "@/api/app.api"; // ✅ Use your API call


export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [vibeFilters, setVibeFilters] = useState<string[]>([]); 
  const query = searchParams.get('q') || '';

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);

    try {
      const lower = query.toLowerCase();
      const cityMatch = lower.match(/in ([a-z\s]+)/);
      const city = cityMatch ? cityMatch[1].trim() : "pune";
      const category = (lower.split(" in ")[0] || "cafe").trim();

      const data = await fetchLocations(city, category);

      const transformed = data.map((item: any) => ({
        id: item._id,
        name: item.name,
        location: item.address || item.city,
        rating: item.rating || (Math.random() * 1.5 + 3.5).toFixed(1),
        vibes: item.ai_analysis?.emojis?.split(' ') || [],
        tags: item.ai_analysis?.vibe_tags || [],
        summary: item.ai_analysis?.vibe_summary || "No description available.",
      }));

      setResults(transformed);

      // Get unique vibe tags across all results
      const allTags = transformed.flatMap(item => item.tags);
      const uniqueTags = Array.from(new Set(allTags));
      setVibeFilters(uniqueTags);

    } catch (err) {
      console.error("Failed to fetch:", err);
      setResults([]);
      setVibeFilters([]);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [query]);


  const toggleVibe = (vibe: string) => {
    setSelectedVibes(prev =>
      prev.includes(vibe)
        ? prev.filter(v => v !== vibe)
        : [...prev, vibe]
    );
  };

 const filteredResults = selectedVibes.length > 0
    ? results.filter(result =>
        result.tags.some(tag => selectedVibes.includes(tag))
      )
    : results;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
                size="sm"
                className="rounded-full"
              >
                <Grid className="w-4 h-4 mr-1" />
                Grid
              </Button>
              <Link to={`/search-map?q=${query}`}>
              <Button variant="outline" size="sm" className="rounded-full">
                <Map className="w-4 h-4 mr-1" />
                Map
              </Button>
            </Link>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            Results for: <span className="text-cyan-600">"{query}"</span>
          </h1>

          {/* Vibe Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
            {vibeFilters.map((vibe) => (
              <Badge
                key={vibe}
                variant={selectedVibes.includes(vibe) ? "default" : "outline"}
                className={`cursor-pointer whitespace-nowrap transition-all duration-200 ${
                  selectedVibes.includes(vibe)
                    ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                    : 'hover:bg-cyan-50 hover:border-cyan-300'
                }`}
                onClick={() => toggleVibe(vibe)}
              >
                {vibe}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-center text-slate-500">Loading...</p>
        ) : viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((result, index) => (
              <div
                key={result.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-slate-800 text-lg leading-tight">
                    {result.name}
                  </h3>
                  <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm font-medium">
                    {result.rating}
                  </span>
                </div>

                <p className="text-slate-500 text-sm mb-2">{result.location}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {result.vibes.map((vibe: string) => (
                    <Badge key={vibe} variant="secondary" className="text-xs">
                      {vibe}
                    </Badge>
                  ))}
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  <h1>Summary:</h1>{result.summary}
                </p>

                <div className="flex flex-wrap gap-1">
                  {result.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Map className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Map View Coming Soon</h3>
            <p className="text-slate-500">
              Interactive map with location markers will be available in the next update.
            </p>
          </div>
        )}

        {!loading && filteredResults.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">No results match your selected vibes.</p>
            <Button
              onClick={() => setSelectedVibes([])}
              variant="outline"
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
