-- CreateTable
CREATE TABLE "Score" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scoredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Gif" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ScoredGif" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scoreId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "gifId" INTEGER NOT NULL,
    CONSTRAINT "ScoredGif_scoreId_fkey" FOREIGN KEY ("scoreId") REFERENCES "Score" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ScoredGif_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ScoredGif_gifId_fkey" FOREIGN KEY ("gifId") REFERENCES "Gif" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Gif_url_key" ON "Gif"("url");

-- CreateIndex
CREATE UNIQUE INDEX "ScoredGif_scoreId_userId_gifId_key" ON "ScoredGif"("scoreId", "userId", "gifId");
