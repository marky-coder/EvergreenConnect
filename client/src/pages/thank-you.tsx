import React, { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

/**
 * Hidden Thank You page - /thank-you
 * - Mirrors the home page layout: Header / hero / content / Footer
 * - Adds a noindex,nofollow meta tag so search engines won't index it
 * - Intentionally NOT linked anywhere; reachable only via direct URL
 */
export default function ThankYou() {
  useEffect(() => {
    // Add a noindex meta tag while this page is mounted
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);

    // Update title while on this page
    const prevTitle = document.title;
    document.title = "Thank you — Evergreen Land Investments";

    return () => {
      // cleanup
      document.head.removeChild(meta);
      document.title = prevTitle;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-20">
        {/* Hero Section (matches site home style) */}
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="mx-auto mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                Thank you!
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground">
                Thank you for your submission. Someone from our team will reach
                out to you.
              </p>

              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => (window.location.href = "/")}
                >
                  Return to Home
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => (window.location.href = "/#contact")}
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Optional: small confirmation card (mirrors other page styling) */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-sm text-muted-foreground">
                If you need immediate assistance, call us at{" "}
                <a href="tel:555-123-4567" className="text-primary underline">
                  (555) 123-4567
                </a>
                . Otherwise, someone will be in touch shortly.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
