-- CreateEnum
CREATE TYPE "HubStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- AlterTable
ALTER TABLE "parcels" ADD COLUMN     "hub_id" TEXT;

-- AlterTable
ALTER TABLE "storage_locations" ADD COLUMN     "hub_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "hub_id" TEXT;

-- CreateTable
CREATE TABLE "hubs" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "address" TEXT,
    "contact_person" VARCHAR(100),
    "contact_phone" VARCHAR(15),
    "contact_email" VARCHAR(100),
    "status" "HubStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hubs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hubs_code_key" ON "hubs"("code");

-- CreateIndex
CREATE INDEX "hubs_code_idx" ON "hubs"("code");

-- CreateIndex
CREATE INDEX "hubs_status_idx" ON "hubs"("status");

-- CreateIndex
CREATE INDEX "parcels_hub_id_idx" ON "parcels"("hub_id");

-- CreateIndex
CREATE INDEX "storage_locations_hub_id_idx" ON "storage_locations"("hub_id");

-- CreateIndex
CREATE INDEX "users_hub_id_idx" ON "users"("hub_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_hub_id_fkey" FOREIGN KEY ("hub_id") REFERENCES "hubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_hub_id_fkey" FOREIGN KEY ("hub_id") REFERENCES "hubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storage_locations" ADD CONSTRAINT "storage_locations_hub_id_fkey" FOREIGN KEY ("hub_id") REFERENCES "hubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
