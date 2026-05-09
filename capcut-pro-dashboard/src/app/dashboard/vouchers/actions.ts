"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth";

async function checkAdmin() {
  const user = await getAuthUser();
  if (!user || (user.role !== "developer" && user.role !== "superadmin")) {
    throw new Error("Unauthorized: Superadmin access required");
  }
  return user;
}

export async function getVouchers() {
  try {
    await checkAdmin();
    const vouchers = await prisma.voucher.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Map Decimal to Number for serialization
    return vouchers.map(v => ({
      ...v,
      value: Number(v.value),
      minPurchase: Number(v.minPurchase)
    }));
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    return [];
  }
}

export async function createVoucher(data: {
  code: string;
  type: string;
  value: number;
  maxUsage?: number | null;
  minPurchase?: number;
  expiryDate?: string | null;
  isActive: boolean;
}) {
  try {
    await checkAdmin();
    await prisma.voucher.create({
      data: {
        code: data.code.toUpperCase(),
        type: data.type,
        value: data.value,
        maxUsage: data.maxUsage || null,
        minPurchase: data.minPurchase || 0,
        expiryDate: (data.expiryDate && data.expiryDate.trim() !== "") ? new Date(data.expiryDate) : null,
        isActive: data.isActive,
      },
    });
    revalidatePath("/dashboard/vouchers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateVoucher(id: string, data: {
  code: string;
  type: string;
  value: number;
  maxUsage?: number | null;
  minPurchase?: number;
  expiryDate?: string | null;
  isActive: boolean;
}) {
  try {
    await checkAdmin();
    await prisma.voucher.update({
      where: { id },
      data: {
        code: data.code.toUpperCase(),
        type: data.type,
        value: data.value,
        maxUsage: data.maxUsage || null,
        minPurchase: data.minPurchase || 0,
        expiryDate: (data.expiryDate && data.expiryDate.trim() !== "") ? new Date(data.expiryDate) : null,
        isActive: data.isActive,
      },
    });
    revalidatePath("/dashboard/vouchers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteVoucher(id: string) {
  try {
    await checkAdmin();
    await prisma.voucher.delete({ where: { id } });
    revalidatePath("/dashboard/vouchers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function validateVoucher(code: string, subtotal: number) {
  try {
    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!voucher) return { success: false, error: "Voucher tidak ditemukan" };
    if (!voucher.isActive) return { success: false, error: "Voucher tidak aktif" };

    if (voucher.expiryDate && new Date() > new Date(voucher.expiryDate)) {
      return { success: false, error: "Voucher sudah kedaluwarsa" };
    }

    if (voucher.maxUsage !== null && (voucher.currentUsage || 0) >= voucher.maxUsage) {
      return { success: false, error: "Kuota voucher sudah habis" };
    }

    if (subtotal < Number(voucher.minPurchase)) {
      return {
        success: false,
        error: `Minimal pembelian Rp ${Number(voucher.minPurchase).toLocaleString("id-ID")}`
      };
    }

    let discount = 0;
    if (voucher.type === "PERCENTAGE") {
      discount = (subtotal * Number(voucher.value)) / 100;
    } else {
      discount = Number(voucher.value);
    }

    return {
      success: true,
      discount,
      code: voucher.code,
      type: voucher.type,
      value: Number(voucher.value)
    };
  } catch (error: any) {
    return { success: false, error: "Gagal memproses voucher" };
  }
}
