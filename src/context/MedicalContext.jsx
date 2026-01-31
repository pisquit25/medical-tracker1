import React, { createContext, useContext, useState, useEffect } from 'react';

const MedicalContext = createContext();

export const useMedical = () => {
  const context = useContext(MedicalContext);
  if (!context) {
    throw new Error('useMedical must be used within MedicalProvider');
  }
  return context;
};

const defaultParameters = [
  { 
    id: 'param_1',
    name: 'Glicemia', 
    unit: 'mg/dL',
    unitCategory: 'glucose',
    availableUnits: ['mg/dL', 'mmol/L'],
    standardRange: { min: 70, max: 100 },
    customFormula: 'mean ± 1.5*sd',
    color: '#3b82f6'
  },
  { 
    id: 'param_2',
    name: 'VES', 
    unit: 'mm/h',
    unitCategory: 'generic',
    availableUnits: ['mm/h'],
    standardRange: { min: 0, max: 20 },
    customFormula: 'mean ± 2*sd',
    color: '#8b5cf6'
  },
  { 
    id: 'param_3',
    name: 'TSH', 
    unit: 'mIU/L',
    unitCategory: 'thyroid',
    availableUnits: ['mIU/L', 'µIU/mL'],
    standardRange: { min: 0.4, max: 4.0 },
    customFormula: 'mean ± 1.5*sd',
    color: '#ec4899'
  },
  { 
    id: 'param_4',
    name: 'Colesterolo Totale', 
    unit: 'mg/dL',
    unitCategory: 'cholesterol',
    availableUnits: ['mg/dL', 'mmol/L'],
    standardRange: { min: 0, max: 200 },
    customFormula: 'mean ± 1.5*sd',
    color: '#f59e0b'
  },
  { 
    id: 'param_5',
    name: 'Emoglobina', 
    unit: 'g/dL',
    unitCategory: 'hemoglobin',
    availableUnits: ['g/dL', 'g/L', 'mmol/L'],
    standardRange: { min: 12, max: 16 },
    customFormula: 'mean ± 1.5*sd',
    color: '#10b981'
  }
];

export const MedicalProvider = ({ children }) => {
  const [parameters, setParameters] = useState([]);
  const [measurements, setMeasurements] = useState([]);

  // Load parameters from localStorage
  useEffect(() => {
    const savedParams = localStorage.getItem('medicalParameters');
    if (savedParams) {
      try {
        setParameters(JSON.parse(savedParams));
      } catch (error) {
        console.error('Error loading parameters:', error);
        setParameters(defaultParameters);
      }
    } else {
      setParameters(defaultParameters);
    }
  }, []);

  // Save parameters to localStorage
  useEffect(() => {
    if (parameters.length > 0) {
      localStorage.setItem('medicalParameters', JSON.stringify(parameters));
    }
  }, [parameters]);

  // Load measurements from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('medicalMeasurements');
    if (saved) {
      try {
        setMeasurements(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading measurements:', error);
      }
    }
  }, []);

  // Save measurements to localStorage
  useEffect(() => {
    localStorage.setItem('medicalMeasurements', JSON.stringify(measurements));
  }, [measurements]);

  // Parameter CRUD operations
  const addParameter = (parameter) => {
    const newParam = {
      ...parameter,
      id: `param_${Date.now()}`
    };
    setParameters(prev => [...prev, newParam]);
  };

  const updateParameter = (id, updatedData) => {
    setParameters(prev => prev.map(p => 
      p.id === id ? { ...p, ...updatedData } : p
    ));
  };

  const deleteParameter = (id) => {
    // Remove parameter
    setParameters(prev => prev.filter(p => p.id !== id));
    
    // Remove all measurements for this parameter
    const paramToDelete = parameters.find(p => p.id === id);
    if (paramToDelete) {
      setMeasurements(prev => prev.filter(m => m.parameter !== paramToDelete.name));
    }
  };

  // Measurement operations
  const addMeasurement = (measurement) => {
    setMeasurements(prev => [...prev, {
      ...measurement,
      id: Date.now(),
      value: parseFloat(measurement.value),
      patientId: measurement.patientId || null,
      includedInFormula: true
    }]);
  };

  const removeMeasurement = (id) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  };

  const toggleIncludeInFormula = (id) => {
    setMeasurements(prev => prev.map(m => 
      m.id === id ? { ...m, includedInFormula: !m.includedInFormula } : m
    ));
  };

  const calculateCustomRange = (parameterName, patientId = null) => {
    const paramMeasurements = measurements.filter(
      m => m.parameter === parameterName && 
           m.includedInFormula &&
           (!patientId || m.patientId === patientId)
    );

    if (paramMeasurements.length < 2) return null;

    const values = paramMeasurements.map(m => m.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const sd = Math.sqrt(variance);

    const parameter = parameters.find(p => p.name === parameterName);
    
    let multiplier = 1.5;
    if (parameter?.customFormula.includes('2*sd')) multiplier = 2;
    if (parameter?.customFormula.includes('1*sd') && !parameter?.customFormula.includes('1.5*sd')) multiplier = 1;

    return {
      min: mean - (multiplier * sd),
      max: mean + (multiplier * sd),
      mean,
      sd
    };
  };

  const exportData = () => {
    const dataToExport = {
      parameters,
      measurements,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medical-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          
          // Check if it's the new format with parameters
          if (importedData.parameters && importedData.measurements) {
            setParameters(importedData.parameters);
            setMeasurements(importedData.measurements);
          } else if (Array.isArray(importedData)) {
            // Old format - just measurements
            setMeasurements(importedData);
          } else {
            throw new Error('Invalid file format');
          }
          
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsText(file);
    });
  };

  const value = {
    parameters,
    measurements,
    addParameter,
    updateParameter,
    deleteParameter,
    addMeasurement,
    removeMeasurement,
    toggleIncludeInFormula,
    calculateCustomRange,
    exportData,
    importData
  };

  return (
    <MedicalContext.Provider value={value}>
      {children}
    </MedicalContext.Provider>
  );
};
