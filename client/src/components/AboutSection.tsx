// client/src/components/AboutSection.tsx
import { SiFacebook, SiLinkedin, SiInstagram } from "react-icons/si";
import evergreenLogo from "@assets/evergreen-logo-removebg-preview_1761178576710.png";
import Reveal from "@/components/Reveal";

export default function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column: heading + copy + social icons */}
          <div className="space-y-6">
            <Reveal direction="up" delay={0} debug={true}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                About Evergreen Land Investments
              </h2>
            </Reveal>

            <div className="space-y-4 text-base md:text-lg">
              <Reveal direction="up" delay={0.06} debug={true}>
                <p className="text-foreground">
                  Here at Evergreen, we love bringing beauty to our community! We are a small, local
                  company eager to connect home and land owners with solutions to their problems and
                  pathways to their dreams.
                </p>
              </Reveal>

              <Reveal direction="up" delay={0.12} debug={true}>
                <p className="text-muted-foreground">
                  That is why we provide quick and convenient cash offers for your property in any condition.
                </p>
              </Reveal>

              <Reveal direction="up" delay={0.18} debug={true}>
                <p className="text-muted-foreground">
                  We skip the listing, commissions, appraisals, lenders, and agents and take care of any
                  clean-up ourselves; putting more money in your pocket and saving you time and energy.
                  Our data-backed algorithms help us offer you top dollar and we can close as quickly as 14 days!
                </p>
              </Reveal>
            </div>

            <div className="flex gap-4 pt-4">
              <Reveal direction="left" delay={0.22} debug={true}>
                <a
                  href="https://www.linkedin.com/company/evergreen-land-investments/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover-elevate active-elevate-2 rounded-full p-3 bg-accent"
                  data-testid="link-linkedin"
                  aria-label="LinkedIn"
                >
                  <SiLinkedin className="h-5 w-5 text-accent-foreground" />
                </a>
              </Reveal>

              <Reveal direction="left" delay={0.28} debug={true}>
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
              </Reveal>

              <Reveal direction="left" delay={0.34} debug={true}>
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
              </Reveal>
            </div>
          </div>

          {/* Right column: logo / image */}
          <Reveal direction="right" delay={0.12} debug={true} className="flex items-center justify-center p-8">
            <img
              src={evergreenLogo}
              alt="Evergreen Land Investments Logo"
              className="w-full max-w-sm h-auto"
              data-testid="img-logo-about"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
