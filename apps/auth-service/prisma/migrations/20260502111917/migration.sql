/*
  Warnings:

  - You are about to drop the `user_info` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_info" DROP CONSTRAINT "user_info_userId_fkey";

-- DropTable
DROP TABLE "user_info";
