import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "George Martinez",
    title: "Evergreen Client",
    content: "We appreciate your efforts in managing our outreach strategy. It's crucial for preventing issues and maintaining connectivity. Your approach is working exceptionally well compared to other providers we've used.",
    rating: 5,
  },
  {
    name: "Antwan Johnson",
    title: "Evergreen Client",
    content: "Very impressed by the service so far! The team is professional, responsive, and truly understands our business needs. Highly recommend!",
    rating: 5,
  },
  {
    name: "Jason Williams",
    title: "Evergreen Client",
    content: "I love working with you and your team. The level of dedication and quality of service is outstanding. You've helped us grow our business significantly.",
    rating: 5,
  },
  {
    name: "Evan Rodriguez",
    title: "Evergreen Client",
    content: "Evergreen has been amazing. The team has provided exceptional service. I've tried other companies but Evergreen's quality is far superior. Their support helped me secure multiple contracts, generating substantial profit.",
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
            What Our Clients Are Saying
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            We have great client feedback! See what our clients have to say.
          </p>
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
                <div className="font-bold text-lg text-foreground">{currentTestimonial.name}</div>
                <div className="text-sm text-muted-foreground">{currentTestimonial.title}</div>
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
        
        <div className="text-center mt-12 p-6 md:p-8 max-w-2xl mx-auto">
          <blockquote className="text-xl md:text-2xl font-semibold text-foreground italic">
            "Success in business requires trust, dedication, and the right partnership."
          </blockquote>
          <cite className="text-muted-foreground mt-2 block">- Evergreen Team</cite>
        </div>
      </div>
    </section>
  );
}
