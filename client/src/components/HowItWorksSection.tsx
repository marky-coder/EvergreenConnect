import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Target, Rocket, HeadphonesIcon } from "lucide-react";

const steps = [
  {
    icon: Calendar,
    number: "01",
    title: "Free Discovery Call",
    description: "Get on a call with one of our experts to explore your goals and set milestones to see if we're a good fit for your business. In that call, we set your growth roadmap.",
  },
  {
    icon: Target,
    number: "02",
    title: "Exploring Your Strategy",
    description: "We customize leads according to your approach, aligning with your goals and strategies. If you're uncertain about your target market, we conduct comprehensive market analysis to guide you.",
  },
  {
    icon: Rocket,
    number: "03",
    title: "Launching the Campaign",
    description: "Our seasoned team is poised to generate the leads your business needs. Our optimized tools and processes are designed to work seamlessly for you, saving you valuable time!",
  },
  {
    icon: HeadphonesIcon,
    number: "04",
    title: "24/7 Support",
    description: "We value your feedback and are continuously open to customization, committed to supporting your business and guiding you through scaling it with our expertise!",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Our proven process to help you achieve sustainable business growth
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <Card 
              key={index}
              className="relative hover-elevate transition-all duration-300"
              data-testid={`card-step-${index}`}
            >
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-6xl font-bold text-primary/10">{step.number}</span>
                </div>
                
                <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
