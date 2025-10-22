import { Card, CardContent } from "@/components/ui/card";

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
];

export default function TrustedPartnersSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Trusted Partners
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {partners.map((partner, index) => (
            <Card 
              key={index} 
              className="hover-elevate transition-all duration-300"
              data-testid={`card-partner-${index}`}
            >
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
          ))}
        </div>
      </div>
    </section>
  );
}
