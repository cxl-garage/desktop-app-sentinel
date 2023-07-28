/**
 * Functions to interact with docker.
 */
import * as DockerVersion from 'models/DockerVersion';
import Docker, { ContainerInfo } from 'dockerode';
import * as DockerImage from 'models/DockerImage';
import { TensorflowModel } from './tensorflow';

// TODO: Maybe this all should be encapsulated in a class
const docker = new Docker();
const CONTAINER_NAME = 'sentinel';
const REPO_TAG = 'tensorflow/serving:latest';

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
export async function findImage(): Promise<DockerImage.T | undefined> {
  // eslint-disable-next-line promise/catch-or-return
  const imageInfo = (await docker.listImages()).find((image) =>
    image.RepoTags?.some((tag) => tag === REPO_TAG),
  );
  console.log(JSON.stringify(imageInfo, null, 2));
  return imageInfo
    ? {
        id: imageInfo?.Id,
        name: REPO_TAG,
        created: imageInfo?.Created,
      }
    : undefined;
}

export async function pullImage(): Promise<void> {
  console.log('Pulling image from docker...');
  await docker.pull(REPO_TAG);
  console.log('Done Pulling image from docker...');
}

/**
 * Gets all of the containers.
 * @returns an array of container infos
 */
export async function getContainers(): Promise<ContainerInfo[]> {
  return docker.listContainers();
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

export async function start(tensorflow: TensorflowModel): Promise<void> {
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
      Binds: [`${tensorflow.savedModelPath}:/models/${tensorflow.modelName}`],
      PortBindings: {
        '8501/tcp': [{ HostPort: '8501' }],
      },
    },
    Env: [`MODEL_NAME=${tensorflow.modelName}`],
    Volumes: { [`/models/${tensorflow.modelName}`]: {} },
  };

  console.log('starting docker...');
  docker.run(imageInfo.id, [], process.stdout, createOptions);
  console.log('container started...');
}
