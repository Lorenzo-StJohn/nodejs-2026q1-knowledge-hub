/*
  Warnings:

  - The values [DRAFT,PUBLISHED,ARCHIVED] on the enum `ArticleStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ArticleStatus_new" AS ENUM ('draft', 'published', 'archived');
ALTER TABLE "public"."articles" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "articles" ALTER COLUMN "status" TYPE "ArticleStatus_new" USING ("status"::text::"ArticleStatus_new");
ALTER TYPE "ArticleStatus" RENAME TO "ArticleStatus_old";
ALTER TYPE "ArticleStatus_new" RENAME TO "ArticleStatus";
DROP TYPE "public"."ArticleStatus_old";
ALTER TABLE "articles" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- AlterTable
ALTER TABLE "articles" ALTER COLUMN "status" SET DEFAULT 'draft';
