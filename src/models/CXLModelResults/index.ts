/**
 * This model represents the results of running a CXL Model.
 *
 * We use the term "CXL Model" to represent the machine learning/computer vision
 * models that CXL uses. This is to differentiate from the general Software term
 * 'model' (which just represents a data type).
 */
type CXLModelResults = {
  runid: string;
  modelname: string;
  rundate: Date;
  imagecount: number;
  emptyimagecount: number;
  objectcount: number;
  imagedir: string;
  resultsdir: string;
};

export { CXLModelResults as T };
