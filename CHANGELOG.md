# 📝 CHANGELOG - Medical Tracker

## v2.1 - Gestione Parametri Dinamica (19 Gennaio 2025)

### 🆕 Nuove Funzionalità

#### Gestione Parametri Completa
- ✅ **Aggiungi parametri personalizzati** con nome, unità di misura e range
- ✅ **Modifica parametri esistenti** senza perdere i dati
- ✅ **Elimina parametri** (con conferma e rimozione dati associati)
- ✅ **Range personalizzabili** (min/max per popolazione generale)
- ✅ **Formula configurabile** (1σ, 1.5σ, 2σ)
- ✅ **Colori automatici** per distinguere i parametri

#### Interfaccia Migliorata
- 📊 Nuovo componente **ParameterManager** nella pagina Impostazioni
- 🎨 Form intuitivo per aggiunta/modifica parametri
- ⚠️ Conferme di sicurezza per eliminazioni
- 💾 Salvataggio automatico in localStorage

### 🔄 Modifiche

#### Sistema di Storage
- I parametri ora sono **dinamici** e salvati in localStorage
- Export/Import include sia parametri che misurazioni
- Retrocompatibilità con export v1.0 (solo misurazioni)

#### Struttura Dati
```javascript
// Nuovo formato export
{
  parameters: [...],     // Lista parametri configurati
  measurements: [...],   // Misurazioni
  exportDate: "...",    // Data export
  version: "2.1"        // Versione formato
}
```

### 💡 Esempi di Utilizzo

#### Aggiungere un nuovo parametro:
1. Vai su **Impostazioni**
2. Clicca **"Aggiungi Parametro"**
3. Compila:
   - Nome: "Emoglobina Glicata"
   - Unità: "%"
   - Range Min: 4.0
   - Range Max: 5.6
   - Formula: mean ± 1.5*sd
4. Clicca **"Aggiungi Parametro"**

#### Modificare un parametro:
1. Trova il parametro nella lista
2. Clicca l'icona ✏️ (Modifica)
3. Cambia i valori
4. Clicca **"Salva Modifiche"**

#### Eliminare un parametro:
1. Clicca l'icona 🗑️ (Elimina)
2. Conferma l'eliminazione
3. Tutte le misurazioni associate verranno rimosse

### ⚙️ Dettagli Tecnici

#### Nuovi File
- `src/components/ParameterManager.jsx` - Componente gestione parametri
- Aggiornato `src/context/MedicalContext.jsx` - CRUD parametri

#### Funzioni Aggiunte
- `addParameter(parameter)` - Aggiunge nuovo parametro
- `updateParameter(id, data)` - Modifica parametro esistente
- `deleteParameter(id)` - Elimina parametro e misurazioni

#### LocalStorage Keys
- `medicalParameters` - Parametri configurati
- `medicalMeasurements` - Misurazioni (invariato)

### 🔐 Sicurezza

- ✅ Conferma richiesta prima di eliminare parametri
- ✅ Warning sulla perdita dati associati
- ✅ Validazione form per campi obbligatori
- ✅ Gestione errori import/export

### 📦 Compatibilità

#### Retrocompatibilità
- ✅ Import di file v1.0 (solo misurazioni) funziona
- ✅ Parametri di default se localStorage vuoto
- ✅ Nessun breaking change per utenti esistenti

#### Migration da v2.0 a v2.1
Nessuna azione richiesta! All'avvio:
1. Se esistono parametri salvati → li carica
2. Se non esistono → carica parametri default (Glicemia, VES, ecc.)
3. Le misurazioni esistenti rimangono invariate

---

## v2.0 - Refactoring Completo (19 Gennaio 2025)

### 🎉 Highlights
- Architettura modulare completa
- React Router con 3 pagine
- Tailwind CSS configurato
- Context API per state management
- Mobile responsive perfetto

### ✨ Funzionalità
- Dashboard con grafici interattivi
- Pagina Analisi con statistiche
- Pagina Impostazioni
- Import/Export dati
- Animazioni fluide

---

## v1.0 - Versione Iniziale

### Funzionalità Base
- Inserimento misurazioni
- Grafico a linee
- Range standard e personalizzato
- Salvataggio localStorage
- 5 parametri predefiniti

---

## 🔮 Roadmap Futura

### v2.2 (Prossima)
- [ ] Esportazione PDF report
- [ ] Note personalizzate per misurazioni
- [ ] Notifiche e reminder

### v3.0 (Futura)
- [ ] Sistema multi-utente (Firebase)
- [ ] Gestione pazienti multipli
- [ ] Condivisione dati medico-paziente
- [ ] PWA con modalità offline

---

**Versione Corrente: 2.1**  
**Ultimo Aggiornamento: 19 Gennaio 2025**
