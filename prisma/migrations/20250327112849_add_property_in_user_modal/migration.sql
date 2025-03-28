-- AlterTable
ALTER TABLE "User" ADD COLUMN     "expired_documents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "expiring_documents" INTEGER NOT NULL DEFAULT 0;
