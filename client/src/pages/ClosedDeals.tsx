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

/* Calibrated bounds previously computed */
const CALIBRATED_BOUNDS = {
  minLng: -124.388835,
  maxLng: -76.927213,
  minLat: 18.040058,
  maxLat: 61.642249,
};

/* Default global shift that you had previously (we keep it as initial value) */
const DEFAULT_GLOBAL_SHIFT = { dx: 30, dy: -4 };

/* Storage key to persist the global shift (optional) */
const SHIFT_KEY = "closedDeals_global_shift_v1";

/**
 * ClosedDeals: static map with live nudge controls
 * - Use the nudge controls to shift all pins by the same pixel offset
 * - Save the final shift to localStorage or Export it as JSON to ask me to bake it into the file permanently
 */

export default function ClosedDeals() {
  const [locations, setLocations] = useState<DealLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [svgSize, setSvgSize] = useState({ width: 1000, height: 589 });

  // image intrinsic size + scale
  const [imgNatural, setImgNatural] = useState({ width: 1000, height: 589 });
  const [imgScale, setImgScale] = useState(1);

  // live global shift (pixels). Load from localStorage if present.
  const [shift, setShift] = useState<{ dx: number; dy: number }>(() => {
    try {
      const raw = localStorage.getItem(SHIFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.dx === "number" && typeof parsed.dy === "number") return parsed;
      }
    } catch {}
    return DEFAULT_GLOBAL_SHIFT;
  });

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

      if (rawLocations && rawLocations.length > 0) setLocations(rawLocations.map(normalizeLocation));
      else setLocations(defaultData.locations.map(normalizeLocation));
    } catch {
      setLocations(defaultData.locations.map(normalizeLocation));
    } finally {
      setIsLoading(false);
    }
  };

  const { minLng, maxLng, minLat, maxLat } = CALIBRATED_BOUNDS;

  // Map lat/lng -> scaled pixel coords, then apply global shift
  const latLngToXY = (lat: number, lng: number) => {
    const imgW = imgNatural.width;
    const imgH = imgNatural.height;

    const xImg = ((lng - minLng) / (maxLng - minLng)) * imgW;
    const yImg = ((maxLat - lat) / (maxLat - minLat)) * imgH;

    let x = xImg * imgScale + shift.dx;
    let y = yImg * imgScale + shift.dy;

    x = Math.max(0, Math.min(svgSize.width, x));
    y = Math.max(0, Math.min(svgSize.height, y));

    return { x, y };
  };

  // Nudge helpers
  const applyNudge = (dx: number, dy: number) => {
    setShift((s) => ({ dx: s.dx + dx, dy: s.dy + dy }));
  };

  const saveShift = () => {
    try {
      localStorage.setItem(SHIFT_KEY, JSON.stringify(shift));
      alert(`Shift saved: dx=${shift.dx}, dy=${shift.dy}`);
    } catch {
      alert("Failed to save shift to localStorage.");
    }
  };

  const resetShift = () => {
    setShift(DEFAULT_GLOBAL_SHIFT);
    try {
      localStorage.removeItem(SHIFT_KEY);
    } catch {}
    alert("Shift reset to default.");
  };

  const exportShift = async () => {
    const payload = JSON.stringify(shift, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      alert("Shift JSON copied to clipboard.");
    } catch {
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "closed-deals-shift.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
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

          <div className="flex items-start justify-between mb-4 gap-4">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <strong className="text-sm">Pin Nudge (global)</strong>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>dx: {shift.dx}px</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>dy: {shift.dy}px</div>
              </div>

              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                {/* X nudges */}
                <Button size="sm" onClick={() => applyNudge(-5, 0)}>← -5</Button>
                <Button size="sm" onClick={() => applyNudge(-1, 0)}>← -1</Button>
                <Button size="sm" onClick={() => applyNudge(1, 0)}>+1 →</Button>
                <Button size="sm" onClick={() => applyNudge(5, 0)}>+5 →</Button>

                {/* Y nudges */}
                <Button size="sm" onClick={() => applyNudge(0, -5)}>↑ -5</Button>
                <Button size="sm" onClick={() => applyNudge(0, -1)}>↑ -1</Button>
                <Button size="sm" onClick={() => applyNudge(0, 1)}>↓ +1</Button>
                <Button size="sm" onClick={() => applyNudge(0, 5)}>↓ +5</Button>

                <Button size="sm" variant="outline" onClick={saveShift}>Save shift</Button>
                <Button size="sm" variant="outline" onClick={exportShift}>Export shift</Button>
                <Button size="sm" variant="destructive" onClick={resetShift}>Reset</Button>
              </div>

              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                Tip: use small increments (±1) to center a single pin exactly, then save. If you want me to bake the final dx/dy into the code, export and paste the JSON here.
              </div>
            </div>

            <div className="text-sm text-muted-foreground">Use the nudge buttons to position pins. Save shift to persist in this browser.</div>
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
