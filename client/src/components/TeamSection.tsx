// client/src/components/TeamSection.tsx
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
import markAnthonyPhoto from "@assets/mark-anthony-photo.png";
import lindseyJohnsonPhoto from "@assets/lindsey-johnson-photo.jpeg";
import kateImperialPhoto from "@assets/kate-imperial-photo.png";

import Fade from "@/components/Fade";

type TeamMember = {
  name: string;
  role: string;
  image?: string;
  imageScale?: string;
};

const team: TeamMember[] = [
  {
    name: "Lindsey Johnson",
    role: "Founder",
    image: lindseyJohnsonPhoto,
    imageScale: "scale-125 object-center",
  },
  {
    name: "Nathaniel Brimlow",
    role: "Founder/CEO",
    image: nathanielPhoto,
    imageScale: "scale-[1.6] -translate-y-1 object-top",
  },
  { name: "Mohamed Ayman", role: "COO", image: mohamedPhoto, imageScale: "scale-125 object-center" },
  { name: "Mostafa Hossam", role: "Head of Outreach Department", image: mostafaPhoto, imageScale: "scale-125 object-top" },
  // Crucial: Ivy set just like Vita — scale-100 and object-center so it's centered
  { name: "Ivy Baker", role: "Head of Dispositions Department", image: ivyPhoto, imageScale: "scale-100 object-center" },
  { name: "Nora Zaki", role: "Dispositions Manager", image: noraPhoto, imageScale: "scale-125 object-center" },
  { name: "Lina Hossam", role: "Acquisitions Manager", image: linaPhoto, imageScale: "scale-125 object-center" },
  { name: "Nate Atkins", role: "Acquisitions Manager", image: natePhoto, imageScale: "scale-125 object-center" },
  { name: "Denise Mancera", role: "Success Manager", image: denisePhoto, imageScale: "scale-125 object-center" },
  { name: "Hanna Aboubakr", role: "Social Media Manager", image: hanaPhoto, imageScale: "scale-125 object-center" },
  {
    name: "Angel Rafols",
    role: "Acquisition Specialist",
    image:
      "https://investwithevergreen.com/wp-content/uploads/2025/04/Angel-Photo-e1746039828271.jpg",
    imageScale: "scale-125 object-center",
  },
  { name: "Maureen Vergara", role: "Acquisition Specialist", image: maureenPhoto, imageScale: "scale-125 object-center" },
  { name: "Ayat Ayman", role: "Acquisition Specialist", image: ayatPhoto, imageScale: "scale-125 object-center" },
  { name: "Shay Magdi", role: "Acquisition Specialist", image: shayPhoto, imageScale: "scale-125 object-center" },
  { name: "Raven Santiago", role: "Property Analyst", image: ravenPhoto, imageScale: "scale-125 object-center" },
  { name: "Kier Caguioa", role: "Property Analyst", image: kierPhoto, imageScale: "scale-125 object-center" },
  { name: "Kate Imperial", role: "Data Manager", image: kateImperialPhoto, imageScale: "scale-125 object-center" },
  { name: "Mark Anthony", role: "Automation Expert", image: markAnthonyPhoto, imageScale: "scale-110 object-center" },
];

export default function TeamSection() {
  return (
    <section id="team" className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Fade direction="up" duration={700} delay={0} distance={14} once>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Meet The Team</h2>
          </div>
        </Fade>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-6xl mx-auto">
          {team.map((member, index) => (
            <Fade
              key={index}
              direction="up"
              delay={80 + index * 40}
              duration={600}
              distance={10}
              once
              index={index}
              staggerGap={40}
            >
              <Card
                className="group w-[160px] sm:w-[180px] md:w-[200px] lg:w-[210px] overflow-hidden bg-card/90 border border-border/60 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                data-testid={`team-member-${index}`}
              >
                <div className="flex flex-col h-full">
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${member.imageScale ?? "scale-125 object-center"}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <span className="text-4xl font-bold text-primary/60">
                          {member.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-4 text-center bg-gradient-to-b from-card to-primary/5 border-t border-primary/10 flex flex-col justify-center">
                    <h3 className="font-semibold text-base text-foreground tracking-tight group-hover:text-primary transition-colors duration-300 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              </Card>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}
