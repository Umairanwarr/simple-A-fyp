import React from 'react';
import OverviewStats from './analytics/OverviewStats';
import ProviderPerformance from './analytics/ProviderPerformance';
import FacilityCapacity from './analytics/FacilityCapacity';

export default function ClinicAnalytics() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full min-w-0">
      <OverviewStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full min-w-0">
        <ProviderPerformance />
        <FacilityCapacity />
      </div>
    </div>
  );
}
