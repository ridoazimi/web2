-- Migration SQL untuk perubahan schema terbaru

-- 1. Buat tabel `products` baru
CREATE TABLE "products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255),
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "image_url" VARCHAR(500),
    "category" VARCHAR(100),
    "max_slots" INTEGER DEFAULT 3,
    "duration" INTEGER DEFAULT 30,
    "rules" TEXT,
    "message_template" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- 2. Buat index unique untuk slug di tabel products
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- 3. Tambahkan kolom `product_id` ke tabel `stock_accounts`
ALTER TABLE "stock_accounts" ADD COLUMN "product_id" UUID;

-- 4. Tambahkan Foreign Key dari `stock_accounts` ke `products`
ALTER TABLE "stock_accounts" ADD CONSTRAINT "stock_accounts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- 5. (Opsional) Hapus kolom `product_type` dari `stock_accounts` jika sudah tidak diperlukan
-- Catatan: Uncomment baris di bawah jika ingin menghapusnya secara permanen dari database
-- ALTER TABLE "stock_accounts" DROP COLUMN "product_type";
