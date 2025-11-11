/**
 * Admin Parcels API
 * GET /api/admin/parcels - List all parcels across all hubs with filters
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/jwt-helper';

export async function GET(request: NextRequest) {
  try {
    // Authenticate and require ADMIN role
    let user;
    try {
      user = await requireAuth(request, ['ADMIN']);
    } catch (error: any) {
      if (error.message === 'UNAUTHORIZED') {
        return unauthorizedResponse('Please login to view parcels');
      }
      if (error.message === 'FORBIDDEN') {
        return forbiddenResponse('Only administrators can access all parcels');
      }
      throw error;
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const hub_id = searchParams.get('hub_id');
    const status = searchParams.get('status');
    const courier = searchParams.get('courier');
    const search = searchParams.get('search'); // Search by tracking ID or recipient name
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: any = {};

    if (hub_id) {
      where.hub_id = hub_id;
    }

    if (status) {
      where.status = status;
    }

    if (courier) {
      where.courier = courier;
    }

    if (search) {
      where.OR = [
        { tracking_id: { contains: search, mode: 'insensitive' } },
        { recipient: { full_name: { contains: search, mode: 'insensitive' } } },
        { recipient: { phone: { contains: search } } },
      ];
    }

    // Get total count
    const total = await prisma.parcel.count({ where });

    // Get parcels with pagination
    const parcels = await prisma.parcel.findMany({
      where,
      select: {
        id: true,
        tracking_id: true,
        status: true,
        storage_location: true,
        weight_kg: true,
        arrived_at: true,
        collected_at: true,
        cancelled_at: true,
        cancellation_reason: true,
        notes: true,
        created_at: true,
        updated_at: true,
        recipient: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
          },
        },
        hub: {
          select: {
            id: true,
            name: true,
            code: true,
            address: true,
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return successResponse({
      parcels,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    }, 'Parcels retrieved successfully');

  } catch (error: any) {
    console.error('Get parcels error:', error);
    return errorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Failed to retrieve parcels',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
