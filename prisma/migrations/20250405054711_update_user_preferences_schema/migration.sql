/*
  Warnings:

  - You are about to drop the column `preference` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('light', 'dark');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'CN');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "preference",
ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'EN',
ADD COLUMN     "technicalIndicators" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "theme" "Theme" NOT NULL DEFAULT 'light';
