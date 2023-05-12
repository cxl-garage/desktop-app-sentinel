/**
 * This model type represents information about a running docker engine
 * that could be useful for debugging any problems.
 */
type DockerSuccess = {
  name: string;
  version: string;
  os: string;
  arch: string;
  kernel: string;
};

type DockerError = {
  error: string;
};

type DockerVersion = DockerSuccess | DockerError;

function isDockerError(x: DockerVersion | undefined): x is DockerError {
  return x !== undefined ? 'error' in x : false;
}

function isDockerSuccess(x: DockerVersion | undefined): x is DockerSuccess {
  return x !== undefined ? 'name' in x : false;
}

export { DockerVersion, isDockerError, isDockerSuccess };
