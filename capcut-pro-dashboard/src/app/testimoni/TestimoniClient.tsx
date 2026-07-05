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
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 font-medium text-sm"
            >
              <ArrowLeft size={16} />
              <span>Kembali</span>
            </button>

            <h1 className="text-3xl md:text-4xl font-bold text-center text-white mt-4">
              Testimoni Pelanggan
            </h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {testimonials.map((item) => (
              <article
                key={item.id}
                className="flex flex-col bg-[#11141a] rounded-2xl border border-gray-800 overflow-hidden relative"
              >
                <button
                  type="button"
                  onClick={() =>
                    setSelectedMedia({
                      type: item.type,
                      mediaUrl: item.mediaUrl,
                      customerName: item.customerName,
                    })
                  }
                  className="relative w-full overflow-hidden bg-[#0f1218] outline-none"
                  aria-label={`Lihat media testimoni ${item.customerName}`}
                >
                  <div className="relative w-full overflow-hidden bg-[#0f1218]">
                    {item.type === "video" ? (
                      <video
                        controls
                        muted
                        playsInline
                        webkit-playsinline="true"
                        className="w-full h-auto object-contain pointer-events-none"
                      >
                        <source src={item.mediaUrl} type="video/mp4" />
                      </video>
                    ) : (
                      <img
                        src={item.mediaUrl}
                        alt={`Testimoni dari ${item.customerName}`}
                        className="w-full h-auto object-contain pointer-events-none"
                      />
                    )}
                  </div>
                </button>

                <div className="p-4 flex flex-col gap-1.5 flex-grow">
                  {item.topTag && (
                    <span className="text-[10px] sm:text-xs font-bold text-[#1bc5b3] uppercase tracking-wide">
                      {item.topTag}
                    </span>
                  )}
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
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
            className="absolute top-6 right-6 text-gray-400 hover:text-white bg-gray-900/50 p-2 rounded-full transition-colors"
            aria-label="Tutup lightbox"
          >
            <X size={18} />
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

