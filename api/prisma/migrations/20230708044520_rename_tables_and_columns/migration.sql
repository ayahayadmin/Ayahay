/*
  Warnings:

  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BookingPassenger` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BookingVehicle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Cabin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Passenger` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PassengerVehicle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Port` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Seat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ship` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShippingLine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Trip` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_tripId_fkey";

-- DropForeignKey
ALTER TABLE "BookingPassenger" DROP CONSTRAINT "BookingPassenger_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "BookingPassenger" DROP CONSTRAINT "BookingPassenger_passengerId_fkey";

-- DropForeignKey
ALTER TABLE "BookingPassenger" DROP CONSTRAINT "BookingPassenger_seatId_fkey";

-- DropForeignKey
ALTER TABLE "BookingVehicle" DROP CONSTRAINT "BookingVehicle_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "BookingVehicle" DROP CONSTRAINT "BookingVehicle_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "Cabin" DROP CONSTRAINT "Cabin_shipId_fkey";

-- DropForeignKey
ALTER TABLE "Passenger" DROP CONSTRAINT "Passenger_buddyId_fkey";

-- DropForeignKey
ALTER TABLE "PassengerVehicle" DROP CONSTRAINT "PassengerVehicle_passengerId_fkey";

-- DropForeignKey
ALTER TABLE "Seat" DROP CONSTRAINT "Seat_cabinId_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_destPortId_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_shipId_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_shippingLineId_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_srcPortId_fkey";

-- DropTable
DROP TABLE "Booking";

-- DropTable
DROP TABLE "BookingPassenger";

-- DropTable
DROP TABLE "BookingVehicle";

-- DropTable
DROP TABLE "Cabin";

-- DropTable
DROP TABLE "Passenger";

-- DropTable
DROP TABLE "PassengerVehicle";

-- DropTable
DROP TABLE "Port";

-- DropTable
DROP TABLE "Seat";

-- DropTable
DROP TABLE "Ship";

-- DropTable
DROP TABLE "ShippingLine";

-- DropTable
DROP TABLE "Trip";

-- CreateTable
CREATE TABLE "seat" (
    "id" SERIAL NOT NULL,
    "cabin_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "column" INTEGER NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "seat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cabin" (
    "id" SERIAL NOT NULL,
    "ship_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number_of_rows" INTEGER NOT NULL,
    "number_of_columns" INTEGER NOT NULL,

    CONSTRAINT "cabin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ship" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "vehicle_capacity" INTEGER NOT NULL,

    CONSTRAINT "ship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip" (
    "id" SERIAL NOT NULL,
    "ship_id" INTEGER NOT NULL,
    "shipping_line_id" INTEGER NOT NULL,
    "src_port_id" INTEGER NOT NULL,
    "dest_port_id" INTEGER NOT NULL,
    "departure_date" TIMESTAMP(3) NOT NULL,
    "base_fare" DOUBLE PRECISION NOT NULL,
    "reference_number" TEXT NOT NULL,

    CONSTRAINT "trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_line" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "shipping_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "port" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "port_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking" (
    "id" SERIAL NOT NULL,
    "trip_id" INTEGER NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "payment_reference" TEXT NOT NULL,
    "reference_number" TEXT NOT NULL,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passenger" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "civil_status" TEXT NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "buddy_id" INTEGER,

    CONSTRAINT "passenger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_passenger" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "passenger_id" INTEGER NOT NULL,
    "seat_id" INTEGER NOT NULL,
    "meal" TEXT NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "reference_no" TEXT NOT NULL,
    "check_in_date" TIMESTAMP(3),

    CONSTRAINT "booking_passenger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_vehicle" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "booking_vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passenger_vehicle" (
    "id" SERIAL NOT NULL,
    "passenger_id" INTEGER NOT NULL,
    "plate_number" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "model_year" INTEGER NOT NULL,
    "model_body" TEXT NOT NULL,
    "official_receipt_url" TEXT NOT NULL,
    "certificate_of_registration_url" TEXT NOT NULL,

    CONSTRAINT "passenger_vehicle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "seat" ADD CONSTRAINT "seat_cabin_id_fkey" FOREIGN KEY ("cabin_id") REFERENCES "cabin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabin" ADD CONSTRAINT "cabin_ship_id_fkey" FOREIGN KEY ("ship_id") REFERENCES "ship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip" ADD CONSTRAINT "trip_ship_id_fkey" FOREIGN KEY ("ship_id") REFERENCES "ship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip" ADD CONSTRAINT "trip_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "shipping_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip" ADD CONSTRAINT "trip_src_port_id_fkey" FOREIGN KEY ("src_port_id") REFERENCES "port"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip" ADD CONSTRAINT "trip_dest_port_id_fkey" FOREIGN KEY ("dest_port_id") REFERENCES "port"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger" ADD CONSTRAINT "passenger_buddy_id_fkey" FOREIGN KEY ("buddy_id") REFERENCES "passenger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_passenger" ADD CONSTRAINT "booking_passenger_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_passenger" ADD CONSTRAINT "booking_passenger_passenger_id_fkey" FOREIGN KEY ("passenger_id") REFERENCES "passenger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_passenger" ADD CONSTRAINT "booking_passenger_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_vehicle" ADD CONSTRAINT "booking_vehicle_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_vehicle" ADD CONSTRAINT "booking_vehicle_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "passenger_vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger_vehicle" ADD CONSTRAINT "passenger_vehicle_passenger_id_fkey" FOREIGN KEY ("passenger_id") REFERENCES "passenger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
