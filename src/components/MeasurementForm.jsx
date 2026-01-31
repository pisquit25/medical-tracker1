import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useMedical } from '../context/MedicalContext';
import { usePatients } from '../context/PatientContext';
import { convertUnit, formatValueWithUnit } from '../utils/unitConversions';

const MeasurementForm = () => {
  const { parameters, addMeasurement } = useMedical();
  const { getActivePatient } = usePatients();
  const activePatient = getActivePatient();
  
  const [formData, setFormData] = useState({
    parameter: '',
    value: '',
    unit: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Inizializza il form quando i parametri vengono caricati
  useEffect(() => {
    if (parameters.length > 0 && !formData.parameter) {
      setFormData(prev => ({
        ...prev,
        parameter: parameters[0].name,
        unit: parameters[0].unit
      }));
    }
  }, [parameters, formData.parameter]);

  const currentParameter = parameters.find(p => p.name === formData.parameter);
  const availableUnits = currentParameter?.availableUnits || [currentParameter?.unit];

  const handleParameterChange = (paramName) => {
    const param = parameters.find(p => p.name === paramName);
    setFormData({
      ...formData,
      parameter: paramName,
      unit: param?.unit || ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.value && formData.date && currentParameter) {
      let valueToStore = parseFloat(formData.value);
      
      // Converti il valore nell'unità predefinita se necessario
      if (formData.unit !== currentParameter.unit && currentParameter.unitCategory) {
        valueToStore = convertUnit(
          valueToStore,
          formData.unit,
          currentParameter.unit,
          currentParameter.unitCategory
        );
      }
      
      addMeasurement({
        parameter: formData.parameter,
        value: valueToStore,
        originalValue: parseFloat(formData.value),
        originalUnit: formData.unit,
        date: formData.date,
        notes: formData.notes.trim(),
        patientId: activePatient?.id
      });
      
      setFormData({
        ...formData,
        value: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      handleSubmit(e);
    }
  };

  // Calcola preview della conversione
  const getConversionPreview = () => {
    if (!formData.value || !currentParameter) return null;
    
    const inputValue = parseFloat(formData.value);
    if (isNaN(inputValue)) return null;
    
    if (formData.unit === currentParameter.unit) {
      return null; // Nessuna conversione necessaria
    }
    
    const convertedValue = convertUnit(
      inputValue,
      formData.unit,
      currentParameter.unit,
      currentParameter.unitCategory
    );
    
    return formatValueWithUnit(convertedValue, currentParameter.unit);
  };

  const conversionPreview = getConversionPreview();

  // Se non ci sono parametri, mostra un messaggio
  if (parameters.length === 0) {
    return (
      <div className="card animate-slide-in">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Nuova Misurazione
        </h2>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">⚙️</div>
          <p className="text-gray-700 font-semibold mb-2">Nessun parametro configurato</p>
          <p className="text-gray-500 text-sm">
            Vai su <strong>Impostazioni</strong> per aggiungere il primo parametro
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-slide-in">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Nuova Misurazione
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Parametro
          </label>
          <select
            value={formData.parameter}
            onChange={(e) => handleParameterChange(e.target.value)}
            className="input"
          >
            {parameters.map(p => (
              <option key={p.name} value={p.name}>
                {p.name} ({p.unit})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Valore
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              onKeyPress={handleKeyPress}
              className="input flex-1"
              placeholder="Es: 95.5"
              required
            />
            {availableUnits && availableUnits.length > 1 ? (
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="input w-32"
              >
                {availableUnits.map(unit => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center px-3 bg-gray-100 rounded-lg border border-gray-300 text-gray-700 font-semibold">
                {formData.unit}
              </div>
            )}
          </div>
          
          {conversionPreview && (
            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-800">
                🔄 <span className="font-semibold">Conversione:</span> {formData.value} {formData.unit} = {conversionPreview}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Data
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Note <span className="text-gray-500 font-normal text-xs">(opzionale)</span>
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="input resize-none"
            rows="3"
            placeholder="Es: Rilevazione a digiuno, dopo attività fisica, ecc..."
            maxLength="500"
          />
          <div className="text-xs text-gray-500 mt-1 text-right">
            {formData.notes.length}/500 caratteri
          </div>
        </div>

        <button
          type="submit"
          className="w-full btn btn-primary py-3 flex items-center justify-center gap-2 text-base font-semibold shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Aggiungi Misurazione
        </button>
      </form>
    </div>
  );
};

export default MeasurementForm;
