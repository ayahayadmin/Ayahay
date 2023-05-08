/*
  Warnings:

  - Added the required column `baseFare` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departureDate` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingLineId` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "baseFare" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "departureDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "shippingLineId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ShippingLine" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ShippingLine_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_shippingLineId_fkey" FOREIGN KEY ("shippingLineId") REFERENCES "ShippingLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
