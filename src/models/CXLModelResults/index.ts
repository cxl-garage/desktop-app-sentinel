/**
 * This model represents the results of running a CXL Model.
 *
 * We use the term "CXL Model" to represent the machine learning/computer vision
 * models that CXL uses. This is to differentiate from the general Software term
 * 'model' (which just represents a data type).
 */
type CXLModelResults = {
  imagecount: number;
  objects: number;
  emptyimages: number;
};

export { CXLModelResults as T };
