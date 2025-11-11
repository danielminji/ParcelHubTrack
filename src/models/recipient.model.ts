/**
 * Recipient Model
 * 
 * Database operations specific to Recipient role
 * Handles parcel registration, tracking, and dashboard
 */

import { prisma } from '@/lib/db';
import { Prisma, ParcelStatus } from '@prisma/client';

/**
 * Get recipient parcels with pagination
 */
export async function getRecipientParcels(
  recipientId: string,
  filters: {
    status?: ParcelStatus;
    page?: number;
    limit?: number;
  } = {}
) {
  const { status, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.ParcelWhereInput = {
    recipient_id: recipientId,
  };

  if (status) {
    where.status = status;
  }

  const [parcels, total] = await Promise.all([
    prisma.parcel.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.parcel.count({ where }),
  ]);

  return { parcels, total };
}

/**
 * Get recipient parcel by ID (with ownership check)
 */
export async function getRecipientParcelById(
  parcelId: string,
  recipientId: string
) {
  return await prisma.parcel.findFirst({
    where: {
      id: parcelId,
      recipient_id: recipientId,
    },
  });
}

/**
 * Pre-register parcel for recipient
 */
export async function preRegisterParcel(data: {
  tracking_id: string;
  recipient_id: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_email?: string;
}) {
  return await prisma.parcel.create({
    data: {
      tracking_id: data.tracking_id,
      recipient_id: data.recipient_id,
      recipient_name: data.recipient_name,
      recipient_phone: data.recipient_phone,
      recipient_email: data.recipient_email,
      status: 'EXPECTED',
    },
  });
}

/**
 * Cancel pre-registered parcel (only if status = EXPECTED)
 */
export async function cancelPreRegisteredParcel(
  parcelId: string,
  recipientId: string
) {
  // First check if parcel exists and is owned by recipient
  const parcel = await prisma.parcel.findFirst({
    where: {
      id: parcelId,
      recipient_id: recipientId,
      status: 'EXPECTED',
    },
  });

  if (!parcel) {
    return null;
  }

  // Update status to CANCELLED
  return await prisma.parcel.update({
    where: { id: parcelId },
    data: {
      status: 'CANCELLED',
      notes: `Cancelled at ${new Date().toISOString()}`,
    },
  });
}

/**
 * Get recipient dashboard statistics
 */
export async function getRecipientDashboardStats(recipientId: string) {
  // Get counts by status
  const statusCounts = await prisma.parcel.groupBy({
    by: ['status'],
    where: {
      recipient_id: recipientId,
    },
    _count: {
      id: true,
    },
  });

  // Convert to object
  const stats = statusCounts.reduce((acc, item) => {
    acc[item.status.toLowerCase()] = item._count.id;
    return acc;
  }, {} as Record<string, number>);

  // Get recent parcels (last 5)
  const recentParcels = await prisma.parcel.findMany({
    where: {
      recipient_id: recipientId,
    },
    orderBy: {
      created_at: 'desc',
    },
    take: 5,
  });

  return {
    total_parcels: Object.values(stats).reduce((sum: number, count: number) => sum + count, 0),
    expected: stats.expected || 0,
    ready_for_pickup: stats.ready_for_pickup || 0,
    collected: stats.collected || 0,
    recent_parcels: recentParcels,
  };
}

/**
 * Check if tracking ID is already registered by this recipient
 */
export async function isTrackingIdRegisteredByRecipient(
  trackingId: string,
  recipientId: string
) {
  const count = await prisma.parcel.count({
    where: {
      tracking_id: trackingId,
      recipient_id: recipientId,
    },
  });

  return count > 0;
}

/**
 * Get recipient's parcels ready for pickup
 */
export async function getRecipientParcelsReadyForPickup(recipientId: string) {
  return await prisma.parcel.findMany({
    where: {
      recipient_id: recipientId,
      status: 'READY_FOR_PICKUP',
    },
    orderBy: {
      created_at: 'desc',
    },
  });
}

/**
 * Get recipient's parcel history (collected parcels)
 */
export async function getRecipientParcelHistory(
  recipientId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const [parcels, total] = await Promise.all([
    prisma.parcel.findMany({
      where: {
        recipient_id: recipientId,
        status: 'COLLECTED',
      },
      orderBy: {
        checked_out_at: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.parcel.count({
      where: {
        recipient_id: recipientId,
        status: 'COLLECTED',
      },
    }),
  ]);

  return { parcels, total };
}

/**
 * Get recipient's notifications
 */
export async function getRecipientNotifications(
  recipientId: string,
  limit: number = 20
) {
  // TODO: Implement when notification table is added
  // For now, return empty array
  return [];
}
