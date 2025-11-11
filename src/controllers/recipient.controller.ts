/**
 * Recipient Controller
 * 
 * Business logic for recipient operations
 * Handles parcel pre-registration, tracking, and profile management
 * 
 * Updated with standardized API response format
 */

import * as parcelModel from '@/models/parcel.model';
import { ParcelStatus } from '@prisma/client';
import * as userModel from '@/models/user.model';
import { PARCEL_STATUS } from '@/lib/constants';
import type { ApiSuccessResponse, PaginationMeta } from '@/lib/api-response';

/**
 * Pre-register a new parcel
 * Returns standardized API response
 */
export async function preRegisterParcel(data: {
  recipientId: string;
  hubId: string;
  trackingId: string;
  expectedArrivalDate?: Date;
}): Promise<ApiSuccessResponse<{ parcel: any }>> {
  // 1. Validate tracking ID doesn't already exist (within the same hub)
  const existing = await parcelModel.findParcelByTrackingId(data.trackingId, data.hubId);
  
  if (existing) {
    // Throw error with custom code for proper error handling
    const error = new Error('This tracking ID is already registered in the system');
    (error as any).code = 'DUPLICATE_TRACKING_ID';
    (error as any).statusCode = 409; // Conflict
    throw error;
  }

  // 2. Get recipient details for parcel creation
  const recipient = await userModel.findUserById(data.recipientId);
  
  if (!recipient) {
    const error = new Error('Recipient not found');
    (error as any).code = 'RECIPIENT_NOT_FOUND';
    (error as any).statusCode = 404;
    throw error;
  }

  // 3. Verify recipient belongs to the hub
  if (recipient.hub_id !== data.hubId) {
    const error = new Error('Recipient not assigned to this hub');
    (error as any).code = 'HUB_MISMATCH';
    (error as any).statusCode = 403;
    throw error;
  }

  // 4. Create parcel with EXPECTED status at the recipient's hub
  const parcel = await parcelModel.createParcel({
    tracking_id: data.trackingId,
    recipient: {
      connect: { id: data.recipientId }
    },
    recipient_name: recipient.full_name,
    recipient_phone: recipient.phone || '',
    recipient_email: recipient.email,
    hub_id: data.hubId,
    status: PARCEL_STATUS.EXPECTED,
  });

  return {
    success: true,
    data: { parcel },
    message: "Parcel registered successfully! We'll notify you when it arrives.",
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Get all parcels for a recipient with pagination
 * Returns standardized paginated response
 */
export async function getRecipientParcels(
  recipientId: string,
  hubId: string,
  filters?: {
    status?: ParcelStatus;
    page?: number;
    limit?: number;
  }
): Promise<ApiSuccessResponse<any[]>> {
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  
  const result = await parcelModel.findParcelsByRecipientId(recipientId, {
    status: filters?.status,
    hubId,
    page,
    limit,
  });

  const totalPages = result.pagination.totalPages;

  return {
    success: true,
    data: result.parcels,
    message: result.parcels.length > 0 
      ? `Found ${result.parcels.length} parcel(s)` 
      : 'No parcels found',
    meta: {
      timestamp: new Date().toISOString(),
      page,
      limit,
      total: result.pagination.total,
      totalPages,
    },
  };
}

/**
 * Get single parcel details with tracking history
 * Returns standardized API response
 */
export async function getParcelDetails(
  parcelId: string, 
  recipientId: string,
  hubId: string
): Promise<ApiSuccessResponse<{ parcel: any; tracking_history: any[] }>> {
  const parcel = await parcelModel.findParcelById(parcelId);

  if (!parcel) {
    const error = new Error('Parcel not found');
    (error as any).code = 'PARCEL_NOT_FOUND';
    (error as any).statusCode = 404;
    throw error;
  }

  // Verify ownership and hub
  if (parcel.recipient_id !== recipientId) {
    const error = new Error('You do not have permission to access this parcel');
    (error as any).code = 'FORBIDDEN';
    (error as any).statusCode = 403;
    throw error;
  }

  // Verify parcel belongs to user's hub (security check)
  if (parcel.hub_id !== hubId) {
    const error = new Error('This parcel belongs to a different location');
    (error as any).code = 'HUB_MISMATCH';
    (error as any).statusCode = 403;
    throw error;
  }

  // TODO: Fetch tracking history from tracking_logs table

  return {
    success: true,
    data: {
      parcel,
      tracking_history: [], // TODO: Implement tracking history
    },
    message: 'Parcel details retrieved successfully',
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Cancel pre-registered parcel
 * Returns standardized API response
 */
export async function cancelParcel(
  parcelId: string, 
  recipientId: string,
  hubId: string
): Promise<ApiSuccessResponse<null>> {
  const parcel = await parcelModel.findParcelById(parcelId);

  if (!parcel) {
    const error = new Error('Parcel not found');
    (error as any).code = 'PARCEL_NOT_FOUND';
    (error as any).statusCode = 404;
    throw error;
  }

  // Verify ownership
  if (parcel.recipient_id !== recipientId) {
    const error = new Error('You do not have permission to cancel this parcel');
    (error as any).code = 'FORBIDDEN';
    (error as any).statusCode = 403;
    throw error;
  }

  // Verify hub access
  if (parcel.hub_id !== hubId) {
    const error = new Error('This parcel belongs to a different location');
    (error as any).code = 'HUB_MISMATCH';
    (error as any).statusCode = 403;
    throw error;
  }

  // Can only cancel if status is EXPECTED
  if (parcel.status !== PARCEL_STATUS.EXPECTED) {
    const error = new Error('Cannot cancel parcel that has already arrived. Please contact the operator.');
    (error as any).code = 'INVALID_STATUS';
    (error as any).statusCode = 400;
    throw error;
  }

  await parcelModel.deleteParcel(parcelId);

  return {
    success: true,
    data: null,
    message: 'Parcel registration cancelled successfully',
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Get recipient dashboard statistics
 * Returns standardized API response
 */
export async function getRecipientDashboard(
  recipientId: string,
  hubId: string
): Promise<ApiSuccessResponse<{
  stats: {
    total: number;
    expected: number;
    ready: number;
    collected: number;
  };
  recentParcels: any[];
}>> {
  const result = await parcelModel.findParcelsByRecipientId(recipientId, {
    hubId,
    limit: 100, // Get all for stats calculation
  });

  const stats = {
    total: result.pagination.total,
    expected: result.parcels.filter((p) => p.status === PARCEL_STATUS.EXPECTED).length,
    ready: result.parcels.filter((p) => p.status === PARCEL_STATUS.READY_FOR_PICKUP).length,
    collected: result.parcels.filter((p) => p.status === PARCEL_STATUS.COLLECTED).length,
  };

  // Get 5 most recent parcels sorted by creation date
  const recentParcels = result.parcels
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return {
    success: true,
    data: {
      stats,
      recentParcels,
    },
    message: 'Dashboard data retrieved successfully',
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}
