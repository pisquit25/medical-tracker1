import React from 'react';
import { Trash2, Eye, EyeOff } from 'lucide-react';
import { useMedical } from '../context/MedicalContext';

const MeasurementList = () => {
  const { measurements, parameters, removeMeasurement, toggleIncludeInFormula } = useMedical();

  const sortedMeasurements = [...measurements]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 15);

  return (
    <div className="card animate-slide-in" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">
          Misurazioni Recenti
        </h3>
        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
          {measurements.length}
        </span>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-2">
        {sortedMeasurements.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-500 text-lg font-medium">Nessuna misurazione</p>
            <p className="text-gray-400 text-sm mt-2">Aggiungi la prima per iniziare!</p>
          </div>
        ) : (
          sortedMeasurements.map((m, index) => {
            const param = parameters.find(p => p.name === m.parameter);
            return (
              <div
                key={m.id}
                className={`p-4 rounded-lg border-2 transition-all duration-200 animate-fade-in ${
                  m.includedInFormula 
                    ? 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-md' 
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
                style={{ 
                  animationDelay: `${index * 0.05}s`,
                  borderLeftColor: param?.color,
                  borderLeftWidth: '4px'
                }}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: param?.color }}
                      />
                      <h4 className="font-bold text-gray-900 truncate">
                        {m.parameter}
                      </h4>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl font-bold text-gray-900">
                        {m.value}
                      </span>
                      <span className="text-sm text-gray-500">
                        {param?.unit}
                      </span>
                      {m.originalUnit && m.originalUnit !== param?.unit && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          ({m.originalValue} {m.originalUnit})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {new Date(m.date).toLocaleDateString('it-IT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                    {m.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 border-l-2 border-blue-400">
                        <span className="font-semibold">📝</span> {m.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleIncludeInFormula(m.id)}
                      className={`p-2 rounded-lg transition-all ${
                        m.includedInFormula 
                          ? 'text-primary-600 hover:bg-primary-50' 
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={m.includedInFormula ? "Escludi dalla formula" : "Includi nella formula"}
                    >
                      {m.includedInFormula ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                      onClick={() => removeMeasurement(m.id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-all"
                      title="Elimina misurazione"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MeasurementList;
