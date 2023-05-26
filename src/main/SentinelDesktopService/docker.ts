/**
 * Functions to interact with docker.
 */
import * as DockerVersion from 'models/DockerVersion';
import Docker, { ImageInfo, ContainerInfo } from 'dockerode';

// TODO: Maybe this all should be encapsulated in a class
const docker = new Docker();
const CONTAINER_NAME = 'sentinel';

/**
 * Gets basic version information about the docker engine, including
 * whether it is running or not.
 * @returns the docker engine version or an error
 */
export async function getVersion(): Promise<DockerVersion.T> {
  try {
    const version = await docker.version();
    return {
      name: version.Platform.Name,
      version: version.Version,
      arch: version.Arch,
      kernel: version.KernelVersion,
      os: version.Os,
    };
  } catch (error: any) {
    return { error: error.toString() };
  }
}

/**
 * Checks whether the needed image is installed in docker locally.
 * @returns the docker image info if found
 */
export async function findImage(): Promise<ImageInfo | undefined> {
  // eslint-disable-next-line promise/catch-or-return
  return (await docker.listImages()).find((image) =>
    image.RepoTags?.some((tag) => tag.endsWith('dataclinic:latest')),
  );
}

/**
 * Gets all of the installed docker images.
 * @returns an array of image infos
 */
export async function getImages(): Promise<ImageInfo[]> {
  return docker.listImages();
}

/**
 * Gets all of the containers.
 * @returns an array of container infos
 */
export async function getContainers(): Promise<ContainerInfo[]> {
  return docker.listContainers();
}

async function getImageEnv(): Promise<string[]> {
  // TODO: Assumes there is only a single suitable docker image
  // installed. What if more than one?
  try {
    const imageInfo = await findImage();
    if (!imageInfo) {
      console.log('Failed to find suitable docker image.');
      return [];
    }
    const dockerImage = docker.getImage(imageInfo.Id);
    return (await dockerImage.inspect()).Config.Env;
  } catch (error) {
    console.log('Failed to find available models', error);
    return [];
  }
}

export async function getModelNames(): Promise<string[]> {
  const models = (await getImageEnv()).find((value) =>
    value.startsWith('AVAILABLE_MODELS'),
  );
  if (models) {
    const tokens = models.split('=');
    console.log(`Available models: ${tokens[1]}`);
    if (tokens.length > 1) {
      return tokens[1].split(',');
    }
  }
  return [];
}

export async function getClassNames(modelName: string): Promise<string[]> {
  const classNames = (await getImageEnv()).find((value) =>
    value.startsWith(`${modelName.toUpperCase()}_CLASSES`),
  );
  if (classNames) {
    const tokens = classNames.split('=');
    if (tokens.length > 1) {
      console.log(`For ${modelName}, class names: ${tokens[1]}`);
      return tokens[1].split(',');
    }
  }
  return [];
}

/**
 * Stops any running containers and clean up old containers too.
 */
export async function cleanup(): Promise<void> {
  // Find the container and kill it and prune any stopped
  // containers too
  console.log('Stopping containers');
  const containers = await docker.listContainers();
  console.log(JSON.stringify(containers, null, 2));
  const sentinel = containers.find((c) =>
    c.Names.some((n) => n === `/${CONTAINER_NAME}`),
  );
  console.log(`Container: ${JSON.stringify(sentinel, null, 2)}`);
  if (sentinel) {
    await docker.getContainer(sentinel.Id).stop();
  }

  console.log('pruning containers');
  await docker.pruneContainers();
  console.log('done pruning containers');
}

export async function start(modelName: string): Promise<void> {
  // Find the right image
  const imageInfo = await findImage();
  if (imageInfo === undefined) {
    return;
  }

  console.log(`got image: ${JSON.stringify(imageInfo, null, 2)}`);

  // Start the container
  const createOptions = {
    name: CONTAINER_NAME,
    Tty: false,
    HostConfig: {
      PortBindings: {
        '8501/tcp': [{ HostPort: '8501' }],
      },
    },
    Env: [`MODEL_NAME=${modelName}`],
  };

  console.log('starting docker...');
  docker.run(imageInfo.Id, [], process.stdout, createOptions);
  console.log('container started...');
}
