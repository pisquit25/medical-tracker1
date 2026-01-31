// Definizione unità di misura disponibili per categoria
export const unitCategories = {
  glucose: {
    label: 'Glicemia',
    units: [
      { value: 'mg/dL', label: 'mg/dL', isDefault: true },
      { value: 'mmol/L', label: 'mmol/L', isDefault: false }
    ],
    conversions: {
      'mg/dL_to_mmol/L': (val) => val / 18.018,
      'mmol/L_to_mg/dL': (val) => val * 18.018
    }
  },
  cholesterol: {
    label: 'Colesterolo',
    units: [
      { value: 'mg/dL', label: 'mg/dL', isDefault: true },
      { value: 'mmol/L', label: 'mmol/L', isDefault: false }
    ],
    conversions: {
      'mg/dL_to_mmol/L': (val) => val / 38.67,
      'mmol/L_to_mg/dL': (val) => val * 38.67
    }
  },
  hemoglobin: {
    label: 'Emoglobina',
    units: [
      { value: 'g/dL', label: 'g/dL', isDefault: true },
      { value: 'g/L', label: 'g/L', isDefault: false },
      { value: 'mmol/L', label: 'mmol/L', isDefault: false }
    ],
    conversions: {
      'g/dL_to_g/L': (val) => val * 10,
      'g/L_to_g/dL': (val) => val / 10,
      'g/dL_to_mmol/L': (val) => val * 0.6206,
      'mmol/L_to_g/dL': (val) => val / 0.6206
    }
  },
  thyroid: {
    label: 'Ormoni Tiroidei',
    units: [
      { value: 'mIU/L', label: 'mIU/L', isDefault: true },
      { value: 'µIU/mL', label: 'µIU/mL', isDefault: false }
    ],
    conversions: {
      'mIU/L_to_µIU/mL': (val) => val, // sono equivalenti
      'µIU/mL_to_mIU/L': (val) => val
    }
  },
  creatinine: {
    label: 'Creatinina',
    units: [
      { value: 'mg/dL', label: 'mg/dL', isDefault: true },
      { value: 'µmol/L', label: 'µmol/L', isDefault: false }
    ],
    conversions: {
      'mg/dL_to_µmol/L': (val) => val * 88.42,
      'µmol/L_to_mg/dL': (val) => val / 88.42
    }
  },
  urea: {
    label: 'Azotemia/Urea',
    units: [
      { value: 'mg/dL', label: 'mg/dL', isDefault: true },
      { value: 'mmol/L', label: 'mmol/L', isDefault: false }
    ],
    conversions: {
      'mg/dL_to_mmol/L': (val) => val * 0.357,
      'mmol/L_to_mg/dL': (val) => val / 0.357
    }
  },
  generic: {
    label: 'Generica',
    units: [
      { value: 'mg/dL', label: 'mg/dL', isDefault: true },
      { value: 'g/dL', label: 'g/dL', isDefault: false },
      { value: 'g/L', label: 'g/L', isDefault: false },
      { value: 'mmol/L', label: 'mmol/L', isDefault: false },
      { value: 'µmol/L', label: 'µmol/L', isDefault: false },
      { value: 'mIU/L', label: 'mIU/L', isDefault: false },
      { value: 'µIU/mL', label: 'µIU/mL', isDefault: false },
      { value: 'U/L', label: 'U/L', isDefault: false },
      { value: 'ng/mL', label: 'ng/mL', isDefault: false },
      { value: 'pg/mL', label: 'pg/mL', isDefault: false },
      { value: '%', label: '%', isDefault: false },
      { value: 'mm/h', label: 'mm/h', isDefault: false }
    ],
    conversions: {} // Nessuna conversione automatica per unità generiche
  }
};

// Funzione per ottenere la categoria basandosi sul nome del parametro
export const detectCategory = (parameterName) => {
  const name = parameterName.toLowerCase();
  
  if (name.includes('glicemia') || name.includes('glucos')) return 'glucose';
  if (name.includes('colesterol')) return 'cholesterol';
  if (name.includes('emoglobin') || name.includes('hb')) return 'hemoglobin';
  if (name.includes('tsh') || name.includes('tiroide') || name.includes('thyroid')) return 'thyroid';
  if (name.includes('creatinin')) return 'creatinine';
  if (name.includes('azot') || name.includes('urea')) return 'urea';
  
  return 'generic';
};

// Funzione per convertire tra unità
export const convertUnit = (value, fromUnit, toUnit, category) => {
  if (fromUnit === toUnit) return value;
  
  const categoryData = unitCategories[category];
  if (!categoryData) return value;
  
  const conversionKey = `${fromUnit}_to_${toUnit}`;
  const conversionFn = categoryData.conversions[conversionKey];
  
  if (conversionFn) {
    return conversionFn(value);
  }
  
  return value; // Nessuna conversione disponibile
};

// Funzione per ottenere l'unità di default per una categoria
export const getDefaultUnit = (category) => {
  const categoryData = unitCategories[category];
  if (!categoryData) return 'mg/dL';
  
  const defaultUnit = categoryData.units.find(u => u.isDefault);
  return defaultUnit ? defaultUnit.value : categoryData.units[0].value;
};

// Funzione per ottenere tutte le unità disponibili per una categoria
export const getAvailableUnits = (category) => {
  const categoryData = unitCategories[category];
  if (!categoryData) return unitCategories.generic.units;
  
  return categoryData.units;
};

// Formattazione valore con unità
export const formatValueWithUnit = (value, unit, decimals = 2) => {
  return `${parseFloat(value).toFixed(decimals)} ${unit}`;
};
