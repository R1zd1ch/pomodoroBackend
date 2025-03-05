-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('SOLO', 'GROUP');

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "roundTimeLeft" INTEGER,
ADD COLUMN     "type" "SessionType" NOT NULL DEFAULT 'GROUP';
