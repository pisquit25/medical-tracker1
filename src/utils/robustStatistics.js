/**
 * ROBUST STATISTICS - Media Robusta con IQR
 * Per < 20 misurazioni
 */

function quantile(sortedArray, q) {
  const pos = (sortedArray.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedArray[base + 1] !== undefined) {
    return sortedArray[base] + rest * (sortedArray[base + 1] - sortedArray[base]);
  }
  return sortedArray[base];
}

function mean(arr) {
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

function std(arr) {
  const m = mean(arr);
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

export function calculateRobustMean(values, multiplier = 1.5) {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  const q1 = quantile(sorted, 0.25);
  const q2 = quantile(sorted, 0.50);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;

  const lowerBound = q1 - multiplier * iqr;
  const upperBound = q3 + multiplier * iqr;

  const filtered = values.filter(v => v >= lowerBound && v <= upperBound);
  const outliers = values.filter(v => v < lowerBound || v > upperBound);
  const dataToUse = filtered.length > 0 ? filtered : values;

  const robustMean = mean(dataToUse);
  const robustStd = std(dataToUse);
  const cv = (robustStd / robustMean) * 100;

  return {
    setpoint: Number(robustMean.toFixed(2)),
    std: Number(robustStd.toFixed(2)),
    cv: Number(cv.toFixed(2)),
    quartiles: { 
      q1: Number(q1.toFixed(2)), 
      q2: Number(q2.toFixed(2)), 
      q3: Number(q3.toFixed(2)) 
    },
    iqr: Number(iqr.toFixed(2)),
    bounds: { 
      lower: Number(lowerBound.toFixed(2)), 
      upper: Number(upperBound.toFixed(2)) 
    },
    nValues: n,
    nFiltered: dataToUse.length,
    nOutliers: outliers.length,
    outliers: outliers.map(v => Number(v.toFixed(2)))
  };
}

export default calculateRobustMean;
