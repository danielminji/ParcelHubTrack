/**
 * Recipient Pre-Register Parcel API Route
 * POST /api/recipient/pre-register
 * 
 * Allows recipient to pre-register a parcel with tracking ID
 * Requires authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { preRegisterParcel } from '@/controllers/recipient.controller';
import { requireRole } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireRole(request, ['RECIPIENT']);

    // Parse request body
    const body = await request.json();
    const { trackingId, expectedArrivalDate } = body;

    // Validate required fields
    if (!trackingId || typeof trackingId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELD',
            message: 'Tracking ID is required',
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Validate tracking ID format (basic validation)
    if (trackingId.length < 5 || trackingId.length > 50) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TRACKING_ID',
            message: 'Tracking ID must be between 5 and 50 characters',
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
            message: 'You must be assigned to a location to register parcels',
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    const result = await preRegisterParcel({
      recipientId: user.id,
      hubId: user.hub_id,
      trackingId: trackingId.trim().toUpperCase(),
      expectedArrivalDate: expectedArrivalDate ? new Date(expectedArrivalDate) : undefined,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Pre-Register API Error:', error);

    const statusCode = error.statusCode || 500;
    const code = error.code || 'INTERNAL_ERROR';

    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message: error.message || 'Failed to register parcel',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: statusCode }
    );
  }
}
