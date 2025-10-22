import { Card } from "@/components/ui/card";

const partners = [
  { name: "TechCorp", description: "Leading provider of cloud-based software solutions" },
  { name: "DataFlow", description: "Advanced data analytics and business intelligence platform" },
  { name: "ConnectPro", description: "Customer engagement platform for modern businesses" },
  { name: "LeadGen", description: "Innovative lead generation and qualification tools" },
];

export default function PartnersSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Our Trusted Partners
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            We are proud to be associated with some of the most respected names in the industry
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {partners.map((partner, index) => (
            <Card 
              key={index} 
              className="p-8 text-center hover-elevate transition-all duration-300"
              data-testid={`card-partner-${index}`}
            >
              <div className="mb-4 h-16 flex items-center justify-center">
                <div className="text-2xl font-bold text-primary">{partner.name}</div>
              </div>
              <p className="text-sm text-muted-foreground">{partner.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
