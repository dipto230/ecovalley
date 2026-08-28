-- CreateEnum
CREATE TYPE "ProductCondition" AS ENUM ('NEW', 'USED', 'REFURBISHED');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SOLD', 'AVAILABLE');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "ai_detections" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "detectedCategory" TEXT,
    "detectedBrand" TEXT,
    "detectedModel" TEXT,
    "condition" "ProductCondition",
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "aiModel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_detections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_comparisons" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "platformName" TEXT NOT NULL,
    "productUrl" TEXT NOT NULL,
    "marketPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "offerPrice" DECIMAL(10,2) NOT NULL,
    "message" TEXT,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_estimations" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "aiPredictedPrice" DECIMAL(10,2) NOT NULL,
    "averagePrice" DECIMAL(10,2) NOT NULL,
    "lowestPrice" DECIMAL(10,2) NOT NULL,
    "highestPrice" DECIMAL(10,2) NOT NULL,
    "confidenceScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_estimations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "condition" "ProductCondition" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "estimatedPrice" DECIMAL(10,2) NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vendorId" TEXT NOT NULL,
    "categoryId" UUID NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" TEXT NOT NULL,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_detections_productId_idx" ON "ai_detections"("productId");

-- CreateIndex
CREATE INDEX "market_comparisons_productId_idx" ON "market_comparisons"("productId");

-- CreateIndex
CREATE INDEX "offers_productId_idx" ON "offers"("productId");

-- CreateIndex
CREATE INDEX "offers_vendorId_idx" ON "offers"("vendorId");

-- CreateIndex
CREATE INDEX "price_estimations_productId_idx" ON "price_estimations"("productId");

-- CreateIndex
CREATE INDEX "idx_product_vendor" ON "products"("vendorId");

-- CreateIndex
CREATE INDEX "idx_product_category" ON "products"("categoryId");

-- CreateIndex
CREATE INDEX "idx_product_status" ON "products"("status");

-- CreateIndex
CREATE INDEX "idx_product_image_product" ON "product_images"("productId");

-- AddForeignKey
ALTER TABLE "ai_detections" ADD CONSTRAINT "ai_detections_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_comparisons" ADD CONSTRAINT "market_comparisons_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_estimations" ADD CONSTRAINT "price_estimations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
