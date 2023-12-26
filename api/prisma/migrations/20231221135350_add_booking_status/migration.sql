/*
  Warnings:

  - You are about to drop the column `status` on the `booking` table. All the data in the column will be lost.
  - Added the required column `booking_status` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_status` to the `booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "booking"
    RENAME COLUMN "status" TO "payment_status";

ALTER TABLE "booking"
    ADD COLUMN "booking_status" TEXT NOT NULL,
    ADD COLUMN "failure_cancellation_remarks" TEXT
;
