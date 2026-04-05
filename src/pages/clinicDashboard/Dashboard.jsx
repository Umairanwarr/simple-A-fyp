import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ClinicDashboard() {
	const navigate = useNavigate();

	const clinicName = useMemo(() => {
		try {
			const rawClinic = localStorage.getItem('clinic');

			if (!rawClinic) {
				return 'Clinic';
			}

			const parsedClinic = JSON.parse(rawClinic);
			return parsedClinic?.name || 'Clinic';
		} catch (error) {
			return 'Clinic';
		}
	}, []);

	return (
		<div className="min-h-screen bg-[#F8FAFC] font-sans px-6 py-10">
			<div className="max-w-[980px] mx-auto bg-white border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10">
				<h1 className="text-[30px] sm:text-[36px] font-bold text-[#1F2937] leading-tight">
					Welcome, <span className="text-[#1EBDB8]">{clinicName}</span>
				</h1>
				<p className="mt-3 text-[15px] text-[#6B7280] font-medium">
					You are now signed in to your clinic dashboard.
				</p>

				<div className="mt-8 flex flex-wrap gap-3">
					<button
						type="button"
						onClick={() => navigate('/')}
						className="px-5 py-2.5 rounded-xl bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white font-bold text-[14px] transition-colors"
					>
						Go to Home
					</button>
					<button
						type="button"
						onClick={() => {
							localStorage.removeItem('clinicToken');
							localStorage.removeItem('clinic');
							navigate('/signin');
						}}
						className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-[14px] transition-colors"
					>
						Sign Out
					</button>
				</div>
			</div>
		</div>
	);
}
