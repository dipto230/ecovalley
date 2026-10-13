-- CreateTable
CREATE TABLE "ewaste_recovery_materials" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "materialName" TEXT NOT NULL,
    "estimatedWeightMinGrams" DOUBLE PRECISION,
    "estimatedWeightMaxGrams" DOUBLE PRECISION,
    "recoveryRate" DOUBLE PRECISION,
    "recoveredWeightMinGrams" DOUBLE PRECISION,
    "recoveredWeightMaxGrams" DOUBLE PRECISION,
    "pricePerKg" DECIMAL(10,2),
    "estimatedValueMin" DECIMAL(10,2),
    "estimatedValueMax" DECIMAL(10,2),
    "confidenceScore" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ewaste_recovery_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ewaste_recovery_reports" (
    "id" TEXT NOT NULL,
    "imagePriceEstimateId" TEXT NOT NULL,
    "deviceCategory" TEXT,
    "deviceBrand" TEXT,
    "deviceModel" TEXT,
    "estimatedWeightMinGrams" DOUBLE PRECISION,
    "estimatedWeightMaxGrams" DOUBLE PRECISION,
    "estimatedGrossValueMin" DECIMAL(10,2),
    "estimatedGrossValueMax" DECIMAL(10,2),
    "processingCostMin" DECIMAL(10,2),
    "processingCostMax" DECIMAL(10,2),
    "estimatedNetValueMin" DECIMAL(10,2),
    "estimatedNetValueMax" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "recommendation" TEXT,
    "recommendationReason" TEXT,
    "assumptions" TEXT,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "aiModel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ewaste_recovery_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ewaste_recovery_materials_reportId_idx" ON "ewaste_recovery_materials"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "ewaste_recovery_reports_imagePriceEstimateId_key" ON "ewaste_recovery_reports"("imagePriceEstimateId");

-- CreateIndex
CREATE INDEX "ewaste_recovery_reports_createdAt_idx" ON "ewaste_recovery_reports"("createdAt");

-- AddForeignKey
ALTER TABLE "ewaste_recovery_materials" ADD CONSTRAINT "ewaste_recovery_materials_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ewaste_recovery_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ewaste_recovery_reports" ADD CONSTRAINT "ewaste_recovery_reports_imagePriceEstimateId_fkey" FOREIGN KEY ("imagePriceEstimateId") REFERENCES "image_price_estimates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
