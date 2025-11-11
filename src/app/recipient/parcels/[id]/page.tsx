/**
 * Parcel Details Page
 * Shows detailed information about a specific parcel with cancel option
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useRequireAuth } from '@/context/AuthContext';
import { api } from '@/lib/api-client';

export default function ParcelDetailsPage() {
  useRequireAuth(['RECIPIENT']);
  
  const router = useRouter();
  const params = useParams();
  const parcelId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [parcel, setParcel] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    fetchParcelDetails();
  }, [parcelId]);

  const fetchParcelDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get(`/api/recipient/parcels/${parcelId}`);
      
      console.log('Parcel Details Response:', response.data);
      
      if (response.data.success) {
        // Extract the parcel from the data object
        const parcelData = response.data.data?.parcel || response.data.data;
        setParcel(parcelData);
      } else {
        setError(response.data.error?.message || response.data.error || 'Failed to load parcel details');
      }
    } catch (err: any) {
      console.error('Failed to fetch parcel:', err);
      if (err.response?.status === 403) {
        setError('You do not have access to this parcel');
      } else if (err.response?.status === 404) {
        setError('Parcel not found');
      } else {
        setError(err.response?.data?.error?.message || err.response?.data?.error || 'Failed to load parcel details');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      
      const response = await api.delete(`/api/recipient/parcels/${parcelId}`);
      
      if (response.data.success) {
        router.push('/recipient/parcels?cancelled=true');
      } else {
        setError(response.data.error || 'Failed to cancel parcel');
      }
    } catch (err: any) {
      console.error('Failed to cancel parcel:', err);
      setError(err.response?.data?.error || 'Failed to cancel parcel');
    } finally {
      setIsCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading parcel details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !parcel) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Error loading parcel</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={fetchParcelDetails}
                  className="text-sm font-medium text-red-800 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                >
                  Try again →
                </button>
                <Link
                  href="/recipient/parcels"
                  className="text-sm font-medium text-red-800 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                >
                  Back to parcels →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY_FOR_PICKUP':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'EXPECTED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'COLLECTED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const canCancel = parcel.status === 'EXPECTED' || parcel.status === 'READY_FOR_PICKUP';

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/recipient/parcels"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Parcels
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Parcel Details
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Tracking ID: <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{parcel.tracking_id}</span>
          </p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(parcel?.status || 'EXPECTED')}`}>
          {parcel?.status ? parcel.status.replace(/_/g, ' ') : 'EXPECTED'}
        </span>
      </div>

      {/* Parcel Information Card */}
      <div className="rounded-lg bg-white shadow dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Parcel Information</h2>
        </div>
        
        <div className="p-6">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Tracking ID */}
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tracking Number</dt>
              <dd className="mt-1 font-mono text-sm font-semibold text-gray-900 dark:text-white">{parcel.tracking_id}</dd>
            </div>

            {/* Status */}
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
              <dd className="mt-1">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(parcel?.status || 'EXPECTED')}`}>
                  {parcel?.status ? parcel.status.replace(/_/g, ' ') : 'EXPECTED'}
                </span>
              </dd>
            </div>

            {/* Storage Location */}
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Storage Location</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {parcel.storage_location ? (
                  <span className="font-mono font-semibold">{parcel.storage_location}</span>
                ) : (
                  <span className="text-gray-400">Not assigned yet</span>
                )}
              </dd>
            </div>

            {/* Weight */}
            {parcel.weight_kg && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Weight</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{parcel.weight_kg} kg</dd>
              </div>
            )}

            {/* Sender Name */}
            {parcel.sender_name && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sender Name</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{parcel.sender_name}</dd>
              </div>
            )}

            {/* Sender Contact */}
            {parcel.sender_contact && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sender Contact</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{parcel.sender_contact}</dd>
              </div>
            )}

            {/* Description */}
            {parcel.description && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{parcel.description}</dd>
              </div>
            )}

            {/* Fee Amount */}
            {parcel.fee_amount && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Storage Fee</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  RM {parcel.fee_amount.toFixed(2)}
                  {parcel.fee_paid && <span className="ml-2 text-xs text-green-600">(Paid)</span>}
                </dd>
              </div>
            )}

            {/* Created At */}
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Registered On</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {new Date(parcel.created_at).toLocaleString()}
              </dd>
            </div>

            {/* Received At */}
            {parcel.received_at && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Received At</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(parcel.received_at).toLocaleString()}
                </dd>
              </div>
            )}

            {/* Collected At */}
            {parcel.collected_at && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Collected At</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(parcel.collected_at).toLocaleString()}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Actions */}
        {canCancel && (
          <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <button
              onClick={() => setShowCancelConfirm(true)}
              disabled={isCancelling}
              className="inline-flex items-center rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel Parcel Registration
            </button>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="flex items-start">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Cancel Parcel Registration</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to cancel this parcel registration? This action cannot be undone.
                </p>
                <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tracking ID: <span className="font-mono text-blue-600 dark:text-blue-400">{parcel.tracking_id}</span>
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel Registration'}
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={isCancelling}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                No, Keep It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
