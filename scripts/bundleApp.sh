#!/bin/bash
SCRIPT_DIR=$(dirname "$0")
PROJECT_DIR=$SCRIPT_DIR/..

# Ensure that the necessary binaries are included in the release bundle
TARGET_PRISMA_BINARY_DIR=$PROJECT_DIR/node_modules/@prisma/engines

# Copying MacOS prisma engine binaries to node_modules, so it can be packaged
cp $PROJECT_DIR/bin/darwin-libquery_engine* $TARGET_PRISMA_BINARY_DIR/libquery_engine-darwin.dylib.node
cp $PROJECT_DIR/bin/darwin-schema-engine* $TARGET_PRISMA_BINARY_DIR/schema-engine-darwin

# Copying MacOS Arm64 prisma engine binaries to node_modules, so it can be packaged
cp $PROJECT_DIR/bin/darwin-arm64-libquery_engine* $TARGET_PRISMA_BINARY_DIR/libquery_engine-darwin-arm64.dylib.node
cp $PROJECT_DIR/bin/darwin-arm64-schema-engine* $TARGET_PRISMA_BINARY_DIR/schema-engine-darwin-arm64

# Copying Windows prisma engine binaries to node_modules, so it can be packaged
cp $PROJECT_DIR/bin/windows-query_engine* $TARGET_PRISMA_BINARY_DIR/query_engine-windows.dll.node
cp $PROJECT_DIR/bin/windows-schema-engine* $TARGET_PRISMA_BINARY_DIR/schema-engine-windows.exe

# Now build the app
rm -rf $PROJECT_DIR/release/build
$PROJECT_DIR/node_modules/.bin/ts-node $PROJECT_DIR/.erb/scripts/clean.js dist
npm run build

# Check if there is exactly one argument and it is "publish"
if [ "$#" -eq 1 ] && [ "$1" == "publish" ]; then
    # If the argument is "publish", use "--publish always"
    PUBLISH_FLAG="always"
else
    PUBLISH_FLAG="never"
fi

$PROJECT_DIR/node_modules/.bin/electron-builder build --publish $PUBLISH_FLAG --mac --win

echo "Finished bundling Sentinel Desktop!"
