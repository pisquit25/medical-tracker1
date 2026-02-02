import React, { useState } from 'react';
import { useMedical } from '../context/MedicalContext';
import { usePatients } from '../context/PatientContext';
import { TrendingUp, TrendingDown, Minus, Calendar, Target, Activity } from 'lucide-react';
import ParameterCalendarView from '../components/ParameterCalendarView';
import InfoTooltip from '../components/InfoTooltip';
import { formatSetpointResult } from '../utils/setpointCalculator';

const Analytics = () => {
  const { measurements, parameters, calculateSetpoint, calculateCustomRange } = useMedical();
  const { getActivePatient } = usePatients();
  const activePatient = getActivePatient();
  const [selectedParameter, setSelectedParameter] = useState(null);

  const getParameterStats = (paramName) => {
    const paramMeasurements = measurements
      .filter(m => 
        m.parameter === paramName && 
        m.includedInFormula &&
        m.patientId === activePatient?.id
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (paramMeasurements.length === 0) return null;

    const values = paramMeasurements.map(m => m.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Trend (confronta ultima misurazione con media precedenti)
    const lastValue = values[values.length - 1];
    const previousMean = values.length > 1 
      ? values.slice(0, -1).reduce((a, b) => a + b, 0) / (values.length - 1)
      : mean;
    
    let trend = 'stable';
    const diff = lastValue - previousMean;
    const threshold = mean * 0.05; // 5% threshold
    
    if (diff > threshold) trend = 'up';
    if (diff < -threshold) trend = 'down';

    return {
      count: paramMeasurements.length,
      mean: mean.toFixed(2),
      min,
      max,
      lastValue,
      trend,
      lastDate: paramMeasurements[paramMeasurements.length - 1].date
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Analisi
        </h1>
        <p className="text-gray-600">
          Statistiche dettagliate e visualizzazione calendario • Click su un parametro per aprire il calendario
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {parameters.map((param, index) => {
          const stats = getParameterStats(param.name);
          
          // NUOVO: Calcola setpoint
          const setpointRaw = calculateSetpoint(param.name, activePatient?.id);
          const setpointData = setpointRaw && !setpointRaw.error 
            ? formatSetpointResult(setpointRaw, param.unit) 
            : null;
          
          return (
            <div
              key={param.name}
              onClick={() => setSelectedParameter(param)}
              className="card animate-slide-in cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 border-2 hover:border-primary-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: param.color }}
                  />
                  <h3 className="font-bold text-gray-900">{param.name}</h3>
                </div>
                <div className="flex gap-2">
                  {stats && (
                    <div className={`p-2 rounded-lg ${
                      stats.trend === 'up' ? 'bg-red-100 text-red-600' :
                      stats.trend === 'down' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {stats.trend === 'up' && <TrendingUp size={18} />}
                      {stats.trend === 'down' && <TrendingDown size={18} />}
                    {stats.trend === 'stable' && <Minus size={18} />}
                  </div>
                )}
                  <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                    <Calendar size={18} />
                  </div>
                </div>
              </div>

              {stats ? (
                <div className="space-y-3">
                  {/* Setpoint Section */}
                  {setpointData && (
                    <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-3 rounded-lg border border-primary-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={16} className="text-primary-600" />
                        <span className="text-xs font-semibold text-primary-700">Setpoint Biologico</span>
                        <InfoTooltip title="Setpoint Biologico">
                          Il <strong>setpoint</strong> è il valore "normale" individuale del parametro per questo paziente, 
                          calcolato automaticamente dal sistema usando:
                          <ul className="mt-2 space-y-1 list-disc list-inside">
                            <li><strong>Media Robusta (IQR)</strong> se &lt; 20 misurazioni: elimina automaticamente gli outlier usando i quartili</li>
                            <li><strong>Gaussian Mixture Model (GMM)</strong> se ≥ 20 misurazioni: identifica gruppi distinti (es: pre/post terapia)</li>
                          </ul>
                          <div className="mt-2 text-xs text-gray-300">
                            Il setpoint è più affidabile della semplice media perché considera la variabilità individuale.
                          </div>
                        </InfoTooltip>
                      </div>
                      
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-2xl font-bold text-primary-700">
                          {setpointData.setpointValue}
                        </span>
                        <span className="text-xs text-gray-600">{param.unit}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-600">
                          CV: {setpointData.cvValue}%
                        </span>
                        <InfoTooltip title="Coefficient of Variation (CV)" position="bottom">
                          Il <strong>CV (Coefficient of Variation)</strong> misura la variabilità del parametro:
                          <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
                            <li><strong>&lt; 5%:</strong> Molto stabile ✅ (controllo eccellente)</li>
                            <li><strong>5-10%:</strong> Stabile ✅ (buona gestione)</li>
                            <li><strong>10-15%:</strong> Moderatamente variabile ⚠️</li>
                            <li><strong>15-20%:</strong> Variabile ⚠️ (richiede attenzione)</li>
                            <li><strong>&gt; 20%:</strong> Molto variabile ❌ (verificare condizioni)</li>
                          </ul>
                          <div className="mt-2 text-xs text-gray-300">
                            CV = (Deviazione Standard / Media) × 100
                          </div>
                        </InfoTooltip>
                        <span className="text-gray-600">
                          • {setpointData.cvInterpretation}
                        </span>
                      </div>

                      {/* Info GMM */}
                      {setpointData.methodUsed === 'gmm' && setpointData.clusters && (
                        <div className="mt-2 pt-2 border-t border-primary-200">
                          <div className="flex items-center gap-2 text-xs text-gray-700">
                            <Activity size={14} className="text-primary-600" />
                            <span className="font-semibold">
                              {setpointData.nComponents} Cluster{setpointData.nComponents > 1 ? 's' : ''} GMM
                            </span>
                            <InfoTooltip title="Cluster GMM" position="bottom">
                              Il <strong>Gaussian Mixture Model</strong> identifica automaticamente gruppi (cluster) nei dati:
                              <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
                                <li><strong>1 Cluster:</strong> Paziente stabile, valori omogenei</li>
                                <li><strong>2 Cluster:</strong> Due fasi distinte (es: pre/post terapia, prima/dopo intervento)</li>
                                <li><strong>3 Cluster:</strong> Tre fasi (es: baseline, intervento, stabilizzazione)</li>
                              </ul>
                              <div className="mt-2 text-xs text-gray-300">
                                Il sistema seleziona automaticamente il modello migliore usando il criterio AIC (Akaike Information Criterion).
                              </div>
                            </InfoTooltip>
                          </div>
                          {setpointData.nComponents > 1 && (
                            <div className="mt-1 space-y-1">
                              {setpointData.clusters.means.map((mean, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600">
                                    Cluster {idx + 1}: {mean} {param.unit}
                                  </span>
                                  <span className="text-gray-500">
                                    {setpointData.clusters.proportions[idx]}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Metodo Robust IQR */}
                      {setpointData.methodUsed === 'robust' && setpointData.outliers && setpointData.outliers.count > 0 && (
                        <div className="mt-2 pt-2 border-t border-primary-200">
                          <div className="flex items-center gap-2 text-xs text-yellow-700">
                            <span>⚠️ {setpointData.outliers.count} valore/i anomalo/i rimosso/i</span>
                            <InfoTooltip title="Outlier Rimossi" position="bottom">
                              La <strong>Media Robusta (IQR)</strong> rimuove automaticamente i valori anomali usando il metodo dei quartili:
                              <div className="mt-2 text-xs">
                                <strong>Metodo Tukey's Fences:</strong>
                                <ul className="mt-1 space-y-1 list-disc list-inside">
                                  <li>Q1 = Primo Quartile (25%)</li>
                                  <li>Q3 = Terzo Quartile (75%)</li>
                                  <li>IQR = Q3 - Q1</li>
                                  <li>Outlier se: valore &lt; Q1-1.5×IQR o valore &gt; Q3+1.5×IQR</li>
                                </ul>
                              </div>
                              <div className="mt-2 text-xs text-gray-300">
                                Questo garantisce che errori di misura o valori eccezionali non influenzino il setpoint.
                              </div>
                            </InfoTooltip>
                          </div>
                        </div>
                      )}

                      {/* Metodo e Confidenza */}
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          {setpointData.method}
                        </span>
                        <span className={`font-medium ${setpointData.confidence.color}`}>
                          {setpointData.confidence.icon} {setpointData.confidence.text}
                        </span>
                      </div>

                      {/* Warning se poche misurazioni */}
                      {setpointData.nMeasurements < 20 && (
                        <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                          ℹ️ {20 - setpointData.nMeasurements} misurazioni per GMM
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-600">Ultima misurazione</span>
                    <span className="text-2xl font-bold" style={{ color: param.color }}>
                      {stats.lastValue} <span className="text-sm text-gray-500">{param.unit}</span>
                    </span>
                  </div>

                  <div className="text-xs text-gray-500">
                    {new Date(stats.lastDate).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>

                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Media</span>
                      <span className="font-semibold text-gray-900">{stats.mean} {param.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Min - Max</span>
                      <span className="font-semibold text-gray-900">
                        {stats.min} - {stats.max} {param.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Misurazioni</span>
                      <span className="font-semibold text-gray-900">{stats.count}</span>
                    </div>
                  </div>

                  {param.standardRange && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-600 mb-2">Range Standard</div>
                      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-emerald-500 rounded-full"
                          style={{
                            left: `${((param.standardRange.min - stats.min) / (stats.max - stats.min)) * 100}%`,
                            width: `${((param.standardRange.max - param.standardRange.min) / (stats.max - stats.min)) * 100}%`
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{param.standardRange.min}</span>
                        <span>{param.standardRange.max}</span>
                      </div>
                    </div>
                  )}

                  {/* NUOVO: Range Personalizzato sempre visibile */}
                  {(() => {
                    const customRange = calculateCustomRange(param.name, activePatient?.id);
                    if (!customRange) return null;
                    
                    return (
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-xs font-semibold text-gray-700">Range Personalizzato</div>
                          <InfoTooltip title="Range Personalizzato" position="bottom">
                            Il <strong>Range Personalizzato</strong> è calcolato dal setpoint individuale del paziente:
                            <div className="mt-2 text-xs">
                              <strong>Formula:</strong> Setpoint ± {param.customFormula || '1.5×SD'}
                            </div>
                            <div className="mt-2 text-xs">
                              <strong>Metodo:</strong> {customRange.method === 'gmm' ? 'Gaussian Mixture Model' : 'Media Robusta (IQR)'}
                            </div>
                            <div className="mt-2 text-xs text-gray-300">
                              Questo range riflette la variabilità individuale del paziente ed è più accurato del range standard per valutare il controllo personale del parametro.
                            </div>
                          </InfoTooltip>
                        </div>
                        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="absolute h-full bg-blue-500 rounded-full"
                            style={{
                              left: `${Math.max(0, ((customRange.min - stats.min) / (stats.max - stats.min)) * 100)}%`,
                              width: `${Math.min(100, ((customRange.max - customRange.min) / (stats.max - stats.min)) * 100)}%`
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{customRange.min.toFixed(1)}</span>
                          <span>{customRange.max.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-center">
                          ({customRange.method === 'gmm' ? 'GMM' : 'Robust'} • {customRange.confidence || 'medium'} confidence)
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-2 text-primary-600 font-medium text-sm">
                      <Calendar size={16} />
                      <span>Click per visualizzare calendario</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-sm text-gray-500">Nessun dato disponibile</p>
                  <p className="text-xs text-gray-400 mt-2">Inserisci misurazioni per visualizzare il calendario</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {measurements.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📈</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nessuna analisi disponibile</h3>
          <p className="text-gray-600">
            Aggiungi le tue prime misurazioni per visualizzare statistiche dettagliate
          </p>
        </div>
      )}

      {/* Calendar Modal */}
      {selectedParameter && (
        <ParameterCalendarView
          parameter={selectedParameter}
          onClose={() => setSelectedParameter(null)}
        />
      )}
    </div>
  );
};

export default Analytics;
