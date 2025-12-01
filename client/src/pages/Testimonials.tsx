// client/src/pages/Testimonials.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import { Button } from "@/components/ui/button";

export default function Testimonials() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero — Share Your Story button removed */}
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Client Testimonials
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Hear what our satisfied clients have to say about their experience working with Evergreen Land Investments
              </p>

              {/* NOTE: "Share Your Story" removed as requested */}
            </div>
          </div>
        </section>

        {/* Carousel Section (replaces Tabs / Filters) */}
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <TestimonialsCarousel tiles={2} autoPlayMs={5000} />
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Work With Us?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join our satisfied clients and experience the Evergreen difference
            </p>
            <Button size="lg" onClick={() => (window.location.href = "/get-offer")}>
              Get Your Cash Offer
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
