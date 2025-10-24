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

    // Require at least video OR written testimonial
    if (!selectedFile && !formData.testimonialText.trim()) {
      toast({
        title: "❌ Missing Content",
        description:
          "Please provide either a video, written testimonial, or both",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      if (selectedFile) {
        formDataToSend.append("video", selectedFile);
      }
      formDataToSend.append("name", formData.name);
      formDataToSend.append("testimonialText", formData.testimonialText);

      const response = await fetch("/api/testimonials/upload", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        const hasVideo = !!selectedFile;
        const hasText = !!formData.testimonialText.trim();
        let description =
          "Your testimonial has been submitted successfully. Thank you!";

        if (hasVideo && hasText) {
          description =
            "Your video and written testimonial have been submitted. Thank you!";
        } else if (hasVideo) {
          description = "Your video testimonial has been submitted. Thank you!";
        } else if (hasText) {
          description =
            "Your written testimonial has been submitted. Thank you!";
        }

        toast({
          title: "✅ Success!",
          description,
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
              <p className="text-lg text-muted-foreground mb-2">
                We'd love to hear about your experience with Evergreen Land
                Investments!
              </p>
              <p className="text-base text-muted-foreground">
                Share your story with a video, write a review, or both – it's up
                to you!
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  Share Your Testimonial
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  <strong>Choose your preferred format:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Write a text review (quick and easy)</li>
                    <li>Record a video testimonial (more personal)</li>
                    <li>Do both for maximum impact!</li>
                  </ul>
                  <span className="block mt-3 text-sm">
                    All testimonials are reviewed before appearing on our
                    website.
                  </span>
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

                  {/* Testimonial Text - Moved to top for prominence */}
                  <div className="space-y-2">
                    <Label htmlFor="testimonial" className="text-base">
                      Written Testimonial
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Share your experience with Evergreen Land Investments in
                      your own words. Tell us what you appreciated most about
                      working with us!
                    </p>
                    <p className="text-xs text-muted-foreground italic">
                      * You must provide either a written testimonial, a video,
                      or both
                    </p>
                    <Textarea
                      id="testimonial"
                      value={formData.testimonialText}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          testimonialText: e.target.value,
                        })
                      }
                      placeholder="Example: Working with Evergreen was a breeze! They made the entire process smooth and stress-free. I highly recommend them to anyone looking to sell their land quickly and fairly."
                      rows={6}
                      className="resize-y"
                    />
                  </div>

                  {/* Video Upload - Now comes after text */}
                  <div className="space-y-2">
                    <Label htmlFor="video-upload">
                      Video Testimonial (Optional)
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Want to add a personal touch? Upload a video testimonial!
                    </p>
                    <div className="flex flex-col gap-2">
                      <Input
                        id="video-upload"
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
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
