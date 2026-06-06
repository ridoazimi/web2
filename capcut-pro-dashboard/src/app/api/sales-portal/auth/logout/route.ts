import { NextResponse } from "next/server";
import { clearSalesCookie } from "@/lib/sales-auth";

export async function POST() {
  await clearSalesCookie();
  return NextResponse.json({ success: true, message: "Berhasil keluar" });
}
