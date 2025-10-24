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

const teamMembers = [
  {
    name: "Nathaniel Brimlow",
    role: "CEO",
    image: nathanielPhoto,
    imageScale: "scale-125", // Zoom out
  },
  {
    name: "Mohamed Ayman",
    role: "COO",
    image: mohamedPhoto,
    imageScale: "scale-125", // Zoom out
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
  ,
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {teamMembers.map((member, index) => (
            <Card
              key={index}
              className="text-center hover-elevate transition-all duration-300"
              data-testid={`card-team-${index}`}
            >
              <CardContent className="p-0 space-y-4">
                <div className="aspect-square w-full overflow-hidden rounded-t-md">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className={`w-full h-full object-cover object-center transition-transform ${
                        (member as any).imageScale || ""
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-4xl font-bold">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                </div>

                <div className="px-6 pb-6">
                  <h3 className="text-xl font-bold text-foreground">
                    {member.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
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
