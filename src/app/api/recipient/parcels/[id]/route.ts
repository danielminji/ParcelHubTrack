/**
 * Recipient Parcel Details API Route
 * GET /api/recipient/parcels/[id] - Get parcel details
 * DELETE /api/recipient/parcels/[id] - Cancel pre-registered parcel
 * Requires authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { getParcelDetails, cancelParcel } from '@/controllers/recipient.controller';
import { requireRole } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const user = await requireRole(request, ['RECIPIENT']);
    const parcelId = params.id;

    if (!parcelId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PARAMETER',
            message: 'Parcel ID is required',
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

    const result = await getParcelDetails(parcelId, user.id, user.hub_id);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Parcel Details API Error:', error);

    const statusCode = error.statusCode || 500;
    const code = error.code || 'INTERNAL_ERROR';

    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message: error.message || 'Failed to fetch parcel details',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: statusCode }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const user = await requireRole(request, ['RECIPIENT']);
    const parcelId = params.id;

    if (!parcelId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PARAMETER',
            message: 'Parcel ID is required',
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

    const result = await cancelParcel(parcelId, user.id, user.hub_id);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Cancel Parcel API Error:', error);

    const statusCode = error.statusCode || 500;
    const code = error.code || 'INTERNAL_ERROR';

    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message: error.message || 'Failed to cancel parcel',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: statusCode }
    );
  }
}
