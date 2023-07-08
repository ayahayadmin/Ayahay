/*
  Warnings:

  - You are about to drop the column `trip_id` on the `booking` table. All the data in the column will be lost.
  - Added the required column `trip_id` to the `booking_passenger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trip_id` to the `booking_vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_trip_id_fkey";

-- AlterTable
ALTER TABLE "booking" DROP COLUMN "trip_id";

-- AlterTable
ALTER TABLE "booking_passenger" ADD COLUMN     "trip_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "booking_vehicle" ADD COLUMN     "trip_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "booking_passenger" ADD CONSTRAINT "booking_passenger_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_vehicle" ADD CONSTRAINT "booking_vehicle_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
