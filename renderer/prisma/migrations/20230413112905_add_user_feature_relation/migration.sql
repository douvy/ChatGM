/*
  Warnings:

  - You are about to drop the column `starred` on the `Feature` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Feature" DROP COLUMN "starred",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defaultHomepage" TEXT NOT NULL DEFAULT '/';

-- CreateTable
CREATE TABLE "_FeatureUsers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FeatureUsers_AB_unique" ON "_FeatureUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_FeatureUsers_B_index" ON "_FeatureUsers"("B");

-- AddForeignKey
ALTER TABLE "_FeatureUsers" ADD CONSTRAINT "_FeatureUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeatureUsers" ADD CONSTRAINT "_FeatureUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
