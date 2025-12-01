// client/src/pages/ClosedDeals.tsx
import { useState, useEffect, useRef } from "react";
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

type Nudges = Record<string, { dx: number; dy: number }>;

const LOCAL_STORAGE_KEY = "closedDealsNudges_v1";

export default function ClosedDeals() {
  const [locations, setLocations] = useState<DealLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [nudges, setNudges] = useState<Nudges>({});
  const [svgSize, setSvgSize] = useState({ width: 1000, height: 589 });
  const svgContainerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Load nudges from localStorage (if present)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed: Nudges = JSON.parse(raw);
        setNudges(parsed);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadLocations();
    updateSvgSize();
    window.addEventListener("resize", updateSvgSize);
    return () => window.removeEventListener("resize", updateSvgSize);
  }, []);

  const updateSvgSize = () => {
    const container = document.querySelector(".container") as HTMLElement | null;
    const width = container ? Math.min(1200, container.clientWidth) : 1000;
    const height = Math.round((width * 589) / 1000);
    setSvgSize({ width, height });
  };

  const loadLocations = async () => {
    try {
      const response = await fetch("/api/deals/locations");
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.locations) && data.locations.length > 0) {
          setLocations(data.locations);
          setUsedFallback(false);
        } else {
          setLocations(defaultData.locations);
          setUsedFallback(true);
        }
      } else {
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

  // Mercator-style lat -> y transform + linear lng -> x
  const latLngToXY = (lat: number, lng: number) => {
    const { width: svgWidth, height: svgHeight } = svgSize;
    // Geographic bounds for continental US (approx)
    const minLng = -125;
    const maxLng = -66.9;
    const minLat = 24.5;
    const maxLat = 49.4;

    // X linear
    const x = ((lng - minLng) / (maxLng - minLng)) * svgWidth;

    // Mercator Y
    const toRad = (d: number) => (d * Math.PI) / 180;
    const merc = (latDeg: number) =>
      Math.log(
        Math.tan(Math.PI / 4 + toRad(Math.max(Math.min(latDeg, maxLat - 0.0001), minLat + 0.0001)) / 2)
      );

    const mercMax = merc(maxLat);
    const mercMin = merc(minLat);
    const mercLat = merc(lat);

    const normalizedY = (mercMax - mercLat) / (mercMax - mercMin);
    const y = normalizedY * svgHeight;

    return { x: Math.max(0, Math.min(svgWidth, x)), y: Math.max(0, Math.min(svgHeight, y)) };
  };

  /*********** Drag/edit logic ***********/
  const dragState = useRef<{
    draggingId: string | null;
    originMouseX: number;
    originMouseY: number;
  }>({ draggingId: null, originMouseX: 0, originMouseY: 0 });

  const onPointerDown = (e: React.PointerEvent, id: string) => {
    if (!isEditMode) return;
    const target = e.currentTarget as HTMLElement;
    (target as any).setPointerCapture(e.pointerId);
    dragState.current = {
      draggingId: id,
      originMouseX: e.clientX,
      originMouseY: e.clientY,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isEditMode) return;
    if (!dragState.current.draggingId) return;
    const ds = dragState.current;
    const dx = e.clientX - ds.originMouseX;
    const dy = e.clientY - ds.originMouseY;

    setNudges((prev) => {
      const prevN = { ...prev };
      const curr = prevN[ds.draggingId!] || { dx: 0, dy: 0 };
      prevN[ds.draggingId!] = { dx: curr.dx + dx, dy: curr.dy + dy };
      // reset origin so next movement is incremental
      dragState.current.originMouseX = e.clientX;
      dragState.current.originMouseY = e.clientY;
      // persist to localStorage for convenience
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prevN));
      } catch (err) {}
      return prevN;
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isEditMode) return;
    if (!dragState.current.draggingId) return;
    const target = e.currentTarget as HTMLElement;
    try {
      (target as any).releasePointerCapture(e.pointerId);
    } catch {}
    dragState.current.draggingId = null;
  };

  const toggleEditMode = () => {
    setIsEditMode((v) => !v);
  };

  const exportNudges = async () => {
    const text = JSON.stringify(nudges, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      console.log("Nudges copied to clipboard:", text);
      alert("Nudges copied to clipboard. Paste them into your code or a file.");
    } catch (e) {
      console.log("Nudges:", text);
      alert("Could not copy to clipboard — check console for JSON.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16 md:py-24 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2">
              Closed Deals Across America
            </h1>
            <p className="text-lg text-muted-foreground">
              See where we've successfully helped landowners across the United States
            </p>
          </div>

          <div className="flex items-center justify-between mb-4 gap-4">
            <div>
              <Button size="sm" onClick={toggleEditMode}>
                {isEditMode ? "Exit Edit Pins" : "Edit Pins"}
              </Button>
              <Button size="sm" variant="outline" className="ml-3" onClick={exportNudges}>
                Export Nudges
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              {isEditMode ? "Drag pins to adjust positions. Click Export Nudges to copy adjustments." : "Toggle Edit Pins to adjust locations."}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card className="max-w-6xl mx-auto">
              <CardContent className="p-6">
                <div ref={svgContainerRef} className="relative w-full" style={{ paddingBottom: "60%" }}>
                  <svg
                    viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
                    className="absolute inset-0 w-full h-full"
                    style={{ background: "#f3f4f6", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerLeave={onPointerUp}
                  >
                    {/* background image */}
                    <image href="/us.jpg" x="0" y="0" width={svgSize.width} height={svgSize.height} />

                    {/* pins */}
                    {locations.map((loc) => {
                      const base = latLngToXY(loc.lat, loc.lng);
                      const n = nudges[loc.id] || { dx: 0, dy: 0 };
                      const x = base.x + n.dx;
                      const y = base.y + n.dy;

                      return (
                        <g key={loc.id}>
                          <circle cx={x} cy={y} r="12" fill="#16a34a" opacity="0.28">
                            <animate attributeName="r" from="12" to="24" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" from="0.28" to="0" dur="2s" repeatCount="indefinite" />
                          </circle>

                          <circle
                            cx={x}
                            cy={y}
                            r="8"
                            fill="#16a34a"
                            stroke="white"
                            strokeWidth="2"
                            style={{ cursor: isEditMode ? "grab" : "default", touchAction: "none" }}
                            onPointerDown={(e) => onPointerDown(e, loc.id)}
                          />

                          <title>
                            {loc.name ||
                              (loc.city && loc.state
                                ? `${loc.city}, ${loc.state}`
                                : `Deal Location (${loc.lat.toFixed(2)}, ${loc.lng.toFixed(2)})`)}
                          </title>

                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div className="mt-6 text-center">
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

          <div className="text-center mt-12 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Join Them?
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Let us help you close a deal on your land property today
            </p>

            <Button size="lg" onClick={() => navigate("/get-offer")}>
              Get Your Cash Offer
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
