import React from 'react';
import { Activity, BarChart3, Settings, Users, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { usePatients } from '../context/PatientContext';

const Header = () => {
  const location = useLocation();
  const { getActivePatient } = usePatients();
  const activePatient = getActivePatient();

  const navItems = [
    { path: '/patients', label: 'Pazienti', icon: Users },
    { path: '/', label: 'Dashboard', icon: Activity },
    { path: '/analytics', label: 'Analisi', icon: BarChart3 },
    { path: '/settings', label: 'Impostazioni', icon: Settings },
  ];

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 mb-6 sm:mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Activity className="text-white" size={24} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Medical Tracker</h1>
                <p className="text-xs text-gray-500">Monitora la tua salute</p>
              </div>
            </Link>

            <nav className="flex gap-1 sm:gap-2">
              {navItems.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Active Patient Banner */}
      {activePatient && (
        <div className="bg-primary-50 border-b border-primary-200 sticky top-16 sm:top-20 z-40 -mt-6 sm:-mt-8 mb-6 sm:mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activePatient.avatar ? (
                  <img
                    src={activePatient.avatar}
                    alt={`${activePatient.nome} ${activePatient.cognome}`}
                    className="w-10 h-10 rounded-full object-cover border-2 border-primary-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center border-2 border-primary-200">
                    <User size={20} className="text-primary-600" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary-900">
                      {activePatient.cognome} {activePatient.nome}
                    </span>
                    <span className="hidden sm:inline text-xs text-primary-600 bg-primary-100 px-2 py-0.5 rounded">
                      {activePatient.sesso} • {activePatient.codiceFiscale}
                    </span>
                  </div>
                  {activePatient.tags && activePatient.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {activePatient.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-1.5 py-0.5 rounded text-white"
                          style={{ 
                            backgroundColor: tag === 'Diabete' ? '#ef4444' : 
                                           tag === 'Ipertensione' ? '#f59e0b' : 
                                           tag === 'Cardiopatia' ? '#ec4899' :
                                           tag === 'Tiroide' ? '#8b5cf6' :
                                           tag === 'Metabolico' ? '#10b981' :
                                           tag === 'Renale' ? '#06b6d4' :
                                           tag === 'Epatico' ? '#f97316' :
                                           '#6b7280' 
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Link
                to="/patients"
                className="text-xs sm:text-sm text-primary-700 hover:text-primary-900 font-medium hover:underline"
              >
                Cambia →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
