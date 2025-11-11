/**
 * Recipient Parcel Detail API Route
 * 
 * GET /api/v1/recipient/parcels/[id]
 * Get single parcel details with ownership verification
 * 
 * DELETE /api/v1/recipient/parcels/[id]
 * Cancel pre-registered parcel (only if status = EXPECTED)
 */

import {
  asyncHandler,
  successResponse,
  deletedResponse,
  notFoundResponse,
  forbiddenResponse,
  unauthorizedResponse,
} from '@/lib/api-response';
import * as recipientController from '@/controllers/recipient.controller';

/**
 * GET /api/v1/recipient/parcels/[id]
 * Get parcel details
 */
export const GET = asyncHandler(async (request, { params }) => {
  // 1. Get recipient ID from session/token
  // TODO: Implement authentication middleware
  const recipientId = 'user-123'; // From auth session

  if (!recipientId) {
    return unauthorizedResponse('Please login to view parcel details');
  }

  // 2. Get parcel ID from params
  const parcelId = params.id;

  // 3. Call controller
  const result = await recipientController.getParcelDetails(parcelId, recipientId);

  // 4. Return response
  return successResponse(result.data, result.message);
});

/**
 * DELETE /api/v1/recipient/parcels/[id]
 * Cancel pre-registered parcel
 */
export const DELETE = asyncHandler(async (request, { params }) => {
  // 1. Get recipient ID from session/token
  const recipientId = 'user-123'; // From auth session

  if (!recipientId) {
    return unauthorizedResponse('Please login to cancel parcels');
  }

  // 2. Get parcel ID from params
  const parcelId = params.id;

  // 3. Call controller
  const result = await recipientController.cancelParcel(parcelId, recipientId);

  // 4. Return response
  return deletedResponse(result.message);
});
