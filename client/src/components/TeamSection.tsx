import { Card, CardContent } from "@/components/ui/card";

const teamMembers = [
  {
    name: "Nathaniel Brimlow",
    role: "Owner",
  },
  {
    name: "Mohamed Ayman",
    role: "COO",
  },
  {
    name: "Tyson Gongloff",
    role: "Sales Manager",
  },
  {
    name: "Angel Rafols",
    role: "Acquisition Specialist",
  },
  {
    name: "Kate Dagatan",
    role: "Acquisition Specialist",
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
                <div className="w-32 h-32 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                
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
