import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

export interface DealLocation {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  city?: string;
  state?: string;
  addedAt: string;
}

const STORAGE_FILE = path.join(
  process.cwd(),
  "uploads",
  "deals-locations.json"
);

// Initialize storage file if it doesn't exist
async function ensureStorageFile() {
  try {
    await fs.access(STORAGE_FILE);
  } catch {
    await fs.writeFile(
      STORAGE_FILE,
      JSON.stringify({ locations: [] }, null, 2)
    );
  }
}

// Read all deal locations
async function readDealLocations(): Promise<DealLocation[]> {
  await ensureStorageFile();
  const data = await fs.readFile(STORAGE_FILE, "utf-8");
  const parsed = JSON.parse(data);
  return parsed.locations || [];
}

// Write deal locations
async function writeDealLocations(locations: DealLocation[]): Promise<void> {
  await fs.writeFile(STORAGE_FILE, JSON.stringify({ locations }, null, 2));
}

// Add a new deal location
export async function addDealLocation(
  lat: number,
  lng: number,
  name?: string,
  city?: string,
  state?: string
): Promise<DealLocation> {
  const locations = await readDealLocations();

  const newLocation: DealLocation = {
    id: nanoid(),
    lat,
    lng,
    name,
    city,
    state,
    addedAt: new Date().toISOString(),
  };

  locations.push(newLocation);
  await writeDealLocations(locations);

  return newLocation;
}

// Get all deal locations
export async function getAllDealLocations(): Promise<DealLocation[]> {
  return await readDealLocations();
}

// Update a deal location name
export async function updateDealLocationName(
  id: string,
  name: string
): Promise<boolean> {
  const locations = await readDealLocations();
  const location = locations.find((loc) => loc.id === id);

  if (!location) {
    return false;
  }

  location.name = name;
  await writeDealLocations(locations);
  return true;
}

// Delete a deal location
export async function deleteDealLocation(id: string): Promise<boolean> {
  const locations = await readDealLocations();
  const filteredLocations = locations.filter((loc) => loc.id !== id);

  if (filteredLocations.length === locations.length) {
    return false; // Location not found
  }

  await writeDealLocations(filteredLocations);
  return true;
}
