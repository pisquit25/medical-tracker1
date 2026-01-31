import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { useMedical } from '../context/MedicalContext';

const DataManager = () => {
  const { measurements, exportData, importData } = useMedical();
  const fileInputRef = useRef(null);

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await importData(file);
        alert('✅ Dati importati con successo!');
      } catch (error) {
        alert('❌ Errore nell\'importazione. Verifica che il file sia valido.');
      }
      e.target.value = '';
    }
  };

  return (
    <div className="card animate-slide-in" style={{ animationDelay: '0.3s' }}>
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Gestione Dati
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={exportData}
          disabled={measurements.length === 0}
          className="btn bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 py-3 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
        >
          <Download size={18} />
          <span className="font-semibold">Esporta Dati</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 py-3 flex items-center justify-center gap-2"
        >
          <Upload size={18} />
          <span className="font-semibold">Importa Dati</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800">
          <span className="font-semibold">💡 Suggerimento:</span> Esporta regolarmente i tuoi dati per creare un backup sicuro.
        </p>
      </div>
    </div>
  );
};

export default DataManager;
