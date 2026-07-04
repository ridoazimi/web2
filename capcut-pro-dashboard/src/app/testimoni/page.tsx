import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TestimoniClient from "./TestimoniClient";
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

      <TestimoniClient testimonials={testimonials} />

      <div className="bg-[#0f1218] border-t border-gray-800/60">
        <Footer />
      </div>
    </div>
  );
}


