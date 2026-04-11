/*
  Warnings:

  - You are about to drop the column `createdAt` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `categories` table. All the data in the column will be lost.
  - Made the column `description` on table `categories` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "categories" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ALTER COLUMN "description" SET NOT NULL;
