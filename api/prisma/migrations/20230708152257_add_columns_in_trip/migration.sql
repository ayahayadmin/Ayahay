-- AlterTable
ALTER TABLE "trip" ADD COLUMN     "available_cabins" TEXT[],
ADD COLUMN     "available_seat_types" TEXT[],
ADD COLUMN     "meals" TEXT[];
