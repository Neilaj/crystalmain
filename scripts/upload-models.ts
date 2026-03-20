/**
 * Upload local GLB files to Vercel Blob Storage
 *
 * Usage:
 * 1. Set BLOB_READ_WRITE_TOKEN env variable (from Vercel dashboard)
 * 2. Run: npx tsx scripts/upload-models.ts
 */

import { put } from "@vercel/blob";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const MODELS_DIR = join(process.cwd(), "public", "models");

async function uploadModels() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error("❌ Set BLOB_READ_WRITE_TOKEN environment variable first");
    console.error("   Get it from: Vercel → Storage → parsley-models → Settings");
    process.exit(1);
  }

  const files = readdirSync(MODELS_DIR).filter(
    (f) => f.endsWith(".glb") || f.endsWith(".usdz") || f.endsWith(".gltf")
  );

  if (files.length === 0) {
    console.log("No model files found in public/models/");
    return;
  }

  console.log(`Found ${files.length} model file(s) to upload:\n`);

  for (const file of files) {
    const filePath = join(MODELS_DIR, file);
    const buffer = readFileSync(filePath);
    const sizeMB = (buffer.length / 1024 / 1024).toFixed(1);

    console.log(`📦 Uploading ${file} (${sizeMB} MB)...`);

    try {
      const blob = await put(`models/${file}`, buffer, {
        access: "public",
        addRandomSuffix: false,
        token,
      });
      console.log(`   ✅ ${blob.url}\n`);
    } catch (err) {
      console.error(`   ❌ Failed: ${err}\n`);
    }
  }

  console.log("Done! Use these URLs in your ModelViewer component.");
}

uploadModels();
