import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { signSalesToken, setSalesCookie } from "@/lib/sales-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, password } = body;

    if (!code || !password) {
      return NextResponse.json({ error: "Kode Sales dan Password wajib diisi" }, { status: 400 });
    }

    const sales = await prisma.salesTeam.findUnique({
      where: { code: code.trim().toLowerCase() }
    });

    if (!sales) {
      return NextResponse.json({ error: "Akun sales tidak ditemukan" }, { status: 401 });
    }

    if (sales.status !== "active") {
      return NextResponse.json({ error: "Akun sales dinonaktifkan oleh admin" }, { status: 401 });
    }

    if (sales.password !== password) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    // Generate JWT token
    const token = await signSalesToken({
      id: sales.id,
      code: sales.code,
      name: sales.name,
      role: "sales"
    });

    await setSalesCookie(token);

    return NextResponse.json({ success: true, name: sales.name });
  } catch (error) {
    console.error("Sales login API error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
