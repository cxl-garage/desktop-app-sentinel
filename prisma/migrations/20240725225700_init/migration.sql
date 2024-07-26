-- CreateTable
CREATE TABLE "ModelRun" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modelPath" TEXT NOT NULL DEFAULT '',
    "modelName" TEXT NOT NULL,
    "outputPath" TEXT NOT NULL,
    "startTime" INTEGER NOT NULL,
    "inputPath" TEXT NOT NULL,
    "confidenceThreshold" REAL NOT NULL,
    "outputStyle" TEXT NOT NULL,
    "imageCount" INTEGER NOT NULL DEFAULT 0,
    "emptyImageCount" INTEGER NOT NULL DEFAULT 0,
    "detectedObjectCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT ''
);
