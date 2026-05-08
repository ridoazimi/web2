"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, ShieldCheck, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CheckoutClient({ product, initialRef }: { product: any, initialRef: string }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    affiliateCode: initialRef
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrisData, setQrisData] = useState<any>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          ...formData
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses checkout");

      // Jika ada data QRIS dari KlikQRIS
      if (data.paymentData) {
        router.push(`/payment/${data.transactionId}`);
      } else {
        // Fallback ke WhatsApp jika API Payment Gateway gagal
        const waNumber = "6281234567890";
        const message = `Halo Admin Dorizz Store, saya ingin melakukan pembayaran untuk pesanan saya:%0A%0ANama: ${formData.name}%0AEmail: ${formData.email}%0AProduk: *${data.productName}*%0ATotal: *${formatCurrency(data.price)}*%0A%0AMohon info rekening pembayaran. Terima kasih.`;
        window.location.href = `https://wa.me/${waNumber}?text=${message}`;
      }

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (qrisData) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
        <Navbar />
        <main className="relative z-10 pt-32 pb-24">
          <div className="max-w-xl mx-auto px-6 text-center">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 shadow-2xl">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={32} className="text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Selesaikan Pembayaran</h1>
              <p className="text-[var(--text-secondary)] mb-8">Scan QRIS di bawah ini menggunakan aplikasi pembayaran pilihan Anda.</p>

              <div className="bg-white p-4 rounded-2xl inline-block mb-8">
                {/* Menampilkan QRIS (asumsi KlikQRIS memberikan URL gambar di qris_url) */}
                <img
                  src={qrisData.qr_url}
                  alt="QRIS Payment"
                  className="w-64 h-64 mx-auto"
                />
              </div>

              <div className="space-y-4 text-left bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-color)]">
                <div className="flex justify-between border-b border-[var(--border-color)] pb-3">
                  <span className="text-[var(--text-muted)] text-sm">Order ID</span>
                  <span className="font-mono text-sm">{qrisData.order_id}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-[var(--text-muted)] text-sm">Total Tagihan</span>
                  <span className="text-xl font-black text-[var(--accent-primary)]">{formatCurrency(Number(qrisData.amount))}</span>
                </div>
              </div>

              <p className="text-xs text-[var(--text-muted)] mt-8">
                Setelah pembayaran berhasil, akun Anda akan dikirimkan otomatis melalui WhatsApp & Email.
              </p>

              <button
                onClick={() => window.location.reload()}
                className="mt-8 text-sm text-[var(--accent-primary)] font-semibold hover:underline"
              >
                Kembali ke Form
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <Navbar />

      <main className="relative z-10 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

            {/* Kolom Kiri: Form (Order 2 on Mobile, Order 1 on Desktop) */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6 md:mb-8">
                <ArrowLeft size={16} />
                <span>Kembali ke Marketplace</span>
              </Link>

              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 md:p-10 shadow-xl">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Detail Pemesanan</h1>
                <p className="text-[var(--text-secondary)] mb-8 text-sm md:text-base leading-relaxed">Lengkapi data di bawah ini untuk proses pengiriman akun secara instan.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2.5 ml-1">Nama Lengkap</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Masukkan nama lengkap Anda"
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2.5 ml-1">Alamat Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@contoh.com"
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2.5 ml-1">Nomor WhatsApp</label>
                      <input
                        type="tel"
                        required
                        value={formData.whatsapp}
                        onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                        placeholder="081234567890"
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2.5 ml-1">Kode Promo / Affiliate (Opsional)</label>
                    <input
                      type="text"
                      value={formData.affiliateCode}
                      onChange={e => setFormData({ ...formData, affiliateCode: e.target.value })}
                      placeholder="Punya kode referal?"
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                    />
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-xl bg-[var(--accent-primary)] text-black font-bold hover:shadow-[0_0_20px_var(--accent-glow)] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                    {loading ? "Memproses..." : "Lanjutkan Pembayaran"}
                  </button>
                  <p className="text-[10px] text-[var(--text-muted)] text-center px-4 leading-relaxed">
                    Dengan mengklik tombol di atas, Anda menyetujui syarat dan ketentuan layanan kami. {product.availableStock > 0 ? "Akun akan dikirimkan secara instan setelah pembayaran berhasil." : "Ini adalah produk Pre-order, akun akan dikirimkan dalam 1-24 jam setelah pembayaran berhasil."}
                  </p>
                </form>
              </div>
            </div>

            {/* Kolom Kanan: Ringkasan Produk (Order 1 on Mobile, Order 2 on Desktop) */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="lg:sticky lg:top-32 space-y-4">
                {/* Mobile View: Concise Header */}
                <div className="lg:hidden bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 flex items-center gap-4 shadow-lg">
                  {product.imageUrl && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 relative flex-shrink-0">
                      <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[var(--text-primary)] break-words leading-tight mb-1">{product.name}</h3>
                    <p className="text-lg font-black text-[var(--accent-primary)]">{formatCurrency(Number(product.price))}</p>
                  </div>
                </div>

                {/* Desktop View & Detailed Summary */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-5 md:p-8 shadow-xl overflow-hidden">
                  <h2 className="hidden lg:block text-xl font-bold mb-6">Ringkasan Pesanan</h2>

                  <div className="flex gap-4 mb-6 pb-6 border-b border-[var(--border-color)]">
                    {product.imageUrl && (
                      <div className="hidden lg:block w-20 h-20 rounded-2xl overflow-hidden bg-black/40 relative flex-shrink-0">
                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] text-[var(--accent-primary)] font-bold uppercase tracking-wider">{product.category}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${(product.availableStock || 0) > 0
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                          }`}>
                          {(product.availableStock || 0) > 0 ? `Ready ${product.availableStock} Akun` : '⚡ Pre-order (1-24 Jam)'}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg leading-tight lg:block hidden break-words">{product.name}</h3>
                      <div
                        className="text-xs text-[var(--text-secondary)] rich-text-content lg:line-clamp-none break-words"
                        dangerouslySetInnerHTML={{ __html: product.description || "" }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center gap-4 text-sm text-[var(--text-secondary)]">
                      <span className="shrink-0">Subtotal</span>
                      <span className="font-medium text-white truncate">{formatCurrency(Number(product.price))}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-6 border-t border-[var(--border-color)] gap-4">
                    <span className="font-medium text-[var(--text-secondary)] shrink-0">Total Bayar</span>
                    <span className="text-2xl md:text-3xl font-black text-[var(--accent-primary)] truncate">{formatCurrency(Number(product.price))}</span>
                  </div>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex items-start gap-3">
                  <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-emerald-400/80 leading-relaxed">
                    Pembayaran aman dan terenkripsi. Produk yang Anda beli dilindungi oleh garansi penuh selama masa berlangganan.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
