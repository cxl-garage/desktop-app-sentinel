import { URL } from 'url';
import path from 'path';
import { app } from 'electron';
import { fork } from 'child_process';

export const IS_APP_PACKAGED = app.isPackaged;

export const DB_PATH = IS_APP_PACKAGED
  ? path.join(app.getPath('userData'), 'sentinel.db')
  : 'prisma/dev.db';

export const PACKAGED_APP_ROOT = path.resolve(
  __dirname,
  // go up 2 directories from app.asar/dist/main to app.asar root
  '..',
  '..',
);

export function resolveHtmlPath(htmlFileName: string): string {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export const platformToExecutables: Record<
  string,
  { schemaEngine: string; queryEngine: string }
> = {
  win32: {
    schemaEngine: 'node_modules/@prisma/engines/schema-engine-windows.exe',
    queryEngine: 'node_modules/@prisma/engines/query_engine-windows.dll.node',
  },
  darwin: {
    schemaEngine: 'node_modules/@prisma/engines/schema-engine-darwin',
    queryEngine:
      'node_modules/@prisma/engines/libquery_engine-darwin.dylib.node',
  },
  darwinArm64: {
    schemaEngine: 'node_modules/@prisma/engines/schema-engine-darwin-arm64',
    queryEngine:
      'node_modules/@prisma/engines/libquery_engine-darwin-arm64.dylib.node',
  },
};

export function getPlatformName(): string {
  const isDarwin = process.platform === 'darwin';
  if (isDarwin && process.arch === 'arm64') {
    return `${process.platform}Arm64`;
  }

  return process.platform;
}

// A lot of this code is pulled from here:
// https://github.com/awohletz/electron-prisma-trpc-example/blob/main/src/server/prisma.ts
export async function runPrismaCommand(options: {
  command: string[];
  dbURL: string;
}): Promise<number> {
  const { command, dbURL } = options;

  const platformName = getPlatformName();
  const schemaEnginePath = path.join(
    process.resourcesPath,
    platformToExecutables[platformName].schemaEngine,
  );
  const queryEnginePath = path.join(
    process.resourcesPath,
    platformToExecutables[platformName].queryEngine,
  );
  console.log('Schema engine path', schemaEnginePath);
  console.log('Query engine path', queryEnginePath);

  // There is no way to invoke prisma migrations programmatically,
  // so the best we have is to spawn a child process and call the
  // CLI directly.
  // More details in this GitHub issue: https://github.com/prisma/prisma/issues/4703
  try {
    const exitCode = await new Promise((resolve) => {
      const prismaPath = path.join(
        PACKAGED_APP_ROOT,
        // now inside app.asar, point to node_modules/prisma/build/index.js
        // to run the prisma CLI
        'node_modules/prisma/build/index.js',
      );
      console.log('Prisma path for command', prismaPath);

      const child = fork(prismaPath, command, {
        env: {
          ...process.env,
          DATABASE_URL: dbURL,
          PRISMA_CLI_QUERY_ENGINE_TYPE: 'library',
          PRISMA_SCHEMA_ENGINE_BINARY: schemaEnginePath,
          PRISMA_QUERY_ENGINE_LIBRARY: queryEnginePath,
          PRISMA_FMT_BINARY: queryEnginePath,
          PRISMA_INTROSPECTION_ENGINE_BINARY: queryEnginePath,
        },
        stdio: 'pipe',
      });

      child.on('message', (msg) => {
        console.log(msg);
      });
      child.on('error', (err) => {
        console.error('Child process got an error', err);
      });
      child.stdout?.on('data', (data) => {
        console.log('Prisma: ', data.toString());
      });
      child.stderr?.on('data', (data) => {
        console.log('Prisma Error: ', data.toString());
      });
      child.on('close', (code) => {
        resolve(code);
      });
    });

    if (exitCode !== 0) {
      const commandString = command.join(' ');
      throw new Error(
        `Prisma command '${commandString}' failed with exit code ${exitCode}`,
      );
    }
    return exitCode;
  } catch (e) {
    console.error(e);
    throw e;
  }
}
