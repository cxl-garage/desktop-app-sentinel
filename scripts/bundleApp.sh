#!/bin/bash
SCRIPT_DIR=$(dirname "$0")
PROJECT_DIR=$SCRIPT_DIR/..
PRISMA_DEV_DB=$PROJECT_DIR/prisma/dev.db

# Prepare the prisma directory for bundling

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
$PROJECT_DIR/node_modules/.bin/electron-builder build --publish never

# Restore the old db we had backed up
if [ -e $PROJECT_DIR/dev.db.bak ]; then
  mv $PROJECT_DIR/dev.db.bak $PRISMA_DEV_DB
fi

echo "Finished bundling Sentinel Desktop!"
