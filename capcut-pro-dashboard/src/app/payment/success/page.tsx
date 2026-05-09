import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, AlertCircle, ShieldCheck, Mail, KeyRound, Monitor, Smartphone, MessageCircle, IdCard } from "lucide-react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import RefreshHandler from "./RefreshHandler";

export default async function PaymentSuccessPage({ searchParams }: { searchParams: Promise<{ order_id?: string }> }) {
  const { order_id } = await searchParams;

  if (!order_id) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />
        <main className="pt-32 pb-24 flex items-center justify-center px-4">
          <div className="text-center p-8 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-xl max-w-md w-full">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-3">Order ID Tidak Ditemukan</h1>
            <p className="text-[var(--text-secondary)] mb-6">Link ini tidak valid atau mungkin telah kadaluarsa.</p>
            <Link href="/" className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all font-semibold">
              Kembali ke Beranda
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: order_id as string },
    include: {
      stockAccount: {
        include: { product: true }
      },
      user: true
    }
  });

  if (!transaction) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />
        <main className="pt-32 pb-24 flex items-center justify-center px-4">
          <div className="text-center p-8 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-xl max-w-md w-full">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-3">Transaksi Tidak Ditemukan</h1>
            <p className="text-[var(--text-secondary)] mb-6">Sistem tidak dapat menemukan detail transaksi Anda.</p>
            <Link href="/" className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all font-semibold">
              Kembali ke Beranda
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Apakah webhook sudah berhasil memproses akun
  const isSuccess = transaction.status === "success";
  const hasAccount = transaction.stockAccountId && transaction.stockAccount;

  // Jika pembayaran belum berstatus success, atau stok belum terassign
  if (!isSuccess || !hasAccount) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />
        <main className="pt-32 pb-24 flex items-center justify-center px-4">
          <div className="text-center p-8 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-xl max-w-md w-full relative overflow-hidden">
            {/* Animasi Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-primary)]/10 to-transparent opacity-20 pointer-events-none" />

            <RefreshHandler orderId={order_id as string} />

            <div className="w-20 h-20 bg-amber-500/20 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>

            <h1 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-[var(--text-secondary)]">
              {isSuccess && !hasAccount ? "Pesanan Pre-order Diterima" : "Menyiapkan Akun Anda..."}
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mb-6 leading-relaxed">
              {isSuccess && !hasAccount
                ? "Pembayaran berhasil! Karena ini adalah layanan Pre-order, admin akan memproses akun Anda secara manual dalam 1-24 jam. Anda akan dihubungi via WhatsApp."
                : "Pembayaran Anda sedang kami verifikasi. Akun sedang dialokasikan untuk Anda. Mohon tunggu, halaman ini akan memuat ulang otomatis."
              }
            </p>

            <div className="p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] text-left">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-[var(--text-muted)]">Order ID</span>
                <span className="text-xs font-mono bg-black/30 px-2 py-1 rounded">{transaction.id.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-muted)]">Status</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${isSuccess ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'}`}>
                  {isSuccess ? 'Pembayaran Berhasil' : 'Menunggu Verifikasi'}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-[var(--text-muted)]">Produk</span>
                <span className="text-sm font-semibold">{transaction.productName}</span>
              </div>
            </div>

            {isSuccess && !hasAccount && (
              <Link
                href="https://wa.me/6281234567890"
                target="_blank"
                className="mt-6 flex items-center justify-center w-full h-12 rounded-xl bg-[#25D366] text-white font-bold hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] transition-all gap-2"
              >
                <MessageCircle size={18} />
                Hubungi Admin (Konfirmasi)
              </Link>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const account = transaction.stockAccount!;
  const purchaseDate = transaction.purchaseDate ? new Date(transaction.purchaseDate).toLocaleDateString("id-ID", {
    year: "numeric", month: "long", day: "numeric"
  }) : "-";
  const warrantyDate = transaction.warrantyExpiredAt ? new Date(transaction.warrantyExpiredAt).toLocaleDateString("id-ID", {
    year: "numeric", month: "long", day: "numeric"
  }) : "-";

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar />

      <main className="relative z-10 pt-32 pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header Success */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-500/20 rounded-full mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Pembayaran Berhasil!</h1>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto text-lg">
              Terima kasih telah berbelanja di Dorizz Store. Berikut adalah detail akun premium Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* Kartu Detail Akun (Kiri/Atas) */}
            <div className="md:col-span-7 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-primary)]/10 blur-3xl rounded-full" />

              <div className="flex items-center gap-3 mb-8 border-b border-[var(--border-color)] pb-6">
                <ShieldCheck className="w-8 h-8 text-[var(--accent-primary)]" />
                <div>
                  <h2 className="text-xl font-bold">Informasi Akun</h2>
                  <p className="text-xs text-[var(--text-muted)]">Gunakan data berikut untuk login</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Id Transaksi */}
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <IdCard size={14} /> Id Transaksi
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3.5 font-mono text-sm break-all">
                      {transaction.id}
                    </div>
                    <CopyButton text={transaction.id} label="Salin" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Mail size={14} /> Alamat Email
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3.5 font-mono text-sm break-all">
                      {account.accountEmail}
                    </div>
                    <CopyButton text={account.accountEmail} label="Salin" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <KeyRound size={14} /> Kata Sandi (Password)
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3.5 font-mono text-sm break-all">
                      {account.accountPassword}
                    </div>
                    <CopyButton text={account.accountPassword} label="Salin" />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--border-color)]">
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-3">
                    <AlertCircle size={16} /> PENTING! BACA SEBELUM LOGIN
                  </h3>
                  <div className="text-xs md:text-sm text-[var(--text-secondary)]">
                    {transaction.stockAccount?.product?.rules ? (
                      <div
                        className="rich-text-content"
                        dangerouslySetInnerHTML={{ __html: transaction.stockAccount.product.rules }}
                      />
                    ) : (
                      <ul className="space-y-2 list-disc list-inside whitespace-pre-line">
                        <li><strong className="text-[var(--accent-primary)]">DILARANG</strong> mengubah data apapun (Email/Password/Profile).</li>
                        <li><strong className="text-[var(--accent-primary)]">DILARANG</strong> pindah device.</li>
                        <li><strong className="text-[var(--accent-primary)]">DILARANG</strong> uninstall aplikasi.</li>
                        <li>Login PC/Laptop <strong className="text-[var(--accent-primary)]">WAJIB</strong> menggunakan Scan QR dari HP.</li>
                      </ul>
                    )}
                  </div>
                  <p className="text-xs text-red-400 mt-4 italic font-semibold">
                    * Melanggar aturan di atas dapat menyebabkan garansi hangus dan dikenakan denda Rp 1.000.000,-
                  </p>
                </div>
              </div>
            </div>

            {/* Kolom Kanan */}
            <div className="md:col-span-5 space-y-6">

              {/* Ringkasan Pesanan */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 md:p-8 shadow-xl">
                <h3 className="font-bold text-lg mb-6 pb-4 border-b border-[var(--border-color)]">Ringkasan Pesanan</h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Produk</p>
                    <p className="font-semibold">{transaction.productName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Tanggal Pembelian</p>
                    <p className="font-semibold">{purchaseDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Garansi Hingga</p>
                    <p className="font-semibold text-emerald-400">{warrantyDate}</p>
                  </div>
                </div>
              </div>

              {/* Bantuan & Support */}
              <div className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 md:p-8 shadow-xl">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-bold text-lg mb-2">Butuh Bantuan?</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-6">
                  Jika Anda mengalami kendala saat login atau memiliki pertanyaan seputar garansi, tim support kami siap membantu Anda.
                </p>
                <a
                  href="https://api.whatsapp.com/send/?phone=6285277815289&text=Halo%20admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full h-12 gap-2 rounded-xl bg-[#25D366] text-white font-bold hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] transition-all"
                >
                  Hubungi Admin
                </a>
              </div>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
