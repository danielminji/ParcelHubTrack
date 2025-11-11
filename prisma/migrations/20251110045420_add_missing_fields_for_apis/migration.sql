-- AlterTable
ALTER TABLE "hubs" ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "country" VARCHAR(100),
ADD COLUMN     "postal_code" VARCHAR(20),
ADD COLUMN     "state" VARCHAR(100);

-- AlterTable
ALTER TABLE "parcels" ADD COLUMN     "arrived_at" TIMESTAMP(3),
ADD COLUMN     "cancellation_reason" TEXT,
ADD COLUMN     "cancelled_at" TIMESTAMP(3),
ADD COLUMN     "collected_at" TIMESTAMP(3),
ADD COLUMN     "courier" VARCHAR(50);

-- CreateIndex
CREATE INDEX "hubs_city_idx" ON "hubs"("city");

-- CreateIndex
CREATE INDEX "parcels_courier_idx" ON "parcels"("courier");
