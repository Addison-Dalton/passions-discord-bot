/*
  Warnings:

  - You are about to drop the column `title` on the `Gif` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Gif` table. All the data in the column will be lost.
  - Added the required column `name` to the `Gif` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Gif" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Gif" ("id") SELECT "id" FROM "Gif";
DROP TABLE "Gif";
ALTER TABLE "new_Gif" RENAME TO "Gif";
CREATE UNIQUE INDEX "Gif_name_key" ON "Gif"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
