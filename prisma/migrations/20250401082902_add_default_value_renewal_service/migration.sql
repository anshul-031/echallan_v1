/*
  Warnings:

  - Made the column `govtFees` on table `renewal_services` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rtoApproval` on table `renewal_services` required. This step will fail if there are existing NULL values in that column.
  - Made the column `inspection` on table `renewal_services` required. This step will fail if there are existing NULL values in that column.
  - Made the column `certificate` on table `renewal_services` required. This step will fail if there are existing NULL values in that column.
  - Made the column `documentDelivered` on table `renewal_services` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "renewal_services" ALTER COLUMN "govtFees" SET NOT NULL,
ALTER COLUMN "govtFees" SET DEFAULT false,
ALTER COLUMN "rtoApproval" SET NOT NULL,
ALTER COLUMN "rtoApproval" SET DEFAULT false,
ALTER COLUMN "inspection" SET NOT NULL,
ALTER COLUMN "inspection" SET DEFAULT false,
ALTER COLUMN "certificate" SET NOT NULL,
ALTER COLUMN "certificate" SET DEFAULT false,
ALTER COLUMN "documentDelivered" SET NOT NULL,
ALTER COLUMN "documentDelivered" SET DEFAULT false;
