/**
 * GAUSSIAN MIXTURE MODEL (GMM)
 * Per >= 20 misurazioni
 * Seleziona automaticamente 1, 2 o 3 componenti basandosi su AIC
 */

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function variance(arr) {
  const m = mean(arr);
  return arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / arr.length;
}

function gaussianPDF(x, mean, variance) {
  const std = Math.sqrt(variance);
  return (1 / (std * Math.sqrt(2 * Math.PI))) * 
         Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
}

function kMeans(values, k, maxIter = 50) {
  const sorted = [...values].sort((a, b) => a - b);
  const centroids = [];
  for (let i = 0; i < k; i++) {
    const idx = Math.floor((i + 1) * sorted.length / (k + 1));
    centroids.push(sorted[idx]);
  }

  let clusters = Array(k).fill(null).map(() => []);
  let changed = true;
  let iter = 0;

  while (changed && iter < maxIter) {
    clusters = Array(k).fill(null).map(() => []);
    values.forEach(val => {
      const distances = centroids.map(c => Math.abs(val - c));
      const nearest = distances.indexOf(Math.min(...distances));
      clusters[nearest].push(val);
    });

    const newCentroids = clusters.map((c, i) => 
      c.length > 0 ? mean(c) : centroids[i]
    );

    changed = !centroids.every((c, i) => Math.abs(c - newCentroids[i]) < 0.001);
    centroids.splice(0, k, ...newCentroids);
    iter++;
  }

  return clusters;
}

function fitEMGMM(values, k, maxIter = 100) {
  const clusters = kMeans(values, k);
  
  let means = clusters.map(c => c.length > 0 ? mean(c) : 0);
  let variances = clusters.map(c => c.length > 0 ? variance(c) : 1);
  let proportions = clusters.map(c => c.length / values.length);

  variances = variances.map(v => Math.max(v, 0.01));

  for (let iter = 0; iter < maxIter; iter++) {
    const responsibilities = values.map(val => {
      const probs = means.map((mu, i) => 
        proportions[i] * gaussianPDF(val, mu, variances[i])
      );
      const sum = probs.reduce((a, b) => a + b, 0);
      return sum > 0 ? probs.map(p => p / sum) : probs.map(() => 1/k);
    });

    const newMeans = [];
    const newVariances = [];
    const newProportions = [];

    for (let i = 0; i < k; i++) {
      const weights = responsibilities.map(r => r[i]);
      const weightSum = weights.reduce((a, b) => a + b, 0);

      if (weightSum < 0.001) {
        newMeans.push(means[i]);
        newVariances.push(variances[i]);
        newProportions.push(0.001);
        continue;
      }

      const mu = values.reduce((sum, val, j) => 
        sum + weights[j] * val, 0) / weightSum;
      
      const v = values.reduce((sum, val, j) => 
        sum + weights[j] * Math.pow(val - mu, 2), 0) / weightSum;

      newMeans.push(mu);
      newVariances.push(Math.max(v, 0.01));
      newProportions.push(weightSum / values.length);
    }

    const converged = means.every((m, i) => Math.abs(m - newMeans[i]) < 0.001);

    means = newMeans;
    variances = newVariances;
    proportions = newProportions;

    if (converged) break;
  }

  const sumProp = proportions.reduce((a, b) => a + b, 0);
  proportions = proportions.map(p => p / sumProp);

  return { means, variances, proportions };
}

function calculateAIC(values, means, variances, proportions) {
  const k = means.length;
  let logL = 0;
  
  values.forEach(val => {
    let likelihood = 0;
    for (let i = 0; i < k; i++) {
      likelihood += proportions[i] * gaussianPDF(val, means[i], variances[i]);
    }
    logL += Math.log(Math.max(likelihood, 1e-10));
  });

  const nParams = k * 3 - 1;
  return 2 * nParams - 2 * logL;
}

export function calculateGMMSetpoint(values) {
  if (values.length < 10) {
    throw new Error('GMM richiede almeno 10 misurazioni');
  }

  const models = [];

  // Prova 1, 2, 3 componenti
  for (let k = 1; k <= 3; k++) {
    try {
      if (k === 1) {
        const m = mean(values);
        const v = variance(values);
        models.push({
          nComponents: 1,
          means: [m],
          variances: [v],
          proportions: [1.0],
          aic: calculateAIC(values, [m], [v], [1.0])
        });
      } else {
        const { means, variances, proportions } = fitEMGMM(values, k);
        models.push({
          nComponents: k,
          means,
          variances,
          proportions,
          aic: calculateAIC(values, means, variances, proportions)
        });
      }
    } catch (e) {
      models.push(null);
    }
  }

  // Seleziona modello con AIC minimo
  let bestModel = null;
  let minAIC = Infinity;

  models.forEach((model, idx) => {
    if (model && model.aic < minAIC) {
      minAIC = model.aic;
      bestModel = { ...model, modelIndex: idx + 1 };
    }
  });

  if (!bestModel) {
    throw new Error('Impossibile fittare GMM');
  }

  const { nComponents, means, variances, proportions } = bestModel;

  let setpoint, cv, confidence, dominantCluster;

  if (nComponents === 1) {
    setpoint = means[0];
    cv = Math.sqrt(variances[0]) / setpoint;
    confidence = 'high';
    dominantCluster = null;
  } else {
    const maxProportion = Math.max(...proportions);
    const maxIdx = proportions.indexOf(maxProportion);

    const isDominant = (nComponents === 2 && maxProportion > 0.7) ||
                       (nComponents === 3 && maxProportion > 0.45);

    if (isDominant) {
      setpoint = means[maxIdx];
      cv = Math.sqrt(variances[maxIdx]) / setpoint;
      confidence = maxProportion > 0.8 ? 'high' : 'medium';
      dominantCluster = maxIdx + 1;
    } else {
      setpoint = mean(values);
      cv = Math.sqrt(variance(values)) / setpoint;
      confidence = 'medium';
      dominantCluster = null;
    }
  }

  return {
    setpoint: Number(setpoint.toFixed(2)),
    cv: Number((cv * 100).toFixed(2)),
    std: Number((Math.sqrt(cv * cv * setpoint * setpoint / 10000)).toFixed(2)),
    confidence,
    method: 'gmm',
    nComponents,
    dominantCluster,
    clusters: {
      nClusters: nComponents,
      means: means.map(m => Number(m.toFixed(2))),
      stds: variances.map(v => Number(Math.sqrt(v).toFixed(2))),
      cvs: means.map((m, i) => Number((Math.sqrt(variances[i]) / m * 100).toFixed(2))),
      proportions: proportions.map(p => Number((p * 100).toFixed(1)))
    },
    aic: Number(bestModel.aic.toFixed(2)),
    aicScores: models.map(m => m ? Number(m.aic.toFixed(2)) : null)
  };
}

export default calculateGMMSetpoint;
