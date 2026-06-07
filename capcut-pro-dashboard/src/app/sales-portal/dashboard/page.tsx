"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  LogOut,
  Briefcase,
  Copy,
  Check,
  TrendingUp,
  DollarSign,
  User,
  Link2,
  Globe,
} from "lucide-react";

interface TransactionItem {
  id: string;
  amount: number;
  productName: string | null;
  status: string | null;
  purchaseDate: string | null;
  voucherCode: string | null;
  stockAccount?: {
    accountEmail: string;
  } | null;
  user: {
    name: string;
    email: string;
    whatsapp: string | null;
  } | null;
}

interface SalesProfile {
  id: string;
  name: string;
  code: string;
  whatsapp: string | null;
  status: string;
  createdAt: string;
  totalClosing: number;
  totalAllClosing: number;
  totalRevenue: number;
  transactions: TransactionItem[];
}

export default function SalesDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<SalesProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"success" | "all">("success");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [linkCopied, setLinkCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const params = new URLSearchParams();
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        const res = await fetch(`/api/sales-portal/auth/me?${params}`);
        if (!res.ok) {
          router.push("/sales-portal/login");
          return;
        }
        const data = await res.json();
        setProfile(data.sales);
      } catch (err) {
        console.error("Failed to load sales profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [router, startDate, endDate]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyLink = () => {
    if (!profile) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://dorizstore.com";
    const trackingLink = `${origin}/?sl=${profile.code}`;
    navigator.clipboard.writeText(trackingLink);
    setLinkCopied(true);
    showToast("Link pelacakan pribadi disalin ke clipboard!");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleLogout = async () => {
    if (!confirm("Apakah Anda yakin ingin keluar dari portal sales?")) return;
    setLoggingOut(true);
    try {
      const res = await fetch("/api/sales-portal/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/sales-portal/login");
        router.refresh();
      } else {
        alert("Gagal keluar. Coba lagi.");
      }
    } catch (err) {
      console.error(err);
      alert("Koneksi error");
    } finally {
      setLoggingOut(false);
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#06080F]">
        <Loader2 className="animate-spin text-[var(--accent-primary)] mb-4" size={40} />
        <p className="text-sm text-[var(--text-muted)]">Memuat dashboard sales...</p>
      </div>
    );
  }

  if (!profile) return null;

  const trackingUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/?sl=${profile.code}` 
    : `https://dorizstore.com/?sl=${profile.code}`;

  const filteredTransactions = profile.transactions.filter(
    (t) => activeTab === "all" || t.status === "success"
  );

  return (
    <div className="min-h-screen bg-[#06080F] text-white">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-5 blur-3xl" style={{ background: "radial-gradient(circle, #20D5D2, transparent)" }} />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-5 blur-3xl" style={{ background: "radial-gradient(circle, #818cf8, transparent)" }} />
      </div>

      {/* Navbar Header */}
      <header className="relative z-10 border-b border-[var(--border-color)] bg-[#0A0D17]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-tr from-[#20D5D2] to-[#16A3A1] shadow-lg"
            >
              <Briefcase size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">Sales Portal</h1>
              <p className="text-[10px] text-[var(--text-muted)]">Dorizz Store Sales Tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-white">{profile.name}</span>
              <span className="text-xs text-[var(--text-muted)] font-mono">Kode: {profile.code}</span>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="btn-secondary !py-2 !px-3 flex items-center gap-2 text-rose-400 border-rose-950/40 hover:bg-rose-500/10 hover:border-rose-500/20"
              title="Keluar"
            >
              {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        {/* Profile Info & Copy Link banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Welcome */}
          <div className="lg:col-span-4 glass-card p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{profile.name}</h2>
                  <p className="text-xs text-[var(--text-muted)]">Bergabung sejak {new Date(profile.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
              </div>
              
              <div className="border-t border-[var(--border-color)] pt-4 space-y-2 text-sm text-[var(--text-secondary)]">
                <div className="flex justify-between">
                  <span>No. WhatsApp:</span>
                  <span className="font-mono text-white">{profile.whatsapp || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status Akun:</span>
                  <span className="badge badge-success !py-0.5 !px-2.5">Aktif</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Link generator */}
          <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wider flex items-center gap-1.5">
                <Globe size={15} className="text-[var(--accent-primary)]" />
                Tautan Pelacakan Pribadi Anda
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                Sebarkan link di bawah ini ke calon pembeli Anda. Setiap kali pembeli mengeklik link ini, sistem akan mencatat Anda sebagai sales selama 3 hari ke depan secara otomatis.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                readOnly
                value={trackingUrl}
                className="form-input flex-1 font-mono text-xs bg-[#06080F] border-[var(--border-color)] text-[var(--text-secondary)] h-12 select-all"
              />
              <button
                onClick={handleCopyLink}
                className="btn-primary gap-2 h-12 justify-center cursor-pointer sm:px-6 flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #20D5D2, #16A3A1)" }}
              >
                {linkCopied ? <Check size={16} /> : <Copy size={16} />}
                {linkCopied ? "Disalin!" : "Salin Link"}
              </button>
            </div>
          </div>
        </div>

        {/* Realtime Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => setActiveTab("success")}
            className={`glass-card p-5 flex items-center gap-4 cursor-pointer border-2 transition-all ${
              activeTab === "success" 
                ? "border-[rgba(32,213,210,0.4)] shadow-[var(--shadow-glow)]" 
                : "border-[var(--border-color)] hover:bg-[#141927]"
            }`}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-400">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">{profile.totalClosing}</p>
              <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Closing Sukses (Sukses)</p>
            </div>
          </div>
          <div 
            onClick={() => setActiveTab("all")}
            className={`glass-card p-5 flex items-center gap-4 cursor-pointer border-2 transition-all ${
              activeTab === "all" 
                ? "border-indigo-500/50 shadow-indigo-500/10" 
                : "border-[var(--border-color)] hover:bg-[#141927]"
            }`}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-400">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{profile.totalAllClosing}</p>
              <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Semua Closing (Semua Status)</p>
            </div>
          </div>
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-400">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">Rp {fmt(profile.totalRevenue)}</p>
              <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Total Omset Penjualan</p>
            </div>
          </div>
        </div>

        {/* Transaction History section */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {activeTab === "success" ? "Riwayat Closing Sukses" : "Semua Riwayat Closing"}
                <span className="badge badge-purple font-mono">{filteredTransactions.length}</span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Daftar transaksi pembeli yang terhubung dengan tautan Anda</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Date Filters */}
              <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 h-[42px]">
                <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase whitespace-nowrap">Dari</span>
                <input
                  type="date"
                  className="bg-transparent text-xs text-[var(--text-secondary)] outline-none cursor-pointer border-0 [color-scheme:dark]"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 h-[42px]">
                <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase whitespace-nowrap">Sampai</span>
                <input
                  type="date"
                  className="bg-transparent text-xs text-[var(--text-secondary)] outline-none cursor-pointer border-0 [color-scheme:dark]"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="btn-secondary h-[42px] px-3 flex items-center justify-center text-xs text-rose-400 border-rose-950/40 hover:bg-rose-500/10 hover:border-rose-500/20"
                  title="Reset Filter Tanggal"
                >
                  Reset
                </button>
              )}

              {/* Status Tabs */}
              <div className="flex gap-1 bg-[var(--bg-card)] border border-[var(--border-color)] p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("success")}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                    activeTab === "success" ? "bg-[rgba(32,213,210,0.15)] text-[var(--accent-primary)] font-bold" : "text-[var(--text-muted)] hover:text-white"
                  }`}
                >
                  Sukses
                </button>
                <button
                  onClick={() => setActiveTab("all")}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                    activeTab === "all" ? "bg-indigo-500/15 text-indigo-400 font-bold" : "text-[var(--text-muted)] hover:text-white"
                  }`}
                >
                  Semua Status
                </button>
              </div>
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="glass-card text-center py-20">
              <TrendingUp size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-50" />
              <p className="text-[var(--text-secondary)]">Belum ada data transaksi yang tercatat</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Produk</th>
                      <th>Nama Pembeli</th>
                      <th>No. WhatsApp</th>
                      <th>Alamat Email</th>
                      <th>Tanggal</th>
                      <th>Voucher</th>
                      <th>Status</th>
                      <th>Nominal</th>
                      <th>Akun CapCut Terkirim</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((t) => (
                      <tr key={t.id}>
                        <td className="font-bold text-white">{t.productName || "CapCut Pro"}</td>
                        <td>{t.user?.name || "—"}</td>
                        <td className="font-mono text-xs">{t.user?.whatsapp || "—"}</td>
                        <td className="font-mono text-xs">{t.user?.email || "—"}</td>
                        <td>
                          {t.purchaseDate 
                            ? new Date(t.purchaseDate).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) 
                            : "—"
                          }
                        </td>
                        <td>
                          {t.voucherCode ? (
                            <span className="badge badge-purple text-[9px]">{t.voucherCode}</span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          <span className={`badge ${
                            t.status === 'success' ? 'badge-success' : t.status === 'pending' ? 'badge-warning' : 'badge-danger'
                          }`}>
                            {t.status === 'success' ? 'Sukses' : t.status === 'pending' ? 'Pending' : 'Gagal'}
                          </span>
                        </td>
                        <td className="font-bold text-white">Rp {fmt(Number(t.amount))}</td>
                        <td className="font-mono text-xs text-[#c7d2fe]">
                          {t.stockAccount ? (
                            <span className="select-all block max-w-[200px] truncate" title={t.stockAccount.accountEmail}>
                              {t.stockAccount.accountEmail}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Copy Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-[slideUp_0.3s_ease]">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg"
            style={{
              background: "rgba(32, 213, 210, 0.15)",
              border: "1px solid rgba(32, 213, 210, 0.3)",
              backdropFilter: "blur(12px)",
            }}
          >
            <Check size={16} className="text-[var(--accent-primary)]" />
            <span className="text-sm text-cyan-300">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
