/**
 * Public Tracking API Route
 * 
 * GET /api/v1/public/track/[trackingId]
 * Track parcel status (no authentication required)
 */

import {
  asyncHandler,
  successResponse,
  notFoundResponse,
  validationErrorResponse,
} from '@/lib/api-response';
import { findParcelByTrackingId } from '@/models/parcel.model';

/**
 * GET /api/v1/public/track/[trackingId]
 * Public parcel tracking (guest)
 */
export const GET = asyncHandler(async (request, { params }) => {
  // 1. Get tracking ID from params
  const trackingId = params.trackingId;

  // Validation
  if (!trackingId || trackingId.length < 5) {
    return validationErrorResponse('Invalid tracking ID', {
      trackingId: ['Tracking ID must be at least 5 characters'],
    });
  }

  // 2. Find parcel
  const parcel = await findParcelByTrackingId(trackingId);

  if (!parcel) {
    return notFoundResponse('Parcel', trackingId);
  }

  // 3. Return limited information (no sensitive data)
  const publicData = {
    tracking_id: parcel.tracking_id,
    status: parcel.status,
    created_at: parcel.created_at,
    checked_in_at: parcel.checked_in_at,
    storage_location: parcel.status === 'READY_FOR_PICKUP' ? parcel.storage_location : null,
    fee_amount: parcel.fee_amount,
    // Do NOT include recipient details, phone, email, etc.
  };

  let message = 'Parcel found';
  
  if (parcel.status === 'EXPECTED') {
    message = 'Parcel is expected to arrive soon';
  } else if (parcel.status === 'READY_FOR_PICKUP') {
    message = 'Parcel is ready for pickup!';
  } else if (parcel.status === 'ARRIVED_UNCLAIMED') {
    message = 'Parcel has arrived. Please collect at counter.';
  } else if (parcel.status === 'COLLECTED') {
    message = 'Parcel has been collected';
  }

  return successResponse(publicData, message);
});
