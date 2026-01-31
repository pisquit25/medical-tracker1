import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../context/PatientContext';
import { useMedical } from '../context/MedicalContext';
import { Search, Plus, Users, AlertCircle, Calendar, Activity, FileText } from 'lucide-react';
import { calculateAge, checkLastVisit, tagColors } from '../utils/patientUtils';
import { generatePatientPDF } from '../utils/pdfGenerator';
import PatientForm from '../components/PatientForm';

const Patients = () => {
  const navigate = useNavigate();
  const { patients, setActivePatient, searchPatients, getPatientsNeedingAttention, getPatientVisits } = usePatients();
  const { measurements, parameters } = useMedical();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);

  const filteredPatients = searchTerm 
    ? searchPatients(searchTerm)
    : selectedTag 
      ? patients.filter(p => p.tags && p.tags.includes(selectedTag))
      : patients;

  const patientsNeedingAttention = getPatientsNeedingAttention(30);

  const handleSelectPatient = (patientId) => {
    setActivePatient(patientId);
    navigate('/');
  };

  const handleExportPDF = (e, patient) => {
    e.stopPropagation();
    const patientMeasurements = measurements.filter(m => m.patientId === patient.id);
    const patientVisits = getPatientVisits(patient.id);
    generatePatientPDF(patient, patientMeasurements, parameters, patientVisits);
  };

  const getPatientMeasurementCount = (patientId) => {
    return measurements.filter(m => m.patientId === patientId).length;
  };

  const getPatientLastMeasurement = (patientId) => {
    const patientMeasurements = measurements
      .filter(m => m.patientId === patientId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    return patientMeasurements[0] || null;
  };

  const allTags = [...new Set(patients.flatMap(p => p.tags || []))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Users size={36} className="text-primary-600" />
              Pazienti
            </h1>
            <p className="text-gray-600 mt-1">
              {patients.length} pazienti registrati
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Nuovo Paziente
          </button>
        </div>

        {/* Alerts */}
        {patientsNeedingAttention.length > 0 && (
          <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-yellow-600" size={20} />
              <p className="text-yellow-800 font-semibold">
                {patientsNeedingAttention.length} pazienti non visitati da oltre 30 giorni
              </p>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cerca per nome, cognome o codice fiscale..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === null
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tutti
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTag === tag
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: selectedTag === tag ? tagColors[tag] : undefined
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Patient List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">
              {searchTerm ? 'Nessun paziente trovato' : 'Nessun paziente registrato'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm ? 'Prova con un altro termine di ricerca' : 'Aggiungi il primo paziente per iniziare'}
            </p>
          </div>
        ) : (
          filteredPatients.map(patient => {
            const age = calculateAge(patient.dataNascita);
            const lastCheck = checkLastVisit(patient.lastVisit, 30);
            const measurementCount = getPatientMeasurementCount(patient.id);
            const lastMeasurement = getPatientLastMeasurement(patient.id);

            return (
              <div
                key={patient.id}
                className="card hover:shadow-xl transition-all cursor-pointer border-2 hover:border-primary-300"
                onClick={() => handleSelectPatient(patient.id)}
              >
                {/* Avatar and Basic Info */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    {patient.avatar ? (
                      <img
                        src={patient.avatar}
                        alt={`${patient.nome} ${patient.cognome}`}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center border-2 border-primary-200">
                        <span className="text-2xl font-bold text-primary-600">
                          {patient.nome?.charAt(0)}{patient.cognome?.charAt(0)}
                        </span>
                      </div>
                    )}
                    {lastCheck.needsAlert && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 truncate">
                          {patient.cognome} {patient.nome}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          CF: {patient.codiceFiscale}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span>{patient.sesso}</span>
                          <span>•</span>
                          <span>{age} anni</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleExportPDF(e, patient)}
                        className="p-2 hover:bg-primary-100 rounded-lg transition-colors group"
                        title="Esporta PDF"
                      >
                        <FileText size={18} className="text-gray-400 group-hover:text-primary-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {patient.tags && patient.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {patient.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: tagColors[tag] || '#6b7280' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    <span>
                      {patient.lastVisit 
                        ? new Date(patient.lastVisit).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' })
                        : 'Mai'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Activity size={16} />
                    <span>{measurementCount} mis.</span>
                  </div>
                </div>

                {/* Last Measurement */}
                {lastMeasurement && (
                  <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                    Ultima: {lastMeasurement.parameter} - {lastMeasurement.value} {lastMeasurement.unit || ''}
                  </div>
                )}

                {/* Alert Badge */}
                {lastCheck.needsAlert && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    ⚠️ Non visto da {lastCheck.daysSince} giorni
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Patient Form Modal */}
      {showForm && (
        <PatientForm
          onClose={() => setShowForm(false)}
          onSuccess={(patientId) => {
            setShowForm(false);
            handleSelectPatient(patientId);
          }}
        />
      )}
    </div>
  );
};

export default Patients;
