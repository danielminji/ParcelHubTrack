"use client";

/**
 * Operator Check-In Page
 * 
 * Features:
 * - Barcode scanner input
 * - Manual entry form
 * - Weight and dimensions input
 * - Auto-match with pre-registered parcels
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/context/AuthContext';

export default function OperatorCheckInPage() {
  const { user, isLoading: authLoading } = useRequireAuth(['OPERATOR']);
  const router = useRouter();
  const [trackingId, setTrackingId] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [isDamaged, setIsDamaged] = useState(false);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/v1/operator/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracking_id: trackingId,
          weight_kg: parseFloat(weightKg),
          is_damaged: isDamaged,
          notes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        // Clear form
        setTrackingId('');
        setWeightKg('');
        setIsDamaged(false);
        setNotes('');
      } else {
        setError(data.error?.message || 'Check-in failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Check-In Parcel
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Scan barcode or enter tracking ID manually
        </p>
      </div>

      {/* Success Message */}
      {result && (
        <div className="mb-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <div className="flex">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                {result.message}
              </h3>
              <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                <p><strong>Tracking ID:</strong> {result.data.tracking_id}</p>
                <p><strong>Storage Location:</strong> <span className="font-mono font-bold">{result.data.storage_location}</span></p>
                <p><strong>Fee:</strong> RM {result.data.fee_amount?.toFixed(2)}</p>
                {result.data.recipient_name && (
                  <p><strong>Recipient:</strong> {result.data.recipient_name}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                {error}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Check-In Form */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tracking ID (Barcode Scanner Input) */}
          <div>
            <label htmlFor="trackingId" className="block text-sm font-medium text-gray-900 dark:text-white">
              Tracking ID <span className="text-red-600">*</span>
            </label>
            <div className="mt-2 relative">
              <input
                type="text"
                id="trackingId"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                placeholder="Scan barcode or enter manually"
                autoFocus
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <div className="absolute right-3 top-3">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Use barcode scanner or type tracking number
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Weight */}
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-900 dark:text-white">
                Weight (kg) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                id="weight"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="0.0"
                step="0.1"
                min="0.1"
                max="100"
                required
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Damaged Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="damaged"
              checked={isDamaged}
              onChange={(e) => setIsDamaged(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="damaged" className="ml-2 text-sm text-gray-900 dark:text-white">
              Parcel is damaged
            </label>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-900 dark:text-white">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any additional notes (e.g., damage description, special instructions)"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {isLoading ? 'Processing...' : 'Check-In Parcel'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/operator/dashboard')}
              className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Instructions */}
      <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">
          📝 Check-In Instructions
        </h3>
        <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-400">
          <li>1. Scan or enter the tracking ID from the parcel</li>
          <li>2. Weigh the parcel and enter the weight</li>
          <li>3. System will auto-generate storage location based on weight</li>
          <li>4. Place parcel at the indicated storage location</li>
          <li>5. Recipient will be notified automatically if pre-registered</li>
        </ul>
      </div>
    </div>
  );
}
