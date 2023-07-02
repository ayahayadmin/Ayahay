/*
  Warnings:

  - You are about to drop the column `checkInDate` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Trip` table. All the data in the column will be lost.
  - Added the required column `referenceNo` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referenceNo` to the `BookingPassenger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referenceNo` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "checkInDate",
ADD COLUMN     "referenceNo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "BookingPassenger" ADD COLUMN     "checkInDate" TIMESTAMP(3),
ADD COLUMN     "referenceNo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "type",
ADD COLUMN     "referenceNo" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "BookingVehicle" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BookingVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PassengerVehicle" (
    "id" SERIAL NOT NULL,
    "passengerId" INTEGER NOT NULL,
    "plateNo" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "modelYear" INTEGER NOT NULL,
    "modelBody" TEXT NOT NULL,
    "officialReceiptUrl" TEXT NOT NULL,
    "certificateOfRegistrationUrl" TEXT NOT NULL,

    CONSTRAINT "PassengerVehicle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BookingVehicle" ADD CONSTRAINT "BookingVehicle_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingVehicle" ADD CONSTRAINT "BookingVehicle_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "PassengerVehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassengerVehicle" ADD CONSTRAINT "PassengerVehicle_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "Passenger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
