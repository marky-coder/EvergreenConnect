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

/**
 * ClosedDeals (static-only, no editing)
 *
 * - Shows pins for each location using the intrinsic size of /us.jpg for exact placement.
 * - No edit controls, no nudges, no local admin flags.
 */

export default function ClosedDeals() {
  const [locations, setLocations] = useState<DealLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);
  const [svgSize, setSvgSize] = useState({ width: 1000, height: 589 });

  // store the natural size of the map image and the uniform scale used to render it
  const [imgNatural, setImgNatural] = useState({ width: 1000, height: 589 });
  const [imgScale, setImgScale] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    loadLocations();
    updateSvgSize();
    measureImage();
    const onResize = () => {
      updateSvgSize();
      measureImage();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the SVG size responsive to the container width
  const updateSvgSize = () => {
    const container = document.querySelector(".container") as HTMLElement | null;
    const width = container ? Math.min(1200, container.clientWidth) : 1000;
    // Keep aspect ratio consistent with the original image (1000x589)
    const height = Math.round((width * 589) / 1000);
    setSvgSize({ width, height });
  };

  // Measure /us.jpg natural size and compute uniform scale used in the SVG
  const measureImage = () => {
    const img = new Image();
    img.src = "/us.jpg";
    img.onload = () => {
      const naturalW = img.naturalWidth || 1000;
      const naturalH = img.naturalHeight || 589;
      setImgNatural({ width: naturalW, height: naturalH });
      const sx = svgSize.width / naturalW;
      const sy = svgSize.height / naturalH;
      const scale = Math.min(sx, sy);
      setImgScale(scale);
    };
    img.onerror = () => {
      // fallback defaults
      setImgNatural({ width: 1000, height: 589 });
      setImgScale(Math.min(svgSize.width / 1000, svgSize.height / 589));
    };
  };

  // Normalize server/bundled location objects into our shape
  const normalizeLocation = (raw: any): DealLocation => {
    const id = raw.id ?? raw.name ?? `${raw.lat ?? raw.latitude}-${raw.lng ?? raw.lon ?? raw.longitude}`;
    const latVal = raw.lat ?? raw.latitude ?? raw.lat_deg ?? raw.latDeg;
    const lngVal = raw.lng ?? raw.lon ?? raw.longitude ?? raw.lng_deg ?? raw.lngDeg;
    const lat = typeof latVal === "string" ? parseFloat(latVal) : latVal;
    const lng = typeof lngVal === "string" ? parseFloat(lngVal) : lngVal;
    const addedAt = raw.addedAt ?? raw.added_at ?? new Date().toISOString();
    return {
      id: String(id),
      lat: Number.isFinite(lat) ? lat : 0,
      lng: Number.isFinite(lng) ? lng : 0,
      name: raw.name,
      city: raw.city,
      state: raw.state,
      addedAt,
    };
  };

  // Load locations from server if present, otherwise fallback to bundled JSON
  const loadLocations = async () => {
    setIsLoading(true);
    setFallbackReason(null);
    try {
      const response = await fetch("/api/deals/locations");
      if (!response.ok) {
        setFallbackReason(`Server responded ${response.status} ${response.statusText}`);
        setLocations(defaultData.locations.map(normalizeLocation));
        setUsedFallback(true);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      let rawLocations: any[] | undefined = undefined;
      if (Array.isArray(data)) rawLocations = data;
      else if (Array.isArray(data?.locations)) rawLocations = data.locations;
      else if (Array.isArray(data?.data?.locations)) rawLocations = data.data.locations;

      if (rawLocations && rawLocations.length > 0) {
        setLocations(rawLocations.map(normalizeLocation));
        setUsedFallback(false);
      } else {
        setFallbackReason("API returned no locations");
        setLocations(defaultData.locations.map(normalizeLocation));
        setUsedFallback(true);
      }
    } catch (err: any) {
      setFallbackReason(String(err?.message ?? err));
      setLocations(defaultData.locations.map(normalizeLocation));
      setUsedFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Map lat/lng to pixel coordinates using natural image size + uniform scale
  // Geographic bounds for continental US (tweak if you need finer calibration)
  const latLngToXY = (lat: number, lng: number) => {
    const minLng = -125;
    const maxLng = -66.9;
    const minLat = 24.5;
    const maxLat = 49.4;

    const imgW = imgNatural.width;
    const imgH = imgNatural.height;

    // image-space pixel location
    const xImg = ((lng - minLng) / (maxLng - minLng)) * imgW;
    const yImg = ((maxLat - lat) / (maxLat - minLat)) * imgH;

    // apply uniform scale used when drawing the image into the svg
    const x = xImg * imgScale;
    const y = yImg * imgScale;

    return {
      x: Math.max(0, Math.min(svgSize.width, x)),
      y: Math.max(0, Math.min(svgSize.height, y)),
    };
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16 md:py-24 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2">Closed Deals Across America</h1>
            <p className="text-lg text-muted-foreground">See where we've successfully helped landowners across the United States</p>
          </div>

          <div className="flex items-center justify-between mb-4 gap-4">
            <div>
              {/* All edit controls removed — static-only */}
            </div>

            <div className="text-sm text-muted-foreground">Map is static — pins are placed from bundled locations.</div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card className="max-w-6xl mx-auto">
              <CardContent className="p-6">
                <div className="relative w-full" style={{ paddingBottom: "60%" }}>
                  <svg viewBox={`0 0 ${svgSize.width} ${svgSize.height}`} className="absolute inset-0 w-full h-full" style={{ background: "#f3f4f6", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}>
                    <image href="/us.jpg" x="0" y="0" width={svgSize.width} height={svgSize.height} preserveAspectRatio="xMinYMin meet" />

                    {locations.map((loc) => {
                      const { x, y } = latLngToXY(loc.lat, loc.lng);
                      return (
                        <g key={loc.id}>
                          <circle cx={x} cy={y} r="12" fill="#16a34a" opacity="0.28" />
                          <circle cx={x} cy={y} r="8" fill="#16a34a" stroke="white" strokeWidth="2" />
                          <title>
                            {loc.name || (loc.city && loc.state ? `${loc.city}, ${loc.state}` : `Deal Location (${loc.lat.toFixed(2)}, ${loc.lng.toFixed(2)})`)}
                          </title>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <span className="text-lg font-semibold">{locations.length} {locations.length === 1 ? "Deal" : "Deals"} Closed</span>
                  </div>

                  {usedFallback && (
                    <div className="mt-4 text-sm text-yellow-700">
                      <div>Note: showing bundled locations because the server API was unavailable (fallback).</div>
                      {fallbackReason && <div className="mt-1 text-xs text-yellow-800">Reason: {fallbackReason}</div>}
                      <div className="mt-2 text-xs text-muted-foreground">This page is static — to edit locations edit <code>client/src/data/deals-locations.json</code> in the repository.</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center mt-12 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Ready to Join Them?</h2>
            <p className="text-lg text-muted-foreground mb-6">Let us help you close a deal on your land property today</p>
            <Button size="lg" onClick={() => navigate("/get-offer")}>Get Your Cash Offer</Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
