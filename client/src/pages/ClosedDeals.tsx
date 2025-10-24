import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";

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

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const response = await fetch("/api/deals/locations");
      const data = await response.json();
      if (data.success) {
        setLocations(data.locations);
      }
    } catch (error) {
      console.error("Error loading locations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert lat/lng to SVG coordinates for the US map
  // US bounds: lat 24.5-49.4, lng -125 to -66.9
  const latLngToXY = (lat: number, lng: number) => {
    // Map bounds in the SVG (approximate continental US area)
    const svgWidth = 1000;
    const svgHeight = 589;

    // Geographic bounds (continental US)
    const minLng = -125;
    const maxLng = -66.9;
    const minLat = 24.5;
    const maxLat = 49.4;

    // Convert to SVG coordinates
    const x = ((lng - minLng) / (maxLng - minLng)) * svgWidth;
    const y = ((maxLat - lat) / (maxLat - minLat)) * svgHeight;

    return { x, y };
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
              See where we've successfully helped landowners across the United
              States
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
                    <rect
                      x="0"
                      y="0"
                      width="1000"
                      height="589"
                      fill="#f3f4f6"
                    />

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
                      const { x, y } = latLngToXY(location.lat, location.lng);
                      return (
                        <g key={location.id}>
                          {/* Pin circle with pulsing animation */}
                          <circle
                            cx={x}
                            cy={y}
                            r="12"
                            fill="#16a34a"
                            opacity="0.3"
                          >
                            <animate
                              attributeName="r"
                              from="12"
                              to="24"
                              dur="2s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="opacity"
                              from="0.3"
                              to="0"
                              dur="2s"
                              repeatCount="indefinite"
                            />
                          </circle>
                          {/* Main pin dot */}
                          <circle
                            cx={x}
                            cy={y}
                            r="8"
                            fill="#16a34a"
                            stroke="white"
                            strokeWidth="2"
                          />
                          {/* Tooltip on hover */}
                          <title>
                            {location.name ||
                              (location.city && location.state
                                ? `${location.city}, ${location.state}`
                                : `Deal Location (${location.lat.toFixed(
                                    2
                                  )}, ${location.lng.toFixed(2)})`)}
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
                      {locations.length}{" "}
                      {locations.length === 1 ? "Deal" : "Deals"} Closed
                    </span>
                  </div>
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
            <a
              href="/#contact"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
            >
              Get Your Cash Offer
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
