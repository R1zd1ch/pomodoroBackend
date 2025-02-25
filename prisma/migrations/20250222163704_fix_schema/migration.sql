/*
  Warnings:

  - The `color` column on the `Category` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currentStatus` column on the `SessionMember` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CategoryColor" AS ENUM ('RED', 'BLUE', 'GREEN', 'YELLOW', 'ORANGE', 'PURPLE');

-- CreateEnum
CREATE TYPE "SessionMemberStatus" AS ENUM ('READY', 'WORKING', 'ON_BREAK', 'LEFT');

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "color",
ADD COLUMN     "color" "CategoryColor";

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "editedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SessionMember" DROP COLUMN "currentStatus",
ADD COLUMN     "currentStatus" "SessionMemberStatus" NOT NULL DEFAULT 'READY';
