-- DropForeignKey
ALTER TABLE "Challan" DROP CONSTRAINT "Challan_vehicle_id_fkey";

-- AddForeignKey
ALTER TABLE "Challan" ADD CONSTRAINT "Challan_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
