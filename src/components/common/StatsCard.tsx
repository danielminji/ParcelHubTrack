/**
 * Stats Card Component (View)
 * Reusable card component for displaying statistics
 */

import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  subtitle?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-600 dark:text-blue-400',
    valueBg: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-600 dark:text-green-400',
    valueBg: 'text-green-600 dark:text-green-400'
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900',
    text: 'text-purple-600 dark:text-purple-400',
    valueBg: 'text-purple-600 dark:text-purple-400'
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900',
    text: 'text-orange-600 dark:text-orange-400',
    valueBg: 'text-orange-600 dark:text-orange-400'
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-600 dark:text-red-400',
    valueBg: 'text-red-600 dark:text-red-400'
  }
};

export default function StatsCard({ title, value, icon, color, subtitle }: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className={`mt-2 text-3xl font-bold ${colors.valueBg}`}>{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 ${colors.bg} rounded-full`}>
          <div className={colors.text}>{icon}</div>
        </div>
      </div>
    </div>
  );
}
