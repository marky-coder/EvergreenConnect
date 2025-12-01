// client/src/pages/ClosedDeals.tsx
import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import defaultData from "@/data/deals-locations.json";
import { geoAlbersUsa, geoPath, GeoPermissibleObjects } from "d3-geo";

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
  const [statesGeo, setStatesGeo] = useState<any | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadLocations();
    // load geojson for US states from a public source
    loadUsStatesGeo();
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
          console.warn("API returned no locations. Falling back to local data.");
          setLocations(defaultData.locations);
          setUsedFallback(true);
        }
      } else {
        console.warn("API responded with status", response.status, " — using local data.");
        setLocations(defaultData.locations);
        setUsedFallback(true);
      }
    } catch (err) {
      console.error("Error fetching locations API — using local data.", err);
      setLocations(defaultData.locations);
      setUsedFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsStatesGeo = async () => {
    try {
      // Public GeoJSON of US states. This is a common public dataset.
      // If you prefer to host in your repo, replace this URL with an internal file import.
      const GEO_URL =
        "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json";

      const resp = await fetch(GEO_URL);
      const geo = await resp.json();
      setStatesGeo(geo);
    } catch (err) {
      console.error("Failed to load US states GeoJSON:", err);
      setStatesGeo(null);
    }
  };

  /**
   * Render helpers: we use d3-geo's geoAlbersUsa projection to convert
   * [lng, lat] -> [x, y], then draw an SVG path for the states.
   *
   * This projection is made for the U.S. and aligns well with typical US maps.
   */
  const renderMapAndPins = (width: number, height: number) => {
    if (!statesGeo) return null;

    // Create a projection sized to the current container
    const projection = geoAlbersUsa()
      // scale and translate are tuned below via fitting
      .translate([width / 3, height / 2])
      .scale(1000);

    const pathGenerator = geoPath().projection(projection);

    // Fit projection nicely to our svg viewport by computing the bounds
    try {
      // compute bounds of all features
      const b = pathGenerator.bounds(statesGeo);
      const dx = b[1][0] - b[0][0];
      const dy = b[1][1] - b[0][1];
      const scale = Math.min(
        (width * 0.9) / dx,
        (height * 0.9) / dy
      );
      const translateX = width / 2 - scale * (b[0][0] + dx / 2);
      const translateY = height / 2 - scale * (b[0][1] + dy / 2);

      projection.scale((projection as any).scale() * scale * 0.8);
      projection.translate([width / 2, height / 2]);
      // Note: we mainly rely on geoAlbersUsa default translate/scale after scale tuning
    } catch (e) {
      // if bounds fails, ignore and continue with defaults
      console.warn("Projection fitting failed, using defaults.", e);
    }

    // Optional nudges (pixel adjustments) keyed by location.id if any pin still needs small correction
    const nudges: Record<string, { dx?: number; dy?: number }> = {
      // e.g. "beaufort-nc": { dx: 6, dy: -4 },
    };

    return (
      <>
        {/* draw each state */}
        {statesGeo.features.map((f: any, idx: number) => {
          const d = pathGenerator(f as any) as string;
          return (
            <path
              key={`s-${idx}`}
              d={d}
              fill="#4b4b4b"
              stroke="#ffffff"
              strokeWidth={1}
              opacity={1}
            />
          );
        })}

        {/* draw pins */}
        {locations.map((location) => {
          const coords: any = (projection as any)([location.lng, location.lat]);
          if (!coords) return null;
          const n = nudges[location.id] || { dx: 0, dy: 0 };
          const x = coords[0] + (n.dx || 0);
          const y = coords[1] + (n.dy || 0);

          return (
            <g key={location.id}>
              <circle cx={x} cy={y} r="12" fill="#16a34a" opacity="0.28">
                <animate attributeName="r" from="12" to="24" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.28" to="0" dur="2s" repeatCount="indefinite" />
              </circle>

              <circle cx={x} cy={y} r="8" fill="#16a34a" stroke="white" strokeWidth="2" />
              <title>
                {location.name ||
                  (location.city && location.state
                    ? `${location.city}, ${location.state}`
                    : `Deal Location (${location.lat.toFixed(2)}, ${location.lng.toFixed(2)})`)}
              </title>
            </g>
          );
        })}
      </>
    );
  };

  // Responsive SVG width/height
  const [svgSize, setSvgSize] = useState({ width: 1000, height: 589 });
  useEffect(() => {
    const update = () => {
      // container width minus paddings
      const container = document.querySelector(".container") as HTMLElement | null;
      const width = container ? Math.min(1200, container.clientWidth) : 1000;
      const height = Math.round((width * 589) / 1000);
      setSvgSize({ width, height });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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
                <div className="relative w-full" style={{ paddingBottom: "60%" }}>
                  <svg
                    ref={svgRef}
                    viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="absolute inset-0 w-full h-full"
                    style={{ background: "#f3f4f6", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
                  >
                    {/* If statesGeo is not ready, we still draw nothing and show count */}
                    {statesGeo && renderMapAndPins(svgSize.width, svgSize.height)}
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
