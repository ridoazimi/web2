import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// GET /api/sales - List all sales team members with performance stats
export async function GET(req: NextRequest) {
  const auth = await requirePermission("page_sales");
  if ("error" in auth) return auth.error;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { whatsapp: { contains: search, mode: "insensitive" } },
      ];
    }

    const txWhere: any = {};
    if (startDate || endDate) {
      txWhere.purchaseDate = {};
      if (startDate) {
        txWhere.purchaseDate.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        txWhere.purchaseDate.lte = end;
      }
    }

    const salesMembers = await prisma.salesTeam.findMany({
      where,
      include: {
        transactions: {
          where: txWhere,
          select: { amount: true, status: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Map stats dynamically (total closing, total revenue)
    const result = salesMembers.map(sales => {
      const allTx = sales.transactions;
      const totalAllClosing = allTx.length;
      const totalClosing = allTx.filter(t => t.status === "success").length;
      const totalRevenue = allTx
        .filter(t => t.status === "success")
        .reduce((sum, tx) => sum + Number(tx.amount), 0);

      const { transactions, ...salesData } = sales;
      return {
        ...salesData,
        totalClosing,
        totalAllClosing,
        totalRevenue
      };
    });

    return NextResponse.json({ sales: result });
  } catch (error) {
    console.error("GET /api/sales error:", error);
    return NextResponse.json({ error: "Gagal mengambil data sales" }, { status: 500 });
  }
}

// POST /api/sales - Create a new sales team member
export async function POST(req: NextRequest) {
  const auth = await requirePermission("page_sales");
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();
    const { name, code, whatsapp, status, password } = body;

    if (!name || !code) {
      return NextResponse.json({ error: "Nama dan Kode Sales wajib diisi" }, { status: 400 });
    }

    // Validate uniqueness of sales code
    const existing = await prisma.salesTeam.findUnique({
      where: { code }
    });
    if (existing) {
      return NextResponse.json({ error: "Kode Sales sudah digunakan oleh anggota lain" }, { status: 400 });
    }

    const sales = await prisma.salesTeam.create({
      data: {
        name,
        code: code.trim().toLowerCase(), // sanitize code to be lowercase and trimmed
        whatsapp,
        status: status || "active",
        password: password || null
      }
    });

    return NextResponse.json({ success: true, sales }, { status: 201 });
  } catch (error) {
    console.error("POST /api/sales error:", error);
    return NextResponse.json({ error: "Gagal membuat data sales" }, { status: 500 });
  }
}
