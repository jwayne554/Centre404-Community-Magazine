-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CONTRIBUTOR',
    "accessibilityPrefs" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "category" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "textContent" TEXT,
    "mediaUrl" TEXT,
    "mediaThumbnailUrl" TEXT,
    "mediaMetadata" TEXT NOT NULL DEFAULT '{}',
    "drawingData" TEXT,
    "accessibilityText" TEXT,
    "userName" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedById" TEXT,
    "reviewNotes" TEXT,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Magazine" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "theme" TEXT NOT NULL DEFAULT '{}',
    "publishedAt" TIMESTAMP(3),
    "publishedById" TEXT,
    "shareableSlug" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Magazine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MagazineItem" (
    "id" TEXT NOT NULL,
    "magazineId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "customTitle" TEXT,
    "customDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MagazineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "publicId" TEXT,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Submission_status_submittedAt_idx" ON "Submission"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "Submission_userId_idx" ON "Submission"("userId");

-- CreateIndex
CREATE INDEX "Submission_category_idx" ON "Submission"("category");

-- CreateIndex
CREATE INDEX "Submission_status_category_submittedAt_idx" ON "Submission"("status", "category", "submittedAt");

-- CreateIndex
CREATE INDEX "Submission_category_status_idx" ON "Submission"("category", "status");

-- CreateIndex
CREATE INDEX "Submission_reviewedById_reviewedAt_idx" ON "Submission"("reviewedById", "reviewedAt");

-- CreateIndex
CREATE INDEX "Submission_reviewedAt_idx" ON "Submission"("reviewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Magazine_shareableSlug_key" ON "Magazine"("shareableSlug");

-- CreateIndex
CREATE INDEX "Magazine_status_publishedAt_idx" ON "Magazine"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Magazine_isPublic_status_publishedAt_idx" ON "Magazine"("isPublic", "status", "publishedAt");

-- CreateIndex
CREATE INDEX "Magazine_viewCount_idx" ON "Magazine"("viewCount");

-- CreateIndex
CREATE INDEX "MagazineItem_magazineId_displayOrder_idx" ON "MagazineItem"("magazineId", "displayOrder");

-- CreateIndex
CREATE INDEX "MagazineItem_submissionId_idx" ON "MagazineItem"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "MagazineItem_magazineId_submissionId_key" ON "MagazineItem"("magazineId", "submissionId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_timestamp_idx" ON "AuditLog"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_action_timestamp_idx" ON "AuditLog"("action", "timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "Media_type_idx" ON "Media"("type");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Magazine" ADD CONSTRAINT "Magazine_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MagazineItem" ADD CONSTRAINT "MagazineItem_magazineId_fkey" FOREIGN KEY ("magazineId") REFERENCES "Magazine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MagazineItem" ADD CONSTRAINT "MagazineItem_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

