-- AlterTable
ALTER TABLE "Challan" ALTER COLUMN "sent_to_reg_court" DROP DEFAULT,
ALTER COLUMN "sent_to_reg_court" SET DATA TYPE TEXT,
ALTER COLUMN "sent_to_virtual_court" DROP DEFAULT,
ALTER COLUMN "sent_to_virtual_court" SET DATA TYPE TEXT;
