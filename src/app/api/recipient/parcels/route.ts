/**
 * Recipient Parcels API Route
 * GET /api/recipient/parcels
 * 
 * Returns paginated list of parcels for the recipient
 * Query params: status, page, limit
 * Requires authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRecipientParcels } from '@/controllers/recipient.controller';
import { ParcelStatus } from '@prisma/client';
import { requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireRole(request, ['RECIPIENT']);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ParcelStatus | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: 'Invalid pagination parameters',
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Verify hub assignment
    if (!user.hub_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_HUB_ASSIGNED',
            message: 'You must be assigned to a location',
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    const result = await getRecipientParcels(user.id, user.hub_id, {
      status: status || undefined,
      page,
      limit,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Parcels API Error:', error);

    const statusCode = error.statusCode || 500;
    const code = error.code || 'INTERNAL_ERROR';

    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message: error.message || 'Failed to fetch parcels',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: statusCode }
    );
  }
}
