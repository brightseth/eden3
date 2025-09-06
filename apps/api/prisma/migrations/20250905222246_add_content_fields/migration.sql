-- AlterTable
ALTER TABLE "public"."works" ADD COLUMN     "content" TEXT,
ADD COLUMN     "content_metadata" TEXT,
ADD COLUMN     "content_type" TEXT NOT NULL DEFAULT 'TEXT';
