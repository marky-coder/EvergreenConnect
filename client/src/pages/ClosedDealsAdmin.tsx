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
import { v4 as uuidv4 } from "uuid";
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

const ADMIN_PASSWORD_CLIENT = "VitaTalent2025!";
const CLIENT_ONLY_FLAG = "closedDeals_clientOnlyAdmin_v1";

/**
 * ClosedDealsAdmin
 *
 * This admin page supports two modes:
 *  - server-backed admin: tries to POST to /api/admin/login and then uses credentials:include to
 *    add/delete/edit locations on the server (normal mode).
 *  - client-only admin: if the POST to /api/admin/login fails with a 405 or network error,
 *    we fall back to a local-only admin mode that keeps changes in memory and allows you to
 *    export a JSON file you can paste into the repo at:
 *      https://github.com/marky-coder/EvergreenConnect/edit/main/client/src/data/deals-locations.json
 *
 * The client-only mode is useful when the site is hosted statically (GitHub Pages / CDN) and
 * the origin refuses POSTs. It keeps everything on GitHub (no new host required).
 */
export default function ClosedDealsAdmin() {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClientOnlyAdmin, setIsClientOnlyAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [locations, setLocations] = useState<DealLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Load locations from server if available, otherwise from bundled data
  const loadLocations = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch("/api/deals/locations");
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data?.locations)) setLocations(data.locations);
        else if (Array.isArray(data)) setLocations(data);
        else setLocations(defaultData.locations);
      } else {
        // if server returns 404/500, fallback to bundled
        setLocations(defaultData.locations);
      }
    } catch (err) {
      // network error, fallback
      setLocations(defaultData.locations);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // if client-only flag present, treat user as client-only admin
    const flag = localStorage.getItem(CLIENT_ONLY_FLAG);
    if (flag === "true") {
      setIsClientOnlyAdmin(true);
      setIsAuthenticated(true);
      // load locations from bundled (or optionally from repo)
      setLocations(defaultData.locations);
    } else {
      loadLocations();
      // also check server auth status
      checkAuthStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthStatus = async () => {
    try {
      const resp = await fetch("/api/admin/status", { credentials: "include" });
      if (!resp.ok) {
        setIsAuthenticated(false);
        return;
      }
      const json = await resp.json();
      if (json?.isAdmin) {
        setIsAuthenticated(true);
        setIsClientOnlyAdmin(false);
        loadLocations();
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      setIsAuthenticated(false);
    }
  };

  const tryServerLogin = async (pw: string) => {
    try {
      const resp = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: pw }),
      });

      // If origin returns 405, it is a static host / CDN — fallback
      if (resp.status === 405) {
        return { ok: false, status: 405 };
      }

      // If network failed, this will throw earlier
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        return { ok: false, status: resp.status, data };
      }

      const data = await resp.json();
      if (data?.success) return { ok: true, status: resp.status, data };
      return { ok: false, status: resp.status, data };
    } catch (err: any) {
      // network error (e.g. blocked by CDN), return as failure
      return { ok: false, status: 0, error: String(err?.message ?? err) };
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // try server login first
    const result = await tryServerLogin(password);

    if (result.ok) {
      setIsAuthenticated(true);
      setIsClientOnlyAdmin(false);
      setPassword("");
      toast({ title: "✅ Access Granted", description: "You are logged in as admin (server mode)." });
      // refresh locations from server
      await loadLocations();
      return;
    }

    // If server responded 405 or network error -> fallback to client-only admin
    if (result.status === 405 || result.status === 0) {
      // verify password locally
      if (password === ADMIN_PASSWORD_CLIENT) {
        setIsAuthenticated(true);
        setIsClientOnlyAdmin(true);
        localStorage.setItem(CLIENT_ONLY_FLAG, "true");
        setPassword("");
        setLocations(defaultData.locations.slice(0)); // clone
        toast({
          title: "⚠️ Client-only Admin",
          description:
            "Server POSTs are not accepted on this host. You are now admin in this browser only. Changes are local — use Export Locations JSON and update the repository via GitHub to persist for everyone.",
        });
        return;
      } else {
        toast({ title: "❌ Access Denied", description: "Incorrect password (client-only)" , variant: "destructive"});
        return;
      }
    }

    // server returned 401/400 etc.
    toast({ title: "❌ Login failed", description: result.data?.error || "Invalid password", variant: "destructive" });
  };

  // Add location
  const handleMapClick = async (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 1000;
    const svgY = ((e.clientY - rect.top) / rect.height) * 589;

    const minLng = -125;
    const maxLng = -66.9;
    const minLat = 24.5;
    const maxLat = 49.4;

    const lng = minLng + (svgX / 1000) * (maxLng - minLng);
    const lat = maxLat - (svgY / 589) * (maxLat - minLat);

    if (!isAuthenticated) {
      toast({ title: "Unauthorized", description: "Please login to add deal locations", variant: "destructive" });
      return;
    }

    if (isClientOnlyAdmin) {
      // local-only add
      const newLoc: DealLocation = {
        id: uuidv4(),
        lat,
        lng,
        name: `Manual ${new Date().toISOString()}`,
        addedAt: new Date().toISOString(),
      };
      setLocations((p) => [...p, newLoc]);
      toast({ title: "Added (local)", description: "Location added locally — export and commit to repo to persist." });
      return;
    }

    // server-backed add
    setProcessingId("adding");
    try {
      const resp = await fetch("/api/deals/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lat, lng }),
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setLocations((p) => [...p, data.location]);
        toast({ title: "✅ Location Added", description: `Added at (${lat.toFixed(2)}, ${lng.toFixed(2)})` });
      } else {
        toast({ title: "❌ Error", description: data?.error || "Failed to add", variant: "destructive" });
      }
    } catch (err) {
      console.error("Error adding location:", err);
      toast({ title: "❌ Error", description: "Failed to add location", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this deal location?")) return;

    if (isClientOnlyAdmin) {
      setLocations((p) => p.filter((l) => l.id !== id));
      toast({ title: "Deleted (local)", description: "Removed locally — export and commit to repo to persist." });
      return;
    }

    setProcessingId(id);
    try {
      const resp = await fetch(`/api/deals/locations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setLocations((p) => p.filter((l) => l.id !== id));
        toast({ title: "🗑️ Deleted", description: "Deal location removed" });
      } else {
        toast({ title: "❌ Error", description: data?.error || "Failed to delete", variant: "destructive" });
      }
    } catch (err) {
      console.error("Error deleting location:", err);
      toast({ title: "❌ Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  // Edit name
  const handleStartEdit = (location: DealLocation) => {
    setEditingId(location.id);
    setEditingName(location.name || "");
  };

  const handleSaveName = async (id: string) => {
    if (isClientOnlyAdmin) {
      setLocations((p) => p.map((l) => (l.id === id ? { ...l, name: editingName } : l)));
      setEditingId(null);
      toast({ title: "Updated (local)", description: "Name updated locally — export and commit to repo to persist." });
      return;
    }

    setProcessingId(id);
    try {
      const resp = await fetch(`/api/deals/locations/${id}/name`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: editingName }),
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setLocations((p) => p.map((l) => (l.id === id ? { ...l, name: editingName } : l)));
        setEditingId(null);
        toast({ title: "✅ Updated", description: "Location name updated" });
      } else {
        toast({ title: "❌ Error", description: data?.error || "Failed to update", variant: "destructive" });
      }
    } catch (err) {
      console.error("Error updating name:", err);
      toast({ title: "❌ Error", description: "Failed to update", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleLogout = async () => {
    if (isClientOnlyAdmin) {
      localStorage.removeItem(CLIENT_ONLY_FLAG);
      setIsClientOnlyAdmin(false);
      setIsAuthenticated(false);
      toast({ title: "Logged out (client-only)" });
      return;
    }

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
      toast({ title: "Logout failed", va
