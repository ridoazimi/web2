import Image from "next/image";
import type { TestimonialItem } from "@/data/testimonials";

type TestimonialMediaCardProps = {
  item: TestimonialItem;
};

export default function TestimonialMediaCard({ item }: TestimonialMediaCardProps) {
  const isVideo = item.type === "video";
  const aspectClass = isVideo ? "aspect-[9/16]" : "aspect-[4/3]";

  return (
    <article className="flex flex-col bg-[#11141a] rounded-2xl border border-gray-800 overflow-hidden relative">
      <div className={`relative w-full overflow-hidden bg-[#0f1218] ${aspectClass}`}>
        {isVideo ? (
          <video
            controls
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={item.mediaUrl} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={item.mediaUrl}
            alt={item.customerName ? `Testimoni dari ${item.customerName}` : "Testimoni pelanggan"}
            fill
            className="w-full object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}
      </div>

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
  );
}
