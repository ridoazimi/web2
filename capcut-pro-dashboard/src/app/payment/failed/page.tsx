import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { XCircle, ArrowLeft, RotateCcw, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar />
      
      <main className="relative z-10 pt-32 pb-24 px-4 flex items-center justify-center min-h-[80vh]">
        <div className="max-w-md w-full text-center">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-500/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500/10 rounded-full mb-6 relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping opacity-50" />
              <XCircle className="w-12 h-12 text-red-500 relative z-10" />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-black mb-4">Pembayaran Gagal</h1>
            <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
              Mohon maaf, kami tidak dapat memproses pembayaran Anda saat ini. Transaksi Anda telah dibatalkan atau waktu pembayaran telah habis.
            </p>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 mb-8 text-left">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <p className="text-sm text-[var(--text-secondary)]">
                  Jika saldo Anda terpotong namun status tetap gagal, silakan hubungi Customer Service kami dengan melampirkan bukti pembayaran.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Link 
                href="/#pricing" 
                className="flex items-center justify-center w-full h-14 gap-2 rounded-xl bg-[var(--accent-primary)] text-black font-bold hover:shadow-[0_0_20px_var(--accent-glow)] transition-all"
              >
                <RotateCcw size={20} />
                Coba Pesan Ulang
              </Link>
              
              <Link 
                href="/" 
                className="flex items-center justify-center w-full h-14 gap-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-all font-semibold"
              >
                <ArrowLeft size={18} />
                Kembali ke Beranda
              </Link>
            </div>
            
          </div>
          
          <div className="mt-8 text-sm text-[var(--text-muted)]">
            Butuh Bantuan? <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="text-[var(--accent-primary)] hover:underline font-semibold">Hubungi Support</a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
