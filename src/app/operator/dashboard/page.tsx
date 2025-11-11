/**
 * Operator Dashboard Page
 * 
 * Shows:
 * - Today's check-ins and check-outs
 * - Storage capacity
 * - Status breakdown
 * - Recent activity
 */

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/context/AuthContext';

export default function OperatorDashboardPage() {
  const { user, isLoading: authLoading } = useRequireAuth(['OPERATOR']);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    today: { checked_in: 0, checked_out: 0, pending_pickup: 0 },
    storage: { total_capacity: 300, occupied: 0, available: 300 },
    stats: {
      expected: 0,
      ready_for_pickup: 0,
      arrived_unclaimed: 0,
      collected_total: 0,
      returned: 0,
      cancelled: 0,
    },
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    }
  }, [authLoading, user]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/operator/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      setStats(result.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent"></div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Operator Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Today's operations and inventory status
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          href="/operator/check-in"
          className="flex items-center justify-between rounded-lg bg-blue-600 p-6 text-white shadow-lg hover:bg-blue-700"
        >
          <div>
            <h3 className="text-lg font-semibold">Check-In Parcel</h3>
            <p className="mt-1 text-sm text-blue-100">Scan or enter tracking ID</p>
          </div>
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>

        <Link
          href="/operator/check-out"
          className="flex items-center justify-between rounded-lg bg-green-600 p-6 text-white shadow-lg hover:bg-green-700"
        >
          <div>
            <h3 className="text-lg font-semibold">Check-Out Parcel</h3>
            <p className="mt-1 text-sm text-green-100">Process pickup and payment</p>
          </div>
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </Link>
      </div>

      {/* Today's Activity */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Today's Check-Ins */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Today's Check-Ins
              </p>
              <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.today?.checked_in || 0}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Today's Check-Outs */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Today's Check-Outs
              </p>
              <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.today?.checked_out || 0}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <svg className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Occupied Slots */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Occupied Slots
              </p>
              <p className="mt-2 text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.storage?.occupied || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                of {stats.storage?.total_capacity || 300}
              </p>
            </div>
            <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900">
              <svg className="h-6 w-6 text-orange-600 dark:text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Available Slots */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Available Slots
              </p>
              <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.storage?.available || 300}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round(((stats.storage?.available || 300) / (stats.storage?.total_capacity || 300)) * 100)}% free
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Parcels by Status
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Expected</p>
            <p className="mt-1 text-2xl font-bold text-yellow-900 dark:text-yellow-200">
              {stats.stats?.expected || 0}
            </p>
          </div>

          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">Ready</p>
            <p className="mt-1 text-2xl font-bold text-green-900 dark:text-green-200">
              {stats.stats?.ready_for_pickup || 0}
            </p>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Arrived</p>
            <p className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-200">
              {stats.stats?.arrived || 0}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-300">Collected</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-200">
              {stats.stats?.collected || 0}
            </p>
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">Cancelled</p>
            <p className="mt-1 text-2xl font-bold text-red-900 dark:text-red-200">
              {stats.stats?.cancelled || 0}
            </p>
          </div>

          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
            <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Returned</p>
            <p className="mt-1 text-2xl font-bold text-purple-900 dark:text-purple-200">
              {stats.stats?.returned || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          href="/operator/search"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <svg className="h-8 w-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">Search Parcels</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Find parcel by tracking ID or recipient</p>
        </Link>

        <Link
          href="/operator/inventory"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <svg className="h-8 w-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">View Inventory</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">See all parcels in storage</p>
        </Link>

        <Link
          href="/operator/reports"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <svg className="h-8 w-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">Reports</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">View activity reports and analytics</p>
        </Link>
      </div>
    </div>
  );
}
