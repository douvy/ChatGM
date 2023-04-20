/*
  Warnings:

  - You are about to drop the column `HEAD` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "HEAD",
ADD COLUMN     "FIRST" TEXT;
