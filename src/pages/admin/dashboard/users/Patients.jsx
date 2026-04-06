import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../AdminLayout';
import { toast } from 'react-toastify';
import { deleteAdminPatient, fetchAdminPatients } from '../../../../services/authApi';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deletingPatientId, setDeletingPatientId] = useState('');

  useEffect(() => {
    const loadPatients = async () => {
      const adminToken = localStorage.getItem('adminToken');

      if (!adminToken) {
        setError('Please login as admin to view patients');
        setLoading(false);
        return;
      }

      try {
        const data = await fetchAdminPatients(adminToken);
        setPatients(data.patients || []);
      } catch (err) {
        setError(err.message || 'Could not fetch patients');
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return patients;
    }

    return patients.filter((patient) => {
      return (
        patient.name.toLowerCase().includes(normalizedSearch) ||
        patient.email.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [patients, search]);

  const formatDate = (rawDate) => {
    return new Date(rawDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const handleDeletePatient = async (patient) => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
      toast.error('Please login as admin first');
      return;
    }

    const shouldDelete = window.confirm(`Delete patient ${patient.name}? This action cannot be undone.`);

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingPatientId(patient.id);
      await deleteAdminPatient(adminToken, patient.id);
      setPatients((prevPatients) => prevPatients.filter((item) => item.id !== patient.id));
      toast.success('Patient deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Could not delete patient');
    } finally {
      setDeletingPatientId('');
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-gray-900 flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1EBDB8]">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Patients List
            </h1>
            <p className="text-[14px] text-gray-500 font-medium mt-1">Manage all registered patients on the platform.</p>
          </div>
        </div>

        {/* Filters/Search block */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col sm:flex-row gap-4 mb-2">
          <div className="relative flex-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search patients by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FAFAFA] text-[#4B5563] text-[14px] font-medium py-2.5 pl-10 pr-4 rounded-xl outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 border border-gray-200 focus:border-[#1EBDB8] transition-all"
            />
          </div>
          <button className="bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-xl font-bold text-[13.5px] text-gray-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            Filter
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Patient Name</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Email Address</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Joined Date</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-sm font-medium text-gray-500">
                      Loading patients...
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-sm font-medium text-red-500">
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-sm font-medium text-gray-500">
                      No patients found.
                    </td>
                  </tr>
                )}

                {!loading && !error && filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-full bg-[#1EBDB8]/10 text-[#1EBDB8] flex items-center justify-center font-bold text-[14px]">
                            {patient.name.charAt(0)}
                         </div>
                         <span className="font-bold text-[14.5px] text-gray-900">{patient.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-[14.5px] text-gray-600">{patient.email}</td>
                    <td className="px-6 py-4 font-medium text-[14.5px] text-gray-600">{formatDate(patient.joined)}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[12px] font-bold ${
                          patient.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {patient.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        disabled={deletingPatientId === patient.id}
                        onClick={() => handleDeletePatient(patient)}
                        className="inline-flex items-center gap-2 text-red-500 hover:text-red-600 disabled:text-gray-400 disabled:cursor-not-allowed font-bold text-[13px] px-2 py-1 rounded-lg transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                          <path d="M10 11v6"></path>
                          <path d="M14 11v6"></path>
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                        </svg>
                        {deletingPatientId === patient.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Placeholder */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-[13.5px] font-medium text-gray-500">
            <span>Showing 1 to {filteredPatients.length} of {filteredPatients.length} entries</span>
            <div className="flex gap-2">
              <button disabled className="px-3 py-1 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed">Prev</button>
              <button disabled className="px-3 py-1 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed">Next</button>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}