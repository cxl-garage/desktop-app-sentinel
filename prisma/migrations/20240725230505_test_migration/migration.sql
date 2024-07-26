-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ModelRun" (
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
    "status" TEXT NOT NULL DEFAULT '',
    "throwawayCol" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_ModelRun" ("confidenceThreshold", "detectedObjectCount", "emptyImageCount", "errorCount", "id", "imageCount", "inputPath", "modelName", "modelPath", "outputPath", "outputStyle", "startTime", "status") SELECT "confidenceThreshold", "detectedObjectCount", "emptyImageCount", "errorCount", "id", "imageCount", "inputPath", "modelName", "modelPath", "outputPath", "outputStyle", "startTime", "status" FROM "ModelRun";
DROP TABLE "ModelRun";
ALTER TABLE "new_ModelRun" RENAME TO "ModelRun";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
