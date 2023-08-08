/**
 * This model type represents information about docker images that
 * are compatible with Sentinel that are installed locally
 */
type DockerImage = {
  id: string;
  name: string;
  created: number;
};

export { DockerImage as T };
