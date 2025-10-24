import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Video, Loader2 } from "lucide-react";

export default function UploadTestimonial() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    testimonialText: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file type
      if (!file.type.startsWith("video/")) {
        toast({
          title: "❌ Invalid File",
          description: "Please upload a video file (MP4, MOV, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "❌ File Too Large",
          description: "Video must be less than 100MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast({
        title: "❌ No Video Selected",
        description: "Please select a video to upload",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("video", selectedFile);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("testimonialText", formData.testimonialText);

      const response = await fetch("/api/testimonials/upload", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✅ Success!",
          description:
            "Your video testimonial has been submitted for review. Thank you!",
        });

        // Reset form
        setFormData({ name: "", testimonialText: "" });
        setSelectedFile(null);
        const fileInput = document.getElementById(
          "video-upload"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        toast({
          title: "❌ Upload Failed",
          description:
            data.error || "Failed to upload video. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      toast({
        title: "❌ Error",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16 md:py-24 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Share Your Experience
              </h1>
              <p className="text-lg text-muted-foreground">
                We'd love to hear about your experience with Evergreen Land
                Investments. Upload a video testimonial to share your story!
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-6 h-6" />
                  Upload Video Testimonial
                </CardTitle>
                <CardDescription>
                  Your testimonial will be reviewed before appearing on our
                  website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Video Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="video-upload">Video Testimonial *</Label>
                    <div className="flex flex-col gap-2">
                      <Input
                        id="video-upload"
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        required
                        className="cursor-pointer"
                      />
                      {selectedFile && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Video className="w-4 h-4" />
                          <span>{selectedFile.name}</span>
                          <span className="text-xs">
                            ({(selectedFile.size / (1024 * 1024)).toFixed(2)}{" "}
                            MB)
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Max file size: 100MB. Supported formats: MP4, MOV, AVI,
                        etc.
                      </p>
                    </div>
                  </div>

                  {/* Testimonial Text (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="testimonial">
                      Written Testimonial (Optional)
                    </Label>
                    <Textarea
                      id="testimonial"
                      value={formData.testimonialText}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          testimonialText: e.target.value,
                        })
                      }
                      placeholder="Share your experience in writing..."
                      rows={4}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Submit Testimonial
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By submitting this testimonial, you agree to let Evergreen
                    Land Investments use your video and name on their website
                    and marketing materials.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
