-- CreateEnum
CREATE TYPE "LostFoundType" AS ENUM ('LOST', 'FOUND');

-- CreateEnum
CREATE TYPE "LostFoundStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('PHONE', 'WALLET', 'BOOKS', 'LAPTOP', 'ACCESSORIES', 'DOCUMENTS', 'CLOTHING', 'KEYS', 'OTHER');

-- CreateTable
CREATE TABLE "LostAndFound" (
    "id" SERIAL NOT NULL,
    "type" "LostFoundType" NOT NULL,
    "itemName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ItemCategory" NOT NULL,
    "location" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "studentRollNo" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "classInfo" TEXT NOT NULL,
    "status" "LostFoundStatus" NOT NULL DEFAULT 'ACTIVE',
    "imageUrl" TEXT,
    "collegeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LostAndFound_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LostAndFound" ADD CONSTRAINT "LostAndFound_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
