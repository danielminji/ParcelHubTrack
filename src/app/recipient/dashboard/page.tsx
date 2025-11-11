/**
 * Recipient Dashboard Page
 * 
 * Shows overview of recipient's parcels:
 * - Statistics cards (total, expected, ready, collected)
 * - Recent parcels list
 */

'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/context/AuthContext';
import { api } from '@/lib/api-client';

export default function RecipientDashboardPage() {
  const { user, isLoading: authLoading } = useRequireAuth(['RECIPIENT']);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    expected: 0,
    ready: 0,
    collected: 0,
  });
  const [recentParcels, setRecentParcels] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData();
    }
  }, [authLoading, user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const { data } = await api.get('/api/recipient/dashboard');
      
      if (data.success) {
        setStats(data.data.stats);
        setRecentParcels(data.data.recentParcels);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Overview of your parcels and recent activity
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Parcels */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Parcels
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Expected */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Expected
              </p>
              <p className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.expected}
              </p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900">
              <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Ready for Pickup */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Ready for Pickup
              </p>
              <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.ready}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <svg className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Collected */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Collected
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-600 dark:text-gray-400">
                {stats.collected}
              </p>
            </div>
            <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-700">
              <svg className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Parcels */}
      <div className="rounded-lg bg-white shadow dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Parcels
          </h2>
        </div>
        <div className="p-6">
          {recentParcels.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                No parcels yet. Click "Add Parcel" to register your first tracking number.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="pb-3 font-medium text-gray-900 dark:text-white">Tracking ID</th>
                    <th className="pb-3 font-medium text-gray-900 dark:text-white">Status</th>
                    <th className="pb-3 font-medium text-gray-900 dark:text-white">Weight</th>
                    <th className="pb-3 font-medium text-gray-900 dark:text-white">Date</th>
                    <th className="pb-3 font-medium text-gray-900 dark:text-white">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentParcels.map((parcel: any) => (
                    <tr key={parcel.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-4 font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                        {parcel.tracking_id}
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          parcel.status === 'READY_FOR_PICKUP' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : parcel.status === 'EXPECTED'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            : parcel.status === 'COLLECTED'
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {parcel.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-400">
                        {parcel.weight_kg ? `${parcel.weight_kg} kg` : '-'}
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-400">
                        {new Date(parcel.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        {parcel.storage_location ? (
                          <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                            {parcel.storage_location}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
