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
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [nudges, setNudges] = useState<Nudges>({});
  const [svgSize, setSvgSize] = useState({ width: 1000, height: 589 });
  const [isAdmin, setIsAdmin] = useState(false);
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
      // ignoring parse errors
    }
  }, []);

  // On mount, load locations and admin status
  useEffect(() => {
    loadLocations();
    checkAuthStatus();
    updateSvgSize();
    window.addEventListener("resize", updateSvgSize);
    return () => window.removeEventListener("resize", updateSvgSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSvgSize = () => {
    const container = document.querySelector(".container") as HTMLElement | null;
    const width = container ? Math.min(1200, container.clientWidth) : 1000;
    const height = Math.round((width * 589) / 1000); // keep same aspect ratio as original
    setSvgSize({ width, height });
  };

  // Check admin session status (so we can hide edit controls from public)
  const checkAuthStatus = async () => {
    try {
      const resp = await fetch("/api/admin/status", { credentials: "include" });
      if (!resp.ok) {
        setIsAdmin(false);
        return;
      }
      const data = await resp.json();
      setIsAdmin(Boolean(data?.isAdmin));
    } catch (err) {
      console.error("[ClosedDeals] admin status check failed:", err);
      setIsAdmin(false);
    }
  };

  // Helper: normalize location objects from many possible server shapes
  const normalizeLocation = (raw: any): DealLocation => {
    const id = raw.id ?? raw.name ?? `${raw.lat ?? raw.latitude}-${raw.lng ?? raw.lon ?? raw.longitude}`;
    // accept many lat/lng naming variants
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
    setFallbackReason(null);
    try {
      console.log("[ClosedDeals] requesting locations from /api/deals/locations");
      const response = await fetch("/api/deals/locations");
      if (!response.ok) {
        // Server returned a non-200 status (404, 500, etc.)
        const statusText = `${response.status} ${response.statusText}`;
        console.warn(`[ClosedDeals] server responded ${statusText}`);
        setFallbackReason(`Server responded ${statusText}`);
        setLocations(defaultData.locations.map(normalizeLocation));
        setUsedFallback(true);
        return;
      }

      // Attempt to parse JSON and accept a couple of shapes
      const data = await response.json();
      console.log("[ClosedDeals] raw API response:", data);

      // Common shapes:
      // 1) { locations: [ ... ] }
      // 2) [ ... ] (top-level array)
      let rawLocations: any[] | undefined = undefined;
      if (Array.isArray(data)) rawLocations = data;
      else if (Array.isArray(data?.locations)) rawLocations = data.locations;
      else if (Array.isArray(data?.data?.locations)) rawLocations = data.data.locations;

      if (rawLocations && rawLocations.length > 0) {
        const normalized = rawLocations.map(normalizeLocation);
        setLocations(normalized);
        setUsedFallback(false);
        console.log("[ClosedDeals] using locations from API", normalized.slice(0, 5));
      } else {
        // No usable data from API - fallback
        console.warn("[ClosedDeals] API returned no locations, using bundled fallback.");
        setFallbackReason("API returned no locations");
        setLocations(defaultData.locations.map(normalizeLocation));
        setUsedFallback(true);
      }
    } catch (err: any) {
      console.error("[ClosedDeals] error fetching locations:", err);
      setFallbackReason(String(err?.message ?? err));
      setLocations(defaultData.locations.map(normalizeLocation));
      setUsedFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Equirectangular (linear) mapping: longitude -> x; latitude -> y (linear)
  // This often matches static map images (non-mercator). Tune the bounds if needed.
  const latLngToXY = (lat: number, lng: number) => {
    const { width: svgWidth, height: svgHeight } = svgSize;

    // Geographic bounds tuned for continental US
    const minLng = -125;
    const maxLng = -66.9;
    const minLat = 24.5;
    const maxLat = 49.4;

    const x = ((lng - minLng) / (maxLng - minLng)) * svgWidth;
    // Note: top of SVG is y=0, so larger lat (north) should map to smaller y
    const y = ((maxLat - lat) / (maxLat - minLat)) * svgHeight;

    return { x: Math.max(0, Math.min(svgWidth, x)), y: Math.max(0, Math.min(svgHeight, y)) };
  };

  /*********** Drag/edit logic ***********/
  const dragState = useRef<{
    draggingId: string | null;
    originMouseX: number;
    originMouseY: number;
  }>({ draggingId: null, originMouseX: 0, originMouseY: 0 });

  const onPointerDown = (e: React.PointerEvent, id: string) => {
    // Only permit pointer interactions when admin & edit mode
    if (!isEditMode || !isAdmin) return;
    const target = e.currentTarget as HTMLElement;
    try {
      (target as any).setPointerCapture(e.pointerId);
    } catch {}
    dragState.current = {
      draggingId: id,
      originMouseX: e.clientX,
      originMouseY: e.clientY,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isEditMode || !isAdmin) return;
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
    if (!isEditMode || !isAdmin) return;
    if (!dragState.current.draggingId) return;
    const target = e.currentTarget as HTMLElement;
    try {
      (target as any).releasePointerCapture(e.pointerId);
    } catch {}
    dragState.current.draggingId = null;
  };

  const toggleEditMode = () => {
    // Only admins can toggle edit mode
    if (!isAdmin) {
      // redirect to admin login page
      if (confirm("Edit Pins is admin-only. Go to admin login?")) navigate("/closed-deals/admin");
      return;
    }
    setIsEditMode((v) => !v);
  };

  const exportNudges = async () => {
    if (!isAdmin) {
      alert("Only admins can export nudges. Please login on the admin page.");
      return;
    }
    const text = JSON.stringify(nudges, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      alert("Nudges copied to clipboard. Paste them into your code or a file.");
    } catch (e) {
      console.log("Nudges:", text);
      alert("Could not copy to clipboard — check console for JSON.");
    }
  };

  const clearNudges = () => {
    if (!isAdmin) {
      alert("Only admins can clear nudges. Please login on the admin page.");
      return;
    }
    if (!confirm("Clear all saved nudges (local offsets)? This cannot be undone locally).")) return;
    setNudges({});
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}
    alert("Nudges cleared locally. Reload page to be sure.");
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
              {isAdmin ? (
                <>
                  <Button size="sm" onClick={toggleEditMode}>
                    {isEditMode ? "Exit Edit Pins" : "Edit Pins"}
                  </Button>
                  <Button size="sm" variant="outline" className="ml-3" onClick={exportNudges}>
                    Export Nudges
                  </Button>
                  <Button size="sm" variant="destructive" className="ml-3" onClick={clearNudges}>
                    Clear Nudges
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" onClick={() => navigate("/closed-deals/admin")}>
                    Admin Login
                  </Button>
                  <span className="ml-4 text-sm text-muted-foreground">Edit Pins are admin-only</span>
                </>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              {isEditMode && isAdmin
                ? "Drag pins to adjust positions. Click Export Nudges to copy adjustments."
                : "Toggle Edit Pins to adjust locations (admin-only)."}
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
                    <image
                      href="/us.jpg"
                      x="0"
                      y="0"
                      width={svgSize.width}
                      height={svgSize.height}
                      preserveAspectRatio="xMinYMin meet"
                    />

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
                            style={{ cursor: isEditMode && isAdmin ? "grab" : "default", touchAction: "none" }}
                            onPointerDown={(e) => onPointerDown(e, loc.id)}
                          />

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
                    <span className="text-lg font-semibold">
                      {locations.length} {locations.length === 1 ? "Deal" : "Deals"} Closed
                    </span>
                  </div>

                  {usedFallback && (
                    <div className="mt-4 text-sm text-yellow-700">
                      <div>Note: showing bundled locations because the server API was unavailable (fallback).</div>
                      {fallbackReason && <div className="mt-1 text-xs text-yellow-800">Reason: {fallbackReason}</div>}
                      <div className="mt-2 text-xs text-muted-foreground">
                        Check the server route <code>/api/deals/locations</code> (should return JSON). See console for details.
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center mt-12 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Ready to Join Them?</h2>
            <p className="text-lg text-muted-foreground mb-6">Let us help you close a deal on your land property today</p>

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
