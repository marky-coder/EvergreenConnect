import { Card } from "@/components/ui/card";
import { SiFacebook, SiLinkedin, SiInstagram } from "react-icons/si";
import evergreenLogo from '@assets/image_1761178339487.png';

export default function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Welcome to Evergreen Land Investments
            </h2>
            
            <div className="space-y-4 text-base md:text-lg">
              <p className="text-foreground">
                Here at Evergreen, we love bringing beauty to our community! We are a small, local 
                company eager to connect home and land owners with solutions to their problems and 
                pathways to their dreams.
              </p>
              
              <p className="text-muted-foreground">
                That is why we provide quick and convenient cash offers for your property in any condition.
              </p>
              
              <p className="text-muted-foreground">
                We skip the listing, commissions, appraisals, lenders, and agents and take care of any 
                clean-up ourselves; putting more money in your pocket and saving you time and energy. 
                Our data-backed algorithms help us offer you top dollar and we can close as quickly as 14 days!
              </p>
            </div>
            
            <div className="flex gap-4 pt-4">
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover-elevate active-elevate-2 rounded-full p-3 bg-accent"
                data-testid="link-linkedin"
                aria-label="LinkedIn"
              >
                <SiLinkedin className="h-5 w-5 text-accent-foreground" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover-elevate active-elevate-2 rounded-full p-3 bg-accent"
                data-testid="link-facebook"
                aria-label="Facebook"
              >
                <SiFacebook className="h-5 w-5 text-accent-foreground" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover-elevate active-elevate-2 rounded-full p-3 bg-accent"
                data-testid="link-instagram"
                aria-label="Instagram"
              >
                <SiInstagram className="h-5 w-5 text-accent-foreground" />
              </a>
            </div>
          </div>
          
          <div className="flex items-center justify-center p-8">
            <img 
              src={evergreenLogo} 
              alt="Evergreen Land Investments Logo" 
              className="w-full max-w-sm h-auto"
              data-testid="img-logo-about"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
