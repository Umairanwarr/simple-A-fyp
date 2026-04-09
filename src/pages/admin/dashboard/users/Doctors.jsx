import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../AdminLayout';
import {
  deleteAdminDoctor,
  fetchAdminDoctors,
  reviewAdminDoctorApplication
} from '../../../../services/authApi';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [reviewingDoctorId, setReviewingDoctorId] = useState('');
  const [deletingDoctorId, setDeletingDoctorId] = useState('');

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

    const loadDoctors = async () => {
      const adminToken = localStorage.getItem('adminToken');

      if (!adminToken) {
        setError('Please login as admin to view doctors');
        setLoading(false);
        return;
      }

      try {
        const data = await fetchAdminDoctors(adminToken);
        setDoctors(
          (data.doctors || []).map((doctor) => ({
            ...doctor,
            applicationStatus: normalizeApplicationStatus(doctor.applicationStatus)
          }))
        );
      } catch (err) {
        setError(err.message || 'Could not fetch doctors');
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  const filteredDoctors = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return doctors;
    }

    return doctors.filter((doctor) => {
      return (
        doctor.fullName.toLowerCase().includes(normalizedSearch) ||
        doctor.email.toLowerCase().includes(normalizedSearch) ||
        doctor.specialization.toLowerCase().includes(normalizedSearch) ||
        doctor.applicationStatus.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [doctors, search]);

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

  const handleReviewAction = async (doctor, status) => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
      toast.error('Please login as admin first');
      return;
    }

    let note = '';

    if (status === 'declined') {
      const prompted = window.prompt('Reason for decline (optional):', doctor.adminReviewNote || '');

      if (prompted === null) {
        return;
      }

      note = prompted;
    }

    try {
      setReviewingDoctorId(doctor.id);
      const data = await reviewAdminDoctorApplication(adminToken, doctor.id, status, note);

      const normalizedDoctor = {
        ...data.doctor,
        applicationStatus:
          data.doctor?.applicationStatus === 'approve'
            ? 'approved'
            : data.doctor?.applicationStatus === 'decline'
              ? 'declined'
              : data.doctor?.applicationStatus
      };

      setDoctors((prevDoctors) => {
        return prevDoctors.map((item) => {
          if (item.id !== doctor.id) {
            return item;
          }

          return normalizedDoctor;
        });
      });

      setSelectedDoctor((prevSelectedDoctor) => {
        if (!prevSelectedDoctor || prevSelectedDoctor.id !== doctor.id) {
          return prevSelectedDoctor;
        }

        return normalizedDoctor;
      });

      toast.success(data.message || `Doctor application ${status}`);
    } catch (err) {
      toast.error(err.message || 'Could not update doctor application status');
    } finally {
      setReviewingDoctorId('');
    }
  };

  const handleDeleteDoctor = async (doctor) => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
      toast.error('Please login as admin first');
      return;
    }

    const shouldDelete = window.confirm(`Delete doctor ${doctor.fullName}? This action cannot be undone.`);

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingDoctorId(doctor.id);
      await deleteAdminDoctor(adminToken, doctor.id);
      setDoctors((prevDoctors) => prevDoctors.filter((item) => item.id !== doctor.id));
      setSelectedDoctor((prevSelectedDoctor) => {
        if (!prevSelectedDoctor || prevSelectedDoctor.id !== doctor.id) {
          return prevSelectedDoctor;
        }

        return null;
      });
      toast.success('Doctor deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Could not delete doctor');
    } finally {
      setDeletingDoctorId('');
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-gray-900 flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1EBDB8]">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
              Doctors Management
            </h1>
            <p className="text-[14px] text-gray-500 font-medium mt-1">
              Review doctor applications, documents, and approval status.
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
              placeholder="Search doctors by name, specialty, email, or status..."
              className="w-full bg-[#FAFAFA] text-[#4B5563] text-[14px] font-medium py-2.5 pl-10 pr-4 rounded-xl outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 border border-gray-200 focus:border-[#1EBDB8] transition-all"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Doctor Name</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Specialty</th>
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
                      Loading doctors...
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

                {!loading && !error && filteredDoctors.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-sm font-medium text-gray-500">
                      No doctors found.
                    </td>
                  </tr>
                )}

                {!loading && !error && filteredDoctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[14px]">
                          {doctor.fullName.charAt(0)}
                        </div>
                        <span className="font-bold text-[14.5px] text-gray-900">{doctor.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-[14.5px] text-gray-600">
                      <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md text-[12.5px] border border-blue-100/50">
                        {doctor.specialization}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-[14.5px] text-gray-600">{doctor.email}</td>
                    <td className="px-6 py-4 font-medium text-[14.5px] text-gray-600">{formatDate(doctor.joinedAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[12px] font-bold ${statusStyle(doctor.applicationStatus)}`}>
                        {doctor.applicationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedDoctor(doctor)}
                          className="px-3 py-1.5 rounded-lg text-[12.5px] font-bold text-gray-700 border border-gray-200 hover:bg-gray-50"
                        >
                          View
                        </button>

                        {doctor.applicationStatus === 'pending' ? (
                          <>
                            <button
                              type="button"
                              disabled={reviewingDoctorId === doctor.id || deletingDoctorId === doctor.id}
                              onClick={() => handleReviewAction(doctor, 'approved')}
                              className="px-3 py-1.5 rounded-lg text-[12.5px] font-bold text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {reviewingDoctorId === doctor.id ? 'Updating...' : 'Approve'}
                            </button>

                            <button
                              type="button"
                              disabled={reviewingDoctorId === doctor.id || deletingDoctorId === doctor.id}
                              onClick={() => handleReviewAction(doctor, 'declined')}
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

                        <button
                          type="button"
                          disabled={deletingDoctorId === doctor.id}
                          onClick={() => handleDeleteDoctor(doctor)}
                          className="inline-flex items-center gap-2 text-red-500 hover:text-red-600 disabled:text-gray-400 disabled:cursor-not-allowed font-bold text-[13px] px-2 py-1 rounded-lg transition-colors"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                            <path d="M10 11v6"></path>
                            <path d="M14 11v6"></path>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                          </svg>
                          {deletingDoctorId === doctor.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-[13.5px] font-medium text-gray-500">
            <span>Showing 1 to {filteredDoctors.length} of {filteredDoctors.length} entries</span>
            <div className="flex gap-2">
              <button disabled className="px-3 py-1 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed">Prev</button>
              <button disabled className="px-3 py-1 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed">Next</button>
            </div>
          </div>
        </div>
      </div>

      {selectedDoctor && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[1px] px-4 py-8 overflow-y-auto">
          <div className="max-w-[720px] mx-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-[24px] font-bold text-gray-900">Doctor Application Details</h2>
                <p className="text-[14px] text-gray-500 font-medium mt-1">Review complete profile information before decision.</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoctor(null)}
                className="text-gray-400 hover:text-gray-600 text-[22px] leading-none"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 font-bold text-[12px] uppercase">Full Name</p>
                <p className="text-gray-900 font-medium mt-1">{selectedDoctor.fullName}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 font-bold text-[12px] uppercase">Professional Email</p>
                <p className="text-gray-900 font-medium mt-1">{selectedDoctor.email}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 font-bold text-[12px] uppercase">Phone</p>
                <p className="text-gray-900 font-medium mt-1">{selectedDoctor.phone}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 font-bold text-[12px] uppercase">Specialization</p>
                <p className="text-gray-900 font-medium mt-1">{selectedDoctor.specialization}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 font-bold text-[12px] uppercase">License Number</p>
                <p className="text-gray-900 font-medium mt-1">{selectedDoctor.licenseNumber}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 font-bold text-[12px] uppercase">Experience</p>
                <p className="text-gray-900 font-medium mt-1">{selectedDoctor.experience} years</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 font-bold text-[12px] uppercase">Joined</p>
                <p className="text-gray-900 font-medium mt-1">{formatDate(selectedDoctor.joinedAt)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 font-bold text-[12px] uppercase">Email Verified</p>
                <p className="text-gray-900 font-medium mt-1">{selectedDoctor.emailVerified ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 rounded-xl p-3">
              <p className="text-gray-500 font-bold text-[12px] uppercase">Address</p>
              <p className="text-gray-900 font-medium mt-1">{selectedDoctor.address}</p>
            </div>

            <div className="mt-4 bg-gray-50 rounded-xl p-3">
              <p className="text-gray-500 font-bold text-[12px] uppercase">Admin Note</p>
              <p className="text-gray-900 font-medium mt-1">
                {selectedDoctor.adminReviewNote || 'No note added yet.'}
              </p>
            </div>

            <div className="mt-4 bg-gray-50 rounded-xl p-3">
              <p className="text-gray-500 font-bold text-[12px] uppercase">License File</p>
              {selectedDoctor.licenseDocument?.url ? (
                <div className="mt-2 flex flex-col gap-2">
                  <p className="text-[12.5px] font-medium text-gray-700">
                    {selectedDoctor.licenseDocument.originalName || 'license-document'}
                    {' · '}
                    {(selectedDoctor.licenseDocument.format || 'file').toUpperCase()}
                  </p>

                  <a
                    href={selectedDoctor.licenseDocument.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-[#1EBDB8] font-bold hover:underline"
                  >
                    Open uploaded license document
                  </a>
                </div>
              ) : (
                <p className="text-gray-500 font-medium mt-1">No license document available</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              {selectedDoctor.applicationStatus === 'pending' && (
                <>
                  <button
                    type="button"
                    disabled={reviewingDoctorId === selectedDoctor.id}
                    onClick={() => handleReviewAction(selectedDoctor, 'approved')}
                    className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reviewingDoctorId === selectedDoctor.id ? 'Updating...' : 'Approve Application'}
                  </button>

                  <button
                    type="button"
                    disabled={reviewingDoctorId === selectedDoctor.id}
                    onClick={() => handleReviewAction(selectedDoctor, 'declined')}
                    className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Decline Application
                  </button>
                </>
              )}

              <button
                type="button"
                disabled={deletingDoctorId === selectedDoctor.id}
                onClick={() => handleDeleteDoctor(selectedDoctor)}
                className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingDoctorId === selectedDoctor.id ? 'Deleting...' : 'Delete Doctor'}
              </button>

              <button
                type="button"
                onClick={() => setSelectedDoctor(null)}
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
