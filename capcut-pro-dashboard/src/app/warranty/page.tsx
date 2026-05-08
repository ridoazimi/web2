"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldAlert, Send, Info, MessageSquare, Ticket, CheckCircle2, Search, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { checkTransactionValidity, submitWarrantyClaim } from "./actions";

export default function ClaimWarrantyPage() {
  const [formData, setFormData] = useState({
    orderId: "",
    issue: "",
    photo: null as File | null,
  });
  const [checking, setChecking] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    valid: boolean,
    message?: string,
    productName?: string | null,
    oldAccountId?: string | null,
    rules?: string | null
  }>({ valid: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCheck = async () => {
    if (!formData.orderId) return;
    setChecking(true);
    setIsValid(false);

    try {
      const result = await checkTransactionValidity(formData.orderId);
      setCheckResult(result);
      if (result.valid) {
        setIsValid(true);
      }
    } catch (error) {
      setCheckResult({ valid: false, message: "Terjadi kesalahan saat memeriksa." });
    } finally {
      setChecking(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, photo: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);

    // Simpan ke database dengan status pending via FormData
    const submissionData = new FormData();
    submissionData.append("orderId", formData.orderId);
    if (checkResult.oldAccountId) {
      submissionData.append("oldAccountId", checkResult.oldAccountId);
    }
    submissionData.append("issue", formData.issue);
    if (formData.photo) {
      submissionData.append("photo", formData.photo);
    }

    const res = await submitWarrantyClaim(submissionData);

    if (!res.success) {
      alert(res.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Buka WhatsApp untuk mengirimkan foto bukti
    // const message = `Halo Admin Dorizz Store, saya telah mengirimkan form klaim garansi di web:%0A%0AOrder ID: ${formData.orderId}%0AProduk: ${checkResult.productName}%0AKendala: ${formData.issue}%0A%0ABerikut adalah lampiran foto bukti kendala saya:`;
    // window.open(`https://wa.me/6281234567890?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <Navbar />

      <main className="relative z-10 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">

            {/* Kolom Kiri: Informasi */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-6">
                <ShieldAlert size={14} />
                <span>Warranty Center</span>
              </div>
              <h1 className="text-4xl font-black mb-6 leading-tight">
                Klaim Garansi <br />
                <span className="text-[var(--accent-primary)]">Produk Anda</span>
              </h1>
              <p className="text-[var(--text-secondary)] mb-10 leading-relaxed">
                Kami berkomitmen memberikan layanan purna jual terbaik. Jika akun Anda mengalami kendala sebelum masa aktif habis, silakan lengkapi form di samping untuk bantuan cepat.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 text-[var(--accent-primary)] shadow-lg">
                    <Info size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Persiapkan Order ID</h3>
                    <p className="text-sm text-[var(--text-muted)]">Anda bisa menemukan Order ID di riwayat transaksi atau pesan WhatsApp/Email saat pembelian.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 text-emerald-400 shadow-lg">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Kirim Bukti Foto</h3>
                    <p className="text-sm text-[var(--text-muted)]">Lampirkan *screenshot* kendala akun untuk mempercepat proses klaim garansi oleh admin.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Form */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-[var(--accent-primary)]"></div>

              {!success && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-8">
                  <h3 className="text-sm font-bold text-rose-500 dark:text-rose-400 mb-3 flex items-center gap-2">
                    <ShieldAlert size={16} /> 🏷️ PASTIKAN SUDAH MEMENUHI RULES‼️
                  </h3>
                  {isValid && checkResult.rules ? (
                    <div
                      className="rich-text-content text-xs md:text-sm text-[var(--text-secondary)]"
                      dangerouslySetInnerHTML={{ __html: checkResult.rules }}
                    />
                  ) : null}
                </div>
              )}

              {!success ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* ... form content ... */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Order ID / ID Transaksi</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                        <input
                          type="text"
                          required
                          disabled={isValid}
                          value={formData.orderId}
                          onChange={e => {
                            setFormData({ ...formData, orderId: e.target.value });
                            setCheckResult({ valid: false });
                            setIsValid(false);
                          }}
                          placeholder="Contoh: DIRECT-123..."
                          className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl px-12 py-4 text-[var(--text-primary)] focus:outline-none focus:border-amber-500 transition-all shadow-inner disabled:opacity-60"
                        />
                      </div>
                      {!isValid ? (
                        <button
                          type="button"
                          onClick={handleCheck}
                          disabled={checking || !formData.orderId}
                          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] px-6 rounded-2xl font-bold hover:bg-[var(--border-active)] transition-colors disabled:opacity-50"
                        >
                          {checking ? "Cek..." : "Cek"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsValid(false)}
                          className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-4 rounded-2xl font-bold hover:bg-amber-500/20 transition-colors"
                        >
                          Ganti
                        </button>
                      )}
                    </div>

                    {checkResult.message && (
                      <p className={`mt-2 text-sm font-medium ${checkResult.valid ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {checkResult.valid ? `✅ Valid: ${checkResult.productName}` : `❌ ${checkResult.message}`}
                      </p>
                    )}
                  </div>

                  {isValid && (
                    <div className="space-y-6 animate-in slide-in-from-top-4 fade-in duration-300">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Detail Kendala</label>
                        <textarea
                          required
                          rows={3}
                          value={formData.issue}
                          onChange={e => setFormData({ ...formData, issue: e.target.value })}
                          placeholder="Jelaskan kendala yang Anda alami (misal: password salah, terkena limit)..."
                          className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl px-5 py-4 text-[var(--text-primary)] focus:outline-none focus:border-amber-500 transition-all shadow-inner resize-none"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Bukti Kendala (Foto/Screenshot)</label>
                        <div className="relative border-2 border-dashed border-[var(--border-color)] rounded-2xl p-4 text-center hover:border-[var(--accent-primary)] transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            required
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="flex flex-col items-center justify-center gap-2 text-[var(--text-muted)]">
                            <ImageIcon size={24} />
                            <span className="text-sm font-medium">
                              {formData.photo ? formData.photo.name : "Klik atau seret gambar ke sini"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {loading ? (
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Send size={18} />
                            <span>Submit Warranty</span>
                          </>
                        )}
                      </button>
                      <p className="text-xs text-center text-[var(--text-muted)]">
                        Foto bukti akan dikirimkan secara manual melalui WhatsApp setelah jendela chat terbuka.
                      </p>
                    </div>
                  )}
                </form>
              ) : (
                <div className="text-center py-10 animate-in zoom-in-95 duration-300">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Permintaan Disimpan!</h2>
                  <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
                    Data klaim Anda telah berhasil dicatat dengan status <strong>Pending</strong>. Jangan lupa untuk mengirimkan lampiran foto bukti pada jendela WhatsApp yang baru saja terbuka.
                  </p>
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setIsValid(false);
                      setFormData({ orderId: "", issue: "", photo: null });
                      setCheckResult({ valid: false });
                    }}
                    className="text-[var(--accent-primary)] font-semibold hover:underline"
                  >
                    Kirim Klaim Lainnya
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
