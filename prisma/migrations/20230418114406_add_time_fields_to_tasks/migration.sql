/*
  Warnings:

  - You are about to drop the column `timeEstimate` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "timeEstimate";

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "order" INTEGER,
ADD COLUMN     "timeEstimate" INTEGER NOT NULL DEFAULT 900,
ADD COLUMN     "timeSpent" INTEGER NOT NULL DEFAULT 0;
