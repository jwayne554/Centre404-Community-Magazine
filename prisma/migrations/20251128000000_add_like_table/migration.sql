-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL,
    "magazineItemId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Like_magazineItemId_idx" ON "Like"("magazineItemId");

-- CreateIndex
CREATE INDEX "Like_userId_idx" ON "Like"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_magazineItemId_userId_key" ON "Like"("magazineItemId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_magazineItemId_sessionId_key" ON "Like"("magazineItemId", "sessionId");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_magazineItemId_fkey" FOREIGN KEY ("magazineItemId") REFERENCES "MagazineItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
