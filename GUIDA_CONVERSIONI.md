# 🔄 Guida Sistema Conversione Unità

## 📊 Panoramica

La versione 2.2 include un **sistema completo di conversione unità di misura** che permette di:
- Scegliere tra diverse unità per ogni parametro
- Inserire misurazioni in qualsiasi unità supportata
- Conversione automatica nell'unità predefinita
- Visualizzazione dell'unità originale nelle misurazioni

---

## 🎯 Categorie di Unità Supportate

### 1. **Glicemia** (glucose)
- **mg/dL** (milligrammi per decilitro) - Predefinita
- **mmol/L** (millimoli per litro)

**Conversione:** 1 mg/dL = 0.0555 mmol/L

**Esempio:**
- Input: `180 mg/dL` → Salvato come: `180 mg/dL`
- Input: `10 mmol/L` → Salvato come: `180.18 mg/dL` (conversione automatica)

---

### 2. **Colesterolo** (cholesterol)
- **mg/dL** - Predefinita
- **mmol/L**

**Conversione:** 1 mg/dL = 0.0259 mmol/L

**Esempio:**
- Input: `200 mg/dL` → Salvato come: `200 mg/dL`
- Input: `5.2 mmol/L` → Salvato come: `201.08 mg/dL`

---

### 3. **Emoglobina** (hemoglobin)
- **g/dL** (grammi per decilitro) - Predefinita
- **g/L** (grammi per litro)
- **mmol/L** (millimoli per litro)

**Conversioni:**
- 1 g/dL = 10 g/L
- 1 g/dL = 0.6206 mmol/L

**Esempio:**
- Input: `14 g/dL` → Salvato come: `14 g/dL`
- Input: `140 g/L` → Salvato come: `14 g/dL`
- Input: `8.7 mmol/L` → Salvato come: `14.02 g/dL`

---

### 4. **Ormoni Tiroidei** (thyroid)
- **mIU/L** - Predefinita
- **µIU/mL** (equivalente)

**Conversione:** 1 mIU/L = 1 µIU/mL (unità equivalenti)

---

### 5. **Creatinina** (creatinine)
- **mg/dL** - Predefinita
- **µmol/L** (micromoli per litro)

**Conversione:** 1 mg/dL = 88.42 µmol/L

**Esempio:**
- Input: `1.0 mg/dL` → Salvato come: `1.0 mg/dL`
- Input: `88.4 µmol/L` → Salvato come: `1.0 mg/dL`

---

### 6. **Azotemia/Urea** (urea)
- **mg/dL** - Predefinita
- **mmol/L**

**Conversione:** 1 mg/dL = 0.357 mmol/L

---

### 7. **Generica** (generic)
Tutte le unità sono disponibili ma **senza conversione automatica**:
- mg/dL, g/dL, g/L, mmol/L, µmol/L
- mIU/L, µIU/mL, U/L
- ng/mL, pg/mL
- %, mm/h

---

## 🚀 Come Usare il Sistema

### 1️⃣ Aggiungere un Parametro con Conversioni

**Passo 1:** Vai su **Impostazioni → Gestione Parametri**

**Passo 2:** Clicca **"Aggiungi Parametro"**

**Passo 3:** Compila il form:
```
Nome: Glicemia
Categoria: Glicemia (glucose)  ← Il sistema rileva automaticamente!
Unità Predefinita: mg/dL
Range: 70 - 100
```

**Risultato:** Il parametro supporta automaticamente `mg/dL` e `mmol/L`

---

### 2️⃣ Inserire Misurazione con Conversione

**Esempio A - Glicemia in mmol/L:**

1. Seleziona parametro: **Glicemia**
2. Inserisci valore: `10.0`
3. Seleziona unità: **mmol/L** (dal menu a tendina)
4. Vedrai preview: `🔄 Conversione: 10.0 mmol/L = 180.18 mg/dL`
5. Clicca "Aggiungi Misurazione"

**Cosa succede:**
- Valore salvato: `180.18 mg/dL` (unità predefinita)
- Valore originale conservato: `10.0 mmol/L`
- Nella lista appare: `180.18 mg/dL (10.0 mmol/L)`

---

**Esempio B - Emoglobina in g/L:**

1. Parametro: **Emoglobina**
2. Valore: `140`
3. Unità: **g/L**
4. Preview: `🔄 Conversione: 140 g/L = 14.0 g/dL`
5. Salva

**Risultato:** Grafico e analisi usano sempre `14.0 g/dL` per coerenza

---

### 3️⃣ Rilevamento Automatico Categoria

Il sistema **rileva automaticamente** la categoria quando digiti il nome:

| Nome Parametro | Categoria Rilevata | Unità Disponibili |
|----------------|-------------------|-------------------|
| Glicemia | Glicemia | mg/dL, mmol/L |
| Glucosio | Glicemia | mg/dL, mmol/L |
| Colesterolo LDL | Colesterolo | mg/dL, mmol/L |
| Emoglobina A1c | Emoglobina | g/dL, g/L, mmol/L |
| TSH | Ormoni Tiroidei | mIU/L, µIU/mL |
| Creatinina | Creatinina | mg/dL, µmol/L |
| VES | Generica | Tutte (no conversione) |

---

## 💡 Casi d'Uso Pratici

### Scenario 1: Laboratorio Europeo
**Problema:** Il referto ha glicemia in mmol/L (standard europeo)

**Soluzione:**
1. Inserisci: `5.5 mmol/L`
2. Sistema converte: `99.1 mg/dL`
3. Tutti i grafici usano mg/dL per coerenza

---

### Scenario 2: Mix di Referti
**Problema:** Alcuni referti in mg/dL, altri in mmol/L

**Soluzione:**
- Scegli l'unità giusta per ogni misurazione
- Il sistema normalizza tutto nell'unità predefinita
- Grafici e statistiche sempre coerenti

---

### Scenario 3: Parametro Personalizzato
**Problema:** Voglio aggiungere "Vitamina D" con ng/mL

**Soluzione:**
1. Aggiungi parametro: "Vitamina D"
2. Categoria: **Generica**
3. Unità: **ng/mL**
4. Inserisci misurazioni sempre in ng/mL (nessuna conversione)

---

## 🔧 Dettagli Tecnici

### Architettura

```
src/utils/unitConversions.js
├── unitCategories         ← Definizione categorie e conversioni
├── detectCategory()       ← Rilevamento automatico categoria
├── convertUnit()          ← Funzione conversione valori
├── getDefaultUnit()       ← Unità predefinita per categoria
└── getAvailableUnits()    ← Lista unità disponibili
```

### Struttura Dati Parametro

```javascript
{
  id: "param_1",
  name: "Glicemia",
  unit: "mg/dL",                    // Unità predefinita
  unitCategory: "glucose",          // Categoria conversione
  availableUnits: ["mg/dL", "mmol/L"], // Unità supportate
  standardRange: { min: 70, max: 100 },
  customFormula: "mean ± 1.5*sd",
  color: "#3b82f6"
}
```

### Struttura Dati Misurazione

```javascript
{
  id: 1642512000000,
  parameter: "Glicemia",
  value: 180.18,                // Valore convertito (mg/dL)
  originalValue: 10.0,          // Valore originale
  originalUnit: "mmol/L",       // Unità originale
  date: "2025-01-19",
  includedInFormula: true
}
```

---

## ✅ Checklist Utilizzo

- [ ] Parametro configurato con categoria corretta
- [ ] Unità predefinita scelta
- [ ] Unità disponibili verificate
- [ ] Test conversione con valore noto
- [ ] Verifica preview conversione nel form
- [ ] Controllo valore salvato corretto
- [ ] Grafici mostrano valori coerenti

---

## ⚠️ Limitazioni

1. **Conversioni disponibili solo per categorie specifiche**
   - Categoria "Generica" non ha conversioni automatiche

2. **Precisione decimale**
   - Le conversioni mantengono 2-4 decimali
   - Possibili lievi differenze per arrotondamenti

3. **Unità personalizzate**
   - Se aggiungi unità non standard, nessuna conversione automatica

---

## 🆘 Risoluzione Problemi

### ❓ "Non vedo il menu a tendina unità"
**Causa:** Il parametro ha solo un'unità disponibile  
**Soluzione:** Normale! Se c'è solo un'unità, appare come testo fisso

### ❓ "La conversione sembra sbagliata"
**Causa:** Categoria non corretta  
**Soluzione:** 
1. Vai in Impostazioni → Gestione Parametri
2. Modifica il parametro
3. Cambia categoria e unità predefinita
4. Salva modifiche

### ❓ "Voglio aggiungere nuove unità"
**Causa:** Limite del sistema attuale  
**Soluzione:** 
- Usa categoria "Generica" con l'unità desiderata
- O richiedi una feature per aggiungere nuove categorie

---

## 🔮 Prossimi Sviluppi

Possibili miglioramenti futuri:
- [ ] Configurazione conversioni personalizzate
- [ ] Più categorie di parametri
- [ ] Export con unità originali
- [ ] Visualizzazione doppia unità sui grafici
- [ ] Conversione batch di misurazioni esistenti

---

**Versione Sistema: 2.2**  
**Ultimo Aggiornamento: 19 Gennaio 2025**
