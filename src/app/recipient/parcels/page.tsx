/**
 * Recipient Parcels List Page
 * 
 * Shows all parcels with:
 * - Status filter tabs
 * - Pagination
 * - Parcel details
 */

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRequireAuth } from '@/context/AuthContext';
import { api } from '@/lib/api-client';

export default function RecipientParcelsPage() {
  useRequireAuth(['RECIPIENT']);
  
  const searchParams = useSearchParams();
  const status = searchParams?.get('status') || null;
  const page = parseInt(searchParams?.get('page') || '1');
  
  const [isLoading, setIsLoading] = useState(true);
  const [parcels, setParcels] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        params.append('page', page.toString());
        params.append('limit', '10');
        
        const response = await api.get(`/api/recipient/parcels?${params.toString()}`);
        
        console.log('API Response:', response.data); // Debug log
        
        if (response.data.success) {
          const parcelsData = Array.isArray(response.data.data) ? response.data.data : [];
          setParcels(parcelsData);
          setPagination({
            total: response.data.meta?.total || 0,
            page: response.data.meta?.page || 1,
            limit: response.data.meta?.limit || 10,
            totalPages: response.data.meta?.totalPages || 1,
          });
        } else {
          setParcels([]);
          setError(response.data.error?.message || 'Failed to load parcels');
        }
      } catch (err: any) {
        console.error('Failed to fetch parcels:', err);
        setParcels([]); // Ensure parcels is always an array
        setError(err.response?.data?.error?.message || err.message || 'Failed to load parcels');
      } finally {
        setIsLoading(false);
      }
    };

    fetchParcels();
  }, [status, page]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading parcels...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Error loading parcels</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm font-medium text-red-800 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              >
                Try again →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Parcels
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage and track all your parcels
          </p>
        </div>
        <Link
          href="/recipient/pre-register"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          + Pre-Register Parcel
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <Link
          href="/recipient/parcels"
          className={`border-b-2 px-4 py-2 text-sm font-medium ${
            !status
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          All
        </Link>
        <Link
          href="/recipient/parcels?status=EXPECTED"
          className={`border-b-2 px-4 py-2 text-sm font-medium ${
            status === 'EXPECTED'
              ? 'border-yellow-600 text-yellow-600 dark:border-yellow-400 dark:text-yellow-400'
              : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          Expected
        </Link>
        <Link
          href="/recipient/parcels?status=READY_FOR_PICKUP"
          className={`border-b-2 px-4 py-2 text-sm font-medium ${
            status === 'READY_FOR_PICKUP'
              ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400'
              : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          Ready for Pickup
        </Link>
        <Link
          href="/recipient/parcels?status=COLLECTED"
          className={`border-b-2 px-4 py-2 text-sm font-medium ${
            status === 'COLLECTED'
              ? 'border-gray-600 text-gray-600 dark:border-gray-400 dark:text-gray-400'
              : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          Collected
        </Link>
      </div>

      {/* Parcels List */}
      <div className="rounded-lg bg-white shadow dark:bg-gray-800">
        {!parcels || parcels.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No parcels found
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {status
                ? `You don't have any ${status.toLowerCase().replace(/_/g, ' ')} parcels.`
                : "You haven't registered any parcels yet."}
            </p>
            <Link
              href="/recipient/pre-register"
              className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Pre-Register Your First Parcel
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Tracking ID</th>
                    <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Status</th>
                    <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Storage</th>
                    <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Weight</th>
                    <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Fee</th>
                    <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Date</th>
                    <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {(parcels || []).map((parcel: any) => (
                    <tr key={parcel.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                          {parcel.tracking_id}
                        </div>
                        {parcel.sender_name && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            From: {parcel.sender_name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4">
                        {parcel.storage_location ? (
                          <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                            {parcel.storage_location}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {parcel.weight_kg ? `${parcel.weight_kg} kg` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {parcel.fee_amount ? (
                          <span className="font-medium text-gray-900 dark:text-white">
                            RM {parcel.fee_amount.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {new Date(parcel.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/recipient/parcels/${parcel.id}`}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total parcels)
                  </div>
                  <div className="flex gap-2">
                    {pagination.hasPrevPage && (
                      <Link
                        href={`/recipient/parcels?${status ? `status=${status}&` : ''}page=${pagination.page - 1}`}
                        className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Previous
                      </Link>
                    )}
                    {pagination.hasNextPage && (
                      <Link
                        href={`/recipient/parcels?${status ? `status=${status}&` : ''}page=${pagination.page + 1}`}
                        className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Next
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
