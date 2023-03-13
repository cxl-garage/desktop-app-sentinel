/**
 * This model represents the results of running a CXL Model.
 *
 * We use the term "CXL Model" to represent the machine learning/computer vision
 * models that CXL uses. This is to differentiate from the general Software term
 * 'model' (which just represents a data type).
 */
type CXLModelResults = {
  emptyimagecount: number;
  imagecount: number;
  imagedir: string;
  modelname: string;
  objectcount: number;
  resultsdir: string;
  rundate: Date;
  runid: string;
};

export { CXLModelResults as T };
