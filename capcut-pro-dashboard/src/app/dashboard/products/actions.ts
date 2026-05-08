"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Fetch all available stock to calculate counts
    const stocks = await prisma.stockAccount.findMany({
      where: {
        status: "available",
      }
    });

    // Map stocks to products by relation
    return products.map((p: any) => {
      // Find matching stocks using productId relation
      const matchingStocks = stocks.filter(s => s.productId === p.id);

      // Calculate total available slots
      const availableStock = matchingStocks.reduce((acc, curr) => {
        const slots = (curr.maxSlots || 0) - (curr.usedSlots || 0);
        return acc + (slots > 0 ? slots : 0);
      }, 0);

      return {
        ...p,
        price: Number(p.price),
        availableStock
      };
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}


import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function createProduct(formData: FormData) {
  const auth = await requirePermission("page_marketplace");
  if ("error" in auth) throw new Error("Forbidden: Akses ditolak");

  try {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const maxSlots = parseInt(formData.get("maxSlots") as string);
    const duration = parseInt(formData.get("duration") as string);
    const isActive = formData.get("isActive") === "true";
    const rules = formData.get("rules") as string;
    const messageTemplate = formData.get("messageTemplate") as string;
    const imageFile = formData.get("imageFile") as File | null;
    let imageUrl = formData.get("imageUrl") as string || "";

    if (imageFile && imageFile.size > 0) {
      const uploadsDir = path.join(process.cwd(), "storage/uploads/products");
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (err) {}

      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = path.join(uploadsDir, filename);
      await writeFile(filePath, buffer);
      imageUrl = `/api/uploads/products/${filename}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        category,
        maxSlots,
        duration,
        imageUrl,
        isActive,
        rules,
        messageTemplate,
      },
    });
    revalidatePath("/dashboard/products");
    revalidatePath("/");
    return product;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

export async function updateProduct(id: string, formData: FormData) {
  const auth = await requirePermission("page_marketplace");
  if ("error" in auth) throw new Error("Forbidden: Akses ditolak");

  try {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const maxSlots = parseInt(formData.get("maxSlots") as string);
    const duration = parseInt(formData.get("duration") as string);
    const isActive = formData.get("isActive") === "true";
    const rules = formData.get("rules") as string;
    const messageTemplate = formData.get("messageTemplate") as string;
    const imageFile = formData.get("imageFile") as File | null;
    let imageUrl = formData.get("imageUrl") as string || "";

    if (imageFile && imageFile.size > 0) {
      const uploadsDir = path.join(process.cwd(), "storage/uploads/products");
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (err) {}

      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = path.join(uploadsDir, filename);
      await writeFile(filePath, buffer);
      imageUrl = `/api/uploads/products/${filename}`;
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        price,
        category,
        maxSlots,
        duration,
        imageUrl,
        isActive,
        rules,
        messageTemplate,
      },
    });
    revalidatePath("/dashboard/products");
    revalidatePath("/");
    return product;
  } catch (error: any) {
    console.error("Error updating product:", error);
    throw new Error(error.message || "Gagal mengupdate produk");
  }
}


export async function deleteProduct(id: string) {
  const auth = await requirePermission("page_marketplace");
  if ("error" in auth) throw new Error("Forbidden: Akses ditolak");
  try {
    await prisma.product.delete({
      where: { id },
    });
    revalidatePath("/dashboard/products");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}
