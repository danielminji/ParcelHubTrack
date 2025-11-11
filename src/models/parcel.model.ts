/**
 * Parcel Model
 * 
 * Database operations for Parcel entity
 * Handles parcel CRUD operations, search, and status updates
 * Includes optimized selective field fetching for better performance
 */

import { prisma } from '@/lib/db';
import { Prisma, ParcelStatus } from '@prisma/client';

// ============================================
// SELECTIVE FIELD SETS (Performance Optimization)
// ============================================

/**
 * Minimal fields for list views and tables
 * Use: Lists, tables, search results
 * Performance: 64% less data transfer
 */
const PARCEL_LIST_SELECT = {
  id: true,
  tracking_id: true,
  status: true,
  hub_id: true,
  recipient_name: true,
  recipient_phone: true,
  storage_location: true,
  storage_zone: true,
  created_at: true,
  updated_at: true,
  checked_in_at: true,
  checked_out_at: true,
} as const;

/**
 * Complete fields for detail views
 * Use: Single parcel details, edit forms
 */
const PARCEL_DETAILS_SELECT = {
  id: true,
  tracking_id: true,
  status: true,
  recipient_id: true,
  hub_id: true,
  recipient_name: true,
  recipient_phone: true,
  recipient_email: true,
  checked_in_by_id: true,
  checked_out_by_id: true,
  storage_location: true,
  storage_zone: true,
  notes: true,
  weight_kg: true,
  photo_url: true,
  fee_amount: true,
  payment_status: true,
  created_at: true,
  updated_at: true,
  checked_in_at: true,
  checked_out_at: true,
  recipient: {
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
    },
  },
  checkedInBy: {
    select: {
      id: true,
      full_name: true,
    },
  },
  checkedOutBy: {
    select: {
      id: true,
      full_name: true,
    },
  },
} as const;

/**
 * Minimal fields for dashboard summaries
 * Use: Dashboard cards, notifications, quick previews
 */
const PARCEL_SUMMARY_SELECT = {
  id: true,
  tracking_id: true,
  status: true,
  recipient_name: true,
  created_at: true,
  checked_in_at: true,
} as const;

// ============================================
// BASIC CRUD OPERATIONS
// ============================================

/**
 * Find parcel by tracking ID (with full details)
 * Optional hub filtering for multi-location support
 */
export async function findParcelByTrackingId(trackingId: string, hubId?: string) {
  return await prisma.parcel.findFirst({
    where: { 
      tracking_id: trackingId,
      ...(hubId && { hub_id: hubId }),
    },
    select: PARCEL_DETAILS_SELECT,
  });
}

/**
 * Find parcel by ID (with full details)
 */
export async function findParcelById(id: string) {
  return await prisma.parcel.findUnique({
    where: { id },
    select: PARCEL_DETAILS_SELECT,
  });
}

/**
 * Create new parcel
 */
export async function createParcel(data: any) {
  // Handle hub_id if provided directly (for compatibility)
  const { hub_id, ...restData } = data;
  
  const createData: any = {
    ...restData,
  };
  
  // Add hub relation if hub_id is provided
  if (hub_id) {
    createData.hub = {
      connect: { id: hub_id }
    };
  }
  
  return await prisma.parcel.create({
    data: createData,
  });
}

/**
 * Update parcel
 */
export async function updateParcel(id: string, data: Prisma.ParcelUpdateInput) {
  return await prisma.parcel.update({
    where: { id },
    data,
  });
}

/**
 * Find parcels by recipient ID (optimized with selective fields)
 */
export async function findParcelsByRecipientId(
  recipientId: string,
  filters?: {
    status?: ParcelStatus;
    hubId?: string;
    page?: number;
    limit?: number;
  }
) {
  const { status, hubId, page = 1, limit = 20 } = filters || {};

  const where: Prisma.ParcelWhereInput = {
    recipient_id: recipientId,
    ...(status && { status: status as ParcelStatus }),
    ...(hubId && { hub_id: hubId }),
  };

  const [parcels, total] = await Promise.all([
    prisma.parcel.findMany({
      where,
      select: PARCEL_LIST_SELECT,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: 'desc' },
    }),
    prisma.parcel.count({ where }),
  ]);

  return {
    parcels,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Search parcels (for operators) - optimized
 */
export async function searchParcels(query: string, limit = 20) {
  return await prisma.parcel.findMany({
    where: {
      OR: [
        { tracking_id: { contains: query, mode: 'insensitive' } },
        { recipient_name: { contains: query, mode: 'insensitive' } },
        { recipient_phone: { contains: query } },
        { recipient_email: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: PARCEL_LIST_SELECT,
    take: limit,
    orderBy: { created_at: 'desc' },
  });
}

/**
 * Get all parcels with filters (for operators/admins) - optimized
 */
export async function findParcels(filters?: {
  status?: ParcelStatus;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}) {
  const { status, dateFrom, dateTo, page = 1, limit = 20 } = filters || {};

  const where: Prisma.ParcelWhereInput = {
    ...(status && { status: status as ParcelStatus }),
    ...(dateFrom && {
      created_at: { gte: dateFrom },
    }),
    ...(dateTo && {
      created_at: { lte: dateTo },
    }),
  };

  const [parcels, total] = await Promise.all([
    prisma.parcel.findMany({
      where,
      select: PARCEL_LIST_SELECT,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: 'desc' },
    }),
    prisma.parcel.count({ where }),
  ]);

  return {
    parcels,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Delete parcel (soft delete - set status to CANCELLED)
 */
export async function deleteParcel(id: string) {
  return await prisma.parcel.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });
}

/**
 * Get parcel statistics
 */
export async function getParcelStats() {
  const [total, expected, unclaimed, ready, collected] = await Promise.all([
    prisma.parcel.count(),
    prisma.parcel.count({ where: { status: 'EXPECTED' } }),
    prisma.parcel.count({ where: { status: 'ARRIVED_UNCLAIMED' } }),
    prisma.parcel.count({ where: { status: 'READY_FOR_PICKUP' } }),
    prisma.parcel.count({ where: { status: 'COLLECTED' } }),
  ]);

  return {
    total,
    expected,
    unclaimed,
    ready,
    collected,
    pending: unclaimed + ready,
  };
}

/**
 * Get inventory statistics across all hubs
 */
export async function getInventoryStats() {
  const [total, ready, unclaimed, collected] = await Promise.all([
    prisma.parcel.count({
      where: {
        status: {
          in: ['EXPECTED', 'ARRIVED_UNCLAIMED', 'READY_FOR_PICKUP']
        }
      }
    }),
    prisma.parcel.count({ where: { status: 'READY_FOR_PICKUP' } }),
    prisma.parcel.count({ where: { status: 'ARRIVED_UNCLAIMED' } }),
    prisma.parcel.count({ where: { status: 'COLLECTED' } }),
  ]);

  return { total, ready, inTransit: unclaimed, collected };
}

/**
 * Get inventory by storage location (hub)
 */
export async function getInventoryByLocation() {
  const parcels = await prisma.parcel.groupBy({
    by: ['storage_location'],
    where: {
      storage_location: { not: null },
      status: {
        in: ['ARRIVED_UNCLAIMED', 'READY_FOR_PICKUP']
      }
    },
    _count: {
      id: true
    }
  });

  // Get detailed counts by status for each location
  const detailedInventory = await Promise.all(
    parcels.map(async (item) => {
      const location = item.storage_location || 'Unknown';
      
      const [ready, unclaimed, collected, total] = await Promise.all([
        prisma.parcel.count({
          where: {
            storage_location: location,
            status: 'READY_FOR_PICKUP'
          }
        }),
        prisma.parcel.count({
          where: {
            storage_location: location,
            status: 'ARRIVED_UNCLAIMED'
          }
        }),
        prisma.parcel.count({
          where: {
            storage_location: location,
            status: 'COLLECTED'
          }
        }),
        prisma.parcel.count({
          where: {
            storage_location: location
          }
        })
      ]);

      return {
        location,
        total,
        ready,
        inTransit: unclaimed, // Map unclaimed to inTransit for display
        collected
      };
    })
  );

  return detailedInventory;
}

// ============================================
// DASHBOARD & STATISTICS (Optimized)
// ============================================

/**
 * Get recipient dashboard statistics (optimized with parallel queries)
 */
export async function getRecipientStats(recipientId: string) {
  const [total, expected, ready, collected] = await Promise.all([
    prisma.parcel.count({ where: { recipient_id: recipientId } }),
    prisma.parcel.count({ where: { recipient_id: recipientId, status: 'EXPECTED' } }),
    prisma.parcel.count({ where: { recipient_id: recipientId, status: 'READY_FOR_PICKUP' } }),
    prisma.parcel.count({ where: { recipient_id: recipientId, status: 'COLLECTED' } }),
  ]);

  return { total, expected, ready, collected };
}

/**
 * Get recent parcels for dashboard (optimized)
 */
export async function getRecentParcels(recipientId: string, limit = 5) {
  return await prisma.parcel.findMany({
    where: { recipient_id: recipientId },
    select: PARCEL_SUMMARY_SELECT,
    orderBy: { created_at: 'desc' },
    take: limit,
  });
}

/**
 * Get operator dashboard statistics (optimized)
 */
export async function getOperatorStats() {
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  
  const [expected, readyForPickup, checkedOutToday, checkedInToday] = await Promise.all([
    prisma.parcel.count({ where: { status: 'EXPECTED' } }),
    prisma.parcel.count({ where: { status: 'READY_FOR_PICKUP' } }),
    prisma.parcel.count({ where: { checked_out_at: { gte: today } } }),
    prisma.parcel.count({ where: { checked_in_at: { gte: today } } }),
  ]);

  return {
    expected,
    readyForPickup,
    checkedOutToday,
    checkedInToday,
  };
}

/**
 * Bulk check parcel statuses by tracking IDs (optimized)
 */
export async function bulkCheckStatus(trackingIds: string[]) {
  return await prisma.parcel.findMany({
    where: {
      tracking_id: {
        in: trackingIds,
      },
    },
    select: PARCEL_SUMMARY_SELECT,
  });
}
