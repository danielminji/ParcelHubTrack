/**
 * Get Available Hubs API Route
 * GET /api/hubs
 * Returns list of active hubs for selection during signup
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS } from '@/lib/api-response';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const hubs = await prisma.hub.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return successResponse(hubs, 'Hubs retrieved successfully');
  } catch (error: any) {
    console.error('Get hubs error:', error);
    return errorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Failed to retrieve hubs',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
