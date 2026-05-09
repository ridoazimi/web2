/**
 * Utility untuk upload gambar.
 * Di Local: Simpan ke filesystem (storage/uploads).
 * Di Production: Disarankan menggunakan Cloudinary atau S3.
 * 
 * Untuk menggunakan Cloudinary, tambahkan ini di .env:
 * CLOUDINARY_CLOUD_NAME=xxx
 * CLOUDINARY_API_KEY=xxx
 * CLOUDINARY_API_SECRET=xxx
 * CLOUDINARY_UPLOAD_PRESET=xxx (optional, atau gunakan 'unsigned' upload)
 */

import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function uploadImage(file: File, folder: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Jika ada Cloudinary config, gunakan Cloudinary (Terutama untuk Production)
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    try {
      const formData = new FormData();
      formData.append("file", new Blob([buffer]));
      formData.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default");
      formData.append("folder", `dorizz-store/${folder}`);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (data.secure_url) {
        console.log(`[Upload] Cloudinary success: ${data.secure_url}`);
        return data.secure_url;
      }
      console.error("[Upload] Cloudinary failed, falling back to local:", data);
    } catch (err) {
      console.error("[Upload] Cloudinary error:", err);
    }
  }

  // Fallback ke Local Filesystem (Hanya bekerja jika server punya izin tulis & persistent storage)
  const uploadsDir = path.join(process.cwd(), "storage/uploads", folder);
  try {
    await mkdir(uploadsDir, { recursive: true });
  } catch (err) {}

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const filePath = path.join(uploadsDir, filename);

  await writeFile(filePath, buffer);
  return `/api/uploads/${folder}/${filename}`;
}
