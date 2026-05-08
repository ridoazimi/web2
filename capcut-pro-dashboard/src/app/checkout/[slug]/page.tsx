import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage(props: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ ref?: string }>
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const product = await prisma.product.findUnique({
    where: { slug: params.slug }
  });

  if (!product || !product.isActive) {
    notFound();
  }

  // Hitung stok tersedia
  const stocks = await prisma.stockAccount.findMany({
    where: {
      productId: product.id,
      status: "available"
    }
  });

  const availableStock = stocks.reduce((acc, curr) => {
    const slots = (curr.maxSlots || 0) - (curr.usedSlots || 0);
    return acc + (slots > 0 ? slots : 0);
  }, 0);

  // Ubah Decimal Prisma menjadi tipe data standard/JSON safe untuk di-pass ke Client Component
  const productData = {
    ...product,
    price: Number(product.price),
    availableStock
  };


  return <CheckoutClient product={productData} initialRef={searchParams.ref || ""} />;
}
