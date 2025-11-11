/**
 * Pre-Register Parcel Page
 * Allows recipients to register tracking numbers before arrival
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRequireAuth } from '@/context/AuthContext';
import { api } from '@/lib/api-client';

export default function PreRegisterPage() {
  useRequireAuth(['RECIPIENT']);
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      trackingId: formData.get('tracking_id') as string,
      description: formData.get('description') as string,
    };

    try {
      const response = await api.post('/api/recipient/pre-register', data);

      if (response.data.success) {
        setSuccess('Parcel pre-registered successfully! We\'ll notify you when it arrives.');
        setTimeout(() => router.push('/recipient/parcels'), 2000);
      } else {
        setError(response.data.error || 'Failed to pre-register parcel');
      }
    } catch (err: any) {
      console.error('Pre-register error:', err);
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Page Header */}
      <div className="mb-8">
        <Link
          href="/recipient/parcels"
          className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Parcels
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Pre-Register Parcel
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Register your tracking number before the parcel arrives for faster processing
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success Message */}
          {success && (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Tracking ID */}
          <div>
            <label htmlFor="tracking_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tracking Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="tracking_id"
              name="tracking_id"
              required
              placeholder="e.g., 1234567890"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter the tracking number from your courier notification
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="e.g., Laptop from Shopee"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          {/* Benefits Info */}
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">
                  Benefits of Pre-Registration
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <ul className="list-disc space-y-1 pl-5">
                    <li>Faster check-in when your parcel arrives</li>
                    <li>Automatic matching with your profile</li>
                    <li>Instant notification when parcel is ready</li>
                    <li>Track expected parcels in your dashboard</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Registering...' : 'Register Parcel'}
            </button>
            <Link
              href="/recipient/parcels"
              className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
