import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Scale, AlertCircle, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <Navbar />
      
      <main className="relative z-10 pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              Syarat & Ketentuan
            </h1>
            <p className="text-[var(--text-secondary)]">Terakhir diperbarui: 27 April 2026</p>
          </div>

          <div className="grid gap-8">
            <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-4 mb-6 text-[var(--accent-primary)]">
                <ShieldCheck size={28} />
                <h2 className="text-2xl font-bold">1. Ketentuan Umum</h2>
              </div>
              <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
                <p>Dengan mengakses dan melakukan pembelian di Dorizz Store, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Layanan kami menyediakan akun premium untuk berbagai platform digital.</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Pengguna wajib memberikan data yang valid (Email & WhatsApp) untuk pengiriman produk.</li>
                  <li>Satu akun hanya boleh digunakan sesuai dengan paket yang dibeli (Private/Sharing).</li>
                  <li>Dilarang mengubah detail akun (Email/Password) kecuali diizinkan secara eksplisit.</li>
                </ul>
              </div>
            </section>

            <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-4 mb-6 text-amber-400">
                <AlertCircle size={28} />
                <h2 className="text-2xl font-bold">2. Kebijakan Garansi</h2>
              </div>
              <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
                <p>Kami memberikan garansi penuh sesuai dengan durasi produk yang dibeli. Garansi berlaku jika:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Akun mengalami kendala login atau premium hilang sebelum masa aktif habis.</li>
                  <li>Pengguna tidak melanggar aturan penggunaan (seperti mengganti password atau sharing akun private).</li>
                  <li>Klaim garansi diajukan melalui form resmi di website ini atau melalui admin WhatsApp.</li>
                </ul>
              </div>
            </section>

            <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-4 mb-6 text-emerald-400">
                <Scale size={28} />
                <h2 className="text-2xl font-bold">3. Pembatalan & Pengembalian</h2>
              </div>
              <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
                <p>Semua penjualan bersifat final. Pengembalian dana (refund) hanya akan dilakukan jika:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Produk yang dibeli sedang kosong (out of stock) setelah pembayaran terkonfirmasi.</li>
                  <li>Kami tidak dapat memberikan solusi atas kendala akun dalam waktu 2x24 jam.</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
