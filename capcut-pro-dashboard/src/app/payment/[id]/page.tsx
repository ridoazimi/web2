import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PaymentDisplay from "./PaymentDisplay";

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;


  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!transaction) {
    return notFound();
  }

  // Jika paymentData belum ada (misal karena delay API), beri pesan menunggu
  if (!transaction.paymentData) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
        <Navbar />
        <main className="relative z-10 pt-40 pb-24 text-center">
          <div className="max-w-md mx-auto bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-12">
            <div className="w-16 h-16 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h1 className="text-xl font-bold mb-2">Menyiapkan Pembayaran...</h1>
            <p className="text-[var(--text-secondary)] text-sm mb-6">Mohon tunggu sebentar, sistem sedang menghubungkan ke Payment Gateway.</p>
            <a href={`/payment/${id}`} className="text-[var(--accent-primary)] text-sm font-semibold hover:underline">
              Coba Segarkan Halaman
            </a>
          </div>

        </main>
        <Footer />
      </div>
    );
  }

  const payment = transaction.paymentData as any;


  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <Navbar />
      
      <main className="relative z-10 pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <PaymentDisplay payment={payment} productName={transaction.productName || "Produk Premium"} transactionId={transaction.id} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
