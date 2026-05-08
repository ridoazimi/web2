import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Lock, Eye, Database, Bell } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <Navbar />
      
      <main className="relative z-10 pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              Kebijakan Privasi
            </h1>
            <p className="text-[var(--text-secondary)]">Kenyamanan dan privasi data Anda adalah prioritas kami.</p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 md:p-12 shadow-xl space-y-12">
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center flex-shrink-0 text-[var(--accent-primary)]">
                <Database size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3">Informasi yang Kami Kumpulkan</h2>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Kami mengumpulkan informasi yang Anda berikan langsung kepada kami saat melakukan pembelian, seperti nama, alamat email, dan nomor WhatsApp. Data ini digunakan murni untuk keperluan pengiriman produk dan layanan bantuan pelanggan.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-400">
                <Lock size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3">Keamanan Data</h2>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Kami menerapkan langkah-langacher keamanan teknis untuk melindungi data pribadi Anda dari akses yang tidak sah. Kami tidak akan pernah menjual atau membagikan data pribadi Anda kepada pihak ketiga untuk tujuan pemasaran.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-400">
                <Eye size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3">Penggunaan Cookies</h2>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Situs kami menggunakan cookies untuk meningkatkan pengalaman pengguna, seperti mengingat preferensi tema (Dark/Light mode) dan melacak sesi pembelian Anda secara anonim.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-400">
                <Bell size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3">Pembaruan Kebijakan</h2>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Kami dapat memperbarui kebijakan privasi ini sewaktu-waktu. Perubahan akan diinformasikan melalui halaman ini atau melalui email jika dianggap perlu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
