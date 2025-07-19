/*
  Warnings:

  - Made the column `variantType` on table `ProductVariant` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ProductVariant" ALTER COLUMN "variantType" SET NOT NULL;
