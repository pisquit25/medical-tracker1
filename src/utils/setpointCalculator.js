/**
 * HYBRID SETPOINT CALCULATOR
 * Sistema intelligente che sceglie automaticamente:
 * - < 20 misurazioni: Media Robusta (IQR)
 * - >= 20 misurazioni: Gaussian Mixture Model (GMM con selezione AIC)
 * 
 * Rispetta sempre la scelta dell'operatore su includedInFormula
 */

import { calculateRobustMean } from './robustStatistics';
import { calculateGMMSetpoint } from './gmmStatistics';

const THRESHOLD_GMM = 20;

/**
 * Calcola setpoint con metodo ibrido automatico
 */
export function calculateSetpoint(measurements, options = {}) {
  const { threshold = THRESHOLD_GMM } = options;

  // Filtra solo misurazioni incluse (rispetta scelta operatore)
  const includedMeasurements = measurements.filter(m => m.includedInFormula !== false);

  if (includedMeasurements.length === 0) {
    return null;
  }

  if (includedMeasurements.length < 5) {
    return {
      error: true,
      message: `Servono almeno 5 misurazioni incluse (attuale: ${includedMeasurements.length})`
    };
  }

  const values = includedMeasurements.map(m => m.value);
  const n = values.length;

  // Scelta automatica metodo
  const useGMM = n >= threshold;

  try {
    let result;

    if (useGMM) {
      // GMM per >= 20 misurazioni
      result = calculateGMMSetpoint(values);
      result.methodUsed = 'gmm';
      result.methodLabel = 'Gaussian Mixture Model';
    } else {
      // Robust per < 20 misurazioni
      const robustResult = calculateRobustMean(values);
      result = {
        setpoint: robustResult.setpoint,
        cv: robustResult.cv,
        std: robustResult.std,
        confidence: n >= 15 ? 'medium' : n >= 10 ? 'medium-low' : 'low',
        method: 'robust-iqr',
        methodUsed: 'robust',
        methodLabel: 'Media Robusta (IQR)',
        nComponents: 1,
        outliers: {
          count: robustResult.nOutliers,
          values: robustResult.outliers
        },
        details: {
          quartiles: robustResult.quartiles,
          iqr: robustResult.iqr,
          bounds: robustResult.bounds
        }
      };
    }

    // Aggiungi info comuni
    result.nMeasurements = n;
    result.totalMeasurements = measurements.length;
    result.excludedMeasurements = measurements.length - n;
    result.threshold = threshold;

    return result;

  } catch (error) {
    console.error('Setpoint calculation error:', error);
    return {
      error: true,
      message: error.message
    };
  }
}

/**
 * Formatta risultato per UI
 */
export function formatSetpointResult(result, unit = '') {
  if (!result || result.error) {
    return null;
  }

  const confidenceLabels = {
    high: { text: 'Alta', icon: '✅', color: 'text-green-600' },
    medium: { text: 'Media', icon: '⚠️', color: 'text-yellow-600' },
    'medium-low': { text: 'Media-Bassa', icon: 'ℹ️', color: 'text-blue-600' },
    low: { text: 'Bassa', icon: 'ℹ️', color: 'text-gray-600' }
  };

  const cvInterpretation = result.cv < 5 ? 'Molto Stabile' :
                           result.cv < 10 ? 'Stabile' :
                           result.cv < 15 ? 'Moderatamente Variabile' :
                           result.cv < 20 ? 'Variabile' :
                           'Molto Variabile';

  return {
    setpoint: `${result.setpoint} ${unit}`,
    setpointValue: result.setpoint,
    cv: `${result.cv}%`,
    cvValue: result.cv,
    cvInterpretation,
    std: `±${result.std} ${unit}`,
    confidence: confidenceLabels[result.confidence] || confidenceLabels.low,
    method: result.methodLabel,
    methodUsed: result.methodUsed,
    nMeasurements: result.nMeasurements,
    nComponents: result.nComponents || 1,
    clusters: result.clusters,
    hasOutliers: result.outliers && result.outliers.count > 0,
    outliers: result.outliers
  };
}

/**
 * Genera raccomandazioni
 */
export function getRecommendations(result) {
  if (!result || result.error) return [];

  const recs = [];
  const { nMeasurements, cv, methodUsed, outliers } = result;

  if (nMeasurements < 20) {
    recs.push({
      type: 'info',
      message: `Aggiungi ${20 - nMeasurements} misurazioni per analisi GMM avanzata`,
      icon: '📊'
    });
  }

  if (nMeasurements < 10) {
    recs.push({
      type: 'warning',
      message: 'Setpoint preliminare - raccomandato almeno 10 misurazioni',
      icon: '⚠️'
    });
  }

  if (cv > 20) {
    recs.push({
      type: 'warning',
      message: 'Alta variabilità rilevata - verifica condizioni di misurazione',
      icon: '🔍'
    });
  }

  if (outliers && outliers.count > 3) {
    recs.push({
      type: 'info',
      message: `${outliers.count} valori anomali rimossi - verifica calibrazione`,
      icon: '🔧'
    });
  }

  if (methodUsed === 'robust' && nMeasurements >= 15) {
    recs.push({
      type: 'success',
      message: `Solo ${20 - nMeasurements} misurazioni per attivare GMM`,
      icon: '🎯'
    });
  }

  return recs;
}

export default calculateSetpoint;
