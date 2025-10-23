import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendCashOfferEmail } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to submit cash offer form
  app.post("/api/submit-offer", async (req, res) => {
    try {
      const formData = req.body;

      // Validate required fields
      const requiredFields = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "propertyAddress",
        "city",
        "state",
        "zipCode",
        "propertyType",
        "propertyCondition",
        "desiredTimeline",
      ];

      for (const field of requiredFields) {
        if (!formData[field]) {
          return res.status(400).json({
            success: false,
            error: `Missing required field: ${field}`,
          });
        }
      }

      // Send email
      await sendCashOfferEmail(formData);

      res.json({
        success: true,
        message: "Your request has been submitted successfully!",
      });
    } catch (error) {
      console.error("Error processing form submission:", error);
      res.status(500).json({
        success: false,
        error:
          "Failed to submit your request. Please try again or contact us directly.",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
