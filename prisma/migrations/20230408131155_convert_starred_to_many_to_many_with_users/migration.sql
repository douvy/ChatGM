-- CreateTable
CREATE TABLE "_MessageFans" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_MessageFans_AB_unique" ON "_MessageFans"("A", "B");

-- CreateIndex
CREATE INDEX "_MessageFans_B_index" ON "_MessageFans"("B");

-- AddForeignKey
ALTER TABLE "_MessageFans" ADD CONSTRAINT "_MessageFans_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageFans" ADD CONSTRAINT "_MessageFans_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
