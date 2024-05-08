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
export async function findImage(): Promise<DockerImage.T | null> {
  // eslint-disable-next-line promise/catch-or-return
  const imageInfo = (await docker.listImages()).find((image) =>
    image.RepoTags?.some((tag) => tag === REPO_TAG),
  );
  return imageInfo
    ? {
        id: imageInfo?.Id,
        name: REPO_TAG,
        created: imageInfo?.Created,
      }
    : null;
}

export async function pullImage(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    docker.pull(REPO_TAG, {}, (err: Error, stream: NodeJS.ReadableStream) => {
      if (err) {
        reject(err);
        return;
      }
      stream.resume(); // Switch to "flowing mode" to avoid hanging

      stream.on('end', () => {
        console.log('Tensorflow image pulled successfully.');
        resolve();
      });
    });
  });
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
  const sentinel = containers.find((c) =>
    c.Names.some((n) => n === `/${CONTAINER_NAME}`),
  );
  if (sentinel) {
    const containerInfo = await docker.getContainer(sentinel.Id).inspect();
    if (containerInfo.State.Status === 'running') {
      await docker.getContainer(sentinel.Id).stop();
    }
  }

  console.log('pruning containers');
  await docker.pruneContainers();
  console.log('done pruning containers');
}

export async function start(tensorflow: TensorflowModel): Promise<void> {
  // Find the right image
  const imageInfo = await findImage();
  if (imageInfo === undefined || imageInfo === null) {
    return;
  }

  console.log(`Found image: ${JSON.stringify(imageInfo, null, 2)}`);

  // Start the container
  const createOptions = {
    name: CONTAINER_NAME,
    Tty: false,
    HostConfig: {
      // allow up to 32 GB of memory to be used. This will get limited by
      // whatever the user has set in their global docker memory limit setting.
      // Memory: 32 * 1024 * 1024 * 1024,
      Binds: [`${tensorflow.savedModelPath}:/models/${tensorflow.modelName}`],
      PortBindings: {
        '8501/tcp': [{ HostPort: '8501' }],
      },
    },
    Env: [`MODEL_NAME=${tensorflow.modelName}`],
    Volumes: { [`/models/${tensorflow.modelName}`]: {} },
  };

  console.log('Starting docker...');
  if (imageInfo.id) {
    docker.run(imageInfo.id, [], process.stdout, createOptions);
  }
  console.log('Container started');
}
