import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  
  if (count === 0) {
    console.log("Seeding products...");
    await prisma.product.createMany({
      data: [
        {
          name: "CapCut Pro 1 Bulan",
          description: "Nikmati fitur premium CapCut tanpa batas selama 1 bulan penuh. Export 4K, tanpa watermark, dan akses semua template & efek pro.",
          price: 25000,
          category: "Video Editing",
          imageUrl: "/products/capcut.png",
          isActive: true
        },
        {
          name: "CapCut Pro 1 Tahun",
          description: "Berlangganan CapCut Pro selama 1 tahun. Jauh lebih hemat untuk konten kreator jangka panjang. Garansi full 1 tahun.",
          price: 150000,
          category: "Video Editing",
          imageUrl: "/products/capcut.png",
          isActive: true
        },
        {
          name: "Canva Pro 1 Bulan",
          description: "Desain grafis premium dengan Canva Pro. Akses ke jutaan elemen premium, hapus background instan, dan magic resize.",
          price: 15000,
          category: "Graphic Design",
          imageUrl: "/products/capcut.png", // fallback image
          isActive: true
        }
      ]
    });
    console.log("Seeded 3 products.");
  } else {
    console.log(`Products already seeded (${count} products).`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
