import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

export interface Testimonial {
  id: string;
  name: string;
  testimonialText: string;
  videoFilename?: string;
  videoUrl?: string;
  hasVideo: boolean;
  status: "pending" | "approved";
  uploadedAt: string;
}

const STORAGE_FILE = path.join(
  process.cwd(),
  "uploads",
  "testimonials-data.json"
);

// Initialize storage file if it doesn't exist
async function ensureStorageFile() {
  try {
    await fs.access(STORAGE_FILE);
  } catch {
    await fs.writeFile(
      STORAGE_FILE,
      JSON.stringify({ testimonials: [] }, null, 2)
    );
  }
}

// Read all testimonials
async function readTestimonials(): Promise<Testimonial[]> {
  await ensureStorageFile();
  const data = await fs.readFile(STORAGE_FILE, "utf-8");
  const parsed = JSON.parse(data);
  return parsed.testimonials || [];
}

// Write testimonials
async function writeTestimonials(testimonials: Testimonial[]): Promise<void> {
  await fs.writeFile(STORAGE_FILE, JSON.stringify({ testimonials }, null, 2));
}

// Add a new testimonial
export async function addTestimonial(
  name: string,
  testimonialText: string,
  videoFilename?: string
): Promise<Testimonial> {
  const testimonials = await readTestimonials();

  const newTestimonial: Testimonial = {
    id: nanoid(),
    name,
    testimonialText,
    hasVideo: !!videoFilename,
    status: "pending",
    uploadedAt: new Date().toISOString(),
  };

  // Add video info if video was uploaded
  if (videoFilename) {
    newTestimonial.videoFilename = videoFilename;
    newTestimonial.videoUrl = `/uploads/testimonials/pending/${videoFilename}`;
  }

  testimonials.push(newTestimonial);
  await writeTestimonials(testimonials);

  return newTestimonial;
}

// Get all pending testimonials
export async function getPendingTestimonials(): Promise<Testimonial[]> {
  const testimonials = await readTestimonials();
  return testimonials.filter((t) => t.status === "pending");
}

// Get all approved testimonials
export async function getApprovedTestimonials(): Promise<Testimonial[]> {
  const testimonials = await readTestimonials();
  return testimonials.filter((t) => t.status === "approved");
}

// Approve a testimonial
export async function approveTestimonial(id: string): Promise<boolean> {
  const testimonials = await readTestimonials();
  const testimonial = testimonials.find((t) => t.id === id);

  if (!testimonial) {
    return false;
  }

  try {
    // Move video file from pending to approved (if there is a video)
    if (testimonial.hasVideo && testimonial.videoFilename) {
      const pendingPath = path.join(
        process.cwd(),
        "uploads",
        "testimonials",
        "pending",
        testimonial.videoFilename
      );
      const approvedPath = path.join(
        process.cwd(),
        "uploads",
        "testimonials",
        "approved",
        testimonial.videoFilename
      );

      await fs.rename(pendingPath, approvedPath);
      testimonial.videoUrl = `/uploads/testimonials/approved/${testimonial.videoFilename}`;
    }

    // Update testimonial status
    testimonial.status = "approved";

    await writeTestimonials(testimonials);
    return true;
  } catch (error) {
    console.error("Error approving testimonial:", error);
    return false;
  }
}

// Reject (delete) a testimonial
export async function rejectTestimonial(id: string): Promise<boolean> {
  const testimonials = await readTestimonials();
  const testimonial = testimonials.find((t) => t.id === id);

  if (!testimonial) {
    return false;
  }

  // Delete video file (if there is one)
  if (testimonial.hasVideo && testimonial.videoFilename) {
    const videoPath = path.join(
      process.cwd(),
      "uploads",
      "testimonials",
      testimonial.status,
      testimonial.videoFilename
    );

    try {
      await fs.unlink(videoPath);
    } catch (error) {
      console.error("Error deleting video file:", error);
    }
  }

  // Remove from storage
  const updatedTestimonials = testimonials.filter((t) => t.id !== id);
  await writeTestimonials(updatedTestimonials);

  return true;
}
