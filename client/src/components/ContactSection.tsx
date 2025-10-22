import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function ContactSection() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    coldCallers: 1,
    acquisitionManagers: 1,
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ coldCallers: 1, acquisitionManagers: 1, message: "" });
  };

  return (
    <section id="contact" className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Get in Touch
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Ready to take your business to the next level? Schedule a free consultation or 
            request a custom package tailored to your needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Schedule Free Consultation</CardTitle>
              <CardDescription>
                Book a 30-minute meeting with one of our experts to discuss your business goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4 p-6">
                  <Calendar className="h-12 w-12 text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Calendly integration would go here
                  </p>
                  <Button
                    onClick={() => window.open('https://calendly.com', '_blank')}
                    data-testid="button-open-calendar"
                  >
                    Open Calendar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Request Custom Package</CardTitle>
              <CardDescription>
                Tell us about your specific needs and we'll create a tailored solution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coldCallers">Number of Cold Callers</Label>
                  <Input
                    id="coldCallers"
                    type="number"
                    min="1"
                    value={formData.coldCallers}
                    onChange={(e) => setFormData({ ...formData, coldCallers: parseInt(e.target.value) })}
                    data-testid="input-cold-callers"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="acquisitionManagers">Number of Acquisition Managers</Label>
                  <Input
                    id="acquisitionManagers"
                    type="number"
                    min="1"
                    value={formData.acquisitionManagers}
                    onChange={(e) => setFormData({ ...formData, acquisitionManagers: parseInt(e.target.value) })}
                    data-testid="input-acquisition-managers"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your business needs..."
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    data-testid="input-message"
                  />
                </div>
                
                <Button type="submit" className="w-full" data-testid="button-submit-contact">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Calendar({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
      <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
      <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
      <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
    </svg>
  );
}
