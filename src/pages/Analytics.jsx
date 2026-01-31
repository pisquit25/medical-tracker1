import React from 'react';
import { useMedical } from '../context/MedicalContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const Analytics = () => {
  const { measurements, parameters } = useMedical();

  const getParameterStats = (paramName) => {
    const paramMeasurements = measurements
      .filter(m => m.parameter === paramName && m.includedInFormula)
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
          Statistiche dettagliate sui tuoi parametri medici
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {parameters.map((param, index) => {
          const stats = getParameterStats(param.name);
          
          return (
            <div
              key={param.name}
              className="card animate-slide-in"
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
              </div>

              {stats ? (
                <div className="space-y-3">
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
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-sm text-gray-500">Nessun dato disponibile</p>
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
    </div>
  );
};

export default Analytics;
