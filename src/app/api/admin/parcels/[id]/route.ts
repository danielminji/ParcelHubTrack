/**
 * Admin Parcel Detail API
 * GET /api/admin/parcels/[id] - Get parcel details
 * PATCH /api/admin/parcels/[id] - Update parcel status or handle disputes
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/jwt-helper';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and require ADMIN role
    let user;
    try {
      user = await requireAuth(request, ['ADMIN']);
    } catch (error: any) {
      if (error.message === 'UNAUTHORIZED') {
        return unauthorizedResponse('Please login to view parcel details');
      }
      if (error.message === 'FORBIDDEN') {
        return forbiddenResponse('Only administrators can access parcel details');
      }
      throw error;
    }

    const parcelId = params.id;

    // Get parcel with all related data
    const parcel = await prisma.parcel.findUnique({
      where: { id: parcelId },
      include: {
        recipient: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            status: true,
          },
        },
        hub: {
          select: {
            id: true,
            name: true,
            code: true,
            address: true,
            contact_phone: true,
            contact_email: true,
          },
        },
      },
    });

    if (!parcel) {
      return errorResponse(
        ERROR_CODES.NOT_FOUND,
        'Parcel not found',
        HTTP_STATUS.NOT_FOUND
      );
    }

    return successResponse({ parcel }, 'Parcel details retrieved successfully');

  } catch (error: any) {
    console.error('Get parcel details error:', error);
    return errorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Failed to retrieve parcel details',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and require ADMIN role
    let user;
    try {
      user = await requireAuth(request, ['ADMIN']);
    } catch (error: any) {
      if (error.message === 'UNAUTHORIZED') {
        return unauthorizedResponse('Please login to update parcels');
      }
      if (error.message === 'FORBIDDEN') {
        return forbiddenResponse('Only administrators can update parcels');
      }
      throw error;
    }

    const parcelId = params.id;

    // Check if parcel exists
    const existingParcel = await prisma.parcel.findUnique({
      where: { id: parcelId },
    });

    if (!existingParcel) {
      return errorResponse(
        ERROR_CODES.NOT_FOUND,
        'Parcel not found',
        HTTP_STATUS.NOT_FOUND
      );
    }

    const body = await request.json();
    const { 
      status, 
      storage_location, 
      hub_id,
      cancellation_reason,
      special_instructions,
      weight,
      length,
      width,
      height,
      declared_value,
    } = body;

    // Build update data
    const updateData: any = {};

    if (status !== undefined) {
      // Validate status
      const validStatuses = ['EXPECTED', 'READY_FOR_PICKUP', 'ARRIVED', 'COLLECTED', 'RETURNED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return errorResponse(
          ERROR_CODES.VALIDATION_ERROR,
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          HTTP_STATUS.BAD_REQUEST
        );
      }
      
      updateData.status = status;
      
      // Set timestamps based on status
      if (status === 'ARRIVED' && !existingParcel.arrived_at) {
        updateData.arrived_at = new Date();
      }
      if (status === 'COLLECTED' && !existingParcel.collected_at) {
        updateData.collected_at = new Date();
      }
      if (status === 'CANCELLED' && !existingParcel.cancelled_at) {
        updateData.cancelled_at = new Date();
        if (cancellation_reason) {
          updateData.cancellation_reason = cancellation_reason;
        }
      }
    }

    if (storage_location !== undefined) updateData.storage_location = storage_location || null;
    if (hub_id !== undefined) {
      // Verify hub exists
      if (hub_id) {
        const hub = await prisma.hub.findUnique({
          where: { id: hub_id },
        });
        if (!hub) {
          return errorResponse(
            ERROR_CODES.NOT_FOUND,
            'Hub not found',
            HTTP_STATUS.NOT_FOUND
          );
        }
      }
      updateData.hub_id = hub_id || null;
    }
    if (special_instructions !== undefined) updateData.special_instructions = special_instructions || null;
    if (weight !== undefined) updateData.weight = weight;
    if (length !== undefined) updateData.length = length;
    if (width !== undefined) updateData.width = width;
    if (height !== undefined) updateData.height = height;
    if (declared_value !== undefined) updateData.declared_value = declared_value;

    // Update parcel
    const updatedParcel = await prisma.parcel.update({
      where: { id: parcelId },
      data: updateData,
      include: {
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
          },
        },
      },
    });

    return successResponse(
      { parcel: updatedParcel },
      'Parcel updated successfully'
    );

  } catch (error: any) {
    console.error('Update parcel error:', error);
    return errorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Failed to update parcel',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
