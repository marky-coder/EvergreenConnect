import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendCashOfferEmail } from "./email";
import multer from "multer";
import path from "path";
import {
  addTestimonial,
  getPendingTestimonials,
  getApprovedTestimonials,
  approveTestimonial,
  rejectTestimonial,
} from "./testimonials-storage";

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

  // Configure multer for video uploads
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(
          null,
          path.join(process.cwd(), "uploads", "testimonials", "pending")
        );
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      },
    }),
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB max
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("video/")) {
        cb(null, true);
      } else {
        cb(new Error("Only video files are allowed"));
      }
    },
  });

  // Upload testimonial video (public - no auth required)
  app.post(
    "/api/testimonials/upload",
    upload.single("video"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            error: "No video file provided",
          });
        }

        const { name, testimonialText } = req.body;

        if (!name) {
          return res.status(400).json({
            success: false,
            error: "Name is required",
          });
        }

        const testimonial = await addTestimonial(
          name,
          testimonialText || "",
          req.file.filename
        );

        res.json({
          success: true,
          message: "Testimonial uploaded successfully",
          testimonial,
        });
      } catch (error) {
        console.error("Error uploading testimonial:", error);
        res.status(500).json({
          success: false,
          error: "Failed to upload testimonial",
        });
      }
    }
  );

  // Get pending testimonials (for admin)
  app.get("/api/testimonials/pending", async (req, res) => {
    try {
      const testimonials = await getPendingTestimonials();
      res.json({
        success: true,
        testimonials,
      });
    } catch (error) {
      console.error("Error getting pending testimonials:", error);
      res.status(500).json({
        success: false,
        error: "Failed to load testimonials",
      });
    }
  });

  // Get approved testimonials (for public page)
  app.get("/api/testimonials/approved", async (req, res) => {
    try {
      const testimonials = await getApprovedTestimonials();
      res.json({
        success: true,
        testimonials,
      });
    } catch (error) {
      console.error("Error getting approved testimonials:", error);
      res.status(500).json({
        success: false,
        error: "Failed to load testimonials",
      });
    }
  });

  // Approve testimonial (admin only - password checked in frontend)
  app.post("/api/testimonials/approve/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await approveTestimonial(id);

      if (success) {
        res.json({
          success: true,
          message: "Testimonial approved",
        });
      } else {
        res.status(404).json({
          success: false,
          error: "Testimonial not found",
        });
      }
    } catch (error) {
      console.error("Error approving testimonial:", error);
      res.status(500).json({
        success: false,
        error: "Failed to approve testimonial",
      });
    }
  });

  // Reject (delete) testimonial (admin only - password checked in frontend)
  app.delete("/api/testimonials/reject/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await rejectTestimonial(id);

      if (success) {
        res.json({
          success: true,
          message: "Testimonial rejected and deleted",
        });
      } else {
        res.status(404).json({
          success: false,
          error: "Testimonial not found",
        });
      }
    } catch (error) {
      console.error("Error rejecting testimonial:", error);
      res.status(500).json({
        success: false,
        error: "Failed to reject testimonial",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
