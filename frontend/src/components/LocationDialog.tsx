import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, User, Quote } from "lucide-react";

interface LocationData {
  id: string;
  name: string;
  location: string;
  address?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
  rating: string;
  vibes: string[];
  tags: string[];
  summary: string;
  raw_reviews?: Array<{
    text: string;
    source: string;
    author: string;
  }>;
}

interface LocationDialogProps {
  location: LocationData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationDialog({ location, isOpen, onClose }: LocationDialogProps) {
  if (!location) return null;

  // Get unique reviews (remove duplicates based on text and author)
  const uniqueReviews = location.raw_reviews?.filter((review, index, self) => 
    index === self.findIndex(r => r.text === review.text && r.author === review.author)
  ).slice(0, 6) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {location.name}
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              <Star className="w-3 h-3 mr-1" />
              {location.rating}
            </Badge>
          </DialogTitle>
          
          {location.address && (
            <div className="flex items-center gap-2 text-slate-600 mt-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{location.address}</span>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Vibe Summary */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                ✨ AI Vibe Analysis
              </h3>
              <p className="text-slate-600 leading-relaxed">{location.summary}</p>
            </CardContent>
          </Card>

          {/* Vibes & Tags */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-slate-800 mb-3">🎭 Vibes</h3>
                <div className="flex flex-wrap gap-2">
                  {location.vibes.map((vibe, index) => (
                    <Badge key={index} variant="secondary" className="text-lg">
                      {vibe}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-slate-800 mb-3">🏷️ Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {location.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reviews */}
          {uniqueReviews.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Quote className="w-4 h-4" />
                  What People Are Saying
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {uniqueReviews.map((review, index) => (
                    <div key={index} className="border-l-2 border-cyan-200 pl-4 py-2">
                      <p className="text-slate-600 text-sm leading-relaxed mb-2">
                        {review.text.length > 200 
                          ? `${review.text.substring(0, 200)}...` 
                          : review.text
                        }
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <User className="w-3 h-3" />
                        <span className="font-medium">{review.author}</span>
                        <span>•</span>
                        <span>{review.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Coordinates (if available) */}
          {location.coordinates && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-slate-800 mb-2">📍 Location</h3>
                <p className="text-slate-600 text-sm">
                  Coordinates: {location.coordinates.lat.toFixed(6)}, {location.coordinates.lon.toFixed(6)}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
