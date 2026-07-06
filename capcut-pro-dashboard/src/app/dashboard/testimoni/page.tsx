"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Topbar from "@/components/Topbar";
import TestimonialMediaCard from "@/components/TestimonialMediaCard";
import { getTestimonials, createTestimonial, deleteTestimonial } from "./actions";
import type { TestimonialItem } from "@/data/testimonials";
import {
  Star,
  Upload,
  Image as ImageIcon,
  Video,
  Trash2,
  Loader2,
  Lock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function TestimoniAdminPage() {
  const { hasPermission, loading: authLoading } = useAuth();
  const canManage = hasPermission("page_testimonials");

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    type: "image" as "image" | "video",
    customerName: "",
    topTag: "WhatsApp",
    statusText: "",
  });

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTestimonials();
      setTestimonials(data);
    } catch (err) {
      console.error("Failed to fetch testimonials:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && canManage) {
      fetchTestimonials();
    }
  }, [authLoading, canManage, fetchTestimonials]);

  useEffect(() => {
    return () => {
      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    };
  }, [mediaPreview]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
        <Loader2 className="animate-spin text-[#1bc5b3]" size={40} />
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)] p-6 text-center text-[var(--text-primary)]">
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20">
          <Lock size={40} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Akses Ditolak</h1>
        <p className="text-[var(--text-secondary)] max-w-md">
          Anda tidak memiliki izin untuk mengelola testimoni.
        </p>
      </div>
    );
  }

  const handleFileSelect = (file: File | null) => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(file);
    if (file) {
      setMediaPreview(URL.createObjectURL(file));
      if (file.type.startsWith("video/")) {
        setFormData((prev) => ({ ...prev, type: "video" }));
      } else if (file.type.startsWith("image/")) {
        setFormData((prev) => ({ ...prev, type: "image" }));
      }
    } else {
      setMediaPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFile) {
      alert("Silakan unggah file media terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("type", formData.type);
      data.append("customerName", formData.customerName);
      data.append("topTag", formData.topTag);
      data.append("statusText", formData.statusText);
      data.append("mediaFile", mediaFile);

      await createTestimonial(data);

      setFormData({
        type: "image",
        customerName: "",
        topTag: "WhatsApp",
        statusText: "Verified Buyer via WhatsApp",
      });
      handleFileSelect(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchTestimonials();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      alert(`Gagal menyimpan testimoni: ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus testimoni ini?")) return;
    setDeletingId(id);
    try {
      await deleteTestimonial(id);
      await fetchTestimonials();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      alert(`Gagal menghapus: ${message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass =
    "w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#1bc5b3] transition-colors";

  return (
    <>
      <Topbar
        title="Kelola Testimoni"
        subtitle="Unggah dan kelola testimoni pelanggan untuk halaman publik"
      />

      <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen px-4 md:px-8 pb-12">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Upload Form */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Star size={20} className="text-[#1bc5b3]" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Tambah Testimoni Baru</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Media Upload Zone */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Media (Gambar atau Video)
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-colors ${
                    dragActive
                      ? "border-[#1bc5b3] bg-[#1bc5b3]/5"
                      : "border-[var(--border-color)] hover:border-[var(--border-active)]"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {mediaPreview ? (
                    <div className="relative aspect-[4/3] w-full bg-[var(--bg-secondary)]">
                      {formData.type === "video" ? (
                        <video
                          src={mediaPreview}
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image
                          src={mediaPreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-[var(--text-secondary)]">
                      <Upload size={32} className="text-[#1bc5b3]/60" />
                      <p className="text-sm font-medium">
                        Seret & lepas file, atau klik untuk memilih
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">JPG, PNG, MP4, WebM</p>
                    </div>
                  )}
                </div>
                {mediaFile && (
                  <p className="text-xs text-[var(--text-muted)] mt-2 truncate">{mediaFile.name}</p>
                )}
              </div>

              {/* Media Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Tipe Media
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "image" })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all ${
                      formData.type === "image"
                        ? "bg-[#1bc5b3]/10 border-[#1bc5b3] text-[#1bc5b3]"
                        : "bg-gray-50 dark:bg-[#161b22] border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700"
                    }`}
                  >
                    <ImageIcon size={16} />
                    Gambar
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "video" })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all ${
                      formData.type === "video"
                        ? "bg-[#1bc5b3]/10 border-[#1bc5b3] text-[#1bc5b3]"
                        : "bg-gray-50 dark:bg-[#161b22] border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700"
                    }`}
                  >
                    <Video size={16} />
                    Video
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Nama Pelanggan
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  placeholder="Contoh: Ahmad Rizky"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Tag / Platform
                </label>
                <input
                  type="text"
                  value={formData.topTag}
                  onChange={(e) => setFormData({ ...formData, topTag: e.target.value })}
                  placeholder="Contoh: WhatsApp"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Berlangganan sejak
                </label>
                <input
                  type="text"
                  value={formData.statusText}
                  onChange={(e) =>
                    setFormData({ ...formData, statusText: e.target.value })
                  }
                  placeholder="Contoh: 20 Februari 2025"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-[#1bc5b3] hover:bg-[#159a8c] text-white font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Upload size={18} />
                )}
                {submitting ? "Menyimpan..." : "Simpan Testimoni"}
              </button>
            </form>
          </div>

          {/* Existing Testimonials */}
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
              Testimoni Tersimpan ({testimonials.length})
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#1bc5b3]" size={32} />
              </div>
            ) : testimonials.length === 0 ? (
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-12 text-center text-[var(--text-secondary)]">
                <Star size={40} className="mx-auto mb-4 opacity-30" />
                <p>Belum ada testimoni. Unggah yang pertama!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {testimonials.map((item) => (
                  <div key={item.id} className="relative group">
                    <TestimonialMediaCard item={item} />
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="absolute top-2 right-2 z-10 p-2 rounded-lg bg-red-600/90 text-white shadow-md transition-opacity hover:bg-red-600 disabled:opacity-50"
                      title="Hapus testimoni"
                    >
                      {deletingId === item.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
