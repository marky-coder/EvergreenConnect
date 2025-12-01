// server/routes.ts
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
  editTestimonial,
  deleteVideoFromTestimonial,
  deleteTextFromTestimonial,
  getTestimonialById,
} from "./testimonials-storage";
import {
  addDealLocation,
  getAllDealLocations,
  deleteDealLocation,
  updateDealLocationName,
} from "./deals-storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // --- Admin auth configuration ---
  // NOTE: For convenience the password is hardcoded here as requested.
  // Security WARNING: Hardcoding secrets in code is unsafe for production.
  // Replace this with process.env.ADMIN_PASSWORD in production environments.
  const ADMIN_PASSWORD = "VitaTalent2025!";

  function requireAdmin(req: any, res: any, next: any) {
    if (req?.session?.isAdmin) {
      next();
    } else {
      res.status(401).json({ success: false, error: "Unauthorized" });
    }
  }

  // Admin login — sets req.session.isAdmin = true when password matches
  app.post("/api/admin/login", (req, res) => {
    try {
      const { password } = req.body || {};
      if (password === ADMIN_PASSWORD) {
        // mark session as admin
        req.session.isAdmin = true;
        res.json({ success: true });
      } else {
        res.status(401).json({ success: false, error: "Invalid password" });
      }
    } catch (err) {
      console.error("Admin login error:", err);
      res.status(500).json({ success: false, error: "Login failed" });
    }
  });

  // Admin logout — destroys session
  app.post("/api/admin/logout", (req, res) => {
    try {
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ success: false, error: "Logout failed" });
        }
        res.json({ success: true });
      });
    } catch (err) {
      console.error("Admin logout error:", err);
      res.status(500).json({ success: false, error: "Logout failed" });
    }
  });

  // Admin status
  app.get("/api/admin/status", (req, res) => {
    try {
      res.json({ success: true, isAdmin: !!req.session.isAdmin });
    } catch (err) {
      res.status(500).json({ success: false, error: "Failed to check status" });
    }
  });

  // --- Existing routes (unchanged otherwise) ---
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
        error: "Failed to submit your request. Please try again or contact us directly.",
      });
    }
  });

  // Configure multer for video uploads
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), "uploads", "testimonials", "pending"));
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

  // Upload testimonial (public - no auth required)
  app.post(
    "/api/testimonials/upload",
    upload.single("video"),
    async (req, res) => {
      try {
        const { name, testimonialText } = req.body;
        // Validate
        if (!name) {
          return res.status(400).json({ success: false, error: "Name is required" });
        }
        if (!req.file && !testimonialText?.trim()) {
          return res.status(400).json({
            success: false,
            error: "Please provide either a video, written testimonial, or both",
          });
        }

        const testimonial = await addTestimonial(name, testimonialText || "", req.file?.filename);
        res.json({
          success: true,
          message: "Testimonial submitted successfully! It will be reviewed before appearing on our website.",
          testimonial,
        });
      } catch (error) {
        console.error("Error uploading testimonial:", error);
        res.status(500).json({ success: false, error: "Failed to upload testimonial" });
      }
    }
  );

  // Get pending testimonials (for admin) — PROTECTED
  app.get("/api/testimonials/pending", requireAdmin, async (req, res) => {
    try {
      const testimonials = await getPendingTestimonials();
      res.json({ success: true, testimonials });
    } catch (error) {
      console.error("Error getting pending testimonials:", error);
      res.status(500).json({ success: false, error: "Failed to load testimonials" });
    }
  });

  // Get approved testimonials (for public page)
  app.get("/api/testimonials/approved", async (req, res) => {
    try {
      const testimonials = await getApprovedTestimonials();
      res.json({ success: true, testimonials });
    } catch (error) {
      console.error("Error getting approved testimonials:", error);
      res.status(500).json({ success: false, error: "Failed to load testimonials" });
    }
  });

  // Approve testimonial (admin only)
  app.post("/api/testimonials/approve/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await approveTestimonial(id);

      if (success) {
        res.json({ success: true, message: "Testimonial approved" });
      } else {
        res.status(404).json({ success: false, error: "Testimonial not found" });
      }
    } catch (error) {
      console.error("Error approving testimonial:", error);
      res.status(500).json({ success: false, error: "Failed to approve testimonial" });
    }
  });

  // Reject (delete) testimonial (admin only)
  app.delete("/api/testimonials/reject/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await rejectTestimonial(id);

      if (success) {
        res.json({ success: true, message: "Testimonial rejected and deleted" });
      } else {
        res.status(404).json({ success: false, error: "Testimonial not found" });
      }
    } catch (error) {
      console.error("Error rejecting testimonial:", error);
      res.status(500).json({ success: false, error: "Failed to reject testimonial" });
    }
  });

  // Edit testimonial (admin only)
  app.put("/api/testimonials/edit/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, testimonialText } = req.body;

      const success = await editTestimonial(id, { name, testimonialText });

      if (success) {
        res.json({ success: true, message: "Testimonial updated successfully" });
      } else {
        res.status(404).json({ success: false, error: "Testimonial not found" });
      }
    } catch (error) {
      console.error("Error editing testimonial:", error);
      res.status(500).json({ success: false, error: "Failed to edit testimonial" });
    }
  });

  // Delete video from testimonial (admin only)
  app.delete("/api/testimonials/:id/video", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await deleteVideoFromTestimonial(id);

      if (success) {
        res.json({ success: true, message: "Video deleted successfully" });
      } else {
        res.status(404).json({ success: false, error: "Testimonial not found or has no video" });
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ success: false, error: "Failed to delete video" });
    }
  });

  // Delete text from testimonial (admin only)
  app.delete("/api/testimonials/:id/text", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await deleteTextFromTestimonial(id);

      if (success) {
        res.json({ success: true, message: "Text deleted successfully" });
      } else {
        res.status(404).json({ success: false, error: "Testimonial not found or has no text" });
      }
    } catch (error) {
      console.error("Error deleting text:", error);
      res.status(500).json({ success: false, error: "Failed to delete text" });
    }
  });

  // Get single testimonial by ID (admin only)
  app.get("/api/testimonials/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const testimonial = await getTestimonialById(id);

      if (testimonial) {
        res.json({ success: true, testimonial });
      } else {
        res.status(404).json({ success: false, error: "Testimonial not found" });
      }
    } catch (error) {
      console.error("Error getting testimonial:", error);
      res.status(500).json({ success: false, error: "Failed to get testimonial" });
    }
  });

  // Get all deal locations (public)
  app.get("/api/deals/locations", async (req, res) => {
    try {
      const locations = await getAllDealLocations();
      res.json({ success: true, locations });
    } catch (error) {
      console.error("Error getting deal locations:", error);
      res.status(500).json({ success: false, error: "Failed to get deal locations" });
    }
  });

  // Add deal location (admin only) — PROTECTED
  app.post("/api/deals/locations", requireAdmin, async (req, res) => {
    try {
      const { lat, lng, name, city, state } = req.body;

      if (!lat || !lng) {
        return res.status(400).json({ success: false, error: "Latitude and longitude are required" });
      }

      const location = await addDealLocation(lat, lng, name, city, state);
      res.json({ success: true, location });
    } catch (error) {
      console.error("Error adding deal location:", error);
      res.status(500).json({ success: false, error: "Failed to add deal location" });
    }
  });

  // Update deal location name (admin only)
  app.put("/api/deals/locations/:id/name", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (name === undefined) {
        return res.status(400).json({ success: false, error: "Name is required" });
      }

      const success = await updateDealLocationName(id, name);

      if (success) {
        res.json({ success: true, message: "Location name updated" });
      } else {
        res.status(404).json({ success: false, error: "Location not found" });
      }
    } catch (error) {
      console.error("Error updating location name:", error);
      res.status(500).json({ success: false, error: "Failed to update location name" });
    }
  });

  // Delete deal location (admin only)
  app.delete("/api/deals/locations/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await deleteDealLocation(id);

      if (success) {
        res.json({ success: true, message: "Deal location deleted" });
      } else {
        res.status(404).json({ success: false, error: "Deal location not found" });
      }
    } catch (error) {
      console.error("Error deleting deal location:", error);
      res.status(500).json({ success: false, error: "Failed to delete deal location" });
    }
  });

  // Fallback / other routes omitted for brevity (if any)
  return createServer(app);
}
