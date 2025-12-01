// client/src/components/TestimonialsSection.tsx
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Brian",
    content:
      "I had the pleasure of working with Evergreen on an investment purchase in Vista. The one word that comes to mind when I think of that transaction is dedication. They went above and beyond to help us navigate a tricky situation with the sellers. They always had our best interest in mind irrespective of what was best for them or their paycheck. That is rare thing in the real state business. Hiring them would be hiring a servant leader that will put others' needs first to get the job done.",
    rating: 5,
  },
  {
    name: "Alix & Audrey",
    content:
      "We can't say enough good things about Evergreen! They really worked so hard to make our dream a reality, and we couldn't be more thankful or eager to recommend them. Their immense knowledge of the market, their connections, and their confidence really made purchasing a home an exciting and wonderful experience.",
    rating: 5,
  },
  {
    name: "Dean",
    content:
      "These are the guys that put your interests first. My experience with them has been top-notch. They were superb in providing me with what I needed and they were great listeners. They took care of my needs. I recommend these people since I had such a great experience with them.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0); // index of the first tile in the visible pair
  const [isPaused, setIsPaused] = useState(false);
  const [visible, setVisible] = useState(true); // used for fade animation

  const N = testimonials.length;

  // Move forward by 2 so we always show two new tiles (wraps properly)
  const nextPair = () => {
    setCurrentIndex((prev) => (prev + 2) % N);
  };
  const prevPair = () => {
    setCurrentIndex((prev) => (prev - 2 + N) % N);
  };

  // Fade animation trigger whenever currentIndex changes
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 50); // short delay to trigger CSS transition
    return () => clearTimeout(t);
  }, [currentIndex]);

  // Auto-advance every 5s (pause when hovered)
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 2) % N);
    }, 5000);
    return () => clearInterval(id);
  }, [isPaused, N]);

  // Two indices to display
  const i1 = currentIndex;
  const i2 = (currentIndex + 1) % N;

  return (
    <section id="testimonials" className="py-16 md:py-24 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Happy Clients
          </h2>
        </div>

        <div
          className="max-w-5xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Visible pair */}
          <div
            key={currentIndex}
            className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-700 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          >
            {[i1, i2].map((idx) => {
              const t = testimonials[idx];
              return (
                <Card
                  key={idx}
                  className="relative overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  {/* green quote badge */}
                  <div className="absolute -top-4 left-6 bg-emerald-800 text-white px-3 py-2 rounded-tr-md rounded-br-md shadow">
                    <Quote className="h-5 w-5" />
                  </div>

                  <CardContent className="p-10">
                    <div className="flex gap-1 mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>

                    <blockquote className="text-base md:text-lg text-foreground leading-relaxed text-center md:text-left">
                      {`"${t.content}"`}
                    </blockquote>

                    <div className="mt-6 text-center md:text-left">
                      <div className="font-bold text-lg text-emerald-800">- {t.name}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevPair}
              data-testid="button-prev-testimonial"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex gap-2 items-center">
              {/* Dots representing pairs (we show N pairs stepping by 2) */}
              {Array.from({ length: N }).map((_, dotIdx) => {
                // dot active if dotIdx equals currentIndex (representing first tile in pair)
                const active = dotIdx === currentIndex;
                return (
                  <button
                    key={dotIdx}
                    onClick={() => setCurrentIndex(dotIdx)}
                    className={`h-2 rounded-full transition-all ${
                      active ? "w-8 bg-primary" : "w-2 bg-primary/30"
                    }`}
                    data-testid={`button-testimonial-dot-${dotIdx}`}
                    aria-label={`Go to testimonial pair starting at ${dotIdx + 1}`}
                  />
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextPair}
              data-testid="button-next-testimonial"
              aria-label="Next testimonials"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
