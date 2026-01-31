# 🏥 GESTIONE PAZIENTI - ISTRUZIONI COMPLETAMENTO

## 📦 COSA È STATO FATTO (Versione Parziale)

### ✅ Infrastruttura Base Creata:

1. **Context e Utilities:**
   - ✅ `PatientContext.jsx` - Gestione completa pazienti
   - ✅ `patientUtils.js` - Validazione CF, utilities

2. **Componenti Base:**
   - ✅ `PatientForm.jsx` - Form aggiunta/modifica paziente completo
   - ✅ `Patients.jsx` - Pagina lista pazienti con ricerca

3. **App Setup:**
   - ✅ `App.js` - PatientProvider aggiunto + route /patients

### 🔄 Funzionalità Implementate:

- ✅ Registrazione pazienti (nome, cognome, CF, data nascita, sesso)
- ✅ Validazione Codice Fiscale
- ✅ Auto-compilazione sesso e data da CF
- ✅ Campi opzionali (email, telefono, indirizzo)
- ✅ Tags/Categorie patologie
- ✅ Note, allergie, terapie
- ✅ Upload avatar/foto
- ✅ Ricerca pazienti (nome, cognome, CF)
- ✅ Filtro per categoria
- ✅ Alert pazienti non visti da 30+ giorni
- ✅ Contatore misurazioni per paziente

---

## ⚠️ COSA MANCA (Da Completare)

### 1. Header con Indicatore Paziente Attivo

**File:** `src/components/Header.jsx`

**Aggiungi:**
- Link "Pazienti" nel menu
- Banner con paziente attivo visualizzato

**Codice da aggiungere:**
```javascript
import { Users } from 'lucide-react';
import { usePatients } from '../context/PatientContext';

// Nel componente Header:
const { getActivePatient } = usePatients();
const activePatient = getActivePatient();

// Nel render, aggiungi link:
<NavLink to="/patients">
  <Users size={20} />
  Pazienti
</NavLink>

// Dopo l'header, aggiungi banner paziente:
{activePatient && (
  <div className="bg-primary-50 px-4 py-2 border-b border-primary-200">
    <div className="max-w-7xl mx-auto flex items-center gap-2">
      <User size={16} />
      <span className="text-sm font-medium">
        Paziente: {activePatient.cognome} {activePatient.nome}
      </span>
    </div>
  </div>
)}
```

---

### 2. MedicalContext - Filtro Misurazioni per Paziente

**File:** `src/context/MedicalContext.jsx`

**Modifiche necessarie:**

**A. Import PatientContext:**
```javascript
import { usePatients } from './PatientContext';

// PROBLEMA: usePatients() non funziona fuori da un componente React!
```

**SOLUZIONE ALTERNATIVA - Passa patientId da props:**

1. In `addMeasurement`:
```javascript
const addMeasurement = (measurement, patientId) => {
  setMeasurements(prev => [...prev, {
    ...measurement,
    id: Date.now(),
    patientId: patientId || null,  // ← AGGIUNGI
    value: parseFloat(measurement.value),
    includedInFormula: true
  }]);
};
```

2. In ogni componente che chiama `addMeasurement`:
```javascript
const { getActivePatient } = usePatients();
const activePatient = getActivePatient();

addMeasurement({
  parameter: '...',
  value: '...',
  date: '...'
}, activePatient?.id);  // ← PASSA patientId
```

3. Modifica `calculateCustomRange`:
```javascript
const calculateCustomRange = (parameterName, patientId = null) => {
  const paramMeasurements = measurements.filter(
    m => m.parameter === parameterName && 
         m.includedInFormula &&
         (!patientId || m.patientId === patientId)  // ← FILTRA
  );
  // ... resto ...
};
```

---

### 3. Componenti - Filtra per Paziente Attivo

**File da modificare:**
- `src/components/StatusOverview.jsx`
- `src/components/Chart.jsx`
- `src/components/MeasurementForm.jsx`

**Pattern da seguire:**

```javascript
import { usePatients } from '../context/PatientContext';

const MyComponent = () => {
  const { measurements } = useMedical();
  const { getActivePatient } = usePatients();
  
  const activePatient = getActivePatient();
  
  // Filtra misurazioni
  const patientMeasurements = measurements.filter(
    m => m.patientId === activePatient?.id
  );
  
  // Usa patientMeasurements invece di measurements
};
```

---

### 4. Dashboard - Gestisci Nessun Paziente

**File:** `src/pages/Dashboard.jsx`

**Aggiungi all'inizio:**
```javascript
import { usePatients } from '../context/PatientContext';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { getActivePatient } = usePatients();
  const navigate = useNavigate();
  const activePatient = getActivePatient();
  
  if (!activePatient) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Users size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">
          Nessun paziente selezionato
        </h2>
        <p className="text-gray-500 mb-6">
          Seleziona un paziente dalla lista per iniziare
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
  
  // Resto del componente normale...
};
```

---

### 5. Componenti Avanzati da Creare

#### A. `src/components/VisitForm.jsx`
Form per registrare visite:
- Data visita
- Motivo (dropdown: Controllo, Urgenza, Follow-up, Altro)
- Note
- Parametri misurati
- Diagnosi
- Prescrizioni

#### B. `src/components/VisitHistory.jsx`
Storico visite paziente:
- Lista visite ordinate per data
- Filtri (data, motivo)
- Click per dettaglio
- Export singola visita

#### C. `src/components/PatientStats.jsx`
Statistiche paziente:
- Card con metriche:
  - Totale visite
  - Ultima visita (giorni fa)
  - Totale misurazioni
  - Parametri fuori range (count)
- Trend settimanale/mensile
- Alert attivi

#### D. `src/utils/pdfGenerator.js`
Generazione PDF report paziente:

```bash
npm install jspdf jspdf-autotable
```

```javascript
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePatientPDF = (patient, measurements, visits) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Report Paziente', 14, 20);
  
  // Dati paziente
  doc.setFontSize(12);
  doc.text(`Nome: ${patient.cognome} ${patient.nome}`, 14, 35);
  doc.text(`CF: ${patient.codiceFiscale}`, 14, 42);
  doc.text(`Nato il: ${patient.dataNascita}`, 14, 49);
  
  // Tabella misurazioni
  const measurementData = measurements.map(m => [
    m.date,
    m.parameter,
    m.value,
    m.unit
  ]);
  
  doc.autoTable({
    head: [['Data', 'Parametro', 'Valore', 'Unità']],
    body: measurementData,
    startY: 60
  });
  
  // Salva
  doc.save(`${patient.cognome}_${patient.nome}_report.pdf`);
};
```

#### E. `src/pages/PatientDetail.jsx`
Pagina dettaglio paziente completo:
- Header con foto, dati, pulsanti azioni
- Tab: Misurazioni / Visite / Statistiche / Note
- Grafici trend
- Export PDF

---

### 6. Migrazione Dati Esistenti

Se ci sono misurazioni salvate senza `patientId`, aggiungi in `MedicalContext`:

```javascript
useEffect(() => {
  const measurements = JSON.parse(localStorage.getItem('medicalMeasurements') || '[]');
  
  if (measurements.length > 0 && measurements.some(m => !m.patientId)) {
    // Crea paziente "Dati Esistenti"
    const existingDataPatient = {
      id: 'existing_data_patient',
      nome: 'Dati',
      cognome: 'Esistenti',
      codiceFiscale: 'XXXXXXXXXXX',
      dataNascita: '1980-01-01',
      sesso: 'M',
      createdAt: new Date().toISOString()
    };
    
    // Salva in PatientContext
    // Assegna tutte le misurazioni a questo paziente
    const updated Measurements = measurements.map(m => ({
      ...m,
      patientId: m.patientId || existingDataPatient.id
    }));
    
    localStorage.setItem('medicalMeasurements', JSON.stringify(updatedMeasurements));
  }
}, []);
```

---

## 🚀 WORKFLOW COMPLETO ATTESO

### Flusso Operatore:

1. **Primo Accesso:**
   - Operatore apre app
   - Va su "Pazienti"
   - Clicca "Nuovo Paziente"
   - Compila form (nome, CF, ecc.)
   - Salva paziente

2. **Selezione Paziente:**
   - Lista mostra tutti i pazienti
   - Ricerca per nome/CF
   - Clicca su paziente
   - Dashboard si apre con dati paziente

3. **Inserimento Dati:**
   - Header mostra paziente attivo
   - Inserisce misurazioni (solo per quel paziente)
   - Visualizza grafici (solo dati paziente)
   - Registra visita (opzionale)

4. **Gestione Multi-Paziente:**
   - Cambia paziente dalla lista
   - Dati si aggiornano automaticamente
   - Ogni paziente ha i suoi dati isolati

5. **Report & Export:**
   - Clicca "Export PDF" su paziente
   - Genera report completo
   - Include grafici, misurazioni, visite

---

## ✅ TESTING CHECKLIST

### Test Base:
- [ ] Creazione nuovo paziente
- [ ] Validazione CF corretta
- [ ] Auto-fill da CF funziona
- [ ] Ricerca pazienti per nome
- [ ] Ricerca per CF
- [ ] Filtro per categoria/tag
- [ ] Selezione paziente
- [ ] Header mostra paziente attivo
- [ ] Dashboard richiede paziente
- [ ] Inserimento misurazione per paziente
- [ ] Misurazioni filtrate per paziente
- [ ] Grafici mostrano solo dati paziente
- [ ] Cambio paziente aggiorna dati
- [ ] Alert pazienti da 30+ giorni

### Test Avanzati:
- [ ] Upload avatar
- [ ] Modifica paziente
- [ ] Eliminazione paziente
- [ ] Eliminazione elimina misurazioni
- [ ] Export PDF funziona
- [ ] Registrazione visite
- [ ] Storico visite
- [ ] Statistiche paziente
- [ ] 100+ pazienti performance

---

## 📊 STIMA COMPLETAMENTO

**Lavoro Rimanente:**
- Modifiche file esistenti: ~2 ore
- Componenti avanzati: ~3 ore
- PDF generator: ~1 ora
- Testing: ~1 ora
- **Totale: ~7 ore**

---

## 💡 SUGGERIMENTI

1. **Testa subito la base:**
   - Completa modifiche Header, Dashboard, MedicalContext
   - Prova flusso: crea paziente → seleziona → inserisci dati
   - Verifica che filtri funzionino

2. **Componenti avanzati dopo:**
   - Una volta che la base funziona
   - Aggiungi Visit, Stats, PDF step by step

3. **Performance:**
   - Con 100+ pazienti, localStorage potrebbe rallentare
   - Considera indicizzazione o pagination
   - O migra a Firebase in futuro

---

**Status Implementazione:** 40% Completato  
**Prossimo Step:** Modificare Header e MedicalContext  
**File Critici:** 6 file da modificare prima di testare
