/**
 * Functions to implement non-maximum supression of bounding boxes
 */

type Prediction = {
  box: number[];
  confidence: number;
  classId: number;
};

// Computes the intersection-over-union between two bounding boxes
function iou(box0: number[], box1: number[]): number {
  // To compute the intersection find the minimum and maximum pairwise
  // x and y coordinates
  // see: https://medium.com/analytics-vidhya/iou-intersection-over-union-705a39e7acef
  const width = Math.min(box0[2], box1[2]) - Math.max(box0[0], box1[0]);
  const height = Math.min(box0[3], box1[3]) - Math.max(box0[1], box1[1]);
  const intersection = Math.max(0, width) * Math.max(0, height);
  const area0 = (box0[2] - box0[0]) * (box0[3] - box0[1]);
  const area1 = (box1[2] - box1[0]) * (box1[3] - box1[1]);
  const union = area0 + area1 - intersection;
  return intersection / union;
}

/**
 * Computes the non-maximal suppression for an array of predictions.
 * @param predictions a two-dimension array of predictions, where each array is of the
 * format [x, y, w, y, confidence, class 1 confidence, class 2 confidence, ...]
 * @param threshold the confidence value below which a result is discarded
 * @param maxPredictions only use the N topmost results ordered by confidence, passing
 * a value of 1 will effectively disable nms and only return the result with the highest
 * confidence value
 * @param iouThreshold the threshold below which a result is considered significantly
 * different from another result based upon an intersection-over-union computation
 * @returns an array of predictions that do not overlap
 */
export default function nms(
  predictions: number[][],
  threshold: number,
  maxPredictions: number,
  iouThreshold: number,
): Prediction[] {
  const keep: Prediction[] = [];

  // Go through all of the predictions and eliminate those whose confidence
  // falls below the threshold. As part of this, compute the composite confidence
  // (the overall confidence of the result multiplied by the maximum confidence of
  // a class) and the class id with the maximum confidence. Sort with the highest
  // confidence value last.
  const candidates = predictions
    // Initial filter for overall result confidence to weed out
    // most values
    .filter((p) => p[4] >= threshold)
    .map((p) => {
      const classes = p.slice(5);
      const max = Math.max(...classes);
      return {
        // convert x, y, w, h to x1, y1, x2, y2 bounding box
        box: [
          p[0] - p[2] / 2,
          p[1] - p[3] / 2,
          p[0] + p[2] / 2,
          p[1] + p[3] / 2,
        ],
        confidence: p[4] * max,
        classId: classes.indexOf(max),
      } as Prediction;
    })
    // We need to filter out for the composite confidence
    .filter((p) => p.confidence >= threshold)
    .sort((a, b) => a.confidence - b.confidence)
    .slice(-maxPredictions);

  // Loop until there are no more candidates
  while (candidates.length) {
    // Take the top candidate to always keep
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const top = candidates.pop()!;
    keep.push(top);

    // For each of the rest of the candidates, remove those whose intersection-
    // over-union exceeds some threshold. We are going to use the trick of
    // iterating backwards so we can remove elements from the array during
    // iteration
    for (let index = candidates.length - 1; index >= 0; index -= 1) {
      const element = candidates[index];
      const iouValue = iou(top.box, element.box);
      if (iouValue > iouThreshold) {
        candidates.splice(index, 1); // 2nd parameter means remove one item only
      }
    }
  }

  return keep;
}
