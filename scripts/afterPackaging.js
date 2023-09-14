const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const BUILD_ROOT = path.resolve(PROJECT_ROOT, 'release/app');

/**
 * After packaging we should remove the .env file we moved into release/app.env
 */
exports.default = function afterPackaging(context) {
  const targetPlatform = context.packager.platform.name;

  console.log('Finished packaging for', targetPlatform);

  // remove release/app/.env
  const envFile = path.join(BUILD_ROOT, '.env');
  if (fs.existsSync(envFile)) {
    fs.unlinkSync(envFile);
  }
};
