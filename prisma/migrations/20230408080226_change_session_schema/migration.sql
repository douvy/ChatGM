/*
  Warnings:

  - You are about to drop the column `accessToken` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Session` table. All the data in the column will be lost.
  - Added the required column `createdAt` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "accessToken",
DROP COLUMN "expiresAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "expires" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
