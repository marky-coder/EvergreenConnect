// client/src/pages/ClosedDeals.tsx
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import defaultData from "@/data/deals-locations.json";

interface DealLocation {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  city?: string;
  state?: string;
  addedAt: string;
}

export default function ClosedDeals() {
  const [locations, setLocations] = useState<DealLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const response = await fetch("/api/deals/locations");
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.locations) && data.locations.length > 0) {
          setLocations(data.locations);
          setUsedFallback(false);
        } else {
          // API returned empty or unexpected result — use local data
          console.warn("API returned no locations. Falling back to local data.");
          setLocations(defaultData.locations);
          setUsedFallback(true);
        }
      } else {
        // Non-OK response (404, 500, etc.) — fallback
        console.warn("API responded with status", response.status, " — using local data.");
        setLocations(defaultData.locations);
        setUsedFallback(true);
      }
    } catch (err) {
      // Network or other error — fallback
      console.error("Error fetching locations API — using local data.", err);
      setLocations(defaultData.locations);
      setUsedFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mercator-style projection mapping lat/lng → SVG x,y
   * The SVG is 1000x589 and the geographic bounds chosen correspond
   * to continental US approximations. This yields much better vertical placement
   * than a linear latitude mapping.
   */
  const latLngToXY = (lat: number, lng: number) => {
    const svgWidth = 1000;
    const svgHeight = 589;

    // Geographic bounds (continental US approximation)
    const minLng = -125;
    const maxLng = -66.9;
    const minLat = 24.5;
    const maxLat = 49.4;

    // X: linear mapping of longitude to svg x
    const x = ((lng - minLng) / (maxLng - minLng)) * svgWidth;

    // Y: use Mercator transform for latitude to approximate map vertical scaling
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const mercator = (latDeg: number) => Math.log(Math.tan(Math.PI / 4 + toRad(latDeg) / 2));

    const mercMax = mercator(maxLat);
    const mercMin = mercator(minLat);
    const mercLat = mercator(Math.max(minLat + 0.0001, Math.min(maxLat - 0.0001, lat))); // clamp to avoid infinities

    // normalized position (0..1) from top to bottom
    const normalizedY = (mercMax - mercLat) / (mercMax - mercMin);
    const y = normalizedY * svgHeight;

    // clamp to svg bounds just in case
    const clampedX = Math.max(0, Math.min(svgWidth, x));
    const clampedY = Math.max(0, Math.min(svgHeight, y));

    return { x: clampedX, y: clampedY };
  };

  /**
   * Nudges are optional pixel offsets to correct any remaining pins after
   * projection. Add entries keyed by `location.id` and supply `dx` (right positive)
   * and/or `dy` (down positive). Example:
   * { "beaufort-nc": { dx: 8, dy: -6 } }
   */
  const nudges: Record<string, { dx?: number; dy?: number }> = {
    // After testing you can add small adjustments here if a pin is slightly off.
    // Example placeholders (commented out):
    // "beaufort-nc": { dx: 6, dy: -4 },
    // "columbus-nc": { dx: -8, dy: 2 },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16 md:py-24 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Closed Deals Across America
            </h1>
            <p className="text-lg text-muted-foreground">
              See where we've successfully helped landowners across the United States
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card className="max-w-6xl mx-auto">
              <CardContent className="p-8">
                <div
                  className="relative w-full"
                  style={{ paddingBottom: "60%" }}
                >
                  {/* US Map SVG */}
                  <svg
                    viewBox="0 0 1000 589"
                    className="absolute inset-0 w-full h-full"
                    style={{
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                    }}
                  >
                    {/* Background */}
                    <rect x="0" y="0" width="1000" height="589" fill="#f3f4f6" />

                    {/* Use the US map as background image */}
                    <image
                      href="/us.jpg"
                      x="0"
                      y="0"
                      width="1000"
                      height="589"
                      opacity="1"
                    />

                    {/* Pins for each location */}
                    {locations.map((location) => {
                      const raw = latLngToXY(location.lat, location.lng);
                      const n = nudges[location.id] || { dx: 0, dy: 0 };
                      const x = raw.x + (n.dx || 0);
                      const y = raw.y + (n.dy || 0);

                      return (
                        <g key={location.id}>
                          {/* Pin circle with pulsing animation */}
                          <circle cx={x} cy={y} r="12" fill="#16a34a" opacity="0.3">
                            <animate attributeName="r" from="12" to="24" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
                          </circle>

                          {/* Main pin dot */}
                          <circle cx={x} cy={y} r="8" fill="#16a34a" stroke="white" strokeWidth="2" />

                          {/* Tooltip on hover */}
                          <title>
                            {location.name ||
                              (location.city && location.state
                                ? `${location.city}, ${location.state}`
                                : `Deal Location (${location.lat.toFixed(2)}, ${location.lng.toFixed(2)})`)}
                          </title>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div className="mt-8 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <span className="text-lg font-semibold">
                      {locations.length} {locations.length === 1 ? "Deal" : "Deals"} Closed
                    </span>
                  </div>

                  {usedFallback && (
                    <div className="mt-4 text-sm text-yellow-700">
                      Note: showing bundled locations because the server API was unavailable (fallback).
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA Section */}
          <div className="text-center mt-16 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Join Them?
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Let us help you close a deal on your land property today
            </p>

            <Button
              size="lg"
              onClick={() => navigate("/get-offer")}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
            >
              Get Your Cash Offer
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
