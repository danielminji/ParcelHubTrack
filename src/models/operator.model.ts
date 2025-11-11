/**
 * Operator Model
 * 
 * Database operations specific to Operator role
 * Handles check-in, check-out, search, and dashboard stats
 */

import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

/**
 * Get operator dashboard statistics
 */
export async function getOperatorDashboardStats() {
  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get parcels checked in today
  const todayCheckIns = await prisma.parcel.count({
    where: {
      checked_in_at: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  // Get parcels checked out today
  const todayCheckOuts = await prisma.parcel.count({
    where: {
      checked_out_at: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  // Get parcels by status
  const parcelsByStatus = await prisma.parcel.groupBy({
    by: ['status'],
    _count: {
      id: true,
    },
  });

  // Convert to object for easier access
  const statusCounts = parcelsByStatus.reduce((acc, item) => {
    acc[item.status] = item._count.id;
    return acc;
  }, {} as Record<string, number>);

  // Get storage capacity (total slots vs occupied)
  const totalSlots = 300; // TODO: Get from system settings
  const occupiedSlots = await prisma.parcel.count({
    where: {
      status: {
        in: ['READY_FOR_PICKUP', 'ARRIVED_UNCLAIMED'],
      },
    },
  });

  return {
    today: {
      check_ins: todayCheckIns,
      check_outs: todayCheckOuts,
    },
    storage: {
      total_slots: totalSlots,
      occupied_slots: occupiedSlots,
      available_slots: totalSlots - occupiedSlots,
    },
    status_breakdown: {
      expected: statusCounts['EXPECTED'] || 0,
      ready_for_pickup: statusCounts['READY_FOR_PICKUP'] || 0,
      arrived_unclaimed: statusCounts['ARRIVED_UNCLAIMED'] || 0,
      collected: statusCounts['COLLECTED'] || 0,
      cancelled: statusCounts['CANCELLED'] || 0,
      returned: statusCounts['RETURNED'] || 0,
    },
  };
}

/**
 * Search parcels by tracking ID, recipient name, or phone
 */
export async function searchParcels(query: string) {
  return await prisma.parcel.findMany({
    where: {
      OR: [
        {
          tracking_id: {
            contains: query,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
        {
          recipient_name: {
            contains: query,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
        {
          recipient_phone: {
            contains: query,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
      ],
    },
    include: {
      recipient: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
    take: 50, // Limit results
  });
}

/**
 * Get parcels ready for pickup (for check-out screen)
 */
export async function getParcelsReadyForPickup(
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const [parcels, total] = await Promise.all([
    prisma.parcel.findMany({
      where: {
        status: {
          in: ['READY_FOR_PICKUP', 'ARRIVED_UNCLAIMED'],
        },
      },
      include: {
        recipient: {
          select: {
            id: true,
            full_name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.parcel.count({
      where: {
        status: {
          in: ['READY_FOR_PICKUP', 'ARRIVED_UNCLAIMED'],
        },
      },
    }),
  ]);

  return { parcels, total };
}

/**
 * Get recent check-ins (for operator dashboard)
 */
export async function getRecentCheckIns(limit: number = 10) {
  return await prisma.parcel.findMany({
    where: {
      checked_in_at: {
        not: null,
      },
    },
    include: {
      recipient: {
        select: {
          id: true,
          full_name: true,
          phone: true,
        },
      },
    },
    orderBy: {
      checked_in_at: 'desc',
    },
    take: limit,
  });
}

/**
 * Get recent check-outs (for operator dashboard)
 */
export async function getRecentCheckOuts(limit: number = 10) {
  return await prisma.parcel.findMany({
    where: {
      status: 'COLLECTED',
      checked_out_at: {
        not: null,
      },
    },
    include: {
      recipient: {
        select: {
          id: true,
          full_name: true,
          phone: true,
        },
      },
    },
    orderBy: {
      checked_out_at: 'desc',
    },
    take: limit,
  });
}

/**
 * Get parcel for check-out (validates if ready for pickup)
 */
export async function getParcelForCheckout(trackingId: string) {
  return await prisma.parcel.findFirst({
    where: {
      tracking_id: trackingId,
      status: {
        in: ['READY_FOR_PICKUP', 'ARRIVED_UNCLAIMED'],
      },
    },
    include: {
      recipient: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
        },
      },
    },
  });
}

/**
 * Update parcel to collected status
 */
export async function markParcelAsCollected(
  parcelId: string,
  data: {
    collected_by_operator_id: string;
    payment_amount: number;
    payment_method: string;
    actual_recipient_name?: string;
    actual_recipient_phone?: string;
    notes?: string;
  }
) {
  return await prisma.parcel.update({
    where: { id: parcelId },
    data: {
      status: 'COLLECTED',
      checked_out_at: new Date(),
      checked_out_by_id: data.collected_by_operator_id,
      fee_amount: data.payment_amount,
      payment_status: 'PAID',
      notes: data.notes,
    },
  });
}

/**
 * Get storage location availability
 */
export async function getStorageLocationStats(zone?: string) {
  const where: Prisma.ParcelWhereInput = {
    status: {
      in: ['READY_FOR_PICKUP', 'ARRIVED_UNCLAIMED'],
    },
  };

  if (zone) {
    where.storage_location = {
      startsWith: zone,
    };
  }

  const occupiedLocations = await prisma.parcel.groupBy({
    by: ['storage_location'],
    where,
    _count: {
      id: true,
    },
  });

  return occupiedLocations;
}
