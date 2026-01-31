import React, { createContext, useContext, useState, useEffect } from 'react';
import { generatePatientId, generateVisitId } from '../utils/patientUtils';

const PatientContext = createContext();

export const usePatients = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatients must be used within PatientProvider');
  }
  return context;
};

export const PatientProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [activePatientId, setActivePatientId] = useState(null);
  const [visits, setVisits] = useState([]);

  // Load patients from localStorage
  useEffect(() => {
    const savedPatients = localStorage.getItem('medicalPatients');
    if (savedPatients) {
      try {
        setPatients(JSON.parse(savedPatients));
      } catch (error) {
        console.error('Error loading patients:', error);
      }
    }
  }, []);

  // Save patients to localStorage
  useEffect(() => {
    localStorage.setItem('medicalPatients', JSON.stringify(patients));
  }, [patients]);

  // Load active patient from localStorage
  useEffect(() => {
    const savedActiveId = localStorage.getItem('activePatientId');
    if (savedActiveId) {
      setActivePatientId(savedActiveId);
    }
  }, []);

  // Save active patient to localStorage
  useEffect(() => {
    if (activePatientId) {
      localStorage.setItem('activePatientId', activePatientId);
    }
  }, [activePatientId]);

  // Load visits from localStorage
  useEffect(() => {
    const savedVisits = localStorage.getItem('medicalVisits');
    if (savedVisits) {
      try {
        setVisits(JSON.parse(savedVisits));
      } catch (error) {
        console.error('Error loading visits:', error);
      }
    }
  }, []);

  // Save visits to localStorage
  useEffect(() => {
    localStorage.setItem('medicalVisits', JSON.stringify(visits));
  }, [visits]);

  // Get active patient
  const getActivePatient = () => {
    return patients.find(p => p.id === activePatientId) || null;
  };

  // Add new patient
  const addPatient = (patientData) => {
    const newPatient = {
      ...patientData,
      id: generatePatientId(),
      createdAt: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      totalVisits: 0,
      totalMeasurements: 0,
      avatar: patientData.avatar || null
    };
    setPatients(prev => [...prev, newPatient]);
    return newPatient.id;
  };

  // Update patient
  const updatePatient = (patientId, updatedData) => {
    setPatients(prev => prev.map(p => 
      p.id === patientId 
        ? { ...p, ...updatedData, updatedAt: new Date().toISOString() }
        : p
    ));
  };

  // Delete patient
  const deletePatient = (patientId) => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
    
    // Delete all visits for this patient
    setVisits(prev => prev.filter(v => v.patientId !== patientId));
    
    // If deleting active patient, clear active
    if (activePatientId === patientId) {
      setActivePatientId(null);
      localStorage.removeItem('activePatientId');
    }
  };

  // Set active patient
  const setActivePatient = (patientId) => {
    setActivePatientId(patientId);
    
    // Update last visit
    if (patientId) {
      updatePatient(patientId, { 
        lastVisit: new Date().toISOString() 
      });
    }
  };

  // Add visit
  const addVisit = (patientId, visitData) => {
    const newVisit = {
      ...visitData,
      id: generateVisitId(),
      patientId,
      date: visitData.date || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    setVisits(prev => [...prev, newVisit]);
    
    // Update patient visit count
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      updatePatient(patientId, {
        totalVisits: (patient.totalVisits || 0) + 1,
        lastVisit: new Date().toISOString()
      });
    }
    
    return newVisit.id;
  };

  // Update visit
  const updateVisit = (visitId, updatedData) => {
    setVisits(prev => prev.map(v =>
      v.id === visitId
        ? { ...v, ...updatedData, updatedAt: new Date().toISOString() }
        : v
    ));
  };

  // Delete visit
  const deleteVisit = (visitId) => {
    const visit = visits.find(v => v.id === visitId);
    if (visit) {
      setVisits(prev => prev.filter(v => v.id !== visitId));
      
      // Decrement patient visit count
      const patient = patients.find(p => p.id === visit.patientId);
      if (patient && patient.totalVisits > 0) {
        updatePatient(visit.patientId, {
          totalVisits: patient.totalVisits - 1
        });
      }
    }
  };

  // Get visits for patient
  const getPatientVisits = (patientId) => {
    return visits
      .filter(v => v.patientId === patientId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Search patients
  const searchPatients = (searchTerm) => {
    if (!searchTerm) return patients;
    
    const term = searchTerm.toLowerCase();
    return patients.filter(p => 
      p.nome?.toLowerCase().includes(term) ||
      p.cognome?.toLowerCase().includes(term) ||
      p.codiceFiscale?.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term) ||
      p.telefono?.includes(term)
    );
  };

  // Get patients by tag
  const getPatientsByTag = (tag) => {
    return patients.filter(p => p.tags && p.tags.includes(tag));
  };

  // Update patient measurement count
  const updatePatientMeasurementCount = (patientId, count) => {
    updatePatient(patientId, { totalMeasurements: count });
  };

  // Get patients needing attention (not visited in X days)
  const getPatientsNeedingAttention = (days = 30) => {
    const now = new Date();
    return patients.filter(p => {
      if (!p.lastVisit) return true;
      const lastVisit = new Date(p.lastVisit);
      const diffDays = Math.ceil((now - lastVisit) / (1000 * 60 * 60 * 24));
      return diffDays >= days;
    });
  };

  const value = {
    patients,
    activePatientId,
    visits,
    getActivePatient,
    addPatient,
    updatePatient,
    deletePatient,
    setActivePatient,
    addVisit,
    updateVisit,
    deleteVisit,
    getPatientVisits,
    searchPatients,
    getPatientsByTag,
    updatePatientMeasurementCount,
    getPatientsNeedingAttention
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};
