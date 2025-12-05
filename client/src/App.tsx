// src/App.tsx
import { Routes, Route } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/Home";
import Testimonials from "@/pages/Testimonials";
import GetOffer from "@/pages/GetOffer";
import UploadTestimonial from "@/pages/UploadTestimonial";
import TestimonialsAdmin from "@/pages/TestimonialsAdmin";
import ClosedDeals from "@/pages/ClosedDeals";
import ClosedDealsAdmin from "@/pages/ClosedDealsAdmin";
import NotFound from "@/pages/not-found";
import ThankYou from "@/pages/thank-you"; // <-- ADD THIS LINE

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/testimonials/upload" element={<UploadTestimonial />} />
          <Route path="/testimonials/admin" element={<TestimonialsAdmin />} />
          <Route path="/closed-deals" element={<ClosedDeals />} />
          <Route path="/closed-deals/admin" element={<ClosedDealsAdmin />} />
          <Route path="/get-offer" element={<GetOffer />} />

          {/* Hidden thank-you route — NOT linked anywhere in the UI */}
          <Route path="/thank-you" element={<ThankYou />} />

          {/* catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
