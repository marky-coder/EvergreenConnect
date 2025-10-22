import { Check } from "lucide-react";

const reasons = [
  "Fast Closings With No Delays",
  "Seamless and Stress Free Transactions",
  "Cash Payment with No Financing Contingencies",
  "Seamless Transactions with Transparent Communication From Start to Finish",
  "Professional In-house Closing Team",
  "Top Quality Closing Firms",
  "We Cover All Closing Costs – No Hidden Fees or Realtor Commissions",
  "Local Market Expertise You Can Trust",
];

export default function WhyChooseSection() {
  return (
    <section id="why-choose" className="py-16 md:py-24 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Why People Choose to Work with Evergreen
          </h2>
        </div>
        
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {reasons.map((reason, index) => (
            <div 
              key={index} 
              className="flex items-start gap-3 p-4 rounded-lg hover-elevate bg-background"
              data-testid={`reason-${index}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-base text-foreground">{reason}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
