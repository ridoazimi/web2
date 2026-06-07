import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";

// GET /api/sales/[id] - Get detailed info and closing transaction history of a sales member
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission("page_sales");
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

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

    const sales = await prisma.salesTeam.findUnique({
      where: { id },
      include: {
        transactions: {
          where: txWhere,
          include: {
            user: { select: { name: true, email: true, whatsapp: true } },
            stockAccount: { select: { accountEmail: true } }
          },
          orderBy: { purchaseDate: "desc" }
        }
      }
    });

    if (!sales) {
      return NextResponse.json({ error: "Sales tidak ditemukan" }, { status: 404 });
    }

    const allTx = sales.transactions;
    const totalAllClosing = allTx.length;
    const totalClosing = allTx.filter(t => t.status === "success").length;
    const totalRevenue = allTx
      .filter(t => t.status === "success")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    return NextResponse.json({
      sales: {
        ...sales,
        totalClosing,
        totalAllClosing,
        totalRevenue
      }
    });
  } catch (error) {
    console.error("GET /api/sales/[id] error:", error);
    return NextResponse.json({ error: "Gagal mengambil detail sales" }, { status: 500 });
  }
}

// PATCH /api/sales/[id] - Update sales profile info (name, code, whatsapp, status, password)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission("page_sales");
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, code, whatsapp, status, password, category } = body;

    // Validate existence
    const existingSales = await prisma.salesTeam.findUnique({ where: { id } });
    if (!existingSales) {
      return NextResponse.json({ error: "Sales tidak ditemukan" }, { status: 404 });
    }

    // Validate code uniqueness if changed
    if (code && code.trim().toLowerCase() !== existingSales.code) {
      const sanitizedCode = code.trim().toLowerCase();
      const duplicate = await prisma.salesTeam.findUnique({ where: { code: sanitizedCode } });
      if (duplicate) {
        return NextResponse.json({ error: "Kode Sales sudah digunakan" }, { status: 400 });
      }
    }

    const updated = await prisma.salesTeam.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        code: code !== undefined ? code.trim().toLowerCase() : undefined,
        whatsapp: whatsapp !== undefined ? whatsapp : undefined,
        status: status !== undefined ? status : undefined,
        password: password !== undefined ? password : undefined,
        category: category !== undefined ? (category || null) : undefined,
      }
    });

    return NextResponse.json({ success: true, sales: updated });
  } catch (error) {
    console.error("PATCH /api/sales/[id] error:", error);
    return NextResponse.json({ error: "Gagal mengupdate data sales" }, { status: 500 });
  }
}

// DELETE /api/sales/[id] - Delete a sales member
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission("page_sales");
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;

    const existingSales = await prisma.salesTeam.findUnique({ where: { id } });
    if (!existingSales) {
      return NextResponse.json({ error: "Sales tidak ditemukan" }, { status: 404 });
    }

    await prisma.salesTeam.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Data sales berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/sales/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus data sales" }, { status: 500 });
  }
}
