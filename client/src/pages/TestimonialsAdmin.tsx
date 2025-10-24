import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, CheckCircle, XCircle, Video, Loader2 } from "lucide-react";

interface PendingTestimonial {
  id: string;
  name: string;
  testimonialText: string;
  videoUrl?: string;
  hasVideo: boolean;
  uploadedAt: string;
}

export default function TestimonialsAdmin() {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingTestimonials, setPendingTestimonials] = useState<
    PendingTestimonial[]
  >([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const ADMIN_PASSWORD = "evergreen-admin-2025"; // Change this to your preferred password

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("adminAuth", "true");
      toast({
        title: "✅ Access Granted",
        description: "Welcome to the admin dashboard",
      });
      loadPendingTestimonials();
    } else {
      toast({
        title: "❌ Access Denied",
        description: "Incorrect password",
        variant: "destructive",
      });
    }
  };

  const loadPendingTestimonials = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/testimonials/pending");
      const data = await response.json();

      if (data.success) {
        setPendingTestimonials(data.testimonials);
      }
    } catch (error) {
      console.error("Error loading testimonials:", error);
      toast({
        title: "❌ Error",
        description: "Failed to load pending testimonials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const response = await fetch(`/api/testimonials/approve/${id}`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✅ Approved",
          description: "Testimonial is now live on the website",
        });
        setPendingTestimonials((prev) => prev.filter((t) => t.id !== id));
      } else {
        toast({
          title: "❌ Error",
          description: data.error || "Failed to approve testimonial",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error approving testimonial:", error);
      toast({
        title: "❌ Error",
        description: "Failed to approve testimonial",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to reject and delete this testimonial? This action cannot be undone."
      )
    ) {
      return;
    }

    setProcessingId(id);
    try {
      const response = await fetch(`/api/testimonials/reject/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "🗑️ Rejected",
          description: "Testimonial has been deleted",
        });
        setPendingTestimonials((prev) => prev.filter((t) => t.id !== id));
      } else {
        toast({
          title: "❌ Error",
          description: data.error || "Failed to reject testimonial",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error rejecting testimonial:", error);
      toast({
        title: "❌ Error",
        description: "Failed to reject testimonial",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminAuth");
    setPassword("");
  };

  useEffect(() => {
    // Check if already authenticated
    const authStatus = localStorage.getItem("adminAuth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      loadPendingTestimonials();
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
              <CardDescription>
                Enter the admin password to manage testimonials
              </CardDescription>
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
                Testimonials Admin
              </h1>
              <p className="text-muted-foreground">
                Review and manage testimonials (video and written)
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : pendingTestimonials.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">
                  No pending testimonials to review
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {pendingTestimonials.map((testimonial) => (
                <Card key={testimonial.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{testimonial.name}</span>
                      <span className="text-sm text-muted-foreground font-normal">
                        {new Date(testimonial.uploadedAt).toLocaleDateString()}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Type Badge */}
                    <div className="flex gap-2">
                      {testimonial.hasVideo && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          Video
                        </span>
                      )}
                      {testimonial.testimonialText && (
                        <span className="text-xs bg-secondary/10 text-secondary-foreground px-2 py-1 rounded">
                          Written
                        </span>
                      )}
                    </div>

                    {/* Video Preview */}
                    {testimonial.hasVideo && testimonial.videoUrl && (
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <video
                          controls
                          className="w-full h-full"
                          src={testimonial.videoUrl}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}

                    {/* Testimonial Text */}
                    {testimonial.testimonialText && (
                      <div className="space-y-2">
                        <Label>Written Testimonial:</Label>
                        <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg whitespace-pre-wrap">
                          {testimonial.testimonialText}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApprove(testimonial.id)}
                        disabled={processingId === testimonial.id}
                        className="flex-1"
                      >
                        {processingId === testimonial.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(testimonial.id)}
                        disabled={processingId === testimonial.id}
                        variant="destructive"
                        className="flex-1"
                      >
                        {processingId === testimonial.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
