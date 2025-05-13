-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('BASIC', 'CAB', 'EV', 'CHALLAN', 'FLEET', 'SUPER_USER', 'ADMIN', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "RenewalServiceStatus" AS ENUM ('not_assigned', 'pending', 'processing', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "address" TEXT,
    "dob" TIMESTAMP(3),
    "gender" TEXT,
    "image" TEXT,
    "location" TEXT,
    "userType" "UserType" NOT NULL DEFAULT 'BASIC',
    "credits" INTEGER NOT NULL DEFAULT 0,
    "companyId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "image" TEXT,
    "address" TEXT,
    "location" TEXT,
    "role" TEXT,
    "doj" TIMESTAMP(3) NOT NULL,
    "designation" TEXT NOT NULL,
    "reportTo" TEXT,
    "assignedUsers" TEXT[],
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "ownerPhone" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "gstin" TEXT,
    "pan" TEXT,
    "cin" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "vrn" TEXT NOT NULL,
    "roadTax" TEXT NOT NULL,
    "roadTaxDoc" TEXT,
    "fitness" TEXT NOT NULL,
    "fitnessDoc" TEXT,
    "insurance" TEXT NOT NULL,
    "insuranceDoc" TEXT,
    "pollution" TEXT NOT NULL,
    "pollutionDoc" TEXT,
    "statePermit" TEXT NOT NULL,
    "statePermitDoc" TEXT,
    "nationalPermit" TEXT NOT NULL,
    "nationalPermitDoc" TEXT,
    "lastUpdated" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "ownerId" TEXT,
    "registeredAt" TEXT NOT NULL,
    "documents" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

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
    "expiring_3m_count" INTEGER NOT NULL DEFAULT 0,
    "expiring_3m_roadTax" INTEGER NOT NULL DEFAULT 0,
    "expiring_3m_fitness" INTEGER NOT NULL DEFAULT 0,
    "expiring_3m_insurance" INTEGER NOT NULL DEFAULT 0,
    "expiring_3m_pollution" INTEGER NOT NULL DEFAULT 0,
    "expiring_3m_statePermit" INTEGER NOT NULL DEFAULT 0,
    "expiring_3m_nationalPermit" INTEGER NOT NULL DEFAULT 0,
    "expiring_6m_count" INTEGER NOT NULL DEFAULT 0,
    "expiring_6m_roadTax" INTEGER NOT NULL DEFAULT 0,
    "expiring_6m_fitness" INTEGER NOT NULL DEFAULT 0,
    "expiring_6m_insurance" INTEGER NOT NULL DEFAULT 0,
    "expiring_6m_pollution" INTEGER NOT NULL DEFAULT 0,
    "expiring_6m_statePermit" INTEGER NOT NULL DEFAULT 0,
    "expiring_6m_nationalPermit" INTEGER NOT NULL DEFAULT 0,
    "expiring_1y_count" INTEGER NOT NULL DEFAULT 0,
    "expiring_1y_roadTax" INTEGER NOT NULL DEFAULT 0,
    "expiring_1y_fitness" INTEGER NOT NULL DEFAULT 0,
    "expiring_1y_insurance" INTEGER NOT NULL DEFAULT 0,
    "expiring_1y_pollution" INTEGER NOT NULL DEFAULT 0,
    "expiring_1y_statePermit" INTEGER NOT NULL DEFAULT 0,
    "expiring_1y_nationalPermit" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_vehicle_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challan" (
    "id" TEXT NOT NULL,
    "rc_no" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "challan_no" TEXT NOT NULL,
    "challan_status" TEXT NOT NULL,
    "sent_to_reg_court" TEXT NOT NULL,
    "remark" TEXT,
    "sent_to_virtual_court" TEXT NOT NULL,
    "amount_of_fine" DOUBLE PRECISION NOT NULL,
    "state_code" TEXT NOT NULL,
    "fine_imposed" DOUBLE PRECISION NOT NULL,
    "challan_date_time" TIMESTAMP(3) NOT NULL,
    "receipt_no" TEXT,
    "last_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Challan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roadTaxVisibility" BOOLEAN NOT NULL DEFAULT true,
    "fitnessVisibility" BOOLEAN NOT NULL DEFAULT true,
    "insuranceVisibility" BOOLEAN NOT NULL DEFAULT true,
    "pollutionVisibility" BOOLEAN NOT NULL DEFAULT true,
    "statePermitVisibility" BOOLEAN NOT NULL DEFAULT true,
    "nationalPermitVisibility" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preferences_pkey" PRIMARY KEY ("id")
);

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
    "amount_of_fine" DOUBLE PRECISION NOT NULL,
    "fine_imposed" DOUBLE PRECISION NOT NULL,
    "receipt_no" TEXT,
    "payment_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicle_id" TEXT NOT NULL,

    CONSTRAINT "PrecedingChallan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "renewal_services" (
    "id" TEXT NOT NULL,
    "services" TEXT,
    "isAssignedService" BOOLEAN,
    "vehicle_no" TEXT,
    "vehicle_id" TEXT,
    "user_id" TEXT,
    "govFees" DOUBLE PRECISION,
    "serviceCharge" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "gst" DOUBLE PRECISION,
    "govtFees" BOOLEAN NOT NULL DEFAULT false,
    "rtoApproval" BOOLEAN NOT NULL DEFAULT false,
    "inspection" BOOLEAN NOT NULL DEFAULT false,
    "certificate" BOOLEAN NOT NULL DEFAULT false,
    "documentDelivered" BOOLEAN NOT NULL DEFAULT false,
    "documentRecieved" BOOLEAN NOT NULL DEFAULT false,
    "documentRecievedUpdate" TIMESTAMP(3),
    "govtFeesUpdate" TIMESTAMP(3),
    "rtoApprovalUpdate" TIMESTAMP(3),
    "inspectionUpdate" TIMESTAMP(3),
    "certificateUpdate" TIMESTAMP(3),
    "documentDeliveryUpdate" TIMESTAMP(3),
    "status" "RenewalServiceStatus" NOT NULL DEFAULT 'not_assigned',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "renewal_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "privileges" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "dashboard_view" BOOLEAN NOT NULL DEFAULT false,
    "dashboard_add" BOOLEAN NOT NULL DEFAULT false,
    "dashboard_edit" BOOLEAN NOT NULL DEFAULT false,
    "customer_view" BOOLEAN NOT NULL DEFAULT false,
    "customer_add" BOOLEAN NOT NULL DEFAULT false,
    "customer_edit" BOOLEAN NOT NULL DEFAULT false,
    "employee_view" BOOLEAN NOT NULL DEFAULT false,
    "employee_add" BOOLEAN NOT NULL DEFAULT false,
    "employee_edit" BOOLEAN NOT NULL DEFAULT false,
    "user_view" BOOLEAN NOT NULL DEFAULT false,
    "user_add" BOOLEAN NOT NULL DEFAULT false,
    "user_edit" BOOLEAN NOT NULL DEFAULT false,
    "vehicle_view" BOOLEAN NOT NULL DEFAULT false,
    "vehicle_add" BOOLEAN NOT NULL DEFAULT false,
    "vehicle_edit" BOOLEAN NOT NULL DEFAULT false,
    "administrator_view" BOOLEAN NOT NULL DEFAULT false,
    "administrator_add" BOOLEAN NOT NULL DEFAULT false,
    "administrator_edit" BOOLEAN NOT NULL DEFAULT false,
    "bulk_data_access" BOOLEAN NOT NULL DEFAULT false,
    "other_options_access" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "privileges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "renewal_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalServices" INTEGER NOT NULL DEFAULT 0,
    "pendingCount" INTEGER NOT NULL DEFAULT 0,
    "processingCount" INTEGER NOT NULL DEFAULT 0,
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "cancelledCount" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "renewal_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE UNIQUE INDEX "companies_email_key" ON "companies"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_vehicle_stats_userId_key" ON "user_vehicle_stats"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Challan_challan_no_key" ON "Challan"("challan_no");

-- CreateIndex
CREATE INDEX "Challan_rc_no_idx" ON "Challan"("rc_no");

-- CreateIndex
CREATE INDEX "Challan_user_id_idx" ON "Challan"("user_id");

-- CreateIndex
CREATE INDEX "Challan_vehicle_id_idx" ON "Challan"("vehicle_id");

-- CreateIndex
CREATE UNIQUE INDEX "preferences_userId_key" ON "preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PrecedingChallan_challan_id_key" ON "PrecedingChallan"("challan_id");

-- CreateIndex
CREATE UNIQUE INDEX "PrecedingChallan_challan_no_key" ON "PrecedingChallan"("challan_no");

-- CreateIndex
CREATE INDEX "PrecedingChallan_rc_no_idx" ON "PrecedingChallan"("rc_no");

-- CreateIndex
CREATE INDEX "PrecedingChallan_user_id_idx" ON "PrecedingChallan"("user_id");

-- CreateIndex
CREATE INDEX "renewal_services_vehicle_id_idx" ON "renewal_services"("vehicle_id");

-- CreateIndex
CREATE INDEX "renewal_services_user_id_idx" ON "renewal_services"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "privileges_employeeId_key" ON "privileges"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "renewal_stats_userId_key" ON "renewal_stats"("userId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_vehicle_stats" ADD CONSTRAINT "user_vehicle_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challan" ADD CONSTRAINT "Challan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challan" ADD CONSTRAINT "Challan_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrecedingChallan" ADD CONSTRAINT "PrecedingChallan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrecedingChallan" ADD CONSTRAINT "PrecedingChallan_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrecedingChallan" ADD CONSTRAINT "PrecedingChallan_challan_id_fkey" FOREIGN KEY ("challan_id") REFERENCES "Challan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renewal_services" ADD CONSTRAINT "renewal_services_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renewal_services" ADD CONSTRAINT "renewal_services_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "privileges" ADD CONSTRAINT "privileges_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renewal_stats" ADD CONSTRAINT "renewal_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
