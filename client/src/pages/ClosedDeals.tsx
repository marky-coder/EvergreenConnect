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
 * ClosedDeals page — robust pin placement:
 * - Measures the natural (intrinsic) size of /us.jpg and the uniform scale CSS uses,
 *   then maps lat/lng -> image coordinates and applies that scale so pins align perfectly.
 * - Keeps the "Enable Local Admin" button so you can edit in-browser if needed.
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
  const [isClientOnlyAdmin, setIsClientOnlyAdmin] = useState(false);

  // image natural size
  const [imgNatural, setImgNatural] = useState({ width: 1000, height: 589 });
  // image scale when drawn into the svg viewport (uniform scale like preserveAspectRatio="xMinYMin meet")
  const [imgScale, setImgScale] = useState(1);

  const svgContainerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const navigate = useNavigate();

  // Load nudges from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) setNudges(JSON.parse(raw));
    } catch {}
  }, []);

  // On mount
  useEffect(() => {
    loadLocations();
    checkAdminStatus();
    updateSvgSize();
    measureImage();
    window.addEventListener("resize", () => {
      updateSvgSize();
      measureImage();
    });
    return () => {
      window.removeEventListener("resize", () => {
        updateSvgSize();
        measureImage();
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update svg width/height to fill container (keeps aspect ratio)
  const updateSvgSize = () => {
    const container = document.querySelector(".container") as HTMLElement | null;
    const width = container ? Math.min(1200, container.clientWidth) : 1000;
    // keep original map aspect ratio from previous images (1000 x 589)
    const height = Math.round((width * 589) / 1000);
    setSvgSize({ width, height });
  };

  // load / measure the actual /us.jpg natural size and compute scale used in svg
  const measureImage = () => {
    const img = new Image();
    img.src = "/us.jpg";
    img.onload = () => {
      const naturalW = img.naturalWidth || 1000;
      const naturalH = img.naturalHeight || 589;
      setImgNatural({ width: naturalW, height: naturalH });

      // compute uniform scale used when drawing the image into svg of size svgSize
      // preserveAspectRatio="xMinYMin meet" => scale = min(svgWidth/naturalW, svgHeight/naturalH)
      const sx = svgSize.width / naturalW;
      const sy = svgSize.height / naturalH;
      const scale = Math.min(sx, sy);
      setImgScale(scale);
    };
    img.onerror = () => {
      // fallback: keep defaults
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
    setFallbackReason(null);
    try {
      const resp = await fetch("/api/deals/locations");
      if (!resp.ok) {
        // fallback to bundled static JSON
        setFallbackReason(`Server responded ${resp.status} ${resp.statusText}`);
        setLocations(defaultData.locations.map(normalizeLocation));
        setUsedFallback(true);
        setIsLoading(false);
        return;
      }
      const data = await resp.json();
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

  // If server admin not available, allow client-only admin via flag
  const checkAdminStatus = async () => {
    const clientFlag = localStorage.getItem(CLIENT_ONLY_FLAG) === "true";
    if (clientFlag) {
      setIsAdmin(true);
      setIsClientOnlyAdmin(true);
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

  // Equirectangular mapping using the *natural image dimensions* and the uniform scale
  const latLngToXY = (lat: number, lng: number) => {
    // Geographic bounds for continental US (approx)
    const minLng = -125;
    const maxLng = -66.9;
    const minLat = 24.5;
    const maxLat = 49.4;

    // Use natural image size and compute pixel coords, then apply the uniform scale
    const imgW = imgNatural.width;
    const imgH = imgNatural.height;

    const xImg = ((lng - minLng) / (maxLng - minLng)) * imgW;
    const yImg = ((maxLat - lat) / (maxLat - minLat)) * imgH;

    // With preserveAspectRatio="xMinYMin meet" the image sits at top-left and is uniformly scaled by imgScale
    const x = xImg * imgScale;
    const y = yImg * imgScale;

    // clamp to svg
    return {
      x: Math.max(0, Math.min(svgSize.width, x)),
      y: Math.max(0, Math.min(svgSize.height, y)),
    };
  };

  /******** Drag/edit logic (kept for convenience) *********/
  const dragState = useRef<{ draggingId: string | null; originMouseX: number; originMouseY: number }>({ draggingId: null, originMouseX: 0, originMouseY: 0 });

  const onPointerDown = (e: React.PointerEvent, id: string) => {
    if (!isEditMode || !isAdmin) return;
    const t = e.currentTarget as HTMLElement;
    try { (t as any).setPointerCapture(e.pointerId); } catch {}
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

  // Toggle edit mode; if not admin user can enable local admin
  const toggleEditMode = () => {
    if (!isAdmin) {
      alert("Editing pins requires admin. If you control this site you can enable local admin with the button next to Edit Pins.");
      return;
    }
    setIsEditMode((v) => !v);
  };

  const enableClientOnlyAdmin = () => {
    if (!confirm("Enable LOCAL admin mode in this browser (local-only changes)?")) return;
    localStorage.setItem(CLIENT_ONLY_FLAG, "true");
    setIsAdmin(true);
    setIsClientOnlyAdmin(true);
    location.reload();
  };

  const exportNudges = async () => {
    if (!isAdmin) { alert("Only admins can export nudges."); return; }
    const data = JSON.stringify(nudges, null, 2);
    try {
      await navigator.clipboard.writeText(data);
      alert("Nudges copied to clipboard.");
    } catch {
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "closed-deals-nudges.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      alert("Downloaded nudges JSON.");
    }
  };

  const clearNudges = () => {
    if (!isAdmin) { alert("Only admins can clear nudges."); return; }
    if (!confirm("Clear all saved nudges (local offsets)?")) return;
    setNudges({});
    try { localStorage.removeItem(LOCAL_STORAGE_KEY); } catch {}
    alert("Nudges cleared locally.");
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
              <Button size="sm" onClick={toggleEditMode}>{isEditMode ? "Exit Edit Pins" : "Edit Pins"}</Button>
              <Button size="sm" variant="outline" className="ml-3" onClick={exportNudges}>Export Nudges</Button>
              <Button size="sm" variant="destructive" className="ml-3" onClick={clearNudges}>Clear Nudges</Button>
              {!isAdmin && (
                <Button size="sm" variant="secondary" className="ml-3" onClick={enableClientOnlyAdmin}>Enable Local Admin</Button>
              )}
            </div>

            <div className="text-sm text-muted-foreground">{isEditMode && isAdmin ? "Drag pins to adjust positions." : "Toggle Edit Pins to adjust locations (admin-only)."}</div>
          </div>

          {isClientOnlyAdmin && (
            <div className="mb-4 text-center text-yellow-600">You are in <strong>local admin mode</strong>. Changes are local-only — export and commit to repo to persist.</div>
          )}

          <Card className="max-w-6xl mx-auto">
            <CardContent className="p-6">
              <div className="relative w-full" style={{ paddingBottom: "60%" }}>
                {/* SVG sized to fill container; image drawn top-left using preserveAspectRatio so scaling is predictable */}
                <svg viewBox={`0 0 ${svgSize.width} ${svgSize.height}`} className="absolute inset-0 w-full h-full" style={{ background: "#f3f4f6" }} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
                  <image
                    ref={imgRef as any}
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
                        <circle cx={x} cy={y} r="8" fill="#16a34a" stroke="white" strokeWidth="2"
                          style={{ cursor: isEditMode && isAdmin ? "grab" : "default", touchAction: "none" }}
                          onPointerDown={(e) => onPointerDown(e, loc.id)}
                        />
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

                {usedFallback && (
                  <div className="mt-4 text-sm text-yellow-700">
                    <div>Note: showing bundled locations because the server API was unavailable (fallback).</div>
                    {fallbackReason && <div className="mt-1 text-xs text-yellow-800">Reason: {fallbackReason}</div>}
                    <div className="mt-2 text-xs text-muted-foreground">Check the server route <code>/api/deals/locations</code> (should return JSON). See console for details.</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

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
