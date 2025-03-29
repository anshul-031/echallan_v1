-- AlterTable
ALTER TABLE "User" ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PrecedingChallan" (
    "id" TEXT NOT NULL,
    "challan_id" TEXT NOT NULL,
    "rc_no" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "challan_no" TEXT NOT NULL,
    "challan_status" TEXT NOT NULL,
    "sent_to_reg_court" TEXT NOT NULL,
    "sent_to_virtual_court" TEXT NOT NULL,
    "amount_of_fine" DECIMAL(10,2) NOT NULL,
    "fine_imposed" DECIMAL(10,2) NOT NULL,
    "receipt_no" TEXT,
    "payment_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicle_id" INTEGER NOT NULL,

    CONSTRAINT "PrecedingChallan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrecedingChallan_challan_id_key" ON "PrecedingChallan"("challan_id");

-- CreateIndex
CREATE UNIQUE INDEX "PrecedingChallan_challan_no_key" ON "PrecedingChallan"("challan_no");

-- CreateIndex
CREATE INDEX "PrecedingChallan_rc_no_idx" ON "PrecedingChallan"("rc_no");

-- CreateIndex
CREATE INDEX "PrecedingChallan_challan_id_idx" ON "PrecedingChallan"("challan_id");

-- CreateIndex
CREATE INDEX "PrecedingChallan_user_id_idx" ON "PrecedingChallan"("user_id");

-- AddForeignKey
ALTER TABLE "PrecedingChallan" ADD CONSTRAINT "PrecedingChallan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrecedingChallan" ADD CONSTRAINT "PrecedingChallan_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrecedingChallan" ADD CONSTRAINT "PrecedingChallan_challan_id_fkey" FOREIGN KEY ("challan_id") REFERENCES "Challan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
