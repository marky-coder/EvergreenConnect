// client/src/components/ContactSection.tsx
import { Button } from "@/components/ui/button";
import { Mail, Phone } from "lucide-react";

export default function ContactSection() {
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const body = {
      name: fd.get("name"),
      email: fd.get("email"),
      message: fd.get("message"),
    };

    try {
      // If you have a real API endpoint, change the URL below.
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Network Error");

      // simple success UX — replace with nicer UI if you prefer
      alert("Message sent — we'll be in touch!");
      form.reset();
    } catch (err) {
      console.error(err);
      alert("Sorry — there was a problem sending your message.");
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24 lg:py-32 bg-muted/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Contact Us</h2>
          <p className="text-muted-foreground mt-3">
            Fill out the form below or email us at{" "}
            <a
              href="mailto:info@evergreenlandinvestments.co"
              className="text-primary underline"
            >
              info@evergreenlandinvestments.co
            </a>
            .
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto grid gap-4">
          <input
            name="name"
            type="text"
            required
            placeholder="Your name"
            className="w-full rounded-md border border-border bg-background px-4 py-3"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="Email address"
            className="w-full rounded-md border border-border bg-background px-4 py-3"
          />
          <textarea
            name="message"
            rows={6}
            required
            placeholder="How can we help?"
            className="w-full rounded-md border border-border bg-background px-4 py-3"
          />

          <div className="flex justify-center">
            <Button type="submit" size="lg">
              Send Message
            </Button>
          </div>
        </form>

        <div className="max-w-2xl mx-auto mt-8 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Mail className="h-4 w-4" /> info@evergreenlandinvestments.co
          </p>
          <p className="flex items-center justify-center gap-2 mt-2">
            <Phone className="h-4 w-4" /> (512) 555-0123
          </p>
        </div>
      </div>
    </section>
  );
}
