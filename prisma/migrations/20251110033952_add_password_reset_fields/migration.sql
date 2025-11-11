-- AlterTable
ALTER TABLE "users" ADD COLUMN     "reset_token" VARCHAR(255),
ADD COLUMN     "reset_token_expiry" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "users_reset_token_idx" ON "users"("reset_token");
