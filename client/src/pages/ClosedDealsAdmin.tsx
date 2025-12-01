// client/src/pages/ClosedDealsAdmin.tsx
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Loader2, Lock, Trash2, Info } from "lucide-react";

interface DealLocation {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  city?: string;
  state?: string;
  addedAt: string;
}

export default function ClosedDealsAdmin() {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [locations, setLocations] = useState<DealLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // include session cookie
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setPassword("");
        toast({
          title: "✅ Access Granted",
          description: "You can now manage deal locations",
        });
        loadLocations();
      } else {
        toast({
          title: "❌ Access Denied",
          description: data?.error || "Incorrect password",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      toast({
        title: "❌ Error",
        description: "Login failed",
        variant: "destructive",
      });
    }
  };

  const checkAuthStatus = async () => {
    try {
      const resp = await fetch("/api/admin/status", { credentials: "include" });
      const data = await resp.json();
      if (resp.ok && data.isAdmin) {
        setIsAuthenticated(true);
        loadLocations();
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Auth status error:", err);
    }
  };

  const loadLocations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/deals/locations");
      const data = await response.json();
      if (data && Array.isArray(data.locations)) {
        setLocations(data.locations);
      } else if (Array.isArray(data)) {
        setLocations(data);
      } else {
        setLocations([]);
      }
    } catch (error) {
      console.error("Error loading locations:", error);
      toast({
        title: "❌ Error",
        description: "Failed to load deal locations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleMapClick = async (e: React.MouseEvent<SVGSVGElement>) => {
    // allow only when authenticated (server also enforces)
    if (!isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please login to add deal locations",
        variant: "destructive",
      });
      return;
    }

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 1000;
    const svgY = ((e.clientY - rect.top) / rect.height) * 589;

    // Convert SVG coordinates back to lat/lng
    const minLng = -125;
    const maxLng = -66.9;
    const minLat = 24.5;
    const maxLat = 49.4;

    const lng = minLng + (svgX / 1000) * (maxLng - minLng);
    const lat = maxLat - (svgY / 589) * (maxLat - minLat);

    try {
      const response = await fetch("/api/deals/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // include session cookie
        body: JSON.stringify({ lat, lng }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "✅ Location Added",
          description: `Deal location added at (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
        });
        setLocations((prev) => [...prev, data.location]);
      } else {
        toast({
          title: "❌ Error",
          description: data?.error || "Failed to add deal location",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding location:", error);
      toast({
        title: "❌ Error",
        description: "Failed to add deal location. Make sure the server is running.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this deal location?")) {
      return;
    }

    setProcessingId(id);
    try {
      const response = await fetch(`/api/deals/locations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "🗑️ Deleted",
          description: "Deal location has been removed",
        });
        setLocations((prev) => prev.filter((loc) => loc.id !== id));
      } else {
        toast({
          title: "❌ Error",
          description: data?.error || "Failed to delete location",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      toast({
        title: "❌ Error",
        description: "Failed to delete location",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleStartEdit = (location: DealLocation) => {
    setEditingId(location.id);
    setEditingName(location.name || "");
  };

  const handleSaveName = async (id: string) => {
    if (editingName === locations.find((loc) => loc.id === id)?.name) {
      setEditingId(null);
      return;
    }

    setProcessingId(id);
    try {
      const response = await fetch(`/api/deals/locations/${id}/name`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: editingName }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "✅ Updated",
          description: "Location name has been updated",
        });
        setLocations((prev) => prev.map((loc) => (loc.id === id ? { ...loc, name: editingName } : loc)));
        setEditingId(null);
      } else {
        toast({
          title: "❌ Error",
          description: data?.error || "Failed to update name",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating name:", error);
      toast({
        title: "❌ Error",
        description: "Failed to update name",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleLogout = async () => {
    try {
      const resp = await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setIsAuthenticated(false);
        toast({ title: "Logged out" });
      } else {
        toast({ title: "Logout failed", variant: "destructive" });
      }
    } catch (err) {
      console.error("Logout error:", err);
      toast({ title: "Logout failed", variant: "destructive" });
    }
  };

  // Convert lat/lng to SVG coordinates for the US map
  // US bounds: lat 24.5-49.4, lng -125 to -66.9
  const latLngToXY = (lat: number, lng: number) => {
    const svgWidth = 1000;
    const svgHeight = 589;

    const minLng = -125;
    const maxLng = -66.9;
    const minLat = 24.5;
    const maxLat = 49.4;

    const x = ((lng - minLng) / (maxLng - minLng)) * svgWidth;
    const y = ((maxLat - lat) / (maxLat - minLat)) * svgHeight;

    return { x, y };
  };

  useEffect(() => {
    // loadLocations is called after successful auth or on login,
    // but we can load public locations even if not authenticated:
    loadLocations();
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 flex items-center justify-center py-16 bg-muted/30">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Admin Access Required</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Lock className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Manage Closed Deals</h1>
              <p className="text-muted-foreground">Click on the map to add deal locations</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Map */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Interactive Map
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-900">Click anywhere on the map to add a green pin for a closed deal location.</p>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="relative w-full" style={{ paddingBottom: "60%" }}>
                      <svg viewBox="0 0 1000 589" className="absolute inset-0 w-full h-full cursor-crosshair" onClick={handleMapClick} style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}>
                        {/* Background */}
                        <rect x="0" y="0" width="1000" height="589" fill="#f3f4f6" />
                        {/* Use the US map as background image */}
                        <image href="/us.jpg" x="0" y="0" width="1000" height="589" opacity="1" style={{ pointerEvents: "none" }} />

                        {/* Pins for each location */}
                        {locations.map((location) => {
                          const { x, y } = latLngToXY(location.lat, location.lng);
                          const isHovered = hoveredId === location.id;
                          return (
                            <g key={location.id} onMouseEnter={() => setHoveredId(location.id)} onMouseLeave={() => setHoveredId(null)} style={{ cursor: "pointer" }}>
                              {/* Pulsing circle */}
                              <circle cx={x} cy={y} r="12" fill={isHovered ? "#22c55e" : "#16a34a"} opacity="0.3">
                                <animate attributeName="r" from="12" to="24" dur="2s" repeatCount="indefinite" />
                                <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
                              </circle>
                              {/* Main pin */}
                              <circle cx={x} cy={y} r="8" fill="#16a34a" stroke="white" strokeWidth="2" />
                              {/* Actions */}
                              {isHovered && (
                                <g>
                                  <rect x={x + 12} y={y - 16} rx={6} ry={6} width={140} height={32} fill="#111827" opacity="0.9" />
                                  <text x={x + 18} y={y + 7} fill="#fff" fontSize="12">
                                    {location.name || `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}`}
                                  </text>
                                  <g transform={`translate(${x + 12}, ${y + 36})`}>
                                    <button
                                      onClick={() => {
                                        if (!confirm("Delete this location?")) return;
                                        handleDelete(location.id);
                                      }}
                                      className="ml-2"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                    <button
                                      onClick={() => handleStartEdit(location)}
                                      className="ml-3"
                                    >
                                      Edit
                                    </button>
                                  </g>
                                </g>
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right column: location list / edit */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {locations.map((loc) => (
                      <div key={loc.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{loc.name || `${loc.lat.toFixed(2)}, ${loc.lng.toFixed(2)}`}</div>
                          <div className="text-xs text-muted-foreground">{loc.city || loc.state || loc.addedAt}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleStartEdit(loc)}>
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(loc.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}

                    {editingId && (
                      <div className="mt-4">
                        <Label>Name</Label>
                        <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} />
                        <div className="mt-2 flex gap-2">
                          <Button onClick={() => editingId && handleSaveName(editingId)}>Save</Button>
                          <Button variant="outline" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
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
