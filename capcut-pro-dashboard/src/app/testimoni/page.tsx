import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TestimonialMediaCard from "@/components/TestimonialMediaCard";
import { mockTestimonials } from "@/data/testimonials";
import { getTestimonials } from "@/app/dashboard/testimoni/actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testimoni Pelanggan - Dorizz Store",
  description:
    "Lihat testimoni asli dari pelanggan Dorizz Store. Bukti transaksi dan pengalaman pelanggan kami.",
};

export const revalidate = 60;

export default async function TestimoniPage() {
  const dbTestimonials = await getTestimonials(true);
  const testimonials = dbTestimonials.length > 0 ? dbTestimonials : mockTestimonials;

  return (
    <div className="min-h-screen bg-[#0f1218] text-white">
      <Navbar variant="dark" />

      <main className="relative z-10 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
            Testimoni Pelanggan
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {testimonials.map((item) => (
              <TestimonialMediaCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </main>

      <div className="bg-[#0f1218] border-t border-gray-800/60">
        <Footer />
      </div>
    </div>
  );
}
