import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star,
  Quote,
  Video,
  MessageSquare,
  Loader2,
  Upload as UploadIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Testimonial {
  name: string;
  content: string;
  rating: number;
  type: "text";
}

interface VideoTestimonial {
  id?: string;
  name: string;
  videoUrl: string;
  testimonialText?: string;
  thumbnail?: string;
  rating: number;
  type: "video";
}

type TestimonialType = Testimonial | VideoTestimonial;

const staticTestimonials: Testimonial[] = [
  {
    name: "Brian",
    content:
      "I had the pleasure of working with Lindsey on an investment purchase in Vista. The one word that comes to mind when I think of that transaction is dedication. He went above and beyond to help us navigate a tricky situation with the sellers. He always had our best interest in mind irrespective of what was best for him or his paycheck. That is a rare thing in the real estate business. Hiring Lindsey would be hiring a servant leader that will put others' needs first to get the job done.",
    rating: 5,
    type: "text",
  },
  {
    name: "Alix & Audrey",
    content:
      "We can't say enough good things about Lindsey! He really worked so hard to make our dream a reality, and we couldn't be more thankful or eager to recommend him. His immense knowledge of the market, his connections, and his confidence really made purchasing a home an exciting and wonderful experience.",
    rating: 5,
    type: "text",
  },
  {
    name: "Dean",
    content:
      "These are the guys that put your interests first. My experience with Steven has been top-notch. He was superb in providing me with what I needed and was a great listener. Steven took care of my needs. I recommend these people since I had such a great experience with Steven.",
    rating: 5,
    type: "text",
  },
];

export default function Testimonials() {
  const [activeTab, setActiveTab] = useState<"all" | "text" | "video">("all");
  const [videoTestimonials, setVideoTestimonials] = useState<
    VideoTestimonial[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load approved video testimonials from API
  useEffect(() => {
    loadApprovedVideos();
  }, []);

  const loadApprovedVideos = async () => {
    try {
      const response = await fetch("/api/testimonials/approved");
      const data = await response.json();

      if (data.success && data.testimonials) {
        const videos: VideoTestimonial[] = data.testimonials.map((t: any) => ({
          id: t.id,
          name: t.name,
          videoUrl: t.videoUrl,
          testimonialText: t.testimonialText,
          rating: 5,
          type: "video" as const,
        }));
        setVideoTestimonials(videos);
      }
    } catch (error) {
      console.error("Error loading video testimonials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const testimonials: TestimonialType[] = [
    ...staticTestimonials,
    ...videoTestimonials,
  ];

  const textTestimonials = staticTestimonials;

  const displayTestimonials =
    activeTab === "text"
      ? textTestimonials
      : activeTab === "video"
      ? videoTestimonials
      : testimonials;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Client Testimonials
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Hear what our satisfied clients have to say about their
                experience working with Evergreen Land Investments
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  size="lg"
                  onClick={() =>
                    (window.location.href = "/testimonials/upload")
                  }
                  className="gap-2"
                >
                  <UploadIcon className="w-5 h-5" />
                  Share Your Story
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Grid */}
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs
              defaultValue="all"
              className="w-full"
              onValueChange={(v) => setActiveTab(v as any)}
            >
              <div className="flex justify-center mb-12">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    All
                  </TabsTrigger>
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <Quote className="h-4 w-4" />
                    Written
                  </TabsTrigger>
                  <TabsTrigger
                    value="video"
                    className="flex items-center gap-2"
                  >
                    <Video className="h-4 w-4" />
                    Video
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-0">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {testimonials.map((testimonial, index) => (
                      <TestimonialCard
                        key={
                          testimonial.type === "video" && testimonial.id
                            ? testimonial.id
                            : index
                        }
                        testimonial={testimonial}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="text" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {textTestimonials.map((testimonial, index) => (
                    <TestimonialCard key={index} testimonial={testimonial} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="video" className="mt-0">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : videoTestimonials.length === 0 ? (
                  <div className="text-center py-12">
                    <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground mb-4">
                      No video testimonials yet
                    </p>
                    <Button
                      onClick={() =>
                        (window.location.href = "/testimonials/upload")
                      }
                    >
                      <UploadIcon className="w-4 h-4 mr-2" />
                      Be the First to Share
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {videoTestimonials.map((testimonial, index) => (
                      <TestimonialCard
                        key={testimonial.id || index}
                        testimonial={testimonial}
                      />
                    ))}
                  </div>
                )}
                {false && (
                  <div className="text-center py-16">
                    <Video className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Video Testimonials Coming Soon
                    </h3>
                    <p className="text-muted-foreground">
                      We're collecting video testimonials from our happy
                      clients. Check back soon!
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Work With Us?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join our satisfied clients and experience the Evergreen difference
            </p>
            <Button
              size="lg"
              onClick={() => {
                window.location.href = "/#contact";
              }}
            >
              Get Your Cash Offer
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: TestimonialType }) {
  if (testimonial.type === "video") {
    const videoTest = testimonial as VideoTestimonial;
    return (
      <Card className="overflow-hidden hover-elevate transition-all duration-300">
        <CardContent className="p-0">
          <div className="aspect-video w-full bg-muted">
            <iframe
              src={videoTest.videoUrl}
              title={`Video testimonial from ${videoTest.name}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="p-6">
            <div className="flex gap-1 mb-3">
              {[...Array(videoTest.rating)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
              ))}
            </div>
            <div className="font-bold text-lg text-foreground">
              - {videoTest.name}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const textTest = testimonial as Testimonial;
  return (
    <Card className="hover-elevate transition-all duration-300 h-full flex flex-col">
      <CardContent className="p-6 flex flex-col h-full">
        <Quote className="h-8 w-8 text-primary/20 mb-4" />

        <div className="flex gap-1 mb-4">
          {[...Array(textTest.rating)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
          ))}
        </div>

        <blockquote className="text-base text-foreground mb-6 leading-relaxed flex-grow">
          "{textTest.content}"
        </blockquote>

        <div className="font-bold text-lg text-foreground">
          - {textTest.name}
        </div>
      </CardContent>
    </Card>
  );
}
