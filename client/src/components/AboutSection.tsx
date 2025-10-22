import { Card } from "@/components/ui/card";
import { SiFacebook, SiLinkedin, SiInstagram } from "react-icons/si";
import aboutImage from '@assets/generated_images/Professional_team_collaboration_photo_ee4bd62e.png';

export default function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              About Evergreen
            </h2>
            
            <div className="space-y-4 text-base md:text-lg">
              <p className="text-foreground">
                Are you a knowledgeable business professional aiming to excel in your market? 
                Your search ends here!
              </p>
              
              <p className="text-muted-foreground">
                At <span className="font-semibold text-foreground">Evergreen</span>, we go beyond 
                being a mere service provider—we serve as your strategic ally in achieving success.
              </p>
              
              <p className="text-muted-foreground">
                Focused on meeting the needs of businesses involved in data generation, lead acquisition, 
                and sustainable growth, we provide a range of premium services crafted to elevate your 
                business to unprecedented levels of success.
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
          
          <Card className="overflow-hidden">
            <img 
              src={aboutImage} 
              alt="Evergreen team collaborating" 
              className="w-full h-full object-cover"
            />
          </Card>
        </div>
      </div>
    </section>
  );
}
