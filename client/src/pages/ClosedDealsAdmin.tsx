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

  const ADMIN_PASSWORD = "evergreen-admin-2025";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("dealsAdminAuth", "true");
      toast({
        title: "✅ Access Granted",
        description: "You can now manage deal locations",
      });
      loadLocations();
    } else {
      toast({
        title: "❌ Access Denied",
        description: "Incorrect password",
        variant: "destructive",
      });
    }
  };

  const loadLocations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/deals/locations");
      const data = await response.json();
      if (data.success) {
        setLocations(data.locations);
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

  const handleMapClick = async (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isAuthenticated) return;

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
        body: JSON.stringify({ lat, lng }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✅ Location Added",
          description: `Deal location added at (${lat.toFixed(
            2
          )}, ${lng.toFixed(2)})`,
        });
        setLocations([...locations, data.location]);
      } else {
        toast({
          title: "❌ Error",
          description: data.error || "Failed to add deal location",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding location:", error);
      toast({
        title: "❌ Error",
        description:
          "Failed to add deal location. Make sure the server is running.",
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
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "🗑️ Deleted",
          description: "Deal location has been removed",
        });
        setLocations(locations.filter((loc) => loc.id !== id));
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
        body: JSON.stringify({ name: editingName }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✅ Updated",
          description: "Location name has been updated",
        });
        setLocations(
          locations.map((loc) =>
            loc.id === id ? { ...loc, name: editingName } : loc
          )
        );
        setEditingId(null);
      } else {
        toast({
          title: "❌ Error",
          description: data.error || "Failed to update name",
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

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("dealsAdminAuth");
    setPassword("");
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
    const authStatus = localStorage.getItem("dealsAdminAuth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      loadLocations();
    }
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
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Manage Closed Deals
              </h1>
              <p className="text-muted-foreground">
                Click on the map to add deal locations
              </p>
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
                    <p className="text-sm text-blue-900">
                      Click anywhere on the map to add a green pin for a closed
                      deal location.
                    </p>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div
                      className="relative w-full"
                      style={{ paddingBottom: "60%" }}
                    >
                      <svg
                        viewBox="0 0 1000 589"
                        className="absolute inset-0 w-full h-full cursor-crosshair"
                        onClick={handleMapClick}
                        style={{
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                        }}
                      >
                        {/* Background */}
                        <rect
                          x="0"
                          y="0"
                          width="1000"
                          height="589"
                          fill="#f3f4f6"
                        />

                        {/* Use the US map as background image */}
                        <image
                          href="/us.jpg"
                          x="0"
                          y="0"
                          width="1000"
                          height="589"
                          opacity="1"
                          style={{ pointerEvents: "none" }}
                        />

                        {/* Pins for each location */}
                        {locations.map((location) => {
                          const { x, y } = latLngToXY(
                            location.lat,
                            location.lng
                          );
                          const isHovered = hoveredId === location.id;
                          return (
                            <g
                              key={location.id}
                              onMouseEnter={() => setHoveredId(location.id)}
                              onMouseLeave={() => setHoveredId(null)}
                              style={{ cursor: "pointer" }}
                            >
                              {/* Pulsing circle */}
                              <circle
                                cx={x}
                                cy={y}
                                r="12"
                                fill={isHovered ? "#22c55e" : "#16a34a"}
                                opacity="0.3"
                              >
                                <animate
                                  attributeName="r"
                                  from="12"
                                  to="24"
                                  dur="2s"
                                  repeatCount="indefinite"
                                />
                                <animate
                                  attributeName="opacity"
                                  from="0.3"
                                  to="0"
                                  dur="2s"
                                  repeatCount="indefinite"
                                />
                              </circle>
                              {/* Main pin */}
                              <circle
                                cx={x}
                                cy={y}
                                r={isHovered ? 10 : 8}
                                fill={isHovered ? "#22c55e" : "#16a34a"}
                                stroke="white"
                                strokeWidth="2"
                              />
                              {/* Tooltip */}
                              <title>
                                {location.name ||
                                  (location.city && location.state
                                    ? `${location.city}, ${location.state}`
                                    : `Deal (${location.lat.toFixed(
                                        2
                                      )}, ${location.lng.toFixed(2)})`)}
                              </title>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">
                      {locations.length}{" "}
                      {locations.length === 1 ? "Location" : "Locations"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Locations List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Deal Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  {locations.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No locations added yet. Click on the map to add one!
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {locations.map((location) => {
                        const isHovered = hoveredId === location.id;
                        const isEditing = editingId === location.id;
                        return (
                          <div
                            key={location.id}
                            onMouseEnter={() => setHoveredId(location.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className={`flex items-start justify-between gap-2 p-3 rounded-lg transition-all ${
                              isHovered
                                ? "bg-green-50 border-2 border-green-500 scale-105"
                                : "bg-muted border-2 border-transparent"
                            }`}
                          >
                            <div className="flex-1 min-w-0 space-y-2">
                              {/* Name field */}
                              {isEditing ? (
                                <div className="space-y-2">
                                  <Input
                                    value={editingName}
                                    onChange={(e) =>
                                      setEditingName(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        handleSaveName(location.id);
                                      } else if (e.key === "Escape") {
                                        handleCancelEdit();
                                      }
                                    }}
                                    placeholder="Enter location name..."
                                    className="h-8 text-sm"
                                    autoFocus
                                  />
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleSaveName(location.id)
                                      }
                                      disabled={processingId === location.id}
                                      className="h-7 text-xs"
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleCancelEdit}
                                      className="h-7 text-xs"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  onClick={() => handleStartEdit(location)}
                                  className="cursor-pointer hover:text-primary transition-colors"
                                >
                                  <p className="text-sm font-medium">
                                    {location.name || (
                                      <span className="text-muted-foreground italic">
                                        Click to add name...
                                      </span>
                                    )}
                                  </p>
                                </div>
                              )}

                              {/* Location details */}
                              <p className="text-xs text-muted-foreground">
                                📍{" "}
                                {location.city && location.state
                                  ? `${location.city}, ${location.state}`
                                  : `${location.lat.toFixed(
                                      2
                                    )}, ${location.lng.toFixed(2)}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                📅{" "}
                                {new Date(
                                  location.addedAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(location.id)}
                              disabled={
                                processingId === location.id || isEditing
                              }
                              className="text-destructive hover:text-destructive"
                            >
                              {processingId === location.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
