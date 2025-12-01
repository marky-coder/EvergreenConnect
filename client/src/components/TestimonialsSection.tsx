import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Brian",
    content: "I had the pleasure of working with Lindsey on an investment purchase in Vista. The one word that comes to mind when I think of that transaction is dedication. He went above and beyond to help us navigate a tricky situation with the sellers. He always had our best interest in mind irrespective of what was best for him or his paycheck. That is a rare thing in the real estate business. Hiring Lindsey would be hiring a servant leader that will put others' needs first to get the job done.",
    rating: 5,
  },
  {
    name: "Alix & Audrey",
    content: "We can't say enough good things about Lindsey! He really worked so hard to make our dream a reality, and we couldn't be more thankful or eager to recommend him. His immense knowledge of the market, his connections, and his confidence really made purchasing a home an exciting and wonderful experience.",
    rating: 5,
  },
  {
    name: "Dean",
    content: "These are the guys that put your interests first. My experience with Steven has been top-notch. He was superb in providing me with what I needed and was a great listener. Steven took care of my needs. I recommend these people since I had such a great experience with Steven.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section id="testimonials" className="py-16 md:py-24 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Happy Clients
          </h2>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="relative overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <Quote className="h-12 w-12 text-primary/20 mb-6" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(currentTestimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              
              <blockquote className="text-lg md:text-xl text-foreground mb-8 leading-relaxed">
                "{currentTestimonial.content}"
              </blockquote>
              
              <div className="space-y-1">
                <div className="font-bold text-lg text-foreground">- {currentTestimonial.name}</div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              data-testid="button-prev-testimonial"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-primary/30'
                  }`}
                  data-testid={`button-testimonial-dot-${index}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              data-testid="button-next-testimonial"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
      </div>
    </section>
  );
}
