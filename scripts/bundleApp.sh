#!/bin/bash
SCRIPT_DIR=$(dirname "$0")
PROJECT_DIR=$SCRIPT_DIR/..

# Ensure that the necessary binaries are included in the release bundle
TRGET_PRISMA_BINARY_DIR=$PROJECT_DIR/node_modules/@prisma/engines

# Copying MacOS prisma engine binaries to node_modules, so it can be packaged
cp $PROJECT_DIR/bin/darwin-libquery_engine* $TARGET_PRISMA_BINARY_DIR/libquery_engine-darwin.dylib.node
cp $PROJECT_DIR/bin/darwin-schema-engine* $TARGET_PRISMA_BINARY_DIR/schema-engine-darwin

# Copying Windows prisma engine binaries to node_modules, so it can be packaged
cp $PROJECT_DIR/bin/query_engine* $TARGET_PRISMA_BINARY_DIR/query_engine-windows.dll.node
cp $PROJECT_DIR/bin/windows-schema-engine* $TARGET_PRISMA_BINARY_DIR/schema-engine-windows.exe

# Now build the app
rm -rf $PROJECT_DIR/release/build
$PROJECT_DIR/node_modules/.bin/ts-node $PROJECT_DIR/.erb/scripts/clean.js dist
npm run build
$PROJECT_DIR/node_modules/.bin/electron-builder build --publish never --mac --win

echo "Finished bundling Sentinel Desktop!"
