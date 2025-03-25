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

-- CreateIndex
CREATE UNIQUE INDEX "preferences_userId_key" ON "preferences"("userId");

-- AddForeignKey
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
