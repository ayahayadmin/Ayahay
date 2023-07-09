-- CreateTable
CREATE TABLE "temp_booking" (
    "id" SERIAL NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "payment_reference" TEXT,
    "passengers_json" JSONB NOT NULL,
    "vehicles_json" JSONB NOT NULL,

    CONSTRAINT "temp_booking_pkey" PRIMARY KEY ("id")
);
