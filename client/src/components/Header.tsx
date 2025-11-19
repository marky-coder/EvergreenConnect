import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import { Menu, X } from "lucide-react";
import { useLocation } from "wouter";
import evergreenLogo from "@assets/evergreen-logo-removebg-preview_1761178576710.png";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string, isPage?: boolean) => {
    setIsMobileMenuOpen(false);

    // ✅ PAGE ROUTES → use SPA navigation (wouter), no full reload
    if (isPage) {
      setLocation(`/${id}`); // e.g. "/get-offer", "/testimonials", "/closed-deals"
      return;
    }

    // ✅ SECTION SCROLLING
    if (location === "/") {
      // Already on homepage → smooth scroll to section
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: "smooth" });
    } else {
      // Go to homepage with hash → Home's useEffect will scroll
      setLocation(`/#${id}`);
    }
  };

  const goToHome = () => {
    if (location === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setLocation("/");
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }
  };

  const navLinks = [
    { label: "About", id: "about" },
    { label: "Team", id: "team" },
    { label: "Why Choose Us", id: "why-choose" },
    { label: "Closed Deals", id: "closed-deals", isPage: true },
    { label: "Testimonials", id: "testimonials", isPage: true },
    { label: "Get Cash Offer", id: "get-offer", isPage: true },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-sm border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <button
            onClick={goToHome}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            data-testid="button-logo"
          >
            <img
              src={evergreenLogo}
              alt="Evergreen Logo"
              className="h-14 md:h-16 w-auto"
              data-testid="img-logo-header"
            />
            <span className="text-2xl md:text-3xl font-bold text-primary">
              Evergreen Land Investments
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id, (link as any).isPage)}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isScrolled ? "text-foreground" : "text-white"
                }`}
                data-testid={`link-${link.id}`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <nav className="container mx-auto px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id, (link as any).isPage)}
                className="block w-full text-left py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                data-testid={`link-mobile-${link.id}`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
