-- CreateTable
CREATE TABLE "BlockedSlot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "start" DATETIME NOT NULL,
    "end" DATETIME NOT NULL,
    "reason" TEXT
);
