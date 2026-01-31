import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { usePatients } from '../context/PatientContext';
import MeasurementForm from '../components/MeasurementForm';
import StatusOverview from '../components/StatusOverview';
import DataManager from '../components/DataManager';
import Chart from '../components/Chart';

const Dashboard = () => {
  const [selectedParameter, setSelectedParameter] = useState('Glicemia');
  const navigate = useNavigate();
  const { getActivePatient } = usePatients();
  const activePatient = getActivePatient();

  // Se nessun paziente selezionato, mostra messaggio
  if (!activePatient) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
            <Users size={48} className="text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Nessun paziente selezionato
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Seleziona un paziente dalla lista per visualizzare e gestire i suoi dati medici
          </p>
          <button
            onClick={() => navigate('/patients')}
            className="btn btn-primary text-lg px-8 py-3"
          >
            Vai alla Lista Pazienti
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Visualizza e gestisci i tuoi parametri medici
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Sidebar sinistra */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <MeasurementForm />
          <DataManager />
          <StatusOverview 
            selectedParameter={selectedParameter}
            onParameterChange={setSelectedParameter}
          />
        </div>

        {/* Area principale */}
        <div className="lg:col-span-2">
          <Chart 
            selectedParameter={selectedParameter}
            onParameterChange={setSelectedParameter}
          />
        </div>
      </div>

      {/* Footer informativo */}
      <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="text-4xl">💡</div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">I tuoi dati sono al sicuro</h3>
            <p className="text-sm text-gray-600">
              Tutte le informazioni vengono salvate localmente nel tuo browser. 
              Nessun dato viene inviato a server esterni. 
              Ricordati di esportare regolarmente per creare backup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
