import React from 'react';
import { useMedical } from '../context/MedicalContext';
import { Info, AlertCircle, Trash2 } from 'lucide-react';
import ParameterManager from '../components/ParameterManager';

const Settings = () => {
  const { measurements, parameters } = useMedical();

  const handleClearData = () => {
    if (window.confirm('⚠️ Sei sicuro di voler eliminare TUTTI i dati? Questa operazione non può essere annullata!')) {
      localStorage.removeItem('medicalMeasurements');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Impostazioni
        </h1>
        <p className="text-gray-600">
          Gestisci parametri, visualizza statistiche e configura l'app
        </p>
      </div>

      {/* Gestione Parametri - NUOVO */}
      <ParameterManager />

      {/* Parametri configurati */}
      <div className="card mb-6 mt-6 animate-slide-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-3 mb-4">
          <Info className="text-primary-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Riepilogo Parametri Attuali</h2>
        </div>

        <div className="space-y-3">
          {parameters.map((param) => (
            <div
              key={param.name}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                  style={{ backgroundColor: param.color }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900">{param.name}</h3>
                  <div className="text-sm text-gray-600 mt-1 space-y-1">
                    <p>Unità di misura: <span className="font-semibold">{param.unit}</span></p>
                    <p>Range standard: <span className="font-semibold">{param.standardRange.min} - {param.standardRange.max}</span></p>
                    <p>Formula personalizzata: <span className="font-semibold">{param.customFormula}</span></p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiche storage */}
      <div className="card mb-6 animate-slide-in" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Statistiche Dati</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-700">
              {measurements.length}
            </div>
            <div className="text-sm text-blue-600 mt-1">Misurazioni totali</div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-700">
              {measurements.filter(m => m.includedInFormula).length}
            </div>
            <div className="text-sm text-green-600 mt-1">Incluse in formule</div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 col-span-2 sm:col-span-1">
            <div className="text-3xl font-bold text-purple-700">
              {new Set(measurements.map(m => m.parameter)).size}
            </div>
            <div className="text-sm text-purple-600 mt-1">Parametri con dati</div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Storage utilizzato:</span> Circa{' '}
            {(JSON.stringify(measurements).length / 1024).toFixed(2)} KB
          </p>
        </div>
      </div>

      {/* Privacy e sicurezza */}
      <div className="card mb-6 animate-slide-in" style={{ animationDelay: '0.4s' }}>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Privacy e Sicurezza</h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl">🔒</div>
            <div>
              <h3 className="font-semibold text-green-900 mb-1">I tuoi dati sono privati</h3>
              <p className="text-sm text-green-800">
                Tutti i dati vengono salvati localmente nel browser. Nessuna informazione viene inviata a server esterni.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl">💾</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Backup consigliati</h3>
              <p className="text-sm text-blue-800">
                Usa la funzione "Esporta Dati" regolarmente per creare backup sicuri dei tuoi dati medici.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl">⚠️</div>
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">Attenzione alla cache</h3>
              <p className="text-sm text-yellow-800">
                Se cancelli i dati del browser o la cache, perderai tutte le misurazioni salvate. Assicurati di avere un backup!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Zona pericolosa */}
      <div className="card border-2 border-red-200 animate-slide-in" style={{ animationDelay: '0.5s' }}>
        <h2 className="text-xl font-bold text-red-700 mb-4">Zona Pericolosa</h2>
        
        <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
          <p className="text-sm text-red-800 mb-4">
            <span className="font-semibold">⚠️ Attenzione:</span> Questa operazione eliminerà permanentemente TUTTI i tuoi dati. 
            Non sarà possibile recuperarli a meno che tu non abbia un backup.
          </p>
          
          <button
            onClick={handleClearData}
            className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 flex items-center gap-2"
          >
            <Trash2 size={18} />
            Elimina Tutti i Dati
          </button>
        </div>
      </div>

      {/* Info versione */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Medical Tracker v2.1</p>
        <p className="mt-1">Gestione parametri dinamica + Refactoring completo</p>
      </div>
    </div>
  );
};

export default Settings;
