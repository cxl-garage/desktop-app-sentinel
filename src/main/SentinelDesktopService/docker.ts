/**
 * Functions to interact with docker.
 */
import { DockerVersion } from 'models/DockerVersion';
import Docker, { ImageInfo, ContainerInfo } from 'dockerode';

// TODO: Maybe this all should be encapsulated in a class
const docker = new Docker();
const CONTAINER_NAME = 'sentinel';

/**
 * Gets basic version information about the docker engine, including
 * whether it is running or not.
 * @returns the docker engine version or an error
 */
export async function getVersion(): Promise<DockerVersion> {
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

export function getModelNames(): string[] {
  // TODO: Hard-code for now, and currently implemented as calling `env`
  // on a running container, but eventually should be information
  // in the image metadata (see LABEL in Dockerfile) so that we
  // can query without having to start a container
  return ['osa_jaguar', 'MegaDetector_v5a'];
}

export function getClassNames(modelName: string): string[] {
  // TODO: Hard-code for now, and currently implemented as calling `env`
  // on a running container, but eventually should be information
  // in the image metadata (see LABEL in Dockerfile) so that we
  // can query without having to start a container
  if (modelName === 'osa_jaguar') {
    return ['jaguar', 'other_animal'];
  }
  if (modelName === 'MegaDetector_v5a') {
    return ['animal', 'person', 'vehicle'];
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
