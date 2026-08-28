-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "vendors_categories" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "categoryId" UUID NOT NULL,

    CONSTRAINT "vendors_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "contactNumber" TEXT,
    "alternateContactNumber" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "companyName" TEXT NOT NULL,
    "tradeLicenseNumber" TEXT NOT NULL,
    "nidNumber" TEXT NOT NULL,
    "tinNumber" TEXT,
    "vatRegistrationNumber" TEXT,
    "website" TEXT,
    "businessType" TEXT,
    "status" "VendorStatus" NOT NULL DEFAULT 'PENDING',
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "bankBranch" TEXT,
    "mobileBankingNumber" TEXT,
    "notes" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_vendor_category_vendor_id" ON "vendors_categories"("vendorId");

-- CreateIndex
CREATE INDEX "idx_vendor_category_category_id" ON "vendors_categories"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_categories_vendorId_categoryId_key" ON "vendors_categories"("vendorId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_email_key" ON "vendors"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_companyName_key" ON "vendors"("companyName");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_tradeLicenseNumber_key" ON "vendors"("tradeLicenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_nidNumber_key" ON "vendors"("nidNumber");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_tinNumber_key" ON "vendors"("tinNumber");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_vatRegistrationNumber_key" ON "vendors"("vatRegistrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_userId_key" ON "vendors"("userId");

-- CreateIndex
CREATE INDEX "idx_vendor_email" ON "vendors"("email");

-- CreateIndex
CREATE INDEX "idx_vendor_company_name" ON "vendors"("companyName");

-- CreateIndex
CREATE INDEX "idx_vendor_is_deleted" ON "vendors"("isDeleted");

-- AddForeignKey
ALTER TABLE "vendors_categories" ADD CONSTRAINT "vendors_categories_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors_categories" ADD CONSTRAINT "vendors_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
