/**
 * Inventory API Route
 * GET /api/operator/inventory
 * Returns inventory statistics and location breakdown for operator's hub
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
        return unauthorizedResponse('Please login to view inventory');
      }
      if (error.message === 'FORBIDDEN') {
        return forbiddenResponse('Only operators can access inventory');
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

    // Get all active parcels at this hub
    const parcels = await prisma.parcel.findMany({
      where: {
        hub_id: user.hub_id,
        status: {
          in: ['EXPECTED', 'READY_FOR_PICKUP', 'ARRIVED_UNCLAIMED'],
        },
      },
      select: {
        id: true,
        tracking_id: true,
        status: true,
        storage_location: true,
        arrived_at: true,
        weight_kg: true,
        recipient: {
          select: {
            full_name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        storage_location: 'asc',
      },
    });

    // Group parcels by storage location
    const locationMap = new Map<string, any[]>();
    const unassignedParcels: any[] = [];

    parcels.forEach(parcel => {
      if (parcel.storage_location) {
        if (!locationMap.has(parcel.storage_location)) {
          locationMap.set(parcel.storage_location, []);
        }
        locationMap.get(parcel.storage_location)!.push(parcel);
      } else {
        unassignedParcels.push(parcel);
      }
    });

    // Convert map to array
    const locations = Array.from(locationMap.entries()).map(([location, items]) => {
      const statusCounts = {
        expected: 0,
        ready: 0,
        arrived: 0,
      };

      items.forEach(item => {
        if (item.status === 'EXPECTED') statusCounts.expected++;
        else if (item.status === 'READY_FOR_PICKUP') statusCounts.ready++;
        else if (item.status === 'ARRIVED') statusCounts.arrived++;
      });

      return {
        location,
        total: items.length,
        parcels: items,
        ...statusCounts,
      };
    });

    // Sort locations alphabetically
    locations.sort((a, b) => a.location.localeCompare(b.location));

    // Get summary statistics
    const summary = {
      total: parcels.length,
      ready: parcels.filter(p => p.status === 'READY_FOR_PICKUP').length,
      expected: parcels.filter(p => p.status === 'EXPECTED').length,
      arrived: parcels.filter(p => p.status === 'ARRIVED_UNCLAIMED').length,
      unassigned: unassignedParcels.length,
    };

    return successResponse({
      summary,
      locations,
      unassigned: unassignedParcels.length > 0 ? {
        location: 'Unassigned',
        total: unassignedParcels.length,
        parcels: unassignedParcels,
      } : null,
    }, 'Inventory retrieved successfully');

  } catch (error: any) {
    console.error('Operator inventory error:', error);
    return errorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Failed to retrieve inventory',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
