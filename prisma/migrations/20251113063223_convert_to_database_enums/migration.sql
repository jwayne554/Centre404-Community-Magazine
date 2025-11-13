-- Task 3.1: Convert to Database Enums
-- This migration safely converts String fields to PostgreSQL enums without data loss

-- Step 1: Create enum types
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MODERATOR', 'CONTRIBUTOR');
CREATE TYPE "SubmissionCategory" AS ENUM ('MY_NEWS', 'SAYING_HELLO', 'MY_SAY');
CREATE TYPE "SubmissionContentType" AS ENUM ('TEXT', 'IMAGE', 'AUDIO', 'DRAWING', 'MIXED');
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED');
CREATE TYPE "MagazineStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT');

-- Step 2: Convert User.role column
-- Drop default first, convert type, then set new default
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING "role"::"UserRole";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CONTRIBUTOR'::"UserRole";

-- Step 3: Convert Submission columns
-- category (no default)
ALTER TABLE "Submission" ALTER COLUMN "category" TYPE "SubmissionCategory" USING "category"::"SubmissionCategory";

-- contentType (no default)
ALTER TABLE "Submission" ALTER COLUMN "contentType" TYPE "SubmissionContentType" USING "contentType"::"SubmissionContentType";

-- status (has default)
ALTER TABLE "Submission" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Submission" ALTER COLUMN "status" TYPE "SubmissionStatus" USING "status"::"SubmissionStatus";
ALTER TABLE "Submission" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"SubmissionStatus";

-- Step 4: Convert Magazine.status column (has default)
ALTER TABLE "Magazine" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Magazine" ALTER COLUMN "status" TYPE "MagazineStatus" USING "status"::"MagazineStatus";
ALTER TABLE "Magazine" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"MagazineStatus";

-- Step 5: Convert Media.type column (no default)
ALTER TABLE "Media" ALTER COLUMN "type" TYPE "MediaType" USING "type"::"MediaType";
