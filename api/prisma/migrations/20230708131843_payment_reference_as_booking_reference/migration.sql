/*
  Warnings:

  - You are about to drop the column `reference_number` on the `booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "booking" DROP COLUMN "reference_number",
ALTER COLUMN "payment_reference" DROP NOT NULL;
