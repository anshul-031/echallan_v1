-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");


CREATE TABLE "vehicles" (
    "id" SERIAL NOT NULL,
    "vrn" TEXT NOT NULL,
    "roadTax" TEXT NOT NULL,
    "fitness" TEXT NOT NULL,
    "insurance" TEXT NOT NULL,
    "pollution" TEXT NOT NULL,
    "statePermit" TEXT NOT NULL,
    "nationalPermit" TEXT NOT NULL,
    "lastUpdated" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "ownerId" TEXT,
    "registeredAt" TEXT NOT NULL,
    "documents" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "vehicles_vrn_key" ON "vehicles"("vrn");

ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_ownerId_fkey" 
FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Challan" (
    "id" TEXT NOT NULL,
    "rc_no" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "challan_no" TEXT NOT NULL,
    "challan_status" TEXT NOT NULL,
    "sent_to_reg_court" BOOLEAN NOT NULL DEFAULT false,
    "remark" TEXT,
    "sent_to_virtual_court" BOOLEAN NOT NULL DEFAULT false,
    "amount_of_fine" DECIMAL(10,2) NOT NULL,
    "state_code" TEXT NOT NULL,
    "fine_imposed" DECIMAL(10,2) NOT NULL,
    "challan_date_time" TIMESTAMP(3) NOT NULL,
    "receipt_no" TEXT,
    "last_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Challan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Challan_challan_no_key" ON "Challan"("challan_no");

-- CreateIndex
CREATE INDEX "Challan_rc_no_idx" ON "Challan"("rc_no");

-- CreateIndex
CREATE INDEX "Challan_user_id_idx" ON "Challan"("user_id");

-- CreateIndex
CREATE INDEX "Challan_challan_no_idx" ON "Challan"("challan_no");

-- CreateIndex
CREATE INDEX "Challan_vehicle_id_idx" ON "Challan"("vehicle_id");

-- AddForeignKey
ALTER TABLE "Challan" ADD CONSTRAINT "Challan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challan" ADD CONSTRAINT "Challan_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
