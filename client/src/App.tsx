import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Testimonials from "@/pages/Testimonials";
import GetOffer from "@/pages/GetOffer";
import UploadTestimonial from "@/pages/UploadTestimonial";
import TestimonialsAdmin from "@/pages/TestimonialsAdmin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/testimonials" component={Testimonials} />
      <Route path="/testimonials/upload" component={UploadTestimonial} />
      <Route path="/testimonials/admin" component={TestimonialsAdmin} />
      <Route path="/get-offer" component={GetOffer} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
