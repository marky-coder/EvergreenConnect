import React, { useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Home, MapPin, Calendar } from "lucide-react";

export default function GetOffer() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Inject the GHL embed script once and avoid duplicate injection on client-side route changes
    if (!document.querySelector('script[data-ghl-form-embed="true"]')) {
      const script = document.createElement("script");
      script.src = "https://link.msgsndr.com/js/form_embed.js";
      script.async = true;
      script.defer = true;
      script.setAttribute("data-ghl-form-embed", "true");
      document.body.appendChild(script);
      // intentionally not removing the script on unmount so it persists across navigation
    }
  }, []);

  const iframeHeight = 811; // keep in sync with data-height on iframe

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <DollarSign className="h-16 w-16 mx-auto text-primary mb-6" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Get Your Free Cash Offer
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Fill out the form below and receive a no-obligation cash offer
                for your property within 24 hours
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Fast Cash Offer
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Receive your offer within 24 hours
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Any Condition
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We buy houses as-is, no repairs needed
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Close on Your Timeline
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We work around your schedule
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Form/Card Section — replaced with GHL iframe */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl text-center">
                  Property Information
                </CardTitle>
              </CardHeader>

              <CardContent>
                {/* Keep the visual card but embed the GHL iframe */}
                <div
                  ref={containerRef}
                  className="rounded-lg overflow-hidden"
                  aria-live="polite"
                >
                  {/* wrapper must have an explicit height because iframe uses height:100% */}
                  <div className="w-full" style={{ height: iframeHeight }}>
                    <iframe
                      src="https://api.leadconnectorhq.com/widget/form/AIvFxy2eO6D76DJgm48Q"
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        borderRadius: "3px",
                      }}
                      id="inline-AIvFxy2eO6D76DJgm48Q"
                      data-layout="{'id':'INLINE'}"
                      data-trigger-type="alwaysShow"
                      data-trigger-value=""
                      data-activation-type="alwaysActivated"
                      data-activation-value=""
                      data-deactivation-type="neverDeactivate"
                      data-deactivation-value=""
                      data-form-name="Get Your Free Cash Offer"
                      data-height={String(iframeHeight)}
                      data-layout-iframe-id="inline-AIvFxy2eO6D76DJgm48Q"
                      data-form-id="AIvFxy2eO6D76DJgm48Q"
                      title="Get Your Free Cash Offer"
                      aria-label="Get Your Free Cash Offer form"
                    />
                  </div>

                  {/* noscript fallback */}
                  <div className="p-4 text-sm text-gray-700">
                    <noscript>
                      It looks like JavaScript is disabled in your browser.
                      Open the form directly:{" "}
                      <a
                        href="https://api.leadconnectorhq.com/widget/form/AIvFxy2eO6D76DJgm48Q"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Get Your Free Cash Offer
                      </a>
                    </noscript>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Why Choose Evergreen?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              We've helped hundreds of homeowners sell their properties quickly
              and hassle-free. No commissions, no fees, no repairs needed. Just
              a fair cash offer and a simple process.
            </p>
            <Button
              variant="outline"
              size="lg"
              onClick={() => (window.location.href = "/#contact")}
            >
              Have Questions? Contact Us
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
