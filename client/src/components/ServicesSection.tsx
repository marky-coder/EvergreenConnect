import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Phone, Handshake, Home, Search, ArrowRight } from "lucide-react";
import dataImage from '@assets/generated_images/Data_analysis_service_image_b91a2127.png';
import callImage from '@assets/generated_images/Customer_service_call_image_d9eadd03.png';
import dealImage from '@assets/generated_images/Business_partnership_handshake_image_55c5be4c.png';
import propertyImage from '@assets/generated_images/Property_management_service_image_360d3ac8.png';

const services = [
  {
    icon: Database,
    title: "Data Generation",
    description: "Entrust the task of list generation to our team of experts",
    details: "We specialize in pulling personalized lists tailored to your objectives and delivering them promptly, ensuring efficiency and effectiveness for your goals.",
    image: dataImage,
  },
  {
    icon: Phone,
    title: "Cold Calling",
    description: "Unlock Hidden Profits: The Secret Weapon of Top Business Leaders",
    details: "Empower your business with a seasoned cold calling professional who will produce high-quality leads aligned with your objectives, ensuring your pipeline is brimming with promising opportunities.",
    image: callImage,
  },
  {
    icon: Handshake,
    title: "Business Acquisition & Disposition",
    description: "Streamlined Success: Effortless Dispositions, Expert ROI Maximization",
    details: "Entrust us with your acquisition needs, where we excel in negotiations to maximize your ROI and handle dispositions to expedite your deals with efficiency and speed.",
    image: dealImage,
  },
  {
    icon: Home,
    title: "Property Management",
    description: "Unlock the Full Potential of Your Investment",
    details: "Maximize your rental income and minimize your stress with our comprehensive property management services. From expert property finding to seamless management, we handle everything.",
    image: propertyImage,
  },
  {
    icon: Search,
    title: "Skip Tracing",
    description: "Find Your Leads Efficiently",
    details: "Accelerate your search for the right contacts with our professional skip tracing services. We specialize in locating hard-to-find individuals and providing accurate, up-to-date contact information.",
    image: dataImage,
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-16 md:py-24 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Our Services
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Spare yourself the effort of deciphering the lead generation puzzle—experience a 
            hassle-free solution that saves you valuable time!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="hover-elevate transition-all duration-300 overflow-hidden group"
              data-testid={`card-service-${index}`}
            >
              <div className="aspect-video overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl md:text-2xl">{service.title}</CardTitle>
                <CardDescription className="text-base">{service.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {service.details}
                </p>
                <Button 
                  variant="ghost" 
                  className="w-full group/btn"
                  data-testid={`button-learn-more-${index}`}
                  onClick={() => console.log(`Learn more about ${service.title}`)}
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-lg md:text-xl text-foreground mb-6">
            Ready to elevate your business with our comprehensive range of services?
          </p>
          <Button 
            size="lg"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            data-testid="button-schedule-call-services"
          >
            Schedule a Free Call
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
