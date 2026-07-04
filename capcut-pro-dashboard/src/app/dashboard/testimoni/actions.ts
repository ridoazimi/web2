"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { uploadMedia } from "@/lib/upload";
import type { TestimonialItem } from "@/data/testimonials";

function mapTestimonial(row: {
  id: string;
  type: string;
  mediaUrl: string;
  customerName: string;
  topTag: string | null;
  statusText: string | null;
}): TestimonialItem {
  return {
    id: row.id,
    type: row.type as "image" | "video",
    mediaUrl: row.mediaUrl,
    customerName: row.customerName,
    topTag: row.topTag ?? undefined,
    statusText: row.statusText ?? undefined,
  };
}

export async function getTestimonials(activeOnly = false): Promise<TestimonialItem[]> {
  try {
    const rows = await prisma.testimonial.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapTestimonial);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return [];
  }
}

export async function createTestimonial(formData: FormData) {
  const auth = await requirePermission("page_testimonials");
  if ("error" in auth) throw new Error("Forbidden: Akses ditolak");

  const type = formData.get("type") as string;
  const customerName = (formData.get("customerName") as string)?.trim();
  const topTag = (formData.get("topTag") as string)?.trim() || null;
  const statusText = (formData.get("statusText") as string)?.trim() || null;
  const mediaFile = formData.get("mediaFile") as File | null;

  if (!customerName) throw new Error("Nama pelanggan wajib diisi");
  if (!type || !["image", "video"].includes(type)) throw new Error("Tipe media tidak valid");
  if (!mediaFile || mediaFile.size === 0) throw new Error("File media wajib diunggah");

  let mediaUrl: string;
  try {
    mediaUrl = await uploadMedia(mediaFile, "testimonials");
  } catch (err) {
    console.error("[Testimonial Upload] Failed:", err);
    throw new Error("Gagal mengunggah media");
  }

  await prisma.testimonial.create({
    data: {
      type,
      mediaUrl,
      customerName,
      topTag,
      statusText,
    },
  });

  revalidatePath("/testimoni");
  revalidatePath("/dashboard/testimoni");
}

export async function deleteTestimonial(id: string) {
  const auth = await requirePermission("page_testimonials");
  if ("error" in auth) throw new Error("Forbidden: Akses ditolak");

  await prisma.testimonial.delete({ where: { id } });

  revalidatePath("/testimoni");
  revalidatePath("/dashboard/testimoni");
}
