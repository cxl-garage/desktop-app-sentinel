#!/bin/bash
# This script generates a new db migration script in the
# `prisma/migrations/` directory
if [ $# -eq 0 ];
then
  echo 'Requires a single argument as the migration title'
else
  if [ $# -gt 1 ];
  then
    echo 'Can only take one string argument.'
  else
    yarn prisma migrate dev --create-only --name "$1"
    echo 'Success!'
    echo 'Now go to `prisma/migrations/` directory and verify the migration SQL is correct. Edit it if necessary.'
    echo 'Then run `yarn db-upgrade` to upgrade your database.'
  fi
fi
