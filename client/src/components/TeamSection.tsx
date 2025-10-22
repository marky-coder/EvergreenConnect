import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const teamMembers = [
  {
    name: "Nathaniel Brimlow",
    role: "Owner",
    image: "https://investwithevergreen.com/wp-content/uploads/2025/04/Screen-Shot-2025-04-22-at-9.49.08-AM.png",
  },
  {
    name: "Mohamed Ayman",
    role: "COO",
    image: "https://investwithevergreen.com/wp-content/uploads/2025/04/Ayman-Photos-2-e1746040133825.jpg",
  },
  {
    name: "Mostafa Hossam",
    role: "Head of Outreach",
    image: "",
  },
  {
    name: "Ivy Baker",
    role: "Head of Dispositions Department",
    image: "",
  },
  {
    name: "Angel Rafols",
    role: "Acquisition Specialist",
    image: "https://investwithevergreen.com/wp-content/uploads/2025/04/Angel-Photo-e1746039828271.jpg",
  },
];

export default function TeamSection() {
  return (
    <section id="team" className="py-16 md:py-24 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Meet The Team
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-8">
          {teamMembers.map((member, index) => (
            <Card 
              key={index} 
              className="text-center hover-elevate transition-all duration-300"
              data-testid={`card-team-${index}`}
            >
              <CardContent className="pt-6 space-y-4">
                <Avatar className="w-32 h-32 mx-auto">
                  <AvatarImage 
                    src={member.image} 
                    alt={member.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="text-xl font-bold text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{member.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
