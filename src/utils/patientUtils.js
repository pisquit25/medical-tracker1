// Utility per validazione Codice Fiscale
export const validateCodiceFiscale = (cf) => {
  const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
  return cfRegex.test(cf.toUpperCase());
};

// Estrae sesso da Codice Fiscale
export const extractSexFromCF = (cf) => {
  if (!cf || cf.length < 11) return null;
  const dayCode = parseInt(cf.substring(9, 11));
  return dayCode > 40 ? 'F' : 'M';
};

// Estrae data di nascita da Codice Fiscale (approssimativa)
export const extractBirthDateFromCF = (cf) => {
  if (!cf || cf.length < 11) return null;
  
  const year = cf.substring(6, 8);
  const monthCode = cf.charAt(8);
  const day = parseInt(cf.substring(9, 11));
  
  const monthMap = {
    'A': '01', 'B': '02', 'C': '03', 'D': '04', 'E': '05', 'H': '06',
    'L': '07', 'M': '08', 'P': '09', 'R': '10', 'S': '11', 'T': '12'
  };
  
  const month = monthMap[monthCode];
  const actualDay = day > 40 ? day - 40 : day;
  
  // Stima l'anno (assume persone nate dopo 1920)
  const currentYear = new Date().getFullYear();
  const shortYear = currentYear % 100;
  const century = parseInt(year) > shortYear ? '19' : '20';
  
  return `${century}${year}-${month}-${actualDay.toString().padStart(2, '0')}`;
};

// Calcola età da data di nascita
export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Genera ID univoco per paziente
export const generatePatientId = () => {
  return `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Genera ID univoco per visita
export const generateVisitId = () => {
  return `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Formatta Codice Fiscale
export const formatCodiceFiscale = (cf) => {
  return cf.toUpperCase().replace(/\s/g, '');
};

// Verifica se paziente non è visto da X giorni
export const checkLastVisit = (lastVisitDate, warningDays = 30) => {
  if (!lastVisitDate) return { needsAlert: false, daysSince: null };
  
  const today = new Date();
  const lastVisit = new Date(lastVisitDate);
  const diffTime = Math.abs(today - lastVisit);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    needsAlert: diffDays >= warningDays,
    daysSince: diffDays
  };
};

// Colori per tag/categorie
export const tagColors = {
  'Diabete': '#ef4444',
  'Ipertensione': '#f59e0b',
  'Cardiopatia': '#ec4899',
  'Tiroide': '#8b5cf6',
  'Metabolico': '#10b981',
  'Renale': '#06b6d4',
  'Epatico': '#f97316',
  'Altro': '#6b7280'
};

// Tag predefiniti
export const defaultTags = [
  'Diabete',
  'Ipertensione',
  'Cardiopatia',
  'Tiroide',
  'Metabolico',
  'Renale',
  'Epatico',
  'Altro'
];
