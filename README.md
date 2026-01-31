# 📊 Medical Tracker v2.0 - Refactored Edition

> **Nuova versione completamente refactored** con architettura modulare, Tailwind CSS configurato correttamente, React Router e design ottimizzato per mobile.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![React](https://img.shields.io/badge/react-18.2.0-61dafb)
![Tailwind](https://img.shields.io/badge/tailwind-3.3.6-38bdf8)

## 🆕 Novità Versione 2.0

### ✨ Refactoring Completo
- ✅ **Architettura modulare** - Componenti separati e riutilizzabili
- ✅ **Context API** - Gestione dello stato globale centralizzata
- ✅ **React Router** - Navigazione SPA con 3 pagine (Dashboard, Analisi, Impostazioni)
- ✅ **Tailwind CSS configurato** - PostCSS + Autoprefixer + theme personalizzato
- ✅ **Mobile-first design** - **FIX: Padding corretto su mobile** (niente più testo attaccato ai bordi!)
- ✅ **Animazioni fluide** - Transizioni e micro-interazioni
- ✅ **Componenti riutilizzabili** - Codice pulito e manutenibile

### 🎨 Miglioramenti UI/UX
- Nuova pagina **Analisi** con statistiche dettagliate e trend
- Pagina **Impostazioni** con info parametri e gestione dati
- Header con navigazione responsive
- Card animate con stagger effect
- Scrollbar personalizzata
- Colori distintivi per ogni parametro
- Tooltip migliorati sui grafici

### 📱 Fix Mobile
- **Padding laterale corretto** su tutti gli schermi
- Responsive grid ottimizzato
- Touch-friendly buttons
- Navigazione mobile migliorata

## 🚀 Funzionalità

### Dashboard
- 📝 Form inserimento misurazioni
- 📊 Grafico interattivo con range
- 📋 Lista misurazioni con azioni rapide
- 💾 Import/Export dati

### Analisi
- 📈 Statistiche per parametro (media, min, max)
- 🔄 Indicatori di trend (su/giù/stabile)
- 📊 Visualizzazione range standard
- 📉 Confronto con misurazioni precedenti

### Impostazioni
- ⚙️ Info parametri configurati
- 📊 Statistiche storage
- 🔒 Informazioni privacy
- 🗑️ Eliminazione dati

## 📁 Struttura Progetto

```
medical-tracker-app-v2/
├── public/
│   └── index.html
├── src/
│   ├── components/          # Componenti riutilizzabili
│   │   ├── Chart.jsx
│   │   ├── DataManager.jsx
│   │   ├── Header.jsx
│   │   ├── MeasurementForm.jsx
│   │   └── MeasurementList.jsx
│   ├── context/             # State management
│   │   └── MedicalContext.jsx
│   ├── pages/               # Pagine SPA
│   │   ├── Analytics.jsx
│   │   ├── Dashboard.jsx
│   │   └── Settings.jsx
│   ├── App.js               # Router principale
│   ├── index.js             # Entry point
│   └── index.css            # Tailwind + custom styles
├── package.json
├── tailwind.config.js       # Configurazione Tailwind
├── postcss.config.js        # PostCSS setup
└── netlify.toml
```

## 💻 Installazione e Sviluppo

### Prerequisiti
- Node.js 14+
- npm o yarn

### Setup Locale

```bash
# 1. Naviga nella cartella
cd medical-tracker-app-v2

# 2. Installa dipendenze
npm install

# 3. Avvia dev server
npm start

# L'app si aprirà su http://localhost:3000
```

### Build per Produzione

```bash
npm run build
```

Crea la cartella `build/` ottimizzata per il deploy.

## 🌐 Deploy su Netlify

### Metodo 1: Deploy automatico da GitHub

1. Carica il progetto su GitHub
2. Vai su [netlify.com](https://netlify.com) → "Add new site"
3. Collega il repository
4. Le impostazioni sono già configurate in `netlify.toml`
5. Deploy automatico! 🚀

### Metodo 2: Deploy manuale

```bash
# 1. Build del progetto
npm run build

# 2. Drag & drop della cartella build/ su Netlify
```

## 🎨 Personalizzazione

### Modificare i colori del tema

Edita `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Cambia questi valori
        500: '#0ea5e9',
        600: '#0284c7',
        // ...
      }
    }
  }
}
```

### Aggiungere nuovi parametri

Edita `src/context/MedicalContext.jsx`:

```javascript
const [parameters] = useState([
  {
    name: 'Nuovo Parametro',
    unit: 'unità',
    standardRange: { min: X, max: Y },
    customFormula: 'mean ± 1.5*sd',
    color: '#hexcolor'
  },
  // ...
]);
```

### Modificare le formule personalizzate

Supportate attualmente:
- `mean ± 1*sd`
- `mean ± 1.5*sd`
- `mean ± 2*sd`

Per formule più complesse, modifica `calculateCustomRange` in `MedicalContext.jsx`.

## 🔧 Tecnologie Utilizzate

- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Tailwind CSS 3** - Utility-first CSS
- **Recharts** - Grafici interattivi
- **Lucide React** - Icone moderne
- **PostCSS + Autoprefixer** - CSS processing
- **Context API** - State management
- **localStorage** - Persistenza dati

## 📱 Compatibilità

- ✅ Chrome, Firefox, Safari, Edge (ultime versioni)
- ✅ iOS Safari 12+
- ✅ Chrome Android
- ✅ Responsive: mobile, tablet, desktop

## 🔒 Privacy e Sicurezza

- **100% locale** - Nessun server esterno
- **localStorage** - Dati salvati nel browser
- **No cookies** - Nessun tracking
- **Open source** - Codice ispezionabile

## 🐛 Risoluzione Problemi

### Build fallisce su Netlify

Verifica che `netlify.toml` sia presente e configurato correttamente.

### I dati non si salvano

Controlla che il browser non sia in modalità "privata" e che localStorage sia abilitato.

### Testo attaccato ai bordi su mobile

✅ **RISOLTO** nella v2.0! Il padding è ora corretto grazie a:
```css
#root {
  @apply px-4 sm:px-6 lg:px-8;
}
```

### Tailwind non funziona

Assicurati di avere installato le devDependencies:
```bash
npm install -D tailwindcss postcss autoprefixer
```

## 📈 Roadmap Future

- [ ] PWA support (offline mode)
- [ ] Export PDF reports
- [ ] Multi-utente con autenticazione
- [ ] Notifiche e reminder
- [ ] Grafici comparativi multi-parametro
- [ ] Integrazione con dispositivi wearable

## 🤝 Contribuire

Questo è un progetto open source. Sentiti libero di:
- Aprire issue per bug o suggerimenti
- Proporre pull request
- Forkare e personalizzare

## 📄 Licenza

MIT License - Libero per uso personale e commerciale

## 💡 Supporto

Per domande o problemi:
1. Controlla la sezione "Risoluzione Problemi"
2. Apri una issue su GitHub
3. Consulta la documentazione di Netlify/React

---

**Fatto con ❤️ per il monitoraggio della salute**

*Versione 2.0 - Completamente refactored e ottimizzato per mobile*
