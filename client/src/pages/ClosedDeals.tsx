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
 * Final static ClosedDeals page with small global shift applied so
 * the Colorado pin ("rio-grande-co") lands over the UT label as requested,
 * and that same pixel delta is applied to all pins to preserve relative layout.
 *
 * To tweak: change GLOBAL_SHIFT.dx / GLOBAL_SHIFT.dy (pixels).
 */

/* Calibrated bounds (from your calibration step) */
const CALIBRATED_BOUNDS = {
  minLng: -124.388835,
  maxLng: -76.927213,
  minLat: 18.040058,
  maxLat: 61.642249,
};

/* Global pixel shift applied to all pins (tweak these numbers for fine tuning).
   Positive dx moves pins to the right; positive dy moves pins down.
   I chose these values so the CO pin (rio-grande-co) moves onto the UT label.
*/
const GLOBAL_SHIFT = { dx: 30, dy: -4 };

export default function ClosedDeals() {
  const [locations, setLocations] = useState<DealLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [svgSize, setSvgSize] = useState({ width: 1000, height: 589 });

  // image intrinsic size + uniform scale
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

  const updateSvgSize = () => {
    const container = document.querySelector(".container") as HTMLElement | null;
    const width = container ? Math.min(1200, container.clientWidth) : 1000;
    const height = Math.round((width * 589) / 1000);
    setSvgSize({ width, height });
  };

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
      setImgNatural({ width: 1000, height: 589 });
      setImgScale(Math.min(svgSize.width / 1000, svgSize.height / 589));
    };
  };

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

  const loadLocations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/deals/locations");
      if (!response.ok) {
        setLocations(defaultData.locations.map(normalizeLocation));
        setIsLoading(false);
        return;
      }
      const data = await response.json();
      let rawLocations: any[] | undefined;
      if (Array.isArray(data)) rawLocations = data;
      else if (Array.isArray(data?.locations)) rawLocations = data.locations;
      else if (Array.isArray(data?.data?.locations)) rawLocations = data.data.locations;

      if (rawLocations && rawLocations.length > 0) {
        setLocations(rawLocations.map(normalizeLocation));
      } else {
        setLocations(defaultData.locations.map(normalizeLocation));
      }
    } catch {
      setLocations(defaultData.locations.map(normalizeLocation));
    } finally {
      setIsLoading(false);
    }
  };

  // Use calibrated bounds
  const { minLng, maxLng, minLat, maxLat } = CALIBRATED_BOUNDS;

  // Map lat/lng -> intrinsic image pixels -> scaled display pixels, then apply global shift
  const latLngToXY = (lat: number, lng: number) => {
    const imgW = imgNatural.width;
    const imgH = imgNatural.height;

    const xImg = ((lng - minLng) / (maxLng - minLng)) * imgW;
    const yImg = ((maxLat - lat) / (maxLat - minLat)) * imgH;

    let x = xImg * imgScale;
    let y = yImg * imgScale;

    // Apply the small global pixel shift (moves CO to cover the UT text area)
    x += GLOBAL_SHIFT.dx;
    y += GLOBAL_SHIFT.dy;

    // Clamp into svg
    x = Math.max(0, Math.min(svgSize.width, x));
    y = Math.max(0, Math.min(svgSize.height, y));

    return { x, y };
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
            <div>{/* static site — no edit controls */}</div>
            <div className="text-sm text-muted-foreground">Map is static — pins are placed from bundled locations and calibrated bounds.</div>
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
                          <title>{loc.name || (loc.city && loc.state ? `${loc.city}, ${loc.state}` : `Deal Location (${loc.lat.toFixed(2)}, ${loc.lng.toFixed(2)})`)}</title>
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

                  <div className="mt-4 text-sm text-muted-foreground">
                    This page is static — to edit locations update <code>client/src/data/deals-locations.json</code> in the repository.
                  </div>
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
