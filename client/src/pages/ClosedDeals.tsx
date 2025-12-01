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

type CalibrationPoint = {
  xImg: number; // image-space pixel (intrinsic)
  yImg: number;
  lat: number;
  lng: number;
};

type CalBounds = {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
};

const CAL_KEY = "closedDeals_calibration_v1";

/**
 * ClosedDeals with calibration UI
 *
 * - Robust pin placement using the intrinsic image size of /us.jpg and uniform scale.
 * - Calibration tool to compute min/max lat/lng from clicked image points + real lat/lng.
 * - Calibration is stored in localStorage (local-only) and can be exported.
 */

export default function ClosedDeals() {
  const [locations, setLocations] = useState<DealLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [svgSize, setSvgSize] = useState({ width: 1000, height: 589 });

  // image natural size and uniform scale
  const [imgNatural, setImgNatural] = useState({ width: 1000, height: 589 });
  const [imgScale, setImgScale] = useState(1);

  // calibration state
  const [calPoints, setCalPoints] = useState<CalibrationPoint[]>([]);
  const [calBounds, setCalBounds] = useState<CalBounds | null>(null);
  const [isCalMode, setIsCalMode] = useState(false);
  const [pendingPoint, setPendingPoint] = useState<{ xImg: number; yImg: number } | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadLocations();
    updateSvgSize();
    measureImage();
    // load calibration from localStorage if present
    try {
      const raw = localStorage.getItem(CAL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.minLng !== undefined) setCalBounds(parsed);
        if (Array.isArray(parsed?.points)) setCalPoints(parsed.points);
      }
    } catch {}
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

  // if calibration bounds exist, use them; otherwise fall back to defaults
  const bounds = calBounds ?? {
    minLng: -125,
    maxLng: -66.9,
    minLat: 24.5,
    maxLat: 49.4,
  };

  const latLngToXY = (lat: number, lng: number) => {
    const { minLng, maxLng, minLat, maxLat } = bounds;
    const imgW = imgNatural.width;
    const imgH = imgNatural.height;

    const xImg = ((lng - minLng) / (maxLng - minLng)) * imgW;
    const yImg = ((maxLat - lat) / (maxLat - minLat)) * imgH;

    const x = xImg * imgScale;
    const y = yImg * imgScale;

    return { x: Math.max(0, Math.min(svgSize.width, x)), y: Math.max(0, Math.min(svgSize.height, y)) };
  };

  /* ================= Calibration math ================= */

  // Given calibration points (xImg,yImg in intrinsic image pixels) and lat/lng,
  // solve for minLng & maxLng via least squares:
  // (1-u_i)*minLng + u_i*maxLng = lng_i, where u_i = xImg / imgW
  // Similarly for lat: v_i*minLat + (1-v_i)*maxLat = lat_i where v_i = yImg / imgH
  function computeBoundsFromPoints(points: CalibrationPoint[]): CalBounds | null {
    if (!points || points.length < 2) return null;

    const imgW = imgNatural.width;
    const imgH = imgNatural.height;

    // Build A_lng (rows [(1-u), u]) and b_lng (lngs)
    const A_lng: number[][] = [];
    const b_lng: number[] = [];
    const A_lat: number[][] = [];
    const b_lat: number[] = [];

    for (const p of points) {
      const u = p.xImg / imgW;
      A_lng.push([1 - u, u]);
      b_lng.push(p.lng);

      const v = p.yImg / imgH;
      A_lat.push([v, 1 - v]); // [minLat, maxLat] coefficients
      b_lat.push(p.lat);
    }

    // Least-squares 2x2 solver: x = (A^T A)^-1 A^T b
    const solve2x2LS = (A: number[][], b: number[]) => {
      // compute ATA (2x2)
      let a00 = 0, a01 = 0, a11 = 0;
      let bt0 = 0, bt1 = 0;
      for (let i = 0; i < A.length; i++) {
        const r0 = A[i][0];
        const r1 = A[i][1];
        a00 += r0 * r0;
        a01 += r0 * r1;
        a11 += r1 * r1;
        bt0 += r0 * b[i];
        bt1 += r1 * b[i];
      }
      // ATA = [[a00,a01],[a01,a11]]
      const det = a00 * a11 - a01 * a01;
      if (!isFinite(det) || Math.abs(det) < 1e-12) {
        return null;
      }
      const inv00 = a11 / det;
      const inv01 = -a01 / det;
      const inv11 = a00 / det;
      const x0 = inv00 * bt0 + inv01 * bt1;
      const x1 = inv01 * bt0 + inv11 * bt1;
      return [x0, x1];
    };

    const solLng = solve2x2LS(A_lng, b_lng); // [minLng, maxLng]
    const solLat = solve2x2LS(A_lat, b_lat); // [minLat, maxLat]

    if (!solLng || !solLat) return null;

    let [minLng, maxLng] = solLng;
    let [minLat, maxLat] = solLat;

    // If the solver swapped min/max (due to noisy points), ensure ordering
    if (minLng > maxLng) [minLng, maxLng] = [maxLng, minLng];
    if (minLat > maxLat) [minLat, maxLat] = [maxLat, minLat];

    // Sanity clamp to US-ish ranges
    minLng = Math.max(-180, Math.min(180, minLng));
    maxLng = Math.max(-180, Math.min(180, maxLng));
    minLat = Math.max(-90, Math.min(90, minLat));
    maxLat = Math.max(-90, Math.min(90, maxLat));

    return { minLng, maxLng, minLat, maxLat };
  }

  /* ================= Calibration UI actions ================= */

  // Handle clicks in SVG while in calibration mode
  const handleSvgClickForCal = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isCalMode) return;
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    // map client coords to viewBox coords
    const xView = ((e.clientX - rect.left) / rect.width) * svgSize.width;
    const yView = ((e.clientY - rect.top) / rect.height) * svgSize.height;
    // convert to image intrinsic pixels
    const xImg = xView / imgScale;
    const yImg = yView / imgScale;
    setPendingPoint({ xImg, yImg });
  };

  const saveCalibrationPoint = (lat: number, lng: number) => {
    if (!pendingPoint) return;
    const p: CalibrationPoint = {
      xImg: pendingPoint.xImg,
      yImg: pendingPoint.yImg,
      lat,
      lng,
    };
    setCalPoints((prev) => [...prev, p]);
    setPendingPoint(null);
  };

  const removeCalPoint = (idx: number) => {
    setCalPoints((prev) => prev.filter((_, i) => i !== idx));
  };

  const computeAndApplyCalibration = () => {
    if (calPoints.length < 2) {
      alert("Please add at least 2 calibration points (3 recommended).");
      return;
    }
    const bounds = computeBoundsFromPoints(calPoints);
    if (!bounds) {
      alert("Calibration failed (singular system). Try adding a different set of points.");
      return;
    }
    // Save in memory AND localStorage
    setCalBounds(bounds);
    try {
      localStorage.setItem(CAL_KEY, JSON.stringify({ ...bounds, points: calPoints }));
      alert("Calibration computed and saved locally.");
    } catch {
      alert("Calibration computed but failed to save to localStorage.");
    }
  };

  const resetCalibration = () => {
    if (!confirm("Reset calibration (clear computed bounds & points)?")) return;
    setCalBounds(null);
    setCalPoints([]);
    setPendingPoint(null);
    try {
      localStorage.removeItem(CAL_KEY);
    } catch {}
    alert("Calibration reset (local only).");
  };

  const exportCalibration = () => {
    const payload = {
      bounds: calBounds,
      points: calPoints,
    };
    const data = JSON.stringify(payload, null, 2);
    navigator.clipboard?.writeText(data).then(
      () => alert("Calibration JSON copied to clipboard."),
      () => {
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "closed-deals-calibration.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    );
  };

  /* ================= Render ================= */

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
            <div style={{ display: "flex", gap: 8 }}>
              <Button size="sm" onClick={() => setIsCalMode((v) => !v)}>
                {isCalMode ? "Exit Calibrate" : "Calibrate"}
              </Button>
              <Button size="sm" variant="outline" onClick={exportCalibration}>Export Calibration</Button>
              <Button size="sm" variant="destructive" onClick={resetCalibration}>Reset Calibration</Button>
            </div>

            <div className="text-sm text-muted-foreground">
              {isCalMode ? "Calibration mode: click the map, then enter the real lat/lng for that point." : "Calibration is optional — use only to fine-tune pin alignment."}
            </div>
          </div>

          <Card className="max-w-6xl mx-auto">
            <CardContent className="p-6">
              <div style={{ position: "relative", width: "100%", paddingBottom: "60%" }}>
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
                  className="absolute inset-0 w-full h-full"
                  style={{ background: "#f3f4f6", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
                  onClick={handleSvgClickForCal}
                >
                  <image href="/us.jpg" x="0" y="0" width={svgSize.width} height={svgSize.height} preserveAspectRatio="xMinYMin meet" />

                  {/* Draw calibration points as small red markers (if any) */}
                  {calPoints.map((p, idx) => {
                    const x = p.xImg * imgScale;
                    const y = p.yImg * imgScale;
                    return (
                      <g key={`cal-${idx}`}>
                        <circle cx={x} cy={y} r={6} fill="#dc2626" stroke="#fff" strokeWidth={1} />
                        <text x={x + 10} y={y + 4} fontSize={12} fill="#fff" style={{ pointerEvents: "none" }}>{idx + 1}</text>
                      </g>
                    );
                  })}

                  {locations.map((loc) => {
                    // map lat/lng to scaled pixel coords using current bounds (calibrated or defaults)
                    const { minLng, maxLng, minLat, maxLat } = calBounds ?? {
                      minLng: -125,
                      maxLng: -66.9,
                      minLat: 24.5,
                      maxLat: 49.4,
                    };

                    const imgW = imgNatural.width;
                    const imgH = imgNatural.height;

                    const xImg = ((loc.lng - minLng) / (maxLng - minLng)) * imgW;
                    const yImg = ((maxLat - loc.lat) / (maxLat - minLat)) * imgH;
                    const x = xImg * imgScale;
                    const y = yImg * imgScale;

                    return (
                      <g key={loc.id}>
                        <circle cx={x} cy={y} r={12} fill="#16a34a" opacity="0.28" />
                        <circle cx={x} cy={y} r={8} fill="#16a34a" stroke="#fff" strokeWidth={2} />
                        <title>{loc.name || `${loc.lat}, ${loc.lng}`}</title>
                      </g>
                    );
                  })}
                </svg>

                {/* Pending point form/modal (appears when user clicked in calibration mode) */}
                {pendingPoint && (
                  <div style={{
                    position: "absolute", left: 16, top: 16, background: "rgba(17,24,39,0.95)",
                    color: "white", padding: 12, borderRadius: 8, zIndex: 40, width: 320
                  }}>
                    <h4 style={{ margin: 0, marginBottom: 8 }}>Add calibration point</h4>
                    <div style={{ fontSize: 12, color: "#cbd5e1", marginBottom: 8 }}>
                      Click the map to pick a point ({pendingPoint.xImg.toFixed(1)}px, {pendingPoint.yImg.toFixed(1)}px).
                      Enter the actual latitude and longitude for this spot.
                    </div>

                    <CalibrationForm
                      pending={pendingPoint}
                      onCancel={() => setPendingPoint(null)}
                      onSave={(lat, lng) => {
                        saveCalibrationPoint(lat, lng);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Calibration points list + compute button */}
              <div style={{ marginTop: 12 }}>
                <strong>Calibration points</strong>
                <div style={{ marginTop: 8 }}>
                  {calPoints.length === 0 && <div className="text-sm text-muted-foreground">No points yet. Click "Calibrate", then click a point on the map to start.</div>}
                  {calPoints.map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: "#ef4444", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13 }}>{p.lat.toFixed(6)}, {p.lng.toFixed(6)}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>img: {p.xImg.toFixed(1)} x {p.yImg.toFixed(1)}</div>
                      </div>
                      <button onClick={() => removeCalPoint(i)} style={{ background: "transparent", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 10px" }}>Remove</button>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <Button size="sm" onClick={() => {
                    if (!isCalMode) setIsCalMode(true);
                    // instruct user
                    alert("Calibration mode: click a point on the map, then enter its lat/lng in the popup.");
                  }}>Start Calibrate</Button>

                  <Button size="sm" variant="outline" onClick={() => {
                    if (calPoints.length < 2) {
                      alert("Add at least 2 points before computing.");
                      return;
                    }
                    const bounds = computeBoundsFromPoints(calPoints);
                    if (!bounds) {
                      alert("Calibration failed — try different points.");
                      return;
                    }
                    setCalBounds(bounds);
                    try {
                      localStorage.setItem(CAL_KEY, JSON.stringify({ ...bounds, points: calPoints }));
                      alert("Calibration applied and saved locally.");
                    } catch {
                      alert("Calibration applied but could not save to localStorage.");
                    }
                  }}>Compute bounds</Button>

                  <Button size="sm" variant="outline" onClick={() => exportCalibration()}>Export</Button>

                  <Button size="sm" variant="destructive" onClick={() => {
                    if (!confirm("Clear calibration points & bounds?")) return;
                    setCalPoints([]);
                    setCalBounds(null);
                    localStorage.removeItem(CAL_KEY);
                    alert("Calibration cleared.");
                  }}>Clear</Button>
                </div>

                {calBounds && (
                  <div style={{ marginTop: 12, padding: 12, background: "#0f172a", color: "#fff", borderRadius: 6 }}>
                    <div><strong>Applied bounds</strong></div>
                    <div style={{ fontSize: 13, color: "#cbd5e1", marginTop: 6 }}>
                      minLng: {calBounds.minLng.toFixed(6)}, maxLng: {calBounds.maxLng.toFixed(6)}<br />
                      minLat: {calBounds.minLat.toFixed(6)}, maxLat: {calBounds.maxLat.toFixed(6)}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>These are applied locally. Export if you want to persist to the repo.</div>
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

/* ================= CalibrationForm component ================= */
// Small embedded component to collect lat/lng for a pending image point.
function CalibrationForm({ pending, onCancel, onSave }: {
  pending: { xImg: number; yImg: number };
  onCancel: () => void;
  onSave: (lat: number, lng: number) => void;
}) {
  const [latStr, setLatStr] = useState("");
  const [lngStr, setLngStr] = useState("");

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: "#e2e8f0" }}>Image pixel: {pending.xImg.toFixed(1)} × {pending.yImg.toFixed(1)}</div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input value={latStr} onChange={(e) => setLatStr(e.target.value)} placeholder="Latitude (e.g. 34.0522)" style={{ flex: 1, padding: 6, borderRadius: 6, border: "1px solid #374151", background: "#0b1220", color: "#fff" }} />
        <input value={lngStr} onChange={(e) => setLngStr(e.target.value)} placeholder="Longitude (e.g. -118.2437)" style={{ flex: 1, padding: 6, borderRadius: 6, border: "1px solid #374151", background: "#0b1220", color: "#fff" }} />
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #374151", background: "#111827", color: "#cbd5e1" }}>Cancel</button>
        <button onClick={() => {
          const lat = parseFloat(latStr);
          const lng = parseFloat(lngStr);
          if (!isFinite(lat) || !isFinite(lng)) {
            alert("Please enter valid numeric latitude and longitude.");
            return;
          }
          onSave(lat, lng);
        }} style={{ padding: "6px 10px", borderRadius: 6, border: "none", background: "#10b981", color: "white" }}>
          Save point
        </button>
      </div>
    </div>
  );
}
