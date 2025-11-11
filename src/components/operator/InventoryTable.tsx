/**
 * Inventory Table Component (View)
 * Displays hub inventory in a table format
 */

interface InventoryItem {
  location: string;
  total: number;
  ready: number;
  inTransit: number;
  collected: number;
}

interface InventoryTableProps {
  data: InventoryItem[];
}

export default function InventoryTable({ data }: InventoryTableProps) {
  const getCapacityColor = (capacity: number) => {
    if (capacity > 80) return 'bg-red-600';
    if (capacity > 60) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const calculateCapacity = (total: number) => {
    const maxCapacity = 250;
    return Math.min(100, Math.round((total / maxCapacity) * 100));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hub Inventory</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Parcels
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ready for Pickup
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                In Transit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Collected
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Capacity
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((hub) => {
              const capacity = calculateCapacity(hub.total);
              return (
                <tr key={hub.location} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {hub.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {hub.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                    {hub.ready}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                    {hub.inTransit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 dark:text-purple-400">
                    {hub.collected}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${getCapacityColor(capacity)}`}
                          style={{ width: `${capacity}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">{capacity}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
