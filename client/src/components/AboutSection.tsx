// client/src/components/AboutSection.tsx
import { SiFacebook, SiLinkedin, SiInstagram } from "react-icons/si";
import evergreenLogo from "@assets/evergreen-logo-removebg-preview_1761178576710.png";
import Fade from "@/components/Fade";

export default function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column: heading + copy + social icons */}
          <div className="space-y-6">
            <Fade direction="up" duration={700} delay={0} distance={16} once>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                About Evergreen Land Investments
              </h2>
            </Fade>

            <div className="space-y-4 text-base md:text-lg">
              {/* We'll stagger the paragraphs by giving explicit delays */}
              <Fade direction="up" duration={700} delay={80} distance={12} once index={0} staggerGap={80}>
                <p className="text-foreground">
                  Here at Evergreen, we love bringing beauty to our community! We are a small, local
                  company eager to connect home and land owners with solutions to their problems and
                  pathways to their dreams.
                </p>
              </Fade>

              <Fade direction="up" duration={700} delay={160} distance={12} once index={1} staggerGap={80}>
                <p className="text-muted-foreground">
                  That is why we provide quick and convenient cash offers for your property in any condition.
                </p>
              </Fade>

              <Fade direction="up" duration={700} delay={240} distance={12} once index={2} staggerGap={80}>
                <p className="text-muted-foreground">
                  We skip the listing, commissions, appraisals, lenders, and agents and take care of any
                  clean-up ourselves; putting more money in your pocket and saving you time and energy.
                  Our data-backed algorithms help us offer you top dollar and we can close as quickly as 14 days!
                </p>
              </Fade>
            </div>

            <div className="flex gap-4 pt-4 items-center">
              {/* Social icons: staggered from the left */}
              <Fade direction="left" duration={600} delay={320} distance={12} once index={0} staggerGap={60}>
                <a
                  href="https://www.linkedin.com/company/evergreen-land-investments/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full p-3 bg-accent text-accent-foreground transition-transform duration-300 hover:scale-110"
                  data-testid="link-linkedin"
                  aria-label="LinkedIn"
                >
                  <SiLinkedin className="h-5 w-5" />
                </a>
              </Fade>

              <Fade direction="left" duration={600} delay={380} distance={12} once index={1} staggerGap={60}>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full p-3 bg-accent text-accent-foreground transition-transform duration-300 hover:scale-110"
                  data-testid="link-facebook"
                  aria-label="Facebook"
                >
                  <SiFacebook className="h-5 w-5" />
                </a>
              </Fade>

              <Fade direction="left" duration={600} delay={440} distance={12} once index={2} staggerGap={60}>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full p-3 bg-accent text-accent-foreground transition-transform duration-300 hover:scale-110"
                  data-testid="link-instagram"
                  aria-label="Instagram"
                >
                  <SiInstagram className="h-5 w-5" />
                </a>
              </Fade>
            </div>
          </div>

          {/* Right column: logo / image */}
          <Fade direction="right" duration={700} delay={140} distance={16} once>
            <div className="flex items-center justify-center p-8">
              <img
                src={evergreenLogo}
                alt="Evergreen Land Investments Logo"
                className="w-full max-w-sm h-auto"
                data-testid="img-logo-about"
              />
            </div>
          </Fade>
        </div>
      </div>
    </section>
  );
}
