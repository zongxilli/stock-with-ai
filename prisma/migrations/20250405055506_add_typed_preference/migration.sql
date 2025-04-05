/*
  Warnings:

  - You are about to drop the column `language` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `technicalIndicators` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `User` table. All the data in the column will be lost.
  - Added the required column `preference` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "language",
DROP COLUMN "technicalIndicators",
DROP COLUMN "theme",
ADD COLUMN     "preference" JSONB NOT NULL;

-- DropEnum
DROP TYPE "Language";

-- DropEnum
DROP TYPE "Theme";
