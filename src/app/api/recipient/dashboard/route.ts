/**
 * Recipient Dashboard API Route
 * GET /api/recipient/dashboard
 * 
 * Returns dashboard statistics and recent parcels
 * Requires authentication and hub assignment
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRecipientDashboard } from '@/controllers/recipient.controller';
import { requireRole, requireHub } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user and verify they are a recipient with hub assigned
    const user = await requireRole(request, ['RECIPIENT']);
    
    if (!user.hub_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_HUB_ASSIGNED',
            message: 'You must be assigned to a location to view your dashboard',
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    const result = await getRecipientDashboard(user.id, user.hub_id);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Dashboard API Error:', error);

    const statusCode = error.statusCode || 500;
    const code = error.code || 'INTERNAL_ERROR';

    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message: error.message || 'Failed to fetch dashboard data',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: statusCode }
    );
  }
}
