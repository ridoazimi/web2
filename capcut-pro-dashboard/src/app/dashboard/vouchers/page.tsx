"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X, Tag, Percent, Banknote, Calendar, Users, ToggleLeft, ToggleRight, Loader2, Lock } from "lucide-react";
import { getVouchers, createVoucher, updateVoucher, deleteVoucher } from "./actions";
import { useAuth } from "@/context/AuthContext";

export default function VoucherPage() {
  const { isSuperAdmin, loading: authLoading } = useAuth();
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    type: "FIXED_AMOUNT",
    value: 0,
    maxUsage: "",
    minPurchase: 0,
    expiryDate: "",
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && isSuperAdmin) {
      fetchVouchers();
    }
  }, [authLoading, isSuperAdmin]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
        <Loader2 className="animate-spin text-[var(--accent-primary)]" size={40} />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)] p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20">
          <Lock size={40} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Akses Ditolak</h1>
        <p className="text-[var(--text-secondary)] max-w-md">
          Anda tidak memiliki izin untuk mengakses halaman manajemen voucher. Halaman ini hanya tersedia untuk Superadmin.
        </p>
      </div>
    );
  }

  const fetchVouchers = async () => {
    setLoading(true);
    const data = await getVouchers();
    setVouchers(data);
    setLoading(false);
  };

  const handleOpenModal = (voucher?: any) => {
    if (voucher) {
      setEditingId(voucher.id);
      setFormData({
        code: voucher.code,
        type: voucher.type,
        value: Number(voucher.value),
        maxUsage: voucher.maxUsage?.toString() || "",
        minPurchase: Number(voucher.minPurchase),
        expiryDate: voucher.expiryDate ? new Date(voucher.expiryDate).toISOString().split('T')[0] : "",
        isActive: voucher.isActive
      });
    } else {
      setEditingId(null);
      setFormData({
        code: "",
        type: "FIXED_AMOUNT",
        value: 0,
        maxUsage: "",
        minPurchase: 0,
        expiryDate: "",
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const payload = {
      ...formData,
      maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : null,
      value: Number(formData.value),
      minPurchase: Number(formData.minPurchase),
    };

    let res;
    if (editingId) {
      res = await updateVoucher(editingId, payload);
    } else {
      res = await createVoucher(payload);
    }

    if (res.success) {
      setIsModalOpen(false);
      fetchVouchers();
    } else {
      alert("Error: " + res.error);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus voucher ini?")) {
      const res = await deleteVoucher(id);
      if (res.success) fetchVouchers();
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
              <Tag className="text-[var(--accent-primary)]" />
              Manajemen Voucher
            </h1>
            <p className="text-[var(--text-secondary)]">Kelola kode promo dan diskon untuk pelanggan Anda.</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent-primary)] text-black font-bold rounded-xl hover:shadow-[0_0_20px_var(--accent-glow)] transition-all"
          >
            <Plus size={20} />
            Tambah Voucher
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-[var(--accent-primary)]" size={40} />
          </div>
        ) : vouchers.length === 0 ? (
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-20 text-center">
            <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mx-auto mb-6">
              <Tag size={40} className="text-[var(--text-muted)]" />
            </div>
            <h3 className="text-xl font-bold mb-2">Belum ada voucher</h3>
            <p className="text-[var(--text-secondary)] mb-8">Mulai dengan membuat voucher pertama Anda.</p>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl font-semibold hover:bg-[var(--border-color)] transition-all"
            >
              Buat Voucher
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vouchers.map((v) => (
              <div
                key={v.id}
                className={`group relative bg-[var(--bg-card)] border ${v.isActive ? "border-[var(--border-color)]" : "border-red-500/20 grayscale"} rounded-3xl p-6 shadow-xl hover:border-[var(--accent-primary)] transition-all overflow-hidden`}
              >
                {!v.isActive && (
                  <div className="absolute top-4 right-4 bg-red-500/10 text-red-400 text-[10px] font-bold px-2 py-1 rounded-full border border-red-500/20">
                    NONAKTIF
                  </div>
                )}
                
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${v.type === 'PERCENTAGE' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {v.type === 'PERCENTAGE' ? <Percent size={24} /> : <Banknote size={24} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-wider text-[var(--accent-primary)]">{v.code}</h3>
                    <p className="text-sm font-bold">
                      {v.type === 'PERCENTAGE' ? `${Number(v.value)}% Potongan` : `${formatCurrency(Number(v.value))} Potongan`}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <Users size={16} />
                    <span>Digunakan: <b className="text-[var(--text-primary)]">{v.currentUsage || 0}</b> / {v.maxUsage || "∞"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <Calendar size={16} />
                    <span>Exp: <b className="text-[var(--text-primary)]">{v.expiryDate ? new Date(v.expiryDate).toLocaleDateString("id-ID") : "Selamanya"}</b></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <Banknote size={16} />
                    <span>Min. Beli: <b className="text-[var(--text-primary)]">{formatCurrency(Number(v.minPurchase))}</b></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-[var(--border-color)]">
                  <button
                    onClick={() => handleOpenModal(v)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] transition-all text-sm font-semibold"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-[var(--border-color)] flex items-center justify-between">
              <h2 className="text-2xl font-bold">{editingId ? "Edit Voucher" : "Tambah Voucher Baru"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-full">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-2">Kode Voucher</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="CONTOH: HEMAT50"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 focus:border-[var(--accent-primary)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Tipe Potongan</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 focus:border-[var(--accent-primary)] outline-none"
                  >
                    <option value="FIXED_AMOUNT">Potongan Rupiah</option>
                    <option value="PERCENTAGE">Persentase (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Nilai Potongan</label>
                  <input
                    type="number"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 focus:border-[var(--accent-primary)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Kuota (Kosongi jika tak terbatas)</label>
                  <input
                    type="number"
                    value={formData.maxUsage}
                    onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
                    placeholder="Contoh: 100"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 focus:border-[var(--accent-primary)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Minimal Pembelian</label>
                  <input
                    type="number"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: Number(e.target.value) })}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 focus:border-[var(--accent-primary)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Tanggal Kedaluwarsa</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 focus:border-[var(--accent-primary)] outline-none text-white [color-scheme:dark]"
                  />
                </div>

                <div className="flex items-center gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className="flex items-center gap-2"
                  >
                    {formData.isActive ? <ToggleRight className="text-emerald-400" size={40} /> : <ToggleLeft className="text-[var(--text-muted)]" size={40} />}
                    <span className="text-sm font-semibold">Status Aktif</span>
                  </button>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-xl bg-[var(--bg-secondary)] font-bold hover:bg-[var(--border-color)] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-2 px-10 py-4 bg-[var(--accent-primary)] text-black font-bold rounded-xl hover:shadow-[0_0_20px_var(--accent-glow)] transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                  {submitting ? "Menyimpan..." : "Simpan Voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
