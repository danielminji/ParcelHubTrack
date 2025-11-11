/**
 * Admin Dashboard API
 * GET /api/admin/dashboard
 * Returns system-wide statistics across all hubs
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/jwt-helper';

export async function GET(request: NextRequest) {
  try {
    // Authenticate and require ADMIN role only
    let user;
    try {
      user = await requireAuth(request, ['ADMIN']);
    } catch (error: any) {
      if (error.message === 'UNAUTHORIZED') {
        return unauthorizedResponse('Please login to view admin dashboard');
      }
      if (error.message === 'FORBIDDEN') {
        return forbiddenResponse('Only administrators can access this dashboard');
      }
      throw error;
    }

    // Get total parcels count
    const totalParcels = await prisma.parcel.count();

    // Get total users count
    const totalUsers = await prisma.user.count();

    // Get active operators count
    const activeOperators = await prisma.user.count({
      where: {
        role: 'OPERATOR',
        status: 'ACTIVE',
      },
    });

    // Get storage utilization across all hubs
    const totalStorageLocations = await prisma.storageLocation.count({
      where: {
        is_occupied: false,
      },
    });

    const occupiedLocations = await prisma.parcel.count({
      where: {
        status: {
          in: ['READY_FOR_PICKUP', 'ARRIVED_UNCLAIMED'],
        },
        storage_location: {
          not: null,
        },
      },
    });

    const storageUtilization = totalStorageLocations > 0 
      ? Math.round((occupiedLocations / totalStorageLocations) * 100)
      : 0;

    // Get status breakdown
    const statusBreakdown = await prisma.parcel.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const stats = {
      expected: 0,
      ready_for_pickup: 0,
      arrived: 0,
      collected: 0,
      returned: 0,
      cancelled: 0,
    };

    statusBreakdown.forEach(item => {
      switch (item.status) {
        case 'EXPECTED':
          stats.expected = item._count.id;
          break;
        case 'READY_FOR_PICKUP':
          stats.ready_for_pickup = item._count.id;
          break;
        case 'ARRIVED_UNCLAIMED':
          stats.arrived = item._count.id;
          break;
        case 'COLLECTED':
          stats.collected = item._count.id;
          break;
        case 'RETURNED':
          stats.returned = item._count.id;
          break;
        case 'CANCELLED':
          stats.cancelled = item._count.id;
          break;
      }
    });

    // Get hub breakdown
    const hubStats = await prisma.hub.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        code: true,
        _count: {
          select: {
            parcels: {
              where: {
                status: {
                  in: ['EXPECTED', 'READY_FOR_PICKUP', 'ARRIVED_UNCLAIMED'],
                },
              },
            },
            users: {
              where: {
                role: 'OPERATOR',
                status: 'ACTIVE',
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const hubs = hubStats.map(hub => ({
      id: hub.id,
      name: hub.name,
      code: hub.code,
      active_parcels: hub._count.parcels,
      operators: hub._count.users,
    }));

    // Get recent activity (last 20 parcels system-wide)
    const recentActivity = await prisma.parcel.findMany({
      orderBy: {
        updated_at: 'desc',
      },
      take: 20,
      select: {
        id: true,
        tracking_id: true,
        status: true,
        storage_location: true,
        arrived_at: true,
        collected_at: true,
        updated_at: true,
        recipient: {
          select: {
            full_name: true,
            phone: true,
          },
        },
        hub: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    // Get users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    });

    const roles = {
      recipients: 0,
      operators: 0,
      admins: 0,
    };

    usersByRole.forEach(item => {
      if (item.role === 'RECIPIENT') roles.recipients = item._count.id;
      else if (item.role === 'OPERATOR') roles.operators = item._count.id;
      else if (item.role === 'ADMIN') roles.admins = item._count.id;
    });

    return successResponse({
      overview: {
        total_parcels: totalParcels,
        total_users: totalUsers,
        active_operators: activeOperators,
        storage_utilization: storageUtilization,
      },
      stats,
      users_by_role: roles,
      hubs,
      recent_activity: recentActivity,
    }, 'Admin dashboard data retrieved successfully');

  } catch (error: any) {
    console.error('Admin dashboard error:', error);
    return errorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Failed to retrieve admin dashboard data',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
