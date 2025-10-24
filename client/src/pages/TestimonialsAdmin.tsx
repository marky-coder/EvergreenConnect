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
import {
  Lock,
  CheckCircle,
  XCircle,
  Video,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PendingTestimonial {
  id: string;
  name: string;
  testimonialText: string;
  videoUrl?: string;
  hasVideo: boolean;
  uploadedAt: string;
  status?: string;
}

export default function TestimonialsAdmin() {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingTestimonials, setPendingTestimonials] = useState<
    PendingTestimonial[]
  >([]);
  const [approvedTestimonials, setApprovedTestimonials] = useState<
    PendingTestimonial[]
  >([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] =
    useState<PendingTestimonial | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    testimonialText: "",
  });
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");

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
      loadAllTestimonials();
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

  const loadApprovedTestimonials = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/testimonials/approved");
      const data = await response.json();

      if (data.success) {
        setApprovedTestimonials(data.testimonials);
      }
    } catch (error) {
      console.error("Error loading approved testimonials:", error);
      toast({
        title: "❌ Error",
        description: "Failed to load approved testimonials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllTestimonials = async () => {
    await Promise.all([loadPendingTestimonials(), loadApprovedTestimonials()]);
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
        // Reload approved testimonials to show the newly approved one
        loadApprovedTestimonials();
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

  const handleEditClick = (testimonial: PendingTestimonial) => {
    setEditingTestimonial(testimonial);
    setEditFormData({
      name: testimonial.name,
      testimonialText: testimonial.testimonialText || "",
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingTestimonial) return;

    setProcessingId(editingTestimonial.id);
    try {
      const response = await fetch(
        `/api/testimonials/edit/${editingTestimonial.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editFormData),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✅ Updated",
          description: "Testimonial has been updated",
        });
        // Update the testimonial in the correct list based on status
        const isApproved = editingTestimonial.status === "approved";
        if (isApproved) {
          setApprovedTestimonials((prev) =>
            prev.map((t) =>
              t.id === editingTestimonial.id ? { ...t, ...editFormData } : t
            )
          );
        } else {
          setPendingTestimonials((prev) =>
            prev.map((t) =>
              t.id === editingTestimonial.id ? { ...t, ...editFormData } : t
            )
          );
        }
        setEditDialogOpen(false);
        setEditingTestimonial(null);
      } else {
        toast({
          title: "❌ Error",
          description: data.error || "Failed to update testimonial",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating testimonial:", error);
      toast({
        title: "❌ Error",
        description: "Failed to update testimonial",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteVideo = async (
    id: string,
    name: string,
    isApproved = false
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete the video from ${name}'s testimonial? The written testimonial will be kept.`
      )
    ) {
      return;
    }

    setProcessingId(id);
    try {
      const response = await fetch(`/api/testimonials/${id}/video`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "🗑️ Video Deleted",
          description: "Video has been removed from testimonial",
        });
        // Update the testimonial in the list
        if (isApproved) {
          setApprovedTestimonials((prev) =>
            prev.map((t) =>
              t.id === id ? { ...t, hasVideo: false, videoUrl: undefined } : t
            )
          );
        } else {
          setPendingTestimonials((prev) =>
            prev.map((t) =>
              t.id === id ? { ...t, hasVideo: false, videoUrl: undefined } : t
            )
          );
        }
      } else {
        toast({
          title: "❌ Error",
          description: data.error || "Failed to delete video",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      toast({
        title: "❌ Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteText = async (
    id: string,
    name: string,
    isApproved = false
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete the written testimonial from ${name}? The video will be kept.`
      )
    ) {
      return;
    }

    setProcessingId(id);
    try {
      const response = await fetch(`/api/testimonials/${id}/text`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "🗑️ Text Deleted",
          description: "Written testimonial has been removed",
        });
        // Update the testimonial in the list
        if (isApproved) {
          setApprovedTestimonials((prev) =>
            prev.map((t) => (t.id === id ? { ...t, testimonialText: "" } : t))
          );
        } else {
          setPendingTestimonials((prev) =>
            prev.map((t) => (t.id === id ? { ...t, testimonialText: "" } : t))
          );
        }
      } else {
        toast({
          title: "❌ Error",
          description: data.error || "Failed to delete text",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting text:", error);
      toast({
        title: "❌ Error",
        description: "Failed to delete text",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteApproved = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete ${name}'s approved testimonial? This action cannot be undone.`
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
          title: "🗑️ Deleted",
          description: "Approved testimonial has been permanently deleted",
        });
        setApprovedTestimonials((prev) => prev.filter((t) => t.id !== id));
      } else {
        toast({
          title: "❌ Error",
          description: data.error || "Failed to delete testimonial",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast({
        title: "❌ Error",
        description: "Failed to delete testimonial",
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
      loadAllTestimonials();
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

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "pending" | "approved")}
          >
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
              <TabsTrigger value="pending">
                Pending ({pendingTestimonials.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({approvedTestimonials.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
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
                            {new Date(
                              testimonial.uploadedAt
                            ).toLocaleDateString()}
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
                          <div className="space-y-2">
                            <div className="aspect-video bg-black rounded-lg overflow-hidden">
                              <video
                                controls
                                className="w-full h-full"
                                src={testimonial.videoUrl}
                              >
                                Your browser does not support the video tag.
                              </video>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeleteVideo(
                                  testimonial.id,
                                  testimonial.name
                                )
                              }
                              disabled={processingId === testimonial.id}
                              className="w-full text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Video Only
                            </Button>
                          </div>
                        )}

                        {/* Testimonial Text */}
                        {testimonial.testimonialText && (
                          <div className="space-y-2">
                            <Label>Written Testimonial:</Label>
                            <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg whitespace-pre-wrap">
                              {testimonial.testimonialText}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeleteText(
                                  testimonial.id,
                                  testimonial.name
                                )
                              }
                              disabled={processingId === testimonial.id}
                              className="w-full text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Text Only
                            </Button>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-2">
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
                          <Button
                            onClick={() => handleEditClick(testimonial)}
                            disabled={processingId === testimonial.id}
                            variant="outline"
                            className="w-full"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Testimonial
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : approvedTestimonials.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">
                      No approved testimonials yet
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {approvedTestimonials.map((testimonial) => (
                    <Card key={testimonial.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{testimonial.name}</span>
                          <span className="text-sm text-muted-foreground font-normal">
                            {new Date(
                              testimonial.uploadedAt
                            ).toLocaleDateString()}
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
                          <span className="text-xs bg-green-500/10 text-green-700 px-2 py-1 rounded">
                            ✓ Approved
                          </span>
                        </div>

                        {/* Video Preview */}
                        {testimonial.hasVideo && testimonial.videoUrl && (
                          <div className="space-y-2">
                            <div className="aspect-video bg-black rounded-lg overflow-hidden">
                              <video
                                controls
                                className="w-full h-full"
                                src={testimonial.videoUrl}
                              >
                                Your browser does not support the video tag.
                              </video>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeleteVideo(
                                  testimonial.id,
                                  testimonial.name,
                                  true
                                )
                              }
                              disabled={processingId === testimonial.id}
                              className="w-full text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Video Only
                            </Button>
                          </div>
                        )}

                        {/* Testimonial Text */}
                        {testimonial.testimonialText && (
                          <div className="space-y-2">
                            <Label>Written Testimonial:</Label>
                            <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg whitespace-pre-wrap">
                              {testimonial.testimonialText}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeleteText(
                                  testimonial.id,
                                  testimonial.name,
                                  true
                                )
                              }
                              disabled={processingId === testimonial.id}
                              className="w-full text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Text Only
                            </Button>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-2">
                          <Button
                            onClick={() => handleEditClick(testimonial)}
                            disabled={processingId === testimonial.id}
                            variant="outline"
                            className="w-full"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Testimonial
                          </Button>
                          <Button
                            onClick={() =>
                              handleDeleteApproved(
                                testimonial.id,
                                testimonial.name
                              )
                            }
                            disabled={processingId === testimonial.id}
                            variant="destructive"
                            className="w-full"
                          >
                            {processingId === testimonial.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-2" />
                            )}
                            Delete Entire Testimonial
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Testimonial</DialogTitle>
            <DialogDescription>
              Make changes to the testimonial. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                placeholder="Enter name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-text">Written Testimonial</Label>
              <Textarea
                id="edit-text"
                value={editFormData.testimonialText}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    testimonialText: e.target.value,
                  })
                }
                placeholder="Enter testimonial text"
                rows={6}
              />
            </div>
            {editingTestimonial?.hasVideo && (
              <p className="text-sm text-muted-foreground">
                Note: Video cannot be edited. Use the "Delete Video Only" button
                if you need to remove it.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={processingId === editingTestimonial?.id}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={
                processingId === editingTestimonial?.id ||
                !editFormData.name.trim()
              }
            >
              {processingId === editingTestimonial?.id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
