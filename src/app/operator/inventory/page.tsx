'use client';

import { useState, useEffect } from 'react';
import { useRequireAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatsCard from '@/components/common/StatsCard';
import InventoryTable from '@/components/operator/InventoryTable';

interface InventorySummary {
  total: number;
  ready: number;
  inTransit: number;
  collected: number;
}

interface InventoryLocation {
  location: string;
  total: number;
  ready: number;
  inTransit: number;
  collected: number;
}

interface InventoryData {
  summary: InventorySummary;
  locations: InventoryLocation[];
}

export default function InventoryPage() {
  const { user, isLoading: authLoading } = useRequireAuth(['OPERATOR']);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InventoryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/operator/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Failed to load inventory data');
      }
    } catch (err) {
      setError('An error occurred while loading inventory data');
      console.error('Inventory fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading inventory..." />;
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error || 'Failed to load data'}</p>
          <button
            onClick={fetchInventoryData}
            className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { summary, locations } = data;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Overview of parcel inventory across all hub locations
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Total Parcels"
          value={summary.total}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />

        <StatsCard
          title="Ready for Pickup"
          value={summary.ready}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatsCard
          title="In Transit"
          value={summary.inTransit}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />

        <StatsCard
          title="Collected"
          value={summary.collected}
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
        />
      </div>

      {/* Inventory Table */}
      <InventoryTable data={locations} />
    </div>
  );
}
