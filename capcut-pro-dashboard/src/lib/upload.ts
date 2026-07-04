/**
 * Utility untuk upload gambar.
 * Menggunakan Vercel Blob jika BLOB_READ_WRITE_TOKEN tersedia.
 * Fallback ke Local Filesystem jika tidak ada token.
 */

import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function uploadMedia(file: File, folder: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Jika ada Vercel Blob Token, gunakan Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `${folder}/${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      
      const blob = await put(filename, buffer, {
        access: "public",
        addRandomSuffix: true,
      });

      if (blob.url) {
        console.log(`[Upload] Vercel Blob success: ${blob.url}`);
        return blob.url;
      }
    } catch (err) {
      console.error("[Upload] Vercel Blob error:", err);
    }
  }

  // Fallback ke Local Filesystem
  const uploadsDir = path.join(process.cwd(), "public/uploads", folder);
  try {
    await mkdir(uploadsDir, { recursive: true });
  } catch (err) {}

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const filePath = path.join(uploadsDir, filename);

  await writeFile(filePath, buffer);
  // Di Next.js public folder diakses langsung dari root
  return `/uploads/${folder}/${filename}`;
}

/** @deprecated Use uploadMedia — kept for existing call sites */
export async function uploadImage(file: File, folder: string): Promise<string> {
  return uploadMedia(file, folder);
}
