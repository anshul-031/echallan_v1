-- CreateEnum
CREATE TYPE "RenewalServiceStatus" AS ENUM ('pending', 'processing', 'completed', 'cancelled');

-- DropForeignKey
ALTER TABLE "PrecedingChallan" DROP CONSTRAINT "PrecedingChallan_challan_id_fkey";

-- DropForeignKey
ALTER TABLE "PrecedingChallan" DROP CONSTRAINT "PrecedingChallan_vehicle_id_fkey";

-- CreateTable
CREATE TABLE "renewal_services" (
    "id" SERIAL NOT NULL,
    "services" TEXT,
    "isAssignedService" BOOLEAN,
    "vehicle_no" TEXT,
    "vehicle_id" INTEGER,
    "user_id" TEXT,
    "govFees" DECIMAL(10,2),
    "serviceCharge" DECIMAL(10,2),
    "price" DECIMAL(10,2),
    "govtFees" BOOLEAN,
    "rtoApproval" BOOLEAN,
    "inspection" BOOLEAN,
    "certificate" BOOLEAN,
    "documentDelivered" BOOLEAN,
    "status" "RenewalServiceStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "renewal_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "renewal_services_vehicle_id_idx" ON "renewal_services"("vehicle_id");

-- CreateIndex
CREATE INDEX "renewal_services_user_id_idx" ON "renewal_services"("user_id");

-- AddForeignKey
ALTER TABLE "PrecedingChallan" ADD CONSTRAINT "PrecedingChallan_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrecedingChallan" ADD CONSTRAINT "PrecedingChallan_challan_id_fkey" FOREIGN KEY ("challan_id") REFERENCES "Challan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renewal_services" ADD CONSTRAINT "renewal_services_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renewal_services" ADD CONSTRAINT "renewal_services_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
