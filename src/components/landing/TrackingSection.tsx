'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ParcelStatus {
  tracking_id: string;
  status: string;
  created_at: string;
  checked_in_at: string | null;
  storage_location: string | null;
  fee_amount: number | null;
}

export default function TrackingSection() {
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParcelStatus | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingId.trim()) {
      setError('Please enter a tracking ID');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/v1/public/track/${trackingId}`);
      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message || 'Parcel not found');
      }
    } catch (err) {
      setError('Failed to track parcel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: string; description: string }> = {
      EXPECTED: {
        label: 'Expected',
        color: 'bg-blue-500',
        icon: '📦',
        description: 'Your parcel is expected to arrive soon'
      },
      READY_FOR_PICKUP: {
        label: 'Ready for Pickup',
        color: 'bg-green-500',
        icon: '✅',
        description: 'Your parcel is ready! Come collect it anytime'
      },
      ARRIVED_UNCLAIMED: {
        label: 'Arrived',
        color: 'bg-yellow-500',
        icon: '📬',
        description: 'Your parcel has arrived. Please collect at counter'
      },
      COLLECTED: {
        label: 'Collected',
        color: 'bg-gray-500',
        icon: '✔️',
        description: 'This parcel has been collected'
      }
    };

    return statusMap[status] || {
      label: status,
      color: 'bg-gray-500',
      icon: '📦',
      description: 'Status information available'
    };
  };

  return (
    <section id="track" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl mb-6 shadow-2xl"
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Track Your Parcel
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No registration needed! Just enter your tracking ID to check your parcel status
            </p>
          </div>

          {/* Tracking Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700"
          >
            <form onSubmit={handleTrack} className="mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="Enter tracking ID (e.g., PT123456)"
                    className="w-full px-6 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-lg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-lg whitespace-nowrap"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Tracking...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Track Now
                    </span>
                  )}
                </button>
              </div>
            </form>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl mb-6"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Result */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
              >
                {(() => {
                  const statusInfo = getStatusInfo(result.status);
                  return (
                    <>
                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{statusInfo.icon}</span>
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 ${statusInfo.color} text-white rounded-lg font-semibold text-lg`}>
                              {statusInfo.label}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl mb-6">
                        <p className="text-gray-700 dark:text-gray-300 text-center font-medium">
                          {statusInfo.description}
                        </p>
                      </div>

                      {/* Details */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tracking ID</div>
                          <div className="text-lg font-mono font-bold text-gray-900 dark:text-white">{result.tracking_id}</div>
                        </div>
                        
                        {result.storage_location && (
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Storage Location</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">{result.storage_location}</div>
                          </div>
                        )}
                        
                        {result.fee_amount !== null && result.fee_amount > 0 && (
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Collection Fee</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">RM {result.fee_amount.toFixed(2)}</div>
                          </div>
                        )}
                        
                        {result.checked_in_at && (
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Checked In</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              {new Date(result.checked_in_at).toLocaleDateString('en-MY', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action for Ready Parcels */}
                      {result.status === 'READY_FOR_PICKUP' && (
                        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl">
                          <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <p className="font-semibold text-green-700 dark:text-green-300 mb-1">Ready for Collection</p>
                              <p className="text-sm text-green-600 dark:text-green-400">
                                Please bring your ID and come to <strong>{result.storage_location}</strong> to collect your parcel.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </motion.div>
            )}

            {/* Info */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Want more features? <a href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Create a free account</a> to get instant notifications and manage all your parcels.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
