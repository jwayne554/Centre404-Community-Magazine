-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "submissionId" TEXT;

-- CreateIndex
CREATE INDEX "Media_submissionId_idx" ON "Media"("submissionId");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
