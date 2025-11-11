/**
 * Get Hub Details API Route
 * GET /api/hubs/[id]
 * Returns details of a specific hub by ID
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS } from '@/lib/api-response';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hubId = params.id; // Hub IDs are UUIDs (strings), not numbers

    const hub = await prisma.hub.findUnique({
      where: {
        id: hubId,
      },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        city: true,
        state: true,
        postal_code: true,
        country: true,
        status: true,
      },
    });

    if (!hub) {
      return errorResponse(
        ERROR_CODES.NOT_FOUND,
        'Hub not found',
        HTTP_STATUS.NOT_FOUND
      );
    }

    return successResponse(hub, 'Hub retrieved successfully');
  } catch (error: any) {
    console.error('Get hub details error:', error);
    return errorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Failed to retrieve hub details',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
