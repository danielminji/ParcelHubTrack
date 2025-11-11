/**
 * Recipient Parcels API Route
 * 
 * Handles recipient parcel operations:
 * - GET: List all parcels with pagination
 * - POST: Pre-register a new parcel
 */

import {
  asyncHandler,
  paginatedResponse,
  createdResponse,
  validationErrorResponse,
  unauthorizedResponse,
} from '@/lib/api-response';
import * as recipientController from '@/controllers/recipient.controller';

/**
 * GET /api/v1/recipient/parcels
 * Get all parcels for authenticated recipient with pagination
 */
export const GET = asyncHandler(async (request) => {
  // 1. Extract and validate query parameters
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status') || undefined;

  // Validation
  if (page < 1 || limit < 1 || limit > 100) {
    return validationErrorResponse('Invalid pagination parameters', {
      page: page < 1 ? ['Page must be greater than 0'] : [],
      limit: limit < 1 || limit > 100 ? ['Limit must be between 1 and 100'] : [],
    });
  }

  // 2. Get recipient ID from session/token
  // TODO: Implement authentication middleware
  const recipientId = 'user-123'; // From auth session
  const hubId = 'hub-123'; // Should come from authenticated user's hub_id

  if (!recipientId) {
    return unauthorizedResponse('Please login to view your parcels');
  }

  // 3. Call controller
  const result = await recipientController.getRecipientParcels(recipientId, hubId, {
    status: status as any, // Type cast from string to ParcelStatus
    page,
    limit,
  });

  // 4. Return paginated response
  const meta = result.meta as any;
  return paginatedResponse(
    result.data,
    meta.pagination.page,
    meta.pagination.limit,
    meta.pagination.total,
    result.message
  );
});

/**
 * POST /api/v1/recipient/parcels
 * Pre-register a new parcel
 */
export const POST = asyncHandler(async (request) => {
  // 1. Parse and validate request body
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return validationErrorResponse('Invalid JSON in request body', {});
  }

  const { tracking_id, expected_arrival_date } = body;

  // Validate required fields
  const errors: Record<string, string[]> = {};
  if (!tracking_id) {
    errors.tracking_id = ['Tracking ID is required'];
  }
  if (tracking_id && tracking_id.length < 5) {
    errors.tracking_id = ['Tracking ID must be at least 5 characters'];
  }

  if (Object.keys(errors).length > 0) {
    return validationErrorResponse('Validation failed', errors);
  }

  // 2. Get recipient from auth session
  // TODO: Replace with actual JWT authentication
  const recipientId = 'user-123';
  const hubId = 'hub-123'; // Should come from authenticated user's hub_id

  if (!recipientId) {
    return unauthorizedResponse('Please login to register parcels');
  }

  // 3. Call controller
  const result = await recipientController.preRegisterParcel({
    recipientId,
    hubId,
    trackingId: tracking_id,
    expectedArrivalDate: expected_arrival_date
      ? new Date(expected_arrival_date)
      : undefined,
  });

  // 4. Return created response (201)
  return createdResponse(result.data, result.message);
});
