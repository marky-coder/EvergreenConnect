// client/src/components/TestimonialsCarousel.tsx
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

export default function TestimonialsCarousel({
  autoPlayMs = 5000,
  tiles = 2,
}: {
  autoPlayMs?: number;
  tiles?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visible, setVisible] = useState(true);

  const N = testimonials.length;
  const T = Math.min(Math.max(1, tiles), N);

  const next = () => setCurrentIndex((prev) => (prev + T) % N);
  const prev = () => setCurrentIndex((prev) => (prev - T + N) % N);

  useEffect(() => {
    // small fade reset to trigger transition
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + T) % N);
    }, autoPlayMs);
    return () => clearInterval(id);
  }, [isPaused, autoPlayMs, T, N]);

  const indices = Array.from({ length: T }).map((_, i) => (currentIndex + i) % N);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        key={currentIndex}
        className={`grid grid-cols-1 md:grid-cols-${T} gap-8 transition-opacity duration-700 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {indices.map((idx) => {
          const t = testimonials[idx];
          return (
            <Card
              key={idx}
              className="relative overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="absolute -top-4 left-6 bg-emerald-800 text-white px-3 py-2 rounded-tr-md rounded-br-md shadow">
                <Quote className="h-5 w-5" />
              </div>

              <CardContent className="p-8 md:p-10">
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
        <Button variant="outline" size="icon" onClick={prev} aria-label="Previous testimonials">
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex gap-2 items-center">
          {Array.from({ length: N }).map((_, dotIdx) => {
            const active = dotIdx === currentIndex;
            return (
              <button
                key={dotIdx}
                onClick={() => setCurrentIndex(dotIdx)}
                className={`h-2 rounded-full transition-all ${
                  active ? "w-8 bg-primary" : "w-2 bg-primary/30"
                }`}
                aria-label={`Go to testimonial ${dotIdx + 1}`}
              />
            );
          })}
        </div>

        <Button variant="outline" size="icon" onClick={next} aria-label="Next testimonials">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
