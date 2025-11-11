"use client";

/**
 * Operator Check-Out Page
 * 
 * Features:
 * - Search parcel by tracking ID
 * - Display parcel details
 * - Payment processing form
 * - Recipient verification
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/context/AuthContext';

export default function OperatorCheckOutPage() {
  const { user, isLoading: authLoading } = useRequireAuth(['OPERATOR']);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [parcel, setParcel] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setError('');
    setParcel(null);

    try {
      const response = await fetch(`/api/v1/operator/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        const foundParcel = data.data[0];
        setParcel(foundParcel);
        setPaymentAmount(foundParcel.fee_amount?.toString() || '0');
        if (foundParcel.recipient_name) {
          setRecipientName(foundParcel.recipient_name);
        }
        if (foundParcel.recipient_phone) {
          setRecipientPhone(foundParcel.recipient_phone);
        }
      } else {
        setError('Parcel not found or not ready for pickup');
      }
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/v1/operator/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracking_id: parcel.tracking_id,
          payment_amount: parseFloat(paymentAmount),
          payment_method: paymentMethod,
          actual_recipient_name: recipientName,
          actual_recipient_phone: recipientPhone,
          notes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSearchQuery('');
          setParcel(null);
          setPaymentAmount('');
          setRecipientName('');
          setRecipientPhone('');
          setNotes('');
          setSuccess(false);
        }, 3000);
      } else {
        setError(data.error?.message || 'Check-out failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateChange = () => {
    const paid = parseFloat(paymentAmount) || 0;
    const fee = parseFloat(parcel?.fee_amount) || 0;
    return Math.max(0, paid - fee).toFixed(2);
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Check-Out Parcel
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Search parcel and process pickup
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <div className="flex">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                ✅ Parcel checked out successfully!
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Search Form */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <form onSubmit={handleSearch}>
          <label htmlFor="search" className="block text-sm font-medium text-gray-900 dark:text-white">
            Search Parcel by Tracking ID
          </label>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              placeholder="Enter tracking ID"
              autoFocus
              required
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-mono text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Parcel Details & Check-Out Form */}
      {parcel && (
        <div className="space-y-6">
          {/* Parcel Information */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Parcel Information
            </h2>
            <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Tracking ID</dt>
                <dd className="mt-1 font-mono text-lg font-bold text-blue-600 dark:text-blue-400">{parcel.tracking_id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</dt>
                <dd className="mt-1">
                  <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 dark:bg-green-900 dark:text-green-300">
                    {parcel.status.replace(/_/g, ' ')}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Storage Location</dt>
                <dd className="mt-1 font-mono text-lg font-bold text-gray-900 dark:text-white">{parcel.storage_location}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Weight</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{parcel.weight_kg} kg</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Fee Amount</dt>
                <dd className="mt-1 text-xl font-bold text-gray-900 dark:text-white">RM {parcel.fee_amount?.toFixed(2)}</dd>
              </div>
            </dl>
          </div>

          {/* Check-Out Form */}
          <form onSubmit={handleCheckOut} className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Process Check-Out
            </h2>

            <div className="space-y-4">
              {/* Recipient Name */}
              <div>
                <label htmlFor="recipientName" className="block text-sm font-medium text-gray-900 dark:text-white">
                  Recipient Name
                </label>
                <input
                  type="text"
                  id="recipientName"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Enter recipient name"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Recipient Phone */}
              <div>
                <label htmlFor="recipientPhone" className="block text-sm font-medium text-gray-900 dark:text-white">
                  Recipient Phone
                </label>
                <input
                  type="tel"
                  id="recipientPhone"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="e.g., +60123456789"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Payment Method */}
                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-900 dark:text-white">
                    Payment Method <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="CASH">Cash</option>
                    <option value="QR">QR Payment (DuitNow/TnG)</option>
                    <option value="CARD">Card</option>
                  </select>
                </div>

                {/* Payment Amount */}
                <div>
                  <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-900 dark:text-white">
                    Payment Amount (RM) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    id="paymentAmount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    step="0.01"
                    min="0"
                    required
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Change Calculation */}
              {paymentMethod === 'CASH' && parseFloat(paymentAmount) > 0 && (
                <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Fee Amount:</span>
                    <span className="text-sm font-bold text-yellow-900 dark:text-yellow-200">RM {parcel.fee_amount?.toFixed(2)}</span>
                  </div>
                  <div className="mt-1 flex justify-between">
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Amount Paid:</span>
                    <span className="text-sm font-bold text-yellow-900 dark:text-yellow-200">RM {parseFloat(paymentAmount).toFixed(2)}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-yellow-200 pt-2 dark:border-yellow-700">
                    <span className="font-medium text-yellow-800 dark:text-yellow-300">Change:</span>
                    <span className="text-lg font-bold text-yellow-900 dark:text-yellow-200">RM {calculateChange()}</span>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-900 dark:text-white">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any additional notes"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Complete Check-Out'}
                </button>
                <button
                  type="button"
                  onClick={() => setParcel(null)}
                  className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
