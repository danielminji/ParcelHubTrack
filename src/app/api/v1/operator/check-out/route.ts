/**
 * Operator Check-Out API Route
 * 
 * POST /api/v1/operator/check-out
 * Process parcel pickup and payment
 */

import {
  asyncHandler,
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api-response';
import * as operatorController from '@/controllers/operator.controller';
import { requireAuth } from '@/lib/jwt-helper';

/**
 * POST /api/v1/operator/check-out
 * Process parcel checkout
 */
export const POST = asyncHandler(async (request) => {
  // 1. Authenticate user and check role
  let user;
  try {
    user = await requireAuth(request, ['OPERATOR', 'ADMIN']);
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return unauthorizedResponse('Please login to perform this operation');
    }
    if (error.message === 'FORBIDDEN') {
      return forbiddenResponse('Only operators can check-out parcels');
    }
    throw error;
  }

  // 2. Parse request body
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return validationErrorResponse('Invalid JSON in request body', {});
  }

  const {
    tracking_id,
    payment_amount,
    payment_method,
    actual_recipient_name,
    actual_recipient_phone,
    notes,
  } = body;

  // 3. Validate required fields
  const errors: Record<string, string[]> = {};

  if (!tracking_id) {
    errors.tracking_id = ['Tracking ID is required'];
  }

  if (!payment_amount && payment_amount !== 0) {
    errors.payment_amount = ['Payment amount is required'];
  }

  if (!payment_method) {
    errors.payment_method = ['Payment method is required (CASH, QR, CARD)'];
  }

  if (Object.keys(errors).length > 0) {
    return validationErrorResponse('Please provide valid checkout information', errors);
  }

  // 4. Call controller with real operator data from JWT
  const result = await operatorController.checkOutParcel({
    parcelId: tracking_id, // Using tracking_id as parcelId for now
    paymentAmount: parseFloat(payment_amount),
    paymentMethod: payment_method,
    recipientName: actual_recipient_name,
    recipientPhone: actual_recipient_phone,
    notes,
    operatorId: user.id,
  });

  // 5. Return success response
  return successResponse(result.data, result.message);
});

