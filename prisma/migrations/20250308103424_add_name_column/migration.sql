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