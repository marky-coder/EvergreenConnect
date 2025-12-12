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

const teamMembers = [
  { name: "Lindsey Johnson", role: "Founder", image: lindseyJohnsonPhoto },
  {
    name: "Nathaniel Brimlow",
    role: "Founder/CEO",
    image: nathanielPhoto,
    imageScale: "scale-[1.45] -translate-y-2 object-top",
  },
  { name: "Mohamed Ayman", role: "COO", image: mohamedPhoto },
  { name: "Mostafa Hossam", role: "Head of Outreach Department", image: mostafaPhoto },
  {
    name: "Ivy Baker",
    role: "Head of Dispositions Department",
    image: ivyPhoto,
    imageScale: "scale-110 -translate-y-2 object-top",
    /* Ivy will be rendered using a background-image div for deterministic crop */
  },
  { name: "Nora Zaki", role: "Dispositions Manager", image: noraPhoto },
  { name: "Lina Hossam", role: "Acquisitions Manager", image: linaPhoto },
  { name: "Nate Atkins", role: "Acquisitions Manager", image: natePhoto },
  { name: "Denise Mancera", role: "Success Manager", image: denisePhoto },
  { name: "Hanna Aboubakr", role: "Social Media Manager", image: hanaPhoto },
  {
    name: "Angel Rafols",
    role: "Acquisition Specialist",
    image:
      "https://investwithevergreen.com/wp-content/uploads/2025/04/Angel-Photo-e1746039828271.jpg",
  },
  { name: "Maureen Vergara", role: "Acquisition Specialist", image: maureenPhoto },
  { name: "Ayat Ayman", role: "Acquisition Specialist", image: ayatPhoto },
  { name: "Shay Magdi", role: "Acquisition Specialist", image: shayPhoto },
  { name: "Raven Santiago", role: "Property Analyst", image: ravenPhoto },
  { name: "Kier Caguioa", role: "Property Analyst", image: kierPhoto },
  { name: "Kate Imperial", role: "Data Manager", image: kateImperialPhoto },
  { name: "Mark Anthony", role: "Automation Expert", image: markAnthonyPhoto, imageScale: "scale-110" },
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
          {teamMembers.map((member, index) => {
            const isIvy = member.name === "Ivy Baker";

            return (
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
                  className="overflow-hidden bg-card/90 border border-border/60 shadow-md group hover-lift zoom-on-hover transition-transform duration-300"
                  data-testid={`card-team-${index}`}
                >
                  <CardContent className="p-0">
                    <div className="w-[160px] sm:w-[180px] md:w-[200px] lg:w-[210px] aspect-[3/4] overflow-hidden">
                      {member.image ? (
                        isIvy ? (
                          // Ivy uses a background-image div to allow pixel-perfect crop control.
                          <div
                            className="team-photo-bg float-on-hover w-full h-full"
                            style={{
                              backgroundImage: `url(${member.image})`,
                              backgroundSize: "cover",
                              // backgroundPosition tuned to give Ivy comfortable right margin and centered face:
                              backgroundPosition: "60% 18%",
                            }}
                            role="img"
                            aria-label={`${member.name} - ${member.role}`}
                          />
                        ) : (
                          <img
                            src={member.image}
                            alt={`${member.name} - ${member.role}`}
                            className={`w-full h-full object-cover team-photo float-on-hover ${
                              (member as any).imageScale || "object-center"
                            }`}
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xl font-bold">
                          {member.name.split(" ").map((n) => n[0]).join("")}
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
              </Fade>
            );
          })}
        </div>
      </div>
    </section>
  );
}
