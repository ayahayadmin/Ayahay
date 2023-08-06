-- CreateTable
CREATE TABLE "trip" (
    "id" SERIAL NOT NULL,
    "ship_id" INTEGER,
    "shipping_line_id" INTEGER NOT NULL,
    "src_port_id" INTEGER NOT NULL,
    "dest_port_id" INTEGER NOT NULL,
    "departure_date" TIMESTAMP(3) NOT NULL,
    "base_fare" DOUBLE PRECISION NOT NULL,
    "reference_number" TEXT NOT NULL,

    CONSTRAINT "trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ship" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "passenger_capacity" INTEGER NOT NULL,
    "vehicle_capacity" INTEGER NOT NULL,

    CONSTRAINT "ship_pkey" PRIMARY KEY ("id")
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
    "total_price" DOUBLE PRECISION NOT NULL,
    "payment_reference" TEXT,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_passenger" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "trip_id" INTEGER NOT NULL,
    "passenger_id" INTEGER NOT NULL,
    "seat_id" INTEGER,
    "meal" TEXT NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "reference_no" TEXT NOT NULL,
    "check_in_date" TIMESTAMP(3),

    CONSTRAINT "booking_passenger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passenger" (
    "id" SERIAL NOT NULL,
    "buddy_id" INTEGER,
    "account_id" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "civil_status" TEXT NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,

    CONSTRAINT "passenger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_vehicle" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "trip_id" INTEGER NOT NULL,
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

-- CreateTable
CREATE TABLE "temp_booking" (
    "id" SERIAL NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "payment_reference" TEXT,
    "passengers_json" JSONB NOT NULL,
    "vehicles_json" JSONB NOT NULL,

    CONSTRAINT "temp_booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passenger_id" INTEGER,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_passenger_id_key" ON "account"("passenger_id");

-- AddForeignKey
ALTER TABLE "trip" ADD CONSTRAINT "trip_ship_id_fkey" FOREIGN KEY ("ship_id") REFERENCES "ship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip" ADD CONSTRAINT "trip_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "shipping_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip" ADD CONSTRAINT "trip_src_port_id_fkey" FOREIGN KEY ("src_port_id") REFERENCES "port"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip" ADD CONSTRAINT "trip_dest_port_id_fkey" FOREIGN KEY ("dest_port_id") REFERENCES "port"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabin" ADD CONSTRAINT "cabin_ship_id_fkey" FOREIGN KEY ("ship_id") REFERENCES "ship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat" ADD CONSTRAINT "seat_cabin_id_fkey" FOREIGN KEY ("cabin_id") REFERENCES "cabin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_passenger" ADD CONSTRAINT "booking_passenger_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_passenger" ADD CONSTRAINT "booking_passenger_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_passenger" ADD CONSTRAINT "booking_passenger_passenger_id_fkey" FOREIGN KEY ("passenger_id") REFERENCES "passenger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_passenger" ADD CONSTRAINT "booking_passenger_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger" ADD CONSTRAINT "passenger_buddy_id_fkey" FOREIGN KEY ("buddy_id") REFERENCES "passenger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_vehicle" ADD CONSTRAINT "booking_vehicle_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_vehicle" ADD CONSTRAINT "booking_vehicle_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_vehicle" ADD CONSTRAINT "booking_vehicle_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "passenger_vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger_vehicle" ADD CONSTRAINT "passenger_vehicle_passenger_id_fkey" FOREIGN KEY ("passenger_id") REFERENCES "passenger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_passenger_id_fkey" FOREIGN KEY ("passenger_id") REFERENCES "passenger"("id") ON DELETE SET NULL ON UPDATE CASCADE;
