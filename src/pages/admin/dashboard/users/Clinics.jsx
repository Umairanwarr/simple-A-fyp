import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../AdminLayout';
import {
  fetchAdminClinics,
  reviewAdminClinicApplication
} from '../../../../services/authApi';

export default function Clinics() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [reviewingClinicId, setReviewingClinicId] = useState('');

  useEffect(() => {
    const normalizeApplicationStatus = (status) => {
      if (status === 'approve') {
        return 'approved';
      }

      if (status === 'decline') {
        return 'declined';
      }

      return status;
    };

    const loadClinics = async () => {
      const adminToken = localStorage.getItem('adminToken');

      if (!adminToken) {
        setError('Please login as admin to view clinics');
        setLoading(false);
        return;
      }

      try {
        const data = await fetchAdminClinics(adminToken);
        setClinics(
          (data.clinics || []).map((clinic) => ({
            ...clinic,
            applicationStatus: normalizeApplicationStatus(clinic.applicationStatus)
          }))
        );
      } catch (err) {
        setError(err.message || 'Could not fetch clinics');
      } finally {
        setLoading(false);
      }
    };

    loadClinics();
  }, []);

  const filteredClinics = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return clinics;
    }

    return clinics.filter((clinic) => {
      return (
        clinic.name.toLowerCase().includes(normalizedSearch) ||
        clinic.email.toLowerCase().includes(normalizedSearch) ||
        clinic.facilityType.toLowerCase().includes(normalizedSearch) ||
        clinic.applicationStatus.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [clinics, search]);

  const formatDate = (rawDate) => {
    if (!rawDate) {
      return 'N/A';
    }

    return new Date(rawDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const statusStyle = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'declined':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  };

  const handleReviewAction = async (clinic, status) => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
      toast.error('Please login as admin first');
      return;
    }

    let note = '';

    if (status === 'declined') {
      const prompted = window.prompt('Reason for decline (optional):', clinic.adminReviewNote || '');

      if (prompted === null) {
        return;
      }

      note = prompted;
    }

    try {
      setReviewingClinicId(clinic.id);
      const data = await reviewAdminClinicApplication(adminToken, clinic.id, status, note);

      const normalizedClinic = {
        ...data.clinic,
        applicationStatus:
          data.clinic?.applicationStatus === 'approve'
            ? 'approved'
            : data.clinic?.applicationStatus === 'decline'
              ? 'declined'
              : data.clinic?.applicationStatus
      };

      setClinics((prevClinics) => {
        return prevClinics.map((item) => {
          if (item.id !== clinic.id) {
            return item;
          }

          return normalizedClinic;
        });
      });

      setSelectedClinic((prevSelectedClinic) => {
        if (!prevSelectedClinic || prevSelectedClinic.id !== clinic.id) {
          return prevSelectedClinic;
        }

        return normalizedClinic;
      });

      toast.success(data.message || `Clinic application ${status}`);
    } catch (err) {
      toast.error(err.message || 'Could not update clinic application status');
    } finally {
      setReviewingClinicId('');
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-gray-900 flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1EBDB8]">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Clinics Management
            </h1>
            <p className="text-[14px] text-gray-500 font-medium mt-1">
              Review clinic applications, permits, and approval status.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col sm:flex-row gap-4 mb-2">
          <div className="relative flex-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clinics by name, type, email, or status..."
              className="w-full bg-[#FAFAFA] text-[#4B5563] text-[14px] font-medium py-2.5 pl-10 pr-4 rounded-xl outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 border border-gray-200 focus:border-[#1EBDB8] transition-all"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Clinic Name</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Facility Type</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-sm font-medium text-gray-500">
                      Loading clinics...
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-sm font-medium text-red-500">
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && filteredClinics.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-sm font-medium text-gray-500">
                      No clinics found.
                    </td>
                  </tr>
                )}

                {!loading && !error && filteredClinics.map((clinic) => (
                  <tr key={clinic.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[14px]">
                          {clinic.name.charAt(0)}
                        </div>
                        <span className="font-bold text-[14.5px] text-gray-900">{clinic.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-[14.5px] text-gray-600">
                      <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-md text-[12.5px] border border-indigo-100/50">
                        {clinic.facilityType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-[14.5px] text-gray-600">{clinic.email}</td>
                    <td className="px-6 py-4 font-medium text-[14.5px] text-gray-600">{formatDate(clinic.joinedAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[12px] font-bold ${statusStyle(clinic.applicationStatus)}`}>
                        {clinic.applicationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedClinic(clinic)}
                          className="px-3 py-1.5 rounded-lg text-[12.5px] font-bold text-gray-700 border border-gray-200 hover:bg-gray-50"
                        >
                          View
                        </button>

                        {clinic.applicationStatus === 'pending' ? (
                          <>
                            <button
                              type="button"
                              disabled={reviewingClinicId === clinic.id}
                              onClick={() => handleReviewAction(clinic, 'approved')}
                              className="px-3 py-1.5 rounded-lg text-[12.5px] font-bold text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {reviewingClinicId === clinic.id ? 'Updating...' : 'Approve'}
                            </button>

                            <button
                              type="button"
                              disabled={reviewingClinicId === clinic.id}
                              onClick={() => handleReviewAction(clinic, 'declined')}
                              className="px-3 py-1.5 rounded-lg text-[12.5px] font-bold text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Decline
                            </button>
                          </>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-[12px] font-bold bg-gray-100 text-gray-600">
                            Reviewed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-[13.5px] font-medium text-gray-500">
            <span>Showing 1 to {filteredClinics.length} of {filteredClinics.length} entries</span>
            <div className="flex gap-2">
              <button disabled className="px-3 py-1 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed">Prev</button>
              <button disabled className="px-3 py-1 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed">Next</button>
            </div>
          </div>
        </div>
      </div>

      {selectedClinic && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[1px] px-4 py-8 overflow-y-auto">
          <div className="max-w-[720px] mx-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-[24px] font-bold text-gray-900">Clinic Application Details</h2>
                <p className="text-[14px] text-gray-500 font-medium mt-1">Review complete profile information before decision.</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClinic(null)}
                className="text-gray-400 hover:text-gray-600 text-[22px] leading-none"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 font-bold text-[12px] uppercase">Clinic Name</p>
                <p className="text-gray-900 font-medium mt-1">{selectedClinic.name}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 font-bold text-[12px] uppercase">Email</p>
                <p className="text-gray-900 font-medium mt-1">{selectedClinic.email}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 font-bold text-[12px] uppercase">Phone</p>
                <p className="text-gray-900 font-medium mt-1">{selectedClinic.phone}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 font-bold text-[12px] uppercase">Facility Type</p>
                <p className="text-gray-900 font-medium mt-1">{selectedClinic.facilityType}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 font-bold text-[12px] uppercase">Joined</p>
                <p className="text-gray-900 font-medium mt-1">{formatDate(selectedClinic.joinedAt)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 font-bold text-[12px] uppercase">Email Verified</p>
                <p className="text-gray-900 font-medium mt-1">{selectedClinic.emailVerified ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 rounded-xl p-3">
              <p className="text-gray-500 font-bold text-[12px] uppercase">Address</p>
              <p className="text-gray-900 font-medium mt-1">{selectedClinic.address}</p>
            </div>

            <div className="mt-4 bg-gray-50 rounded-xl p-3">
              <p className="text-gray-500 font-bold text-[12px] uppercase">Admin Note</p>
              <p className="text-gray-900 font-medium mt-1">
                {selectedClinic.adminReviewNote || 'No note added yet.'}
              </p>
            </div>

            <div className="mt-4 bg-gray-50 rounded-xl p-3">
              <p className="text-gray-500 font-bold text-[12px] uppercase">Permit File</p>
              {selectedClinic.permitDocument?.url ? (
                <div className="mt-2 flex flex-col gap-2">
                  <p className="text-[12.5px] font-medium text-gray-700">
                    {selectedClinic.permitDocument.originalName || 'permit-document'}
                    {' · '}
                    {(selectedClinic.permitDocument.format || 'file').toUpperCase()}
                  </p>

                  <a
                    href={selectedClinic.permitDocument.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-[#1EBDB8] font-bold hover:underline"
                  >
                    Open uploaded permit document
                  </a>
                </div>
              ) : (
                <p className="text-gray-500 font-medium mt-1">No permit document available</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              {selectedClinic.applicationStatus === 'pending' && (
                <>
                  <button
                    type="button"
                    disabled={reviewingClinicId === selectedClinic.id}
                    onClick={() => handleReviewAction(selectedClinic, 'approved')}
                    className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reviewingClinicId === selectedClinic.id ? 'Updating...' : 'Approve Application'}
                  </button>

                  <button
                    type="button"
                    disabled={reviewingClinicId === selectedClinic.id}
                    onClick={() => handleReviewAction(selectedClinic, 'declined')}
                    className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Decline Application
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setSelectedClinic(null)}
                className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-gray-700 border border-gray-200 bg-white hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}