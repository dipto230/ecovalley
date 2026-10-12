-- CreateTable
CREATE TABLE "image_price_estimates" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "detectedCategory" TEXT,
    "detectedBrand" TEXT,
    "detectedModel" TEXT,
    "condition" "ProductCondition",
    "detectionConfidence" DOUBLE PRECISION NOT NULL,
    "aiModel" TEXT NOT NULL,
    "aiPredictedPrice" DECIMAL(10,2),
    "averagePrice" DECIMAL(10,2),
    "lowestPrice" DECIMAL(10,2),
    "highestPrice" DECIMAL(10,2),
    "confidenceScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "image_price_estimates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_price_sources" (
    "id" TEXT NOT NULL,
    "imagePriceEstimateId" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "productName" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "sourceUrl" TEXT,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_price_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "image_price_estimates_createdAt_idx" ON "image_price_estimates"("createdAt");

-- CreateIndex
CREATE INDEX "image_price_sources_imagePriceEstimateId_idx" ON "image_price_sources"("imagePriceEstimateId");

-- AddForeignKey
ALTER TABLE "image_price_sources" ADD CONSTRAINT "image_price_sources_imagePriceEstimateId_fkey" FOREIGN KEY ("imagePriceEstimateId") REFERENCES "image_price_estimates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
