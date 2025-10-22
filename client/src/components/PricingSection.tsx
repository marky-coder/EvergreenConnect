import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const packages = [
  {
    name: "Essential",
    description: "Perfect for small businesses looking to grow their sales pipeline",
    features: [
      "Experienced cold caller",
      "Client success manager",
      "Quality control management",
      "Weekly reports",
      "Weekly meeting with your team",
      "Choose your cold caller",
      "Premium dialer included",
    ],
    isBestValue: false,
  },
  {
    name: "Standard",
    description: "Perfect for medium-sized businesses looking to grow their sales pipeline",
    features: [
      "Experienced cold caller",
      "Client success manager",
      "Quality control management",
      "Weekly reports",
      "Weekly meeting with your team",
      "Choose your cold caller",
      "Premium dialer included",
      "Data pulling – 15k records",
      "Data skiptracing – 15k records",
    ],
    isBestValue: false,
  },
  {
    name: "Standard Pro",
    description: "Our most beloved package, perfect for those who want to scale their business",
    features: [
      "2 experienced cold callers",
      "Client success manager",
      "Quality control management",
      "Weekly reports",
      "Weekly meeting with your team",
      "Choose your cold caller",
      "Premium dialer included",
      "Data pulling – 30k records",
      "Data skiptracing – 30k records",
    ],
    isBestValue: true,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-16 md:py-24 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Our Packages
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Choose the perfect plan to match your business needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
          {packages.map((pkg, index) => (
            <Card 
              key={index}
              className={`relative hover-elevate transition-all duration-300 ${
                pkg.isBestValue ? 'border-primary shadow-lg' : ''
              }`}
              data-testid={`card-package-${index}`}
            >
              {pkg.isBestValue && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="px-4 py-1.5 text-sm font-semibold">
                    Best Value
                  </Badge>
                </div>
              )}
              
              <CardHeader className="space-y-4 pb-6">
                <CardTitle className="text-2xl md:text-3xl">{pkg.name}</CardTitle>
                <CardDescription className="text-base">{pkg.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {pkg.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full"
                  variant={pkg.isBestValue ? "default" : "outline"}
                  size="lg"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  data-testid={`button-get-started-${index}`}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card className="max-w-2xl mx-auto p-6 md:p-8">
          <div className="text-center space-y-4">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              Custom Plan
            </h3>
            <p className="text-muted-foreground">
              Not sure which plan is right for you? We can create a custom plan to fit your needs.
            </p>
            <Button 
              size="lg"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="button-custom-plan"
            >
              Let's Talk
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
