-- CreateTable
CREATE TABLE "price_sources" (
    "id" TEXT NOT NULL,
    "priceEstimationId" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "productName" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "sourceUrl" TEXT,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "price_sources_priceEstimationId_idx" ON "price_sources"("priceEstimationId");

-- AddForeignKey
ALTER TABLE "price_sources" ADD CONSTRAINT "price_sources_priceEstimationId_fkey" FOREIGN KEY ("priceEstimationId") REFERENCES "price_estimations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
