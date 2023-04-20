-- CreateTable
CREATE TABLE "Feature" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "starred" BOOLEAN NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);
