/*
  Warnings:

  - Added the required column `destPortId` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `srcPortId` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Booking_tripId_key";

-- DropIndex
DROP INDEX "BookingPassenger_bookingId_key";

-- DropIndex
DROP INDEX "BookingPassenger_passengerId_key";

-- DropIndex
DROP INDEX "BookingPassenger_seatId_key";

-- DropIndex
DROP INDEX "Trip_shipId_key";

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "destPortId" INTEGER NOT NULL,
ADD COLUMN     "srcPortId" INTEGER NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Port" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Port_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_srcPortId_fkey" FOREIGN KEY ("srcPortId") REFERENCES "Port"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_destPortId_fkey" FOREIGN KEY ("destPortId") REFERENCES "Port"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
