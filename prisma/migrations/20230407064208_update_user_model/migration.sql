-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarSource" TEXT,
ADD COLUMN     "includeTaskFeature" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "todoistApiKey" TEXT;
