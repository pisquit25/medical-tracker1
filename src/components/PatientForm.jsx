import React, { useState, useEffect } from 'react';
import { X, Save, User, Calendar, Mail, Phone, FileText, Tag, Camera } from 'lucide-react';
import { usePatients } from '../context/PatientContext';
import { 
  validateCodiceFiscale, 
  extractSexFromCF, 
  extractBirthDateFromCF, 
  formatCodiceFiscale,
  defaultTags 
} from '../utils/patientUtils';

const PatientForm = ({ patient = null, onClose, onSuccess }) => {
  const { addPatient, updatePatient } = usePatients();
  const isEdit = !!patient;

  const [formData, setFormData] = useState({
    nome: patient?.nome || '',
    cognome: patient?.cognome || '',
    codiceFiscale: patient?.codiceFiscale || '',
    dataNascita: patient?.dataNascita || '',
    sesso: patient?.sesso || '',
    email: patient?.email || '',
    telefono: patient?.telefono || '',
    indirizzo: patient?.indirizzo || '',
    note: patient?.note || '',
    allergie: patient?.allergie || '',
    terapie: patient?.terapie || '',
    tags: patient?.tags || [],
    avatar: patient?.avatar || null
  });

  const [errors, setErrors] = useState({});
  const [autoFillAvailable, setAutoFillAvailable] = useState(false);

  // Check if can auto-fill from CF
  useEffect(() => {
    if (formData.codiceFiscale.length === 16) {
      const isValid = validateCodiceFiscale(formData.codiceFiscale);
      if (isValid && (!formData.sesso || !formData.dataNascita)) {
        setAutoFillAvailable(true);
      }
    }
  }, [formData.codiceFiscale, formData.sesso, formData.dataNascita]);

  const handleAutoFill = () => {
    const cf = formatCodiceFiscale(formData.codiceFiscale);
    const sex = extractSexFromCF(cf);
    const birthDate = extractBirthDateFromCF(cf);
    
    setFormData(prev => ({
      ...prev,
      sesso: sex || prev.sesso,
      dataNascita: birthDate || prev.dataNascita
    }));
    setAutoFillAvailable(false);
  };

  const handleCFChange = (value) => {
    const formatted = formatCodiceFiscale(value);
    setFormData(prev => ({ ...prev, codiceFiscale: formatted }));
    
    // Clear CF error when typing
    if (errors.codiceFiscale) {
      setErrors(prev => ({ ...prev, codiceFiscale: null }));
    }
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome obbligatorio';
    }
    if (!formData.cognome.trim()) {
      newErrors.cognome = 'Cognome obbligatorio';
    }
    if (!formData.codiceFiscale.trim()) {
      newErrors.codiceFiscale = 'Codice fiscale obbligatorio';
    } else if (!validateCodiceFiscale(formData.codiceFiscale)) {
      newErrors.codiceFiscale = 'Codice fiscale non valido';
    }
    if (!formData.dataNascita) {
      newErrors.dataNascita = 'Data di nascita obbligatoria';
    }
    if (!formData.sesso) {
      newErrors.sesso = 'Sesso obbligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    if (isEdit) {
      updatePatient(patient.id, formData);
      onSuccess?.(patient.id);
    } else {
      const newPatientId = addPatient(formData);
      onSuccess?.(newPatientId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User size={28} className="text-primary-600" />
            {isEdit ? 'Modifica Paziente' : 'Nuovo Paziente'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Avatar */}
            <div className="md:col-span-2 flex justify-center">
              <div className="relative">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                    <Camera size={48} className="text-gray-400" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                  <Camera size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className={`input ${errors.nome ? 'border-red-500' : ''}`}
                placeholder="Mario"
              />
              {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
            </div>

            {/* Cognome */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cognome *
              </label>
              <input
                type="text"
                value={formData.cognome}
                onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                className={`input ${errors.cognome ? 'border-red-500' : ''}`}
                placeholder="Rossi"
              />
              {errors.cognome && <p className="text-red-500 text-xs mt-1">{errors.cognome}</p>}
            </div>

            {/* Codice Fiscale */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Codice Fiscale *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.codiceFiscale}
                  onChange={(e) => handleCFChange(e.target.value)}
                  className={`input flex-1 ${errors.codiceFiscale ? 'border-red-500' : ''}`}
                  placeholder="RSSMRA80A01H501Z"
                  maxLength={16}
                />
                {autoFillAvailable && (
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    className="btn btn-secondary whitespace-nowrap"
                  >
                    Compila Auto
                  </button>
                )}
              </div>
              {errors.codiceFiscale && <p className="text-red-500 text-xs mt-1">{errors.codiceFiscale}</p>}
            </div>

            {/* Data di Nascita */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Data di Nascita *
              </label>
              <input
                type="date"
                value={formData.dataNascita}
                onChange={(e) => setFormData({ ...formData, dataNascita: e.target.value })}
                className={`input ${errors.dataNascita ? 'border-red-500' : ''}`}
              />
              {errors.dataNascita && <p className="text-red-500 text-xs mt-1">{errors.dataNascita}</p>}
            </div>

            {/* Sesso */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sesso *
              </label>
              <select
                value={formData.sesso}
                onChange={(e) => setFormData({ ...formData, sesso: e.target.value })}
                className={`input ${errors.sesso ? 'border-red-500' : ''}`}
              >
                <option value="">Seleziona...</option>
                <option value="M">Maschio</option>
                <option value="F">Femmina</option>
              </select>
              {errors.sesso && <p className="text-red-500 text-xs mt-1">{errors.sesso}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Mail size={16} />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                placeholder="mario.rossi@example.com"
              />
            </div>

            {/* Telefono */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Phone size={16} />
                Telefono
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="input"
                placeholder="+39 333 1234567"
              />
            </div>

            {/* Indirizzo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Indirizzo
              </label>
              <input
                type="text"
                value={formData.indirizzo}
                onChange={(e) => setFormData({ ...formData, indirizzo: e.target.value })}
                className="input"
                placeholder="Via Roma 123, 00100 Roma"
              />
            </div>

            {/* Tags */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Tag size={16} />
                Categorie / Patologie
              </label>
              <div className="flex flex-wrap gap-2">
                {defaultTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.tags.includes(tag)
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={{
                      backgroundColor: formData.tags.includes(tag) ? (tag === 'Diabete' ? '#ef4444' : tag === 'Ipertensione' ? '#f59e0b' : tag === 'Cardiopatia' ? '#ec4899' : tag === 'Tiroide' ? '#8b5cf6' : tag === 'Metabolico' ? '#10b981' : tag === 'Renale' ? '#06b6d4' : tag === 'Epatico' ? '#f97316' : '#6b7280') : undefined
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Allergie */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText size={16} />
                Allergie
              </label>
              <textarea
                value={formData.allergie}
                onChange={(e) => setFormData({ ...formData, allergie: e.target.value })}
                className="input resize-none"
                rows="2"
                placeholder="Es: Penicillina, lattosio..."
              />
            </div>

            {/* Terapie */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText size={16} />
                Terapie in corso
              </label>
              <textarea
                value={formData.terapie}
                onChange={(e) => setFormData({ ...formData, terapie: e.target.value })}
                className="input resize-none"
                rows="2"
                placeholder="Es: Metformina 500mg x2/die, Ramipril 5mg..."
              />
            </div>

            {/* Note */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText size={16} />
                Note
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="input resize-none"
                rows="3"
                placeholder="Altre informazioni rilevanti..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="btn btn-primary flex-1 py-3 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {isEdit ? 'Salva Modifiche' : 'Crea Paziente'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary px-6 py-3"
            >
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;
