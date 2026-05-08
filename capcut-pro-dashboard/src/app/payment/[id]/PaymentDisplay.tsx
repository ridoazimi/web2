"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Clock, Copy, CheckCircle2, QrCode, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PaymentDisplay({ payment, productName, transactionId }: { payment: any, productName: string, transactionId: string }) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expired = new Date(payment.expired_at).getTime();
      const distance = expired - now;

      if (distance < 0) {
        setTimeLeft("EXPIRED");
        clearInterval(timer);
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [payment.expired_at]);

  // Polling untuk auto-redirect jika status pembayaran berubah
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/transactions/${transactionId}/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "success") {
            router.push(`/payment/success?order_id=${transactionId}`);
          } else if (data.status === "failed" || data.status === "expired" || data.status === "cancelled") {
            router.push(`/payment/failed`);
          }
        }
      } catch (err) {
        // Abaikan error polling
      }
    };

    const interval = setInterval(checkStatus, 3000); // Cek setiap 3 detik
    return () => clearInterval(interval);
  }, [transactionId, router]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6">
          <ArrowLeft size={16} />
          <span>Kembali ke Beranda</span>
        </Link>
        <h1 className="text-3xl font-bold">Pembayaran QRIS</h1>
        <p className="text-[var(--text-secondary)]">Selesaikan pembayaran Anda sebelum waktu habis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Kiri: QRIS */}
        <div className="md:col-span-2">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 text-center shadow-xl">
            <div className="flex items-center justify-center gap-2 mb-4 text-[var(--accent-primary)]">
              <QrCode size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">QRIS Dinamis</span>
            </div>
            
            <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-inner">
              <img 
                src={payment.qris_image || payment.qris_url} 
                alt="QRIS" 
                className="w-full aspect-square"
              />
            </div>

            <div className="flex flex-col gap-3 mb-6">
              <a 
                href={payment.qris_image || payment.qris_url} 
                download={`QRIS-${payment.order_id}.png`}
                className="w-full py-3 rounded-xl bg-[var(--accent-primary)] text-black font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg"
              >
                <QrCode size={18} />
                Simpan / Download QRIS
              </a>
            </div>


            <div className="flex items-center justify-center gap-2 text-[var(--text-muted)] text-[10px] font-medium uppercase">
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/GPN_Logo.svg" alt="GPN" className="h-4 opacity-50" />
              <span>Support Semua Aplikasi</span>
            </div>
          </div>
        </div>

        {/* Kanan: Detail Tagihan */}
        <div className="md:col-span-3 flex flex-col gap-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 relative overflow-hidden">
            {/* Countdown Badge */}
            <div className="absolute top-0 right-0 px-4 py-2 bg-amber-500/10 border-b border-l border-amber-500/20 text-amber-500 text-xs font-bold flex items-center gap-2 rounded-bl-xl">
              <Clock size={14} />
              <span>{timeLeft}</span>
            </div>

            <div className="mb-6">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Produk</p>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">{productName}</h2>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-[var(--border-color)]">
                <span className="text-sm text-[var(--text-muted)]">Order ID</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold">{payment.order_id}</span>
                  <button onClick={() => copyToClipboard(payment.order_id)} className="text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors">
                    {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                  <span>Harga Produk</span>
                  <span>{formatCurrency(payment.amount)}</span>
                </div>
                <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                  <span>Biaya Layanan</span>
                  <span>{formatCurrency(payment.amount_uniq)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-[var(--border-color)]">
                <span className="font-bold text-[var(--text-primary)] text-lg">Total Bayar</span>
                <span className="text-3xl font-black text-[var(--accent-primary)]">
                  {formatCurrency(payment.total_amount)}
                </span>
              </div>
            </div>


            <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-color)]">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={16} className="text-emerald-500" />
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Akun akan dikirim otomatis ke WhatsApp & Email Anda setelah pembayaran terverifikasi oleh sistem.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Cara Pembayaran:</h3>
            <ol className="text-sm text-[var(--text-secondary)] space-y-2 list-decimal list-inside">
              <li>Buka aplikasi perbankan atau e-wallet Anda.</li>
              <li>Pilih menu <span className="font-bold text-[var(--text-primary)]">Scan / Bayar</span>.</li>
              <li>Arahkan kamera ke kode QRIS di samping.</li>
              <li>Periksa nominal dan nama toko (<span className="font-bold">{payment.nama_toko}</span>).</li>
              <li>Masukkan PIN dan selesaikan pembayaran.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
