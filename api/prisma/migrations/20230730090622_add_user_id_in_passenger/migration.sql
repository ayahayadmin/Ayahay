/*
  Warnings:

  - Added the required column `userId` to the `passenger` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "passenger" ADD COLUMN     "userId" TEXT NOT NULL;
