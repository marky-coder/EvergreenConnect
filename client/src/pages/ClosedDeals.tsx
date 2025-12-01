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
const CLIENT_ONLY_FLAG = "closedDeals_clientOnlyAdmin_v1";

/**
 * ClosedDeals page with in-page admin modal.
 * - Shows an in-page modal when user clicks "Edit Pins" and is not admin.
 * - Tries SPA navigate, then falls back to full page navigation respecting <base href>.
 */
export default function ClosedDeals() {
  const [locations, setLocations] = useState<DealLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [nudges, setNudges] = useState<Nudges>({});
  const [svgSize, setSvgSize] = useState({ width: 1000, height: 589 });
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const svgContainerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Load nudges from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) setNudges(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    loadLocations();
    checkAdminStatus();
    updateSvgSize();
    window.addEventListener("resize", updateSvgSize);
    return () => window.removeEventListener("resize", updateSvgSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSvgSize = () => {
    const container = document.querySelector(".container") as HTMLElement | null;
    const width = container ? Math.min(1200, container.clientWidth) : 1000;
    const height = Math.round((width * 589) / 1000);
    setSvgSize({ width, height });
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
    setFallbackReason(null);
    try {
      const response = await fetch("/api/deals/locations");
      if (!response.ok) {
        const statusText = `${response.status} ${response.statusText}`;
        setFallbackReason(`Server responded ${statusText}`);
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

  // Check admin state: server-side or client-only flag
  const checkAdminStatus = async () => {
    const clientFlag = localStorage.getItem(CLIENT_ONLY_FLAG) === "true";
    if (clientFlag) {
      setIsAdmin(true);
      return;
    }

    try {
      const resp = await fetch("/api/admin/status", { credentials: "include" });
      if (!resp.ok) {
        setIsAdmin(false);
        return;
      }
      const json = await resp.json();
      setIsAdmin(Boolean(json?.isAdmin));
    } catch {
      setIsAdmin(false);
    }
  };

  // Simple equirectangular mapping
  const latLngToXY = (lat: number, lng: number) => {
    const { width: svgWidth, height: svgHeight } = svgSize;
    const minLng = -125;
    const maxLng = -66.9;
    const minLat = 24.5;
    const maxLat = 49.4;
    const x = ((lng - minLng) / (maxLng - minLng)) * svgWidth;
    const y = ((maxLat - lat) / (maxLat - minLat)) * svgHeight;
    return { x: Math.max(0, Math.min(svgWidth, x)), y: Math.max(0, Math.min(svgHeight, y)) };
  };

  /******** Drag/edit logic *********/
  const dragState = useRef<{ draggingId: string | null; originMouseX: number; originMouseY: number }>({ draggingId: null, originMouseX: 0, originMouseY: 0 });

  const onPointerDown = (e: React.PointerEvent, id: string) => {
    if (!isEditMode || !isAdmin) return;
    const target = e.currentTarget as HTMLElement;
    try { (target as any).setPointerCapture(e.pointerId); } catch {}
    dragState.current = { draggingId: id, originMouseX: e.clientX, originMouseY: e.clientY };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isEditMode || !isAdmin) return;
    if (!dragState.current.draggingId) return;
    const ds = dragState.current;
    const dx = e.clientX - ds.originMouseX;
    const dy = e.clientY - ds.originMouseY;
    setNudges((prev) => {
      const next = { ...prev };
      const curr = next[ds.draggingId!] || { dx: 0, dy: 0 };
      next[ds.draggingId!] = { dx: curr.dx + dx, dy: curr.dy + dy };
      try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next)); } catch {}
      dragState.current.originMouseX = e.clientX;
      dragState.current.originMouseY = e.clientY;
      return next;
    });
  };

  const onPointerUp = () => {
    if (!isEditMode || !isAdmin) return;
    dragState.current.draggingId = null;
  };

  // NEW: open modal instead of using browser confirm
  const toggleEditMode = () => {
    if (!isAdmin) {
      setShowAdminModal(true);
      return;
    }
    setIsEditMode((v) => !v);
  };

  // Go to admin: SPA navigate then fallback to full-page assign
  const goToAdmin = () => {
    const spaPath = "/closed-deals/admin";
    try {
      navigate(spaPath);
    } catch {
      // ignore
    }

    // after a short delay, if SPA didn't move to the admin path, force a page load
    setTimeout(() => {
      if (!window.location.pathname.endsWith(spaPath)) {
        // Respect <base href> if present (useful for repo subpath hosting)
        const baseEl = document.querySelector("base");
        let baseHref = "";
        if (baseEl) {
          baseHref = baseEl.getAttribute("href") || "";
        }
        // If no base tag, try to infer repo base as the first path segment if site runs under /repo-name/
        if (!baseHref) {
          const parts = window.location.pathname.split("/");
          // parts[0] === "" for leading slash
          if (parts.length > 1 && parts[1] && parts[1] !== "closed-deals") {
            baseHref = `/${parts[1]}`;
          } else {
            baseHref = "";
          }
        }
        const adminUrl = (baseHref.replace(/\/$/, "") || "") + spaPath;
        // If adminUrl is relative (starts without slash), make it absolute relative to origin
        const url = adminUrl.startsWith("/") ? `${window.location.origin}${adminUrl}` : `${window.location.href.replace(/\/$/, "")}/${adminUrl}`;
        window.location.assign(url);
      }
    }, 80);
  };

  const exportNudges = async () => {
    if (!isAdmin) { alert("Only admins can export nudges. Please login."); return; }
    const text = JSON.stringify(nudges, null, 2);
    try { await navigator.clipboard.writeText(text); alert("Nudges copied to clipboard."); } catch { console.log(text); alert("Copied to console."); }
  };

  const clearNudges = () => {
    if (!isAdmin) { alert("Only admins can clear nudges."); return; }
    if (!confirm("Clear all saved nudges?")) return;
    setNudges({});
    try { localStorage.removeItem(LOCAL_STORAGE_KEY); } catch {}
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
              <Button size="sm" onClick={toggleEditMode}>
                {isEditMode ? "Exit Edit Pins" : "Edit Pins"}
              </Button>
              <Button size="sm" variant="outline" className="ml-3" onClick={exportNudges}>
                Export Nudges
              </Button>
              <Button size="sm" variant="destructive" className="ml-3" onClick={clearNudges}>
                Clear Nudges
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              {isEditMode && isAdmin ? "Drag pins to adjust positions." : "Toggle Edit Pins to adjust locations (admin-only)."}
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
                    <image
                      href="/us.jpg"
                      x="0"
                      y="0"
                      width={svgSize.width}
                      height={svgSize.height}
                      preserveAspectRatio="xMinYMin meet"
                    />

                    {locations.map((loc) => {
                      const base = latLngToXY(loc.lat, loc.lng);
                      const n = nudges[loc.id] || { dx: 0, dy: 0 };
                      const x = base.x + n.dx;
                      const y = base.y + n.dy;

                      return (
                        <g key={loc.id}>
                          <circle cx={x} cy={y} r="12" fill="#16a34a" opacity="0.28" />
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

      {/* In-page admin modal */}
      {showAdminModal && (
        <div style={{
          position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 60, background: "rgba(0,0,0,0.45)"
        }}>
          <div style={{
            width: 420, maxWidth: "92%", background: "white", borderRadius: 10, padding: 20,
            boxShadow: "0 8px 30px rgba(0,0,0,0.35)"
          }}>
            <h3 style={{ margin: 0, marginBottom: 8, fontSize: 18 }}>Admin required</h3>
            <p style={{ marginTop: 0, marginBottom: 16, color: "#374151" }}>Edit Pins is admin-only. Go to admin login?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setShowAdminModal(false)} style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff" }}>Cancel</button>
              <button onClick={() => { setShowAdminModal(false); goToAdmin(); }} style={{ padding: "8px 14px", borderRadius: 6, background: "#e11d48", color: "white", border: "none" }}>Go to admin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
