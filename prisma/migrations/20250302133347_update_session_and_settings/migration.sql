/*
  Warnings:

  - You are about to drop the column `breakDuration` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "breakDuration",
ADD COLUMN     "longBreakDuration" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "roundsBeforeLongBreak" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "shortBreakDuration" INTEGER NOT NULL DEFAULT 5;

-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN     "roundsPlanned" INTEGER NOT NULL DEFAULT 4;
