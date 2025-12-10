// client/src/pages/Home.tsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import TeamSection from "@/components/TeamSection";
import TrustedPartnersSection from "@/components/TrustedPartnersSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import ProcessSection from "@/components/ProcessSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  // Handle hash navigation on page load
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <WhyChooseSection />
        <ProcessSection />

        {/* Testimonials CTA Section */}
        <section className="py-16 md:py-24 lg:py-32 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 fill-primary text-primary" />
                ))}
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Happy Clients
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                See what our satisfied clients have to say about their experience with Evergreen Land Investments
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/testimonials")}
                >
                  View All Testimonials
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate("/get-offer")}
                >
                  Get Your Cash Offer
                </Button>
              </div>
            </div>
          </div>
        </section>

        <TeamSection />
        <TrustedPartnersSection />
        {/* ContactSection removed */}
      </main>
      <Footer />
    </div>
  );
}
