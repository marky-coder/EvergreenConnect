import { Card, CardContent } from "@/components/ui/card";
import ivyPhoto from "@assets/ivy-baker-photo.png";
import ayatPhoto from "@assets/ayat-ayman-photo.png";
import natePhoto from "@assets/nate-atkins-photo.png";
import mohamedPhoto from "@assets/mohamed-ayman-photo.png";
import linaPhoto from "@assets/lina-hossam-photo.png";
import maureenPhoto from "@assets/maureen-vergara-photo.png";
import hanaPhoto from "@assets/hana-aboubakr-photo.png";
import nathanielPhoto from "@assets/nathaniel-brimlow-photo.png";
import ravenPhoto from "@assets/raven-santiago-photo.png";
import kierPhoto from "@assets/kier-caguioa-photo.png";
import mostafaPhoto from "@assets/mostafa-hossam-photo.png";
import denisePhoto from "@assets/denise-mancera-photo.png";
import shayPhoto from "@assets/shay-magdi-photo.png";
import noraPhoto from "@assets/nora-zaki-photo.png";
import markAnthonyPhoto from "@assets/mark-anthony-photo.jpeg";
import lindseyJohnsonPhoto from "@assets/lindsey-johnson-photo.jpeg";

const teamMembers = [
  {
    name: "Lindsey Johnson",
    role: "Founder",
    image: lindseyJohnsonPhoto,
  },
  {
    name: "Nathaniel Brimlow",
    role: "Founder/CEO",
    image: nathanielPhoto,
    // zoom in and crop from the top so his head matches other portraits
    imageScale: "scale-125 object-top",
  },
  {
    name: "Mohamed Ayman",
    role: "COO",
    image: mohamedPhoto,
  },
  {
    name: "Mostafa Hossam",
    role: "Head of Outreach Department",
    image: mostafaPhoto,
  },
  {
    name: "Ivy Baker",
    role: "Head of Dispositions Department",
    image: ivyPhoto,
  },
  {
    name: "Nora Zaki",
    role: "Dispositions Manager",
    image: noraPhoto,
  },
  {
    name: "Lina Hossam",
    role: "Acquisitions Manager",
    image: linaPhoto,
  },
  {
    name: "Nate Atkins",
    role: "Acquisitions Manager",
    image: natePhoto,
  },
  {
    name: "Denise Mancera",
    role: "Success Manager",
    image: denisePhoto,
  },
  {
    name: "Hanna Aboubakr",
    role: "Social Media Manager",
    image: hanaPhoto,
  },
  {
    name: "Angel Rafols",
    role: "Acquisition Specialist",
    image:
      "https://investwithevergreen.com/wp-content/uploads/2025/04/Angel-Photo-e1746039828271.jpg",
  },
  {
    name: "Maureen Vergara",
    role: "Acquisition Specialist",
    image: maureenPhoto,
  },
  {
    name: "Ayat Ayman",
    role: "Acquisition Specialist",
    image: ayatPhoto,
  },
  {
    name: "Shay Magdi",
    role: "Acquisition Specialist",
    image: shayPhoto,
  },
  {
    name: "Raven Santiago",
    role: "Property Analyst",
    image: ravenPhoto,
  },
  {
    name: "Kier Caguioa",
    role: "Property Analyst",
    image: kierPhoto,
  },
  {
    name: "Mark Anthony",
    role: "Automation Expert",
    image: markAnthonyPhoto,
    // tiny zoom so his framing matches the others
    imageScale: "scale-110",
  },
];

export default function TeamSection() {
  return (
    <section id="team" className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Meet The Team
          </h2>
        </div>

        {/* flex so last row is centered; fixed width + aspect so all cards match */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-6xl mx-auto">
          {teamMembers.map((member, index) => (
            <Card
              key={index}
              className="overflow-hidden bg-card/90 border border-border/60 shadow-md"
              data-testid={`card-team-${index}`}
            >
              <CardContent className="p-0">
                <div className="w-[160px] sm:w-[180px] md:w-[200px] lg:w-[210px] aspect-[3/4] overflow-hidden">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        (member as any).imageScale || "object-center"
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xl font-bold">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                </div>

                <div className="px-4 py-3 text-center">
                  <h3 className="text-sm md:text-base font-semibold text-foreground leading-tight">
                    {member.name}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1 leading-tight">
                    {member.role}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
