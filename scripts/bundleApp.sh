#!/bin/bash
SCRIPT_DIR=$(dirname "$0")
PROJECT_DIR=$SCRIPT_DIR/..
PRISMA_DEV_DB=$PROJECT_DIR/prisma/dev.db

# Ensure that the necessary binaries are included in the release bundle
TARGET_PRISMA_BINARY_DIR=$PROJECT_DIR/node_modules/@prisma/engines
TARGET_PRISMA_BINARY_DIR_2=$PROJECT_DIR/release/app/node_modules/@prisma/engines # TODO: do we still need this one?
# TODO: we only need the binaries in resourcesPath. we dont need it in app.asar.unpacked.

# Copying MacOS prisma engine binaries to node_modules, so it can be packaged
cp $PROJECT_DIR/bin/darwin-query-engine* $TARGET_PRISMA_BINARY_DIR/query-engine-darwin
cp $PROJECT_DIR/bin/darwin-schema-engine* $TARGET_PRISMA_BINARY_DIR/schema-engine-darwin

cp $PROJECT_DIR/bin/darwin-query-engine* $TARGET_PRISMA_BINARY_DIR_2/query-engine-darwin
cp $PROJECT_DIR/bin/darwin-schema-engine* $TARGET_PRISMA_BINARY_DIR_2/schema-engine-darwin

# Copying Windows prisma engine binaries to node_modules, so it can be packaged
cp $PROJECT_DIR/bin/windows-query-engine* $TARGET_PRISMA_BINARY_DIR/query-engine-windows.exe
cp $PROJECT_DIR/bin/windows-schema-engine* $TARGET_PRISMA_BINARY_DIR/schema-engine-windows.exe

cp $PROJECT_DIR/bin/windows-query-engine* $TARGET_PRISMA_BINARY_DIR_2/query-engine-windows.exe
cp $PROJECT_DIR/bin/windows-schema-engine* $TARGET_PRISMA_BINARY_DIR_2/schema-engine-windows.exe

# TODO: probably not necessary anymore
# Now prepare the prisma directory for bundling

# Make a backup of our db if one currently exists
if [ -e $PRISMA_DEV_DB ]; then
  mv $PRISMA_DEV_DB $PROJECT_DIR/dev.db.bak
fi

# Create a new empty db to use for the release
yarn prisma migrate dev --name init

# Now build the app
rm -rf $PROJECT_DIR/release/build
$PROJECT_DIR/node_modules/.bin/ts-node $PROJECT_DIR/.erb/scripts/clean.js dist
npm run build
$PROJECT_DIR/node_modules/.bin/electron-builder build --publish never --mac --win

# Restore the old db we had backed up
if [ -e $PROJECT_DIR/dev.db.bak ]; then
  mv $PROJECT_DIR/dev.db.bak $PRISMA_DEV_DB
fi

echo "Finished bundling Sentinel Desktop!"
