/*
  Warnings:

  - A unique constraint covering the columns `[messageId]` on the table `PinnedMessage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PinnedMessage_messageId_key" ON "PinnedMessage"("messageId");
