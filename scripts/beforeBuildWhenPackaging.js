const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const BUILD_ROOT = path.resolve(PROJECT_ROOT, 'release/app');

const MAC_ENV_FILE = '.env.prod.mac';
const WINDOWS_ENV_FILE = '.env.prod.win';

/**
 * This function moves the appropriate env file to release/app
 */
exports.default = function beforeBuild(context) {
  const targetPlatform = context.platform.name;

  console.log('Beginning new build for', targetPlatform);

  // figure out what platform's env file to use
  let envFileToUse = '.env';
  if (targetPlatform === 'mac') {
    envFileToUse = MAC_ENV_FILE;
  } else if (targetPlatform === 'windows') {
    envFileToUse = WINDOWS_ENV_FILE;
  }

  // copy to release/app/.env
  fs.copyFileSync(
    path.join(PROJECT_ROOT, envFileToUse),
    path.join(BUILD_ROOT, '.env'),
  );
};
