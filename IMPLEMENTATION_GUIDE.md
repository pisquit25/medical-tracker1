# 🏥 IMPLEMENTAZIONE GESTIONE PAZIENTI - GUIDA COMPLETA

## ✅ FILE CREATI

### 1. Utilities
- ✅ `src/utils/patientUtils.js` - Validazione CF, calcolo età, utilities

### 2. Context
- ✅ `src/context/PatientContext.jsx` - Gestione pazienti completa

### 3. Components
- ✅ `src/components/PatientForm.jsx` - Form aggiunta/modifica paziente

### 4. Pages
- ✅ `src/pages/Patients.jsx` - Lista pazienti con ricerca

---

## 📋 MODIFICHE NECESSARIE AI FILE ESISTENTI

### 1. `src/App.js` - Aggiungere PatientProvider e route

```javascript
import { PatientProvider } from './context/PatientContext';
import Patients from './pages/Patients';

function App() {
  return (
    <PatientProvider>  {/* ← AGGIUNGI */}
      <MedicalProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Header />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />  {/* ← AGGIUNGI */}
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </Router>
      </MedicalProvider>
    </PatientProvider>  {/* ← AGGIUNGI */}
  );
}
```

---

### 2. `src/components/Header.jsx` - Aggiungere link Pazienti

```javascript
<nav className="flex items-center gap-1">
  <NavLink to="/patients">  {/* ← AGGIUNGI */}
    <Users size={20} />
    Pazienti
  </NavLink>
  <NavLink to="/">
    <LayoutDashboard size={20} />
    Dashboard
  </NavLink>
  {/* ... altri link ... */}
</nav>
```

Aggiungere anche **indicatore paziente attivo** nell'header:

```javascript
import { usePatients } from '../context/PatientContext';

const Header = () => {
  const { getActivePatient } = usePatients();
  const activePatient = getActivePatient();

  return (
    <header>
      {/* ... menu ... */}
      
      {activePatient && (
        <div className="bg-primary-50 px-4 py-2 border-b border-primary-200">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <User size={16} className="text-primary-600" />
            <span className="text-sm font-medium text-primary-900">
              Paziente: {activePatient.cognome} {activePatient.nome}
            </span>
            <span className="text-xs text-primary-600">
              ({activePatient.codiceFiscale})
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
```

---

### 3. `src/context/MedicalContext.jsx` - Filtrare per paziente

**MODIFICHE NECESSARIE:**

1. Aggiungere `patientId` a ogni misurazione:

```javascript
const addMeasurement = (measurement) => {
  // Ottieni paziente attivo
  const activePatient = /* get from PatientContext */;
  
  setMeasurements(prev => [...prev, {
    ...measurement,
    id: Date.now(),
    patientId: activePatient?.id || null,  // ← AGGIUNGI
    value: parseFloat(measurement.value),
    includedInFormula: true
  }]);
};
```

2. Filtrare misurazioni per paziente attivo:

```javascript
// Funzione helper per ottenere misurazioni paziente attivo
const getActivePa tientMeasurements = () => {
  const activePatient = /* get from PatientContext */;
  if (!activePatient) return [];
  
  return measurements.filter(m => m.patientId === activePatient.id);
};
```

3. Aggiornare `calculateCustomRange` per filtrare per paziente:

```javascript
const calculateCustomRange = (parameterName) => {
  const activePatient = /* get from PatientContext */;
  
  const paramMeasurements = measurements.filter(
    m => m.parameter === parameterName && 
         m.includedInFormula &&
         m.patientId === activePatient?.id  // ← AGGIUNGI
  );
  // ... resto del codice ...
};
```

---

### 4. `src/components/StatusOverview.jsx` - Usare misurazioni filtrate

```javascript
import { usePatients } from '../context/PatientContext';

const StatusOverview = ({ selectedParameter, onParameterChange }) => {
  const { measurements, parameters, calculateCustomRange, ... } = useMedical();
  const { getActivePatient } = usePatients();
  
  const activePatient = getActivePatient();
  
  // Filtra misurazioni per paziente attivo
  const patientMeasurements = measurements.filter(
    m => m.patientId === activePatient?.id
  );
  
  // Usa patientMeasurements invece di measurements nel resto del componente
};
```

---

### 5. `src/components/Chart.jsx` - Filtrare dati grafico

```javascript
import { usePatients } from '../context/PatientContext';

const Chart = ({ selectedParameter, onParameterChange }) => {
  const { measurements, ... } = useMedical();
  const { getActivePatient } = usePatients();
  
  const activePatient = getActivePatient();
  
  const chartData = measurements
    .filter(m => 
      m.parameter === currentParameter &&
      m.patientId === activePatient?.id  // ← AGGIUNGI
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    // ... resto ...
};
```

---

### 6. `src/pages/Dashboard.jsx` - Gestire paziente non selezionato

```javascript
import { usePatients } from '../context/PatientContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { getActivePatient } = usePatients();
  const navigate = useNavigate();
  const activePatient = getActivePatient();
  
  // Se nessun paziente selezionato, mostra messaggio
  if (!activePatient) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Users size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">
          Nessun paziente selezionato
        </h2>
        <p className="text-gray-500 mb-6">
          Seleziona un paziente per visualizzare i suoi dati
        </p>
        <button
          onClick={() => navigate('/patients')}
          className="btn btn-primary"
        >
          Vai ai Pazienti
        </button>
      </div>
    );
  }
  
  // Resto del componente normale
  return (
    <div>
      {/* Dashboard normale */}
    </div>
  );
};
```

---

## 🚀 FILE ANCORA DA CREARE

### 1. `src/pages/PatientDetail.jsx` - Dettaglio paziente completo

Funzionalità:
- Visualizzazione dati paziente
- Modifica paziente
- Storico visite
- Statistiche complete
- Export PDF
- Timeline misurazioni

### 2. `src/components/PatientHeader.jsx` - Header con info paziente

Mostra:
- Avatar
- Nome, cognome, CF
- Età, sesso
- Tags
- Pulsanti azioni (Modifica, Export PDF)

### 3. `src/components/VisitForm.jsx` - Form registrazione visite

Campi:
- Data visita
- Motivo
- Note
- Esami effettuati
- Diagnosi
- Terapie prescritte

### 4. `src/components/VisitHistory.jsx` - Storico visite

Lista:
- Date visite
- Motivi
- Link a dettaglio
- Filtri per data

### 5. `src/components/PatientStats.jsx` - Statistiche paziente

Mostra:
- Totale misurazioni
- Ultima visita
- Parametri fuori range
- Trend
- Alert

### 6. `src/utils/pdfGenerator.js` - Generazione PDF

Funzioni:
- `generatePatientReport(patient, measurements, visits)`
- Usa jsPDF o react-pdf
- Include grafici, dati, storico

---

## 📦 DIPENDENZE DA AGGIUNGERE

```json
{
  "dependencies": {
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.0",
    "recharts": "^2.10.3"  // già presente
  }
}
```

Installazione:
```bash
npm install jspdf jspdf-autotable
```

---

## 🔄 MIGRAZIONE DATI ESISTENTI

Se ci sono già misurazioni salvate senza `patientId`, serve una migrazione:

```javascript
// In MedicalContext, dopo il caricamento
useEffect(() => {
  const measurements = JSON.parse(localStorage.getItem('medicalMeasurements') || '[]');
  
  // Se ci sono misurazioni senza patientId
  const needsMigration = measurements.some(m => !m.patientId);
  
  if (needsMigration) {
    // Crea un paziente "Anonimo" o chiedi all'utente
    // Assegna tutte le misurazioni a quel paziente
    // Aggiorna localStorage
  }
}, []);
```

---

## ✅ CHECKLIST IMPLEMENTAZIONE

- [x] PatientContext creato
- [x] PatientForm creato
- [x] Patients page creata
- [x] patientUtils creati
- [ ] App.js aggiornato (PatientProvider + route)
- [ ] Header aggiornato (link + indicatore paziente)
- [ ] MedicalContext aggiornato (filtro per paziente)
- [ ] StatusOverview aggiornato (usa paziente attivo)
- [ ] Chart aggiornato (filtra per paziente)
- [ ] Dashboard aggiornato (check paziente selezionato)
- [ ] PatientDetail creato
- [ ] VisitForm creato
- [ ] VisitHistory creato
- [ ] PatientStats creato
- [ ] PDF generator creato
- [ ] Dipendenze installate
- [ ] Testing completo

---

## 🎯 PROSSIMI PASSI

1. Aggiorna `App.js` con PatientProvider e route
2. Aggiorna `Header.jsx` con link e indicatore paziente
3. Modifica `MedicalContext.jsx` per filtrare per paziente
4. Aggiorna tutti i componenti che usano measurements
5. Crea i componenti rimanenti
6. Testa workflow completo
7. Genera PDF
8. Deploy

---

**Status:** Implementazione Base Completata (40%)
**File Creati:** 4/10
**File da Modificare:** 6
**File da Creare:** 6
