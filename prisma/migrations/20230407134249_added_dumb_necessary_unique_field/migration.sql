/*
  Warnings:

  - A unique constraint covering the columns `[id,ownerId]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Conversation_id_ownerId_key" ON "Conversation"("id", "ownerId");
