/**
 * Operator Dashboard API
 * GET /api/operator/dashboard
 * Returns real-time statistics for operator's hub
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/jwt-helper';

export async function GET(request: NextRequest) {
  try {
    // Authenticate and require OPERATOR or ADMIN role
    let user;
    try {
      user = await requireAuth(request, ['OPERATOR', 'ADMIN']);
    } catch (error: any) {
      if (error.message === 'UNAUTHORIZED') {
        return unauthorizedResponse('Please login to view dashboard');
      }
      if (error.message === 'FORBIDDEN') {
        return forbiddenResponse('Only operators can access this dashboard');
      }
      throw error;
    }

    // Operators must have a hub assigned
    if (!user.hub_id) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Operator not assigned to any hub',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's check-ins (parcels that arrived today)
    const todayCheckIns = await prisma.parcel.count({
      where: {
        hub_id: user.hub_id,
        arrived_at: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Get today's check-outs (parcels collected today)
    const todayCheckOuts = await prisma.parcel.count({
      where: {
        hub_id: user.hub_id,
        collected_at: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Get pending pickups (ready for pickup but not collected)
    const pendingPickups = await prisma.parcel.count({
      where: {
        hub_id: user.hub_id,
        status: 'READY_FOR_PICKUP',
      },
    });

    // Get storage capacity info
    const totalStorageLocations = await prisma.storageLocation.count({
      where: {
        hub_id: user.hub_id,
        is_occupied: false, // Available locations
      },
    });

    const occupiedLocations = await prisma.parcel.count({
      where: {
        hub_id: user.hub_id,
        status: {
          in: ['READY_FOR_PICKUP', 'ARRIVED_UNCLAIMED'],
        },
        storage_location: {
          not: null,
        },
      },
    });

    const availableLocations = totalStorageLocations - occupiedLocations;

    // Get status breakdown
    const statusBreakdown = await prisma.parcel.groupBy({
      by: ['status'],
      where: {
        hub_id: user.hub_id,
        status: {
          in: ['EXPECTED', 'READY_FOR_PICKUP', 'ARRIVED_UNCLAIMED', 'COLLECTED', 'RETURNED', 'CANCELLED'],
        },
      },
      _count: {
        _all: true,
      },
    });

    const stats = {
      expected: 0,
      ready_for_pickup: 0,
      arrived_unclaimed: 0,
      collected_total: 0,
      returned: 0,
      cancelled: 0,
    };

    statusBreakdown.forEach(item => {
      switch (item.status) {
        case 'EXPECTED':
          stats.expected = item._count._all;
          break;
        case 'READY_FOR_PICKUP':
          stats.ready_for_pickup = item._count._all;
          break;
        case 'ARRIVED_UNCLAIMED':
          stats.arrived_unclaimed = item._count._all;
          break;
        case 'COLLECTED':
          stats.collected_total = item._count._all;
          break;
        case 'RETURNED':
          stats.returned = item._count._all;
          break;
        case 'CANCELLED':
          stats.cancelled = item._count._all;
          break;
      }
    });

    // Get recent activity (last 10 parcels)
    const recentActivity = await prisma.parcel.findMany({
      where: {
        hub_id: user.hub_id,
      },
      orderBy: {
        updated_at: 'desc',
      },
      take: 10,
      select: {
        id: true,
        tracking_id: true,
        status: true,
        storage_location: true,
        arrived_at: true,
        collected_at: true,
        recipient: {
          select: {
            full_name: true,
            phone: true,
          },
        },
      },
    });

    return successResponse({
      today: {
        checked_in: todayCheckIns,
        checked_out: todayCheckOuts,
        pending_pickup: pendingPickups,
      },
      storage: {
        total_capacity: totalStorageLocations,
        occupied: occupiedLocations,
        available: availableLocations,
      },
      stats,
      recent_activity: recentActivity,
    }, 'Dashboard data retrieved successfully');

  } catch (error: any) {
    console.error('Operator dashboard error:', error);
    return errorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Failed to retrieve dashboard data',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
