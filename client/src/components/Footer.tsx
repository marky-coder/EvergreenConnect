// client/src/components/Footer.tsx
import { SiFacebook, SiLinkedin, SiInstagram } from "react-icons/si";
import Fade from "@/components/Fade";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-card-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <Fade direction="up" duration={600} delay={0} distance={12} once>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-primary">Evergreen Land Investments</h3>
              <p className="text-sm text-muted-foreground">
                Quick and convenient cash offers for your property in any condition.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://www.linkedin.com/company/evergreen-land-investments/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full p-2 bg-accent text-accent-foreground hover:scale-110 transition-transform"
                  data-testid="link-footer-linkedin"
                  aria-label="LinkedIn"
                >
                  <SiLinkedin className="h-4 w-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full p-2 bg-accent text-accent-foreground hover:scale-110 transition-transform"
                  data-testid="link-footer-facebook"
                  aria-label="Facebook"
                >
                  <SiFacebook className="h-4 w-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full p-2 bg-accent text-accent-foreground hover:scale-110 transition-transform"
                  data-testid="link-footer-instagram"
                  aria-label="Instagram"
                >
                  <SiInstagram className="h-4 w-4" />
                </a>
              </div>
            </div>
          </Fade>

          <Fade direction="up" duration={600} delay={80} distance={12} once>
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/#about" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-about">About Us</a>
                </li>
                <li>
                  <a href="/#team" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-team">Team</a>
                </li>
                <li>
                  <a href="/#why-choose" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-why-choose">Why Choose Us</a>
                </li>
                <li>
                  <a href="/testimonials" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-testimonials">Testimonials</a>
                </li>
                <li>
                  <a href="/get-offer" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-get-offer">Get Cash Offer</a>
                </li>
              </ul>
            </div>
          </Fade>

          <Fade direction="up" duration={600} delay={160} distance={12} once>
            <div id="contact" className="space-y-4">
              <h4 className="font-semibold text-foreground">Contact Information</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="mailto:info@evergreenlandinvestments.com" className="hover:text-primary transition-colors">info@evergreenlandinvestments.com</a>
                </li>
                <li>
                  <a href="tel:+13466413237" className="hover:text-primary transition-colors font-semibold">(346) 641-3237</a>
                </li>
                <li>
                  <span className="text-muted-foreground">12300 NE 33rd St, Vancouver, WA 98682</span>
                </li>
                <li className="pt-2">
                  Operating Hours:
                  <br />
                  Monday - Saturday: 8:00 AM - 4:00 PM
                </li>
              </ul>
            </div>
          </Fade>
        </div>

        <div className="border-t border-card-border mt-12 pt-8 space-y-6">
          <div className="text-center max-w-3xl mx-auto">
            <Fade direction="up" duration={600} delay={220} distance={10} once>
              <blockquote className="text-sm md:text-base text-muted-foreground italic leading-relaxed">
                "Blessed is the one who trusts in the Lord; whose confidence is in Him..."
                <br />
                <cite className="font-semibold not-italic">Jeremiah 17:7-8</cite>
              </blockquote>
            </Fade>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <Fade direction="up" duration={600} delay={300} distance={10} once>
              <p>Copyright 2025 Invest with Evergreen LLC | All Rights Reserved</p>
            </Fade>

            <Fade direction="up" duration={600} delay={360} distance={10} once>
              <div className="flex gap-6">
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-privacy">Privacy Policy</a>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-terms">Terms & Conditions</a>
              </div>
            </Fade>
          </div>
        </div>
      </div>
    </footer>
  );
}
