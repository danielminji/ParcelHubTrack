/*
  Warnings:

  - You are about to drop the column `courier` on the `parcels` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."parcels_courier_idx";

-- AlterTable
ALTER TABLE "parcels" DROP COLUMN "courier";
