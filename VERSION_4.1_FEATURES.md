# 🎯 AGGIORNAMENTO v4.1 - Range Personalizzato + PDF Semaforo + Tooltip

## ✨ NUOVE FUNZIONALITÀ IMPLEMENTATE

### 1️⃣ **Range Personalizzato = Setpoint**
### 2️⃣ **PDF con Colori Semaforo**
### 3️⃣ **Tooltip Informativi in Analytics**
### 4️⃣ **Range Personalizzato Sempre Visibile**

---

## 1️⃣ RANGE PERSONALIZZATO BASATO SU SETPOINT

### ❌ PRIMA (v4.0):
```javascript
Range Personalizzato = Media ± 1.5×SD
// Media semplice di tutti i valori
```

**Problema:** Influenzato da outlier, non considerava metodi robusti

### ✅ ADESSO (v4.1):
```javascript
Range Personalizzato = Setpoint ± 1.5×SD
// Setpoint da Robust IQR o GMM
```

**Vantaggi:**
- ✅ Usa setpoint robusto (immune outlier)
- ✅ Metodo automatico (Robust < 20, GMM ≥ 20)
- ✅ Rispetta includedInFormula
- ✅ Più accurato per paziente specifico

### Implementazione:

**File:** `src/context/MedicalContext.jsx`

```javascript
const calculateCustomRange = (parameterName, patientId = null) => {
  // USA SETPOINT invece di media semplice
  const setpointResult = calculateSetpointHybrid(paramMeasurements);
  
  const { setpoint, std } = setpointResult;
  const multiplier = 1.5; // O da formula parametro
  
  return {
    min: setpoint - (multiplier * std),
    max: setpoint + (multiplier * std),
    mean: setpoint,  // Ora è setpoint!
    sd: std,
    method: 'robust' | 'gmm'  // Metodo usato
  };
};
```

---

## 2️⃣ PDF CON COLORI SEMAFORO

### 🚦 Legenda Colori:

- 🟢 **Verde** = Valore dentro ENTRAMBI i range (Ottimale)
- 🟡 **Giallo** = Valore dentro UN SOLO range (Attenzione)
- 🔴 **Rosso** = Valore fuori da ENTRAMBI i range (Critico)

### Implementazione:

**File:** `src/utils/pdfGenerator.js`

**Funzione Helper:**
```javascript
const getTrafficLightColor = (value, standardRange, customRange) => {
  const inStandardRange = standardRange && 
    value >= standardRange.min && value <= standardRange.max;
  
  const inCustomRange = customRange && 
    value >= customRange.min && value <= customRange.max;
  
  // Verde: dentro entrambi
  if (inStandardRange && inCustomRange) {
    return [34, 197, 94]; // green-500
  }
  // Giallo: dentro uno solo
  if (inStandardRange || inCustomRange) {
    return [234, 179, 8]; // yellow-500
  }
  // Rosso: fuori da entrambi
  return [239, 68, 68]; // red-500
};
```

**Applicazione alla Tabella:**
```javascript
doc.autoTable({
  // ... configurazione tabella
  didParseCell: function(data) {
    if (data.section === 'body' && data.column.index === 1) { // Colonna Valore
      const color = getTrafficLightColor(
        measurement.value,
        standardRange,
        customRange
      );
      
      data.cell.styles.fillColor = color;  // Colore cella
      data.cell.styles.textColor = [255, 255, 255]; // Testo bianco
      data.cell.styles.fontStyle = 'bold';
    }
  }
});
```

### PDF Output Esempio:

```
┌─────────────────────────────────────────┐
│ Glicemia                                │
├─────┬──────────┬──────────┬─────────────┤
│Data │  Valore  │Range Std │Range Pers   │
├─────┼──────────┼──────────┼─────────────┤
│15/01│🟢 85 mg/dL│  ✓ SÌ   │   ✓ SÌ      │
│14/01│🟡 105mg/dL│  ✓ SÌ   │   ✗ NO      │
│13/01│🔴 180mg/dL│  ✗ NO   │   ✗ NO      │
└─────┴──────────┴──────────┴─────────────┘

Legenda:
🟢 Ottimale (in entrambi i range)
🟡 Attenzione (in un solo range)
🔴 Critico (fuori range)

Range Personalizzato (GMM): 78.5-91.5 mg/dL
  (Setpoint: 85.0 ± 6.5)
Range Standard: 70-100 mg/dL
```

---

## 3️⃣ TOOLTIP INFORMATIVI IN ANALYTICS

### 📚 Tooltip Aggiunti:

#### A) **Setpoint Biologico**
**Hover su** 🔍 **accanto a "Setpoint Biologico"**

**Contenuto:**
```
Setpoint Biologico

Il setpoint è il valore "normale" individuale del parametro 
per questo paziente, calcolato automaticamente usando:

• Media Robusta (IQR) se < 20 misurazioni: 
  elimina automaticamente gli outlier usando i quartili

• Gaussian Mixture Model (GMM) se ≥ 20 misurazioni: 
  identifica gruppi distinti (es: pre/post terapia)

Il setpoint è più affidabile della semplice media perché 
considera la variabilità individuale.
```

#### B) **CV (Coefficient of Variation)**
**Hover su** 🔍 **accanto a "CV"**

**Contenuto:**
```
Coefficient of Variation (CV)

Il CV misura la variabilità del parametro:

• < 5%: Molto stabile ✅ (controllo eccellente)
• 5-10%: Stabile ✅ (buona gestione)
• 10-15%: Moderatamente variabile ⚠️
• 15-20%: Variabile ⚠️ (richiede attenzione)
• > 20%: Molto variabile ❌ (verificare condizioni)

CV = (Deviazione Standard / Media) × 100
```

#### C) **Cluster GMM**
**Hover su** 🔍 **accanto a "X Clusters GMM"**

**Contenuto:**
```
Cluster GMM

Il Gaussian Mixture Model identifica automaticamente 
gruppi (cluster) nei dati:

• 1 Cluster: Paziente stabile, valori omogenei
• 2 Cluster: Due fasi distinte 
  (es: pre/post terapia, prima/dopo intervento)
• 3 Cluster: Tre fasi 
  (es: baseline, intervento, stabilizzazione)

Il sistema seleziona automaticamente il modello migliore 
usando il criterio AIC (Akaike Information Criterion).
```

#### D) **Outlier Rimossi (Media Robusta)**
**Hover su** 🔍 **accanto a "X valori anomali rimossi"**

**Contenuto:**
```
Outlier Rimossi

La Media Robusta (IQR) rimuove automaticamente i valori 
anomali usando il metodo dei quartili:

Metodo Tukey's Fences:
• Q1 = Primo Quartile (25%)
• Q3 = Terzo Quartile (75%)
• IQR = Q3 - Q1
• Outlier se: valore < Q1-1.5×IQR o valore > Q3+1.5×IQR

Questo garantisce che errori di misura o valori 
eccezionali non influenzino il setpoint.
```

#### E) **Range Personalizzato**
**Hover su** 🔍 **accanto a "Range Personalizzato"**

**Contenuto:**
```
Range Personalizzato

Il Range Personalizzato è calcolato dal setpoint 
individuale del paziente:

Formula: Setpoint ± 1.5×SD

Metodo: Gaussian Mixture Model / Media Robusta (IQR)

Questo range riflette la variabilità individuale del 
paziente ed è più accurato del range standard per 
valutare il controllo personale del parametro.
```

### Implementazione:

**File:** `src/components/InfoTooltip.jsx`

```jsx
const InfoTooltip = ({ title, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <HelpCircle size={16} />
      </button>

      {isVisible && (
        <div className="tooltip-popup">
          {title && <div className="font-bold">{title}</div>}
          <div>{children}</div>
        </div>
      )}
    </div>
  );
};
```

**Uso:**
```jsx
<InfoTooltip title="Setpoint Biologico">
  Spiegazione dettagliata del setpoint...
</InfoTooltip>
```

---

## 4️⃣ RANGE PERSONALIZZATO SEMPRE VISIBILE

### Prima (v4.0):
```
Range visualizzato solo nel PDF o se richiesto
```

### Adesso (v4.1):
```
Range Personalizzato sempre visibile in Analytics,
subito dopo il Range Standard
```

### Visualizzazione:

```
┌───────────────────────────────┐
│ Range Standard                │
│ ═══════════════════════       │
│ 70          100      mg/dL    │
└───────────────────────────────┘

┌───────────────────────────────┐
│ Range Personalizzato 🔍       │
│    ═══════════════            │
│ 78.5        91.5     mg/dL    │
│ (GMM • high confidence)       │
└───────────────────────────────┘
```

**Caratteristiche:**
- ✅ Barra visuale blu
- ✅ Valori min/max
- ✅ Metodo (GMM/Robust)
- ✅ Confidenza
- ✅ Tooltip con spiegazione

### Implementazione:

```jsx
{(() => {
  const customRange = calculateCustomRange(param.name, activePatient?.id);
  if (!customRange) return null;
  
  return (
    <div className="pt-3 border-t border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-xs font-semibold">Range Personalizzato</div>
        <InfoTooltip title="Range Personalizzato">
          Spiegazione...
        </InfoTooltip>
      </div>
      
      {/* Barra visuale */}
      <div className="relative h-2 bg-gray-200 rounded-full">
        <div className="absolute h-full bg-blue-500 rounded-full" 
             style={{ left: '...', width: '...' }} />
      </div>
      
      {/* Valori */}
      <div className="flex justify-between text-xs">
        <span>{customRange.min.toFixed(1)}</span>
        <span>{customRange.max.toFixed(1)}</span>
      </div>
      
      {/* Info metodo */}
      <div className="text-xs text-center">
        ({customRange.method} • {customRange.confidence} confidence)
      </div>
    </div>
  );
})()}
```

---

## 📦 FILE MODIFICATI/CREATI

### File Modificati:

**1. `src/context/MedicalContext.jsx`**
- ✅ `calculateCustomRange()` usa setpoint invece di media
- ✅ Restituisce anche `method` e `confidence`

**2. `src/utils/pdfGenerator.js`**
- ✅ Import `calculateSetpoint`
- ✅ Funzione `getTrafficLightColor()`
- ✅ Range personalizzato da setpoint
- ✅ Colori semaforo nella tabella (didParseCell)
- ✅ Legenda semaforo dopo ogni tabella
- ✅ Info setpoint (metodo + valore)

**3. `src/pages/Analytics.jsx`**
- ✅ Import `InfoTooltip` e `calculateCustomRange`
- ✅ Tooltip su Setpoint, CV, GMM, Outlier, Range
- ✅ Range Personalizzato sempre visibile
- ✅ Barra visuale range personalizzato

### File Creati:

**4. `src/components/InfoTooltip.jsx`**
- ✅ Componente tooltip riutilizzabile
- ✅ Posizione configurabile (top/bottom/left/right)
- ✅ Hover e click per mostrare
- ✅ Stile dark con freccia

---

## 🎨 ESEMPIO VISUALE ANALYTICS

```
┌──────────────────────────────────────────┐
│ 🔵 Glicemia                         📅   │
├──────────────────────────────────────────┤
│ ╔═ SETPOINT BIOLOGICO 🔍 ═══════════╗   │
│ ║ 🎯 90.2 mg/dL                      ║   │
│ ║ CV: 3.8% 🔍 • Stabile              ║   │
│ ║                                    ║   │
│ ║ 📊 2 Clusters GMM 🔍               ║   │
│ ║ Cluster 1: 165 mg/dL (25%)         ║   │
│ ║ Cluster 2: 90 mg/dL (75%)          ║   │
│ ║                                    ║   │
│ ║ Gaussian Mixture Model             ║   │
│ ║ Confidenza: ✅ Alta                ║   │
│ ╚════════════════════════════════════╝   │
├──────────────────────────────────────────┤
│ Ultima Misurazione: 92 mg/dL             │
│                                          │
│ Media: 91.5 mg/dL                        │
│ Min-Max: 75-180 mg/dL                    │
│ Misurazioni: 25                          │
├──────────────────────────────────────────┤
│ Range Standard                           │
│ ═══════════════════════                  │
│ 70            100         mg/dL          │
├──────────────────────────────────────────┤
│ Range Personalizzato 🔍                  │
│     ═══════════════                      │
│ 78.5          91.5        mg/dL          │
│ (GMM • high confidence)                  │
├──────────────────────────────────────────┤
│ 📅 Click per visualizzare calendario     │
└──────────────────────────────────────────┘

🔍 = Tooltip disponibile (hover per info)
```

---

## 🧪 TESTING

### Test Range Personalizzato:

```bash
1. Inserisci 8 misurazioni per un paziente
2. Vai su Analytics
3. Verifica:
   ✓ Range Personalizzato visibile
   ✓ Metodo = "Robust" (< 20 mis)
   ✓ Valori basati su setpoint robusto
   
4. Aggiungi altre 15 misurazioni (tot 23)
5. Ricarica Analytics
6. Verifica:
   ✓ Range Personalizzato aggiornato
   ✓ Metodo = "GMM" (≥ 20 mis)
   ✓ Se 2 cluster, range dal dominante
```

### Test PDF Semaforo:

```bash
1. Crea paziente con misurazioni miste:
   - 3 valori verdi (in entrambi range)
   - 2 valori gialli (in un solo range)
   - 1 valore rosso (fuori entrambi)
   
2. Esporta PDF
3. Verifica:
   ✓ Colonna "Valore" colorata
   ✓ Verde per valori ottimali
   ✓ Giallo per valori attenzione
   ✓ Rosso per valori critici
   ✓ Legenda sotto tabella
   ✓ Info setpoint presente
```

### Test Tooltip:

```bash
1. Vai su Analytics
2. Hover su 🔍 accanto a "Setpoint Biologico"
3. Verifica:
   ✓ Tooltip appare
   ✓ Testo leggibile
   ✓ Posizione corretta
   
4. Prova tutti i tooltip:
   ✓ CV
   ✓ Cluster GMM (se presente)
   ✓ Outlier (se presenti)
   ✓ Range Personalizzato
```

---

## 💡 ESEMPI PRATICI

### Esempio 1: Paziente Stabile

**Input:** 25 misurazioni glicemia tutte 85-95 mg/dL

**Output Analytics:**
```
Setpoint: 90.2 mg/dL
CV: 3.1% • Molto Stabile
1 Cluster GMM
Range Personalizzato: 85.5-94.9 mg/dL (GMM)
```

**PDF:**
- Tutti valori 🟢 verdi
- Legenda: "Ottimale"
- Range Pers: 85.5-94.9 (GMM, Setpoint: 90.2±4.7)

---

### Esempio 2: Cambio Terapia

**Input:** 30 misurazioni (15 pre: 150-180, 15 post: 85-95)

**Output Analytics:**
```
Setpoint: 89.5 mg/dL
CV: 3.5% • Stabile
2 Clusters GMM
  Cluster 1: 165 mg/dL (50%)
  Cluster 2: 89.5 mg/dL (50%) ← Dominante
Range Personalizzato: 80-99 mg/dL (GMM)
```

**PDF:**
- Pre-terapia: 15 valori 🔴 rossi
- Post-terapia: 15 valori 🟢 verdi
- Legenda mostra cambiamento
- Range Pers da cluster post-terapia

---

### Esempio 3: Paziente con Outlier

**Input:** 8 misurazioni (7 normali: 85-92, 1 outlier: 300)

**Output Analytics:**
```
Setpoint: 88.1 mg/dL
CV: 2.3% • Molto Stabile
1 valore anomalo rimosso 🔍
Media Robusta (IQR)
Range Personalizzato: 83-93 mg/dL (Robust)
```

**PDF:**
- 7 valori 🟢 verdi
- 1 valore 🔴 rosso (300)
- Range calcolato SENZA il 300
- Legenda indica outlier rimosso

---

## 📚 VANTAGGI COMPLESSIVI

### Per l'Operatore:

✅ **Range personalizzato automatico** - Non serve calcolare manualmente  
✅ **PDF più chiaro** - Colori immediati da leggere  
✅ **Tooltip informativi** - Impara il significato statistico  
✅ **Tutto visibile** - Range sempre in vista  

### Per il Paziente:

✅ **Report PDF colorato** - Capisce subito i valori  
✅ **Range individuale** - Non generico  
✅ **Controllo migliore** - Sa dove deve stare  

### Per il Medico:

✅ **Interpretazione statistica** - Tooltip spiegano metodi  
✅ **Cluster evidenti** - Vede cambi terapia  
✅ **CV chiaro** - Stabilità del controllo  
✅ **PDF professionale** - Pronto per cartella clinica  

---

**Status:** ✅ IMPLEMENTATO  
**Versione:** 4.1 - Enhanced Range & PDF  
**Data:** 3 Febbraio 2025  

🎯 **Tutte le funzionalità richieste sono state implementate!**
