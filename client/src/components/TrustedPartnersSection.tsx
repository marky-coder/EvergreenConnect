// client/src/components/TrustedPartnersSection.tsx
import { Card, CardContent } from "@/components/ui/card";
import Fade from "@/components/Fade";

const partners = [
  {
    name: "Capital Title Of Texas",
    info: "6850 Austin Center Blvd Suite 127, Austin, TX 78731",
    phone: "512-222-0222",
  },
  {
    name: "Sandy Steed",
    role: "Vice President / Branch Manager / Escrow Officer",
    info: "2300 Greenhill Drive, Bldg. 10-Suite 1000, Round Rock, TX 78664",
  },
  {
    name: "Crystal Pratt",
    role: "Transaction Coordinator and Due Diligence manager",
    phone: "(512) 586-5833",
  },
  {
    name: "Vita Talent",
    role: "Professional Recruiting and Staffing Solutions",
    info: "Connecting top talent with exceptional opportunities in the real estate industry",
  },
];

export default function TrustedPartnersSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Fade direction="up" duration={700} delay={0} distance={14} once>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Success Partners
            </h2>
          </div>
        </Fade>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
          {partners.map((partner, index) => (
            <Fade key={index} direction="up" duration={600} delay={80 + index * 60} distance={10} once>
              <Card className="hover-elevate transition-all duration-300 hover-lift" data-testid={`card-partner-${index}`}>
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-xl font-bold text-foreground">{partner.name}</h3>
                  {partner.role && (
                    <p className="text-sm font-medium text-muted-foreground">{partner.role}</p>
                  )}
                  {partner.info && (
                    <p className="text-sm text-muted-foreground">{partner.info}</p>
                  )}
                  {partner.phone && (
                    <p className="text-sm font-medium text-primary">{partner.phone}</p>
                  )}
                </CardContent>
              </Card>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}
