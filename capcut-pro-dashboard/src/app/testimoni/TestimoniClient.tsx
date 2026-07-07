"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { TestimonialItem } from "@/data/testimonials";

export type TestimoniClientProps = {
  testimonials: TestimonialItem[];
};

type SelectedMedia = {
  type: "image" | "video";
  mediaUrl: string;
  customerName: string;
};

export default function TestimoniClient({
  testimonials,
}: TestimoniClientProps) {
  const router = useRouter();

  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(
    null
  );

  useEffect(() => {
    if (!selectedMedia) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedMedia(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedMedia]);

  return (
    <>
      <main className="relative z-10 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative mb-12">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 font-medium text-sm"
            >
              <ArrowLeft size={16} />
              <span>Kembali</span>
            </button>

            <h1 className="text-3xl md:text-4xl font-bold text-center text-[var(--text-primary)] mt-4">
              Testimoni Pelanggan
            </h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {testimonials.map((item) => (
              <article
                key={item.id}
                className="flex flex-col bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden relative"
              >
                {item.type === "video" ? (
                  /* Removed fixed aspect-ratio, added min-h-[250px] to prevent iOS collapse */
                  <div className="relative w-full bg-black flex items-center justify-center overflow-hidden min-h-[250px]">
                    <video
                      controls
                      preload="metadata"
                      playsInline
                      webkit-playsinline="true"
                      /* Removed absolute positioning and object-cover to allow natural video height */
                      className="w-full h-auto block"
                      onLoadedMetadata={(e) => {
                        const video = e.currentTarget;
                        if (Number.isFinite(video.duration) && video.currentTime === 0) {
                          video.currentTime = 0.5;
                        }
                      }}
                    >
                      <source src={item.mediaUrl} type="video/mp4" />
                    </video>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedMedia({
                        type: item.type,
                        mediaUrl: item.mediaUrl,
                        customerName: item.customerName,
                      })
                    }
                    className="w-full outline-none block bg-[var(--bg-secondary)] relative"
                    aria-label={`Lihat media testimoni ${item.customerName}`}
                  >
                    {/* Removed the fixed aspect-ratio completely. 
                        w-full and h-auto allows the image to stretch the card to its actual uploaded height */}
                    <img
                      src={item.mediaUrl}
                      alt={`Testimoni dari ${item.customerName}`}
                      className="w-full h-auto block"
                    />
                  </button>
                )}
                  
                <div className="p-4 flex flex-col gap-1.5 flex-grow">
                  {item.topTag && (
                    <span className="text-[10px] sm:text-xs font-bold text-[#1bc5b3] uppercase tracking-wide">
                      {item.topTag}
                    </span>
                  )}
                  <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-snug">
                    {item.customerName}
                  </h3>
                  <p className="text-[10px] sm:text-xs font-semibold text-green-500 mt-auto pt-2">
                    {item.statusText ?? "Verified Buyer"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      {selectedMedia && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedMedia(null);
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedMedia(null)}
            // Added z-[60], backdrop blur, and solid background so it ALWAYS floats above the image
            className="absolute top-4 right-4 md:top-6 md:right-6 z-[60] text-[var(--text-primary)] hover:text-red-500 bg-[var(--bg-card)]/90 backdrop-blur-md p-2.5 rounded-full transition-all shadow-lg"
            aria-label="Tutup lightbox"
          >
            <X size={20} />
          </button>

          <div className="relative">
            {selectedMedia.type === "video" ? (
              <video
                src={selectedMedia.mediaUrl}
                controls
                playsInline
                webkit-playsinline="true"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            ) : (
              <Image
                src={selectedMedia.mediaUrl}
                alt={`Testimoni dari ${selectedMedia.customerName}`}
                width={1200}
                height={900}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}