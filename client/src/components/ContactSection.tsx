import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export default function ContactSection() {
  return (
    <section id="contact" className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Contact Us
          </h2>
        </div>

        {/* Contact Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Call Us</h3>
              <a
                href="tel:+19566006000"
                className="text-primary hover:underline text-xl font-bold"
              >
                (956) 600-6000
              </a>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Email Us</h3>
              <a
                href="mailto:contact@evergreenlandinvestments.com"
                className="text-primary hover:underline break-all"
              >
                contact@evergreenlandinvestments.com
              </a>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Location</h3>
              <p className="text-muted-foreground">
                McAllen, TX
                <br />
                Rio Grande Valley
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Hours</h3>
              <p className="text-muted-foreground">
                Mon-Fri: 9AM-6PM
                <br />
                Sat: 10AM-4PM
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
