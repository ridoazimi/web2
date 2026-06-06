import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// ─── Config ──────────────────────────────────────────────────────────────────

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "capcut-dashboard-secret-key-change-in-production"
);
const COOKIE_NAME = "sales_token";
const TOKEN_EXPIRY = "30d"; // Sales token lasts 30 days

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SalesPayload {
  id: string;
  code: string;
  name: string;
  role: "sales";
}

// ─── JWT ──────────────────────────────────────────────────────────────────────

export async function signSalesToken(payload: SalesPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifySalesToken(token: string): Promise<SalesPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if ((payload as Record<string, unknown>).role !== "sales") return null;
    return payload as unknown as SalesPayload;
  } catch {
    return null;
  }
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────

export async function setSalesCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function clearSalesCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSalesCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || null;
}

// ─── Get current sales user ───────────────────────────────────────────────────

export async function getSalesUser(): Promise<SalesPayload | null> {
  const token = await getSalesCookie();
  if (!token) return null;
  return verifySalesToken(token);
}

// ─── Auth Guard (for API routes) ─────────────────────────────────────────────

export async function requireSales(): Promise<
  { sales: SalesPayload; error?: never } | { sales?: never; error: NextResponse }
> {
  const sales = await getSalesUser();
  if (!sales) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  // Verify sales still exists and is active
  const dbSales = await prisma.salesTeam.findUnique({
    where: { id: sales.id },
    select: { id: true, status: true },
  });

  if (!dbSales || dbSales.status !== "active") {
    return { error: NextResponse.json({ error: "Akun sales tidak aktif" }, { status: 401 }) };
  }

  return { sales };
}
