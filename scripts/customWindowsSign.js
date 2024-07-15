/* eslint-disable */
'use strict';
require('dotenv').config();
const { execSync } = require('child_process');
/* eslint-enable */

exports.default = async function (configuration) {
  if (!process.env.SM_API_KEY) {
    // eslint-disable-next-line no-console
    console.warn(
      'Skipping signing for Windows because SM_API_KEY is not configured.',
    );
  }

  if (!process.env.SM_KEYPAIR_NAME) {
    // eslint-disable-next-line no-console
    console.warn(
      'Skipping signing for Windows because SM_KEYPAIR_NAME is not configured.',
    );
  }

  if (!configuration.path) {
    // eslint-disable-next-line no-console
    console.warn(
      'Skipping signing for Windows because path of application is not found.',
    );
  }

  const appPath = String(configuration.path);
  const digicertKeyPairName = String(process.env.SM_KEYPAIR_NAME);
  const pkcs11PropertiesFile = String(process.env.SM_PKCS11_PROPERTIES_FILE);

  execSync(
    `smctl sign --input "${appPath}" --keypair-alias ${digicertKeyPairName} --config-file ${pkcs11PropertiesFile} -vvv`,
    {
      stdio: 'inherit',
    },
  );
};
