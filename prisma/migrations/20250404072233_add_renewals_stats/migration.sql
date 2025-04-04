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
CREATE UNIQUE INDEX "renewal_stats_userId_key" ON "renewal_stats"("userId");

-- AddForeignKey
ALTER TABLE "renewal_stats" ADD CONSTRAINT "renewal_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
