import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MedicalProvider } from './context/MedicalContext';
import { PatientProvider } from './context/PatientContext';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function App() {
  return (
    <PatientProvider>
      <MedicalProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Header />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </Router>
      </MedicalProvider>
    </PatientProvider>
  );
}

export default App;
