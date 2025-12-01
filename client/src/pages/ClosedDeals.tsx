// client/src/pages/ClosedDeals.tsx
import React, { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import defaultData from "@/data/deals-locations.json";

type DealLocation = {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  city?: string;
  state?: string;
  addedAt?: string;
};

const LOCAL_STORAGE_KEY = "closedDeals_manual_locations_v1";

/* Calibrated bounds (kept from your calibration) */
const BOUNDS = {
  minLng: -124.388835,
  maxLng: -76.927213,
  minLat: 18.040058,
  maxLat: 61.642249,
};

export default function ClosedDeals() {
  const navigate = useNavigate();

  // svg / image sizing
  const [svgSize, setSvgSize] = useState({ width: 1000, height: 589 });
  const [imgNatural, setImgNatural] = useState({ width: 1000, height: 589 });
  const [imgScale, setImgScale] = useState(1);

  // locations state
  const [locations, setLocations] = useState<DealLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // load locations from localStorage or bundled JSON
  useEffect(() => {
    // if user saved local edits, prefer that
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setLocations(parsed);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // ignore
    }

    // otherwise use bundled
    setLocations(
      defaultData.locations.map((l: any) => ({
        id: l.id ?? l.name ?? `${l.lat}-${l.lng}`,
        lat: Number(l.lat),
        lng: Number(l.lng),
        name: l.name,
        city: l.city,
        state: l.state,
        addedAt: l.addedAt ?? l.added_at ?? new Date().toISOString(),
      }))
    );
    setIsLoading(false);
  }, []);

  // measure image natural size and scale
  useEffect(() => {
    measureImage();
    window.addEventListener("resize", measureImage);
    return () => window.removeEventListener("resize", measureImage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svgSize.width, svgSize.height]);

  useEffect(() => {
    // ensure svg size updates on container change
    const container = document.querySelector(".container") as HTMLElement | null;
    const update = () => {
      const width = container ? Math.min(1200, container.clientWidth) : 1000;
      setSvgSize({ width, height: Math.round((width * 589) / 1000) });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  function measureImage() {
    const img = new Image();
    img.src = "/us.jpg";
    img.onload = () => {
      const naturalW = img.naturalWidth || 1000;
      const naturalH = img.naturalHeight || 589;
      setImgNatural({ width: naturalW, height: naturalH });
      const sx = svgSize.width / naturalW;
      const sy = svgSize.height / naturalH;
      setImgScale(Math.min(sx, sy));
    };
    img.onerror = () => {
      setImgNatural({ width: 1000, height: 589 });
      setImgScale(Math.min(svgSize.width / 1000, svgSize.height / 589));
    };
  }

  // conversions lat/lng <-> pixels
  const latLngToXY = (lat: number, lng: number) => {
    const { minLng, maxLng, minLat, maxLat } = BOUNDS;
    const imgW = imgNatural.width;
    const imgH = imgNatural.height;

    const xImg = ((lng - minLng) / (maxLng - minLng)) * imgW;
    const yImg = ((maxLat - lat) / (maxLat - minLat)) * imgH;

    const x = xImg * imgScale;
    const y = yImg * imgScale;
    return { x: clamp(x, 0, svgSize.width), y: clamp(y, 0, svgSize.height) };
  };

  const xyToLatLng = (x: number, y: number) => {
    const { minLng, maxLng, minLat, maxLat } = BOUNDS;
    const imgW = imgNatural.width;
    const imgH = imgNatural.height;

    const xImg = x / imgScale;
    const yImg = y / imgScale;

    const lng = minLng + (xImg / imgW) * (maxLng - minLng);
    const lat = maxLat - (yImg / imgH) * (maxLat - minLat);
    return { lat, lng };
  };

  // clamp helper
  function clamp(n: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, n));
  }

  // pointer handlers for dragging pins
  const onPinPointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    const svg = svgRef.current;
    if (!svg) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    setDraggingId(id);
  };

  const onSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingId) return;
    updateLocationFromPointer(e, draggingId);
  };

  const onSvgPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingId) return;
    // finalize
    updateLocationFromPointer(e, draggingId);
    setDraggingId(null);
  };

  // helper to set location by pointer coordinates relative to SVG
  function updateLocationFromPointer(e: React.PointerEvent, id: string) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * svgSize.width;
    const cy = ((e.clientY - rect.top) / rect.height) * svgSize.height;
    const { lat, lng } = xyToLatLng(cx, cy);
    setLocations((prev) => prev.map((p) => (p.id === id ? { ...p, lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) } : p)));
  }

  // clicking the map when Add mode enabled -> create a pin at click
  const onSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isAdding) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * svgSize.width;
    const cy = ((e.clientY - rect.top) / rect.height) * svgSize.height;
    const { lat, lng } = xyToLatLng(cx, cy);
    const newPin: DealLocation = {
      id: `manual-${Date.now()}`,
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      name: "New Pin",
      addedAt: new Date().toISOString(),
    };
    setLocations((prev) => [...prev, newPin]);
    setIsAdding(false);
    setSelectedId(newPin.id);
  };

  // select pin
  const handleSelect = (id: string) => {
    setSelectedId(id === selectedId ? null : id);
  };

  // update fields from inputs
  const handleFieldChange = (id: string, field: keyof DealLocation, value: string) => {
    setLocations((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (field === "name") return { ...p, name: value };
        if (field === "lat") return { ...p, lat: Number(value) || 0 };
        if (field === "lng") return { ...p, lng: Number(value) || 0 };
        return p;
      })
    );
  };

  // save to localStorage
  const saveLocally = () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(locations));
      alert("Saved to localStorage.");
    } catch {
      alert("Failed to save locally.");
    }
  };

  // reset to bundled JSON
  const resetToBundled = () => {
    if (!confirm("Reset to bundled locations? This will clear local edits.")) return;
    setLocations(defaultData.locations.map((l: any) => ({
      id: l.id ?? l.name ?? `${l.lat}-${l.lng}`,
      lat: Number(l.lat),
      lng: Number(l.lng),
      name: l.name,
      city: l.city,
      state: l.state,
      addedAt: l.addedAt ?? l.added_at ?? new Date().toISOString(),
    })));
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}
  };

  // export JSON file for commit
  const exportLocations = () => {
    const payload = { locations: locations.map((l) => ({ id: l.id, lat: l.lat, lng: l.lng, name: l.name, city: l.city, state: l.state, addedAt: l.addedAt })) };
    const data = JSON.stringify(payload, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deals-locations.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const deletePin = (id: string) => {
    if (!confirm("Delete this pin?")) return;
    setLocations((prev) => prev.filter((p) => p.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left / center: map */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-lg font-semibold">Closed Deals — Editor</div>
                    <div className="text-sm text-muted-foreground">Click a pin to select, drag to move, or edit via the right panel.</div>
                  </div>

                  <div className="relative w-full" style={{ paddingBottom: "60%" }}>
                    {isLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <svg
                        ref={svgRef}
                        viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
                        className="absolute inset-0 w-full h-full"
                        onPointerMove={onSvgPointerMove}
                        onPointerUp={onSvgPointerUp}
                        onClick={onSvgClick}
                      >
                        <image href="/us.jpg" x="0" y="0" width={svgSize.width} height={svgSize.height} preserveAspectRatio="xMinYMin meet" />

                        {locations.map((loc) => {
                          const { x, y } = latLngToXY(loc.lat, loc.lng);
                          const isSelected = loc.id === selectedId;
                          return (
                            <g key={loc.id} transform={`translate(${x},${y})`} style={{ cursor: "grab" }}>
                              <circle
                                cx={0}
                                cy={0}
                                r={isSelected ? 14 : 12}
                                fill="#16a34a"
                                opacity={0.28}
                                onClick={(e) => { e.stopPropagation(); handleSelect(loc.id); }}
                                onPointerDown={(e) => onPinPointerDown(e, loc.id)}
                              />
                              <circle
                                cx={0}
                                cy={0}
                                r={isSelected ? 9 : 8}
                                fill="#16a34a"
                                stroke="#fff"
                                strokeWidth={2}
                                onClick={(e) => { e.stopPropagation(); handleSelect(loc.id); }}
                                onPointerDown={(e) => onPinPointerDown(e, loc.id)}
                              />
                            </g>
                          );
                        })}
                      </svg>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" onClick={() => setIsAdding((v) => !v)}>{isAdding ? "Cancel Add" : "Add pin"}</Button>
                    <Button size="sm" variant="outline" onClick={saveLocally}>Save locally</Button>
                    <Button size="sm" variant="outline" onClick={exportLocations}>Export JSON</Button>
                    <Button size="sm" variant="destructive" onClick={resetToBundled}>Reset to bundled</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: editor */}
            <div>
              <Card>
                <CardContent>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-semibold">Pins ({locations.length})</div>
                    <div className="text-xs text-muted-foreground">Select a pin to edit</div>
                  </div>

                  <div style={{ maxHeight: "56vh", overflow: "auto", paddingRight: 4 }}>
                    {locations.map((loc) => {
                      const isSelected = loc.id === selectedId;
                      return (
                        <div key={loc.id} style={{ border: isSelected ? "1px solid #10b981" : "1px solid #1f2937", borderRadius: 8, padding: 8, marginBottom: 8, background: isSelected ? "#052e17" : "transparent" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                            <div style={{ fontWeight: 600 }}>{loc.name ?? loc.id}</div>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => { handleSelect(loc.id); }} style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #e5e7eb", background: isSelected ? "#064e3b" : "#0b1220", color: "#fff" }}>Select</button>
                              <button onClick={() => deletePin(loc.id)} style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#161616", color: "#fff" }}>Delete</button>
                            </div>
                          </div>

                          <div style={{ marginTop: 8 }}>
                            <label className="text-xs text-muted-foreground">Name</label>
                            <input value={loc.name ?? ""} onChange={(e) => handleFieldChange(loc.id, "name", e.target.value)} className="w-full mt-1 p-2 rounded bg-background border border-border text-foreground text-sm" />
                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                              <div style={{ flex: 1 }}>
                                <label className="text-xs text-muted-foreground">Latitude</label>
                                <input value={String(loc.lat)} onChange={(e) => handleFieldChange(loc.id, "lat", e.target.value)} className="w-full mt-1 p-2 rounded bg-background border border-border text-foreground text-sm" />
                              </div>
                              <div style={{ flex: 1 }}>
                                <label className="text-xs text-muted-foreground">Longitude</label>
                                <input value={String(loc.lng)} onChange={(e) => handleFieldChange(loc.id, "lng", e.target.value)} className="w-full mt-1 p-2 rounded bg-background border border-border text-foreground text-sm" />
                              </div>
                            </div>
                            <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                              <button onClick={() => {
                                // apply lat/lng typed values (already updated live by inputs)
                                setLocations((prev) => prev.map((p) => p.id === loc.id ? { ...p } : p));
                              }} style={{ padding: "6px 10px", borderRadius: 6, background: "#10b981", color: "#fff" }}>Save</button>

                              <button onClick={() => {
                                // center map selection over the pin - just select
                                setSelectedId(loc.id);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }} style={{ padding: "6px 10px", borderRadius: 6, background: "#111827", color: "#fff" }}>Focus</button>

                              <button onClick={() => {
                                // set this pin by clicking on map — toggle adding with target id
                                setSelectedId(loc.id);
                                setIsAdding(true);
                                alert("Add mode on: click the map to place a new pin. Or drag the selected pin on the map.");
                              }} style={{ padding: "6px 10px", borderRadius: 6, background: "#0b1220", color: "#fff" }}>Set from map</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div style={{ height: 12 }} />

              <Card>
                <CardContent>
                  <div className="font-semibold mb-2">Local actions</div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <Button size="sm" onClick={saveLocally}>Save to localStorage</Button>
                    <Button size="sm" variant="outline" onClick={exportLocations}>Export JSON</Button>
                    <Button size="sm" variant="destructive" onClick={resetToBundled}>Reset</Button>
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>
                    When you finish editing, click Export JSON and paste into <code>client/src/data/deals-locations.json</code> in the repo to make edits permanent.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
