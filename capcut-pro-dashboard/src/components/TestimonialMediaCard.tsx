import Image from "next/image";
import type { TestimonialItem } from "@/data/testimonials";

type TestimonialMediaCardProps = {
  item: TestimonialItem;
};

export default function TestimonialMediaCard({ item }: TestimonialMediaCardProps) {
  const isVideo = item.type === "video";

  return (
    <article className="flex flex-col bg-white dark:bg-[#11141a] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden relative">
      <div className="relative w-full overflow-hidden bg-gray-100 dark:bg-[#0f1218]">
        {isVideo ? (
          <video
            controls
            muted
            playsInline
            webkit-playsinline="true"
            className="w-full h-auto object-contain"
          >
            <source src={item.mediaUrl} type="video/mp4" />
          </video>
        ) : (
          <img
            src={item.mediaUrl}
            alt={item.customerName ? `Testimoni dari ${item.customerName}` : "Testimoni pelanggan"}
            className="w-full h-auto object-contain"
          />
        )}
      </div>

      <div className="p-4 flex flex-col gap-1.5 flex-grow">
        {item.topTag && (
          <span className="text-[10px] sm:text-xs font-bold text-[#1bc5b3] uppercase tracking-wide">
            {item.topTag}
          </span>
        )}
        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-snug">
          {item.customerName}
        </h3>
        <p className="text-[10px] sm:text-xs font-semibold text-green-500 mt-auto pt-2">
          {item.statusText ?? "Verified Buyer"}
        </p>
      </div>
    </article>
  );
}
