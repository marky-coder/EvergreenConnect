// client/src/components/ProcessSection.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Calendar, DollarSign, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    icon: Phone,
    number: "01",
    title: "Contact us",
  },
  {
    icon: Calendar,
    number: "02",
    title: "Book an appointment",
  },
  {
    icon: DollarSign,
    number: "03",
    title: "Receive a cash offer",
  },
  {
    icon: Home,
    number: "04",
    title: "Close quickly and conveniently",
  },
];

export default function ProcessSection() {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Our Process
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
          {steps.map((step, index) => (
            <Card 
              key={index}
              className="relative hover-elevate transition-all duration-300 text-center"
              data-testid={`card-process-${index}`}
            >
              <CardContent className="pt-8 pb-6 space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 rounded-full bg-primary/10">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                
                <div className="text-6xl font-bold text-primary/20">{step.number}</div>
                <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center space-y-6">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground">
            Call us today to get your FREE, no obligation cash offer!
          </h3>
          <Button 
            size="lg"
            onClick={() => navigate("/get-offer")}
            data-testid="button-contact-process"
          >
            Get Your Free Cash Offer
          </Button>
        </div>
      </div>
    </section>
  );
}
