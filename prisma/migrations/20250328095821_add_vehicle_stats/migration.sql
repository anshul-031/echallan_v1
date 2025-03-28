/*
  Warnings:

  - You are about to drop the column `expired_documents` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `expiring_documents` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "expired_documents",
DROP COLUMN "expiring_documents";

-- CreateTable
CREATE TABLE "user_vehicle_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "total_vehicles" INTEGER NOT NULL DEFAULT 0,
    "expiring_count" INTEGER NOT NULL DEFAULT 0,
    "expired_count" INTEGER NOT NULL DEFAULT 0,
    "expiring_roadTax" INTEGER NOT NULL DEFAULT 0,
    "expiring_fitness" INTEGER NOT NULL DEFAULT 0,
    "expiring_insurance" INTEGER NOT NULL DEFAULT 0,
    "expiring_pollution" INTEGER NOT NULL DEFAULT 0,
    "expiring_statePermit" INTEGER NOT NULL DEFAULT 0,
    "expiring_nationalPermit" INTEGER NOT NULL DEFAULT 0,
    "expired_roadTax" INTEGER NOT NULL DEFAULT 0,
    "expired_fitness" INTEGER NOT NULL DEFAULT 0,
    "expired_insurance" INTEGER NOT NULL DEFAULT 0,
    "expired_pollution" INTEGER NOT NULL DEFAULT 0,
    "expired_statePermit" INTEGER NOT NULL DEFAULT 0,
    "expired_nationalPermit" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_vehicle_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_vehicle_stats_userId_key" ON "user_vehicle_stats"("userId");

-- AddForeignKey
ALTER TABLE "user_vehicle_stats" ADD CONSTRAINT "user_vehicle_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
