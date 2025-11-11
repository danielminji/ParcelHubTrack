/**
 * Operator Check-In API Route
 * 
 * POST /api/v1/operator/check-in
 * Handles parcel check-in operations (barcode scanning)
 */

import {
  asyncHandler,
  createdResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api-response';
import * as operatorController from '@/controllers/operator.controller';
import { requireAuth } from '@/lib/jwt-helper';

/**
 * POST /api/v1/operator/check-in
 * Check-in a parcel (scan barcode)
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
      return forbiddenResponse('Only operators can check-in parcels');
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
    weight_kg,
    is_damaged,
    notes,
  } = body;

  // 3. Validate required fields
  const errors: Record<string, string[]> = {};

  if (!tracking_id) {
    errors.tracking_id = ['Tracking ID is required'];
  }

  if (!weight_kg) {
    errors.weight_kg = ['Weight is required'];
  } else if (weight_kg <= 0) {
    errors.weight_kg = ['Weight must be greater than 0'];
  } else if (weight_kg > 100) {
    errors.weight_kg = ['Weight cannot exceed 100kg (check with supervisor for oversized parcels)'];
  }

  if (Object.keys(errors).length > 0) {
    return validationErrorResponse('Please provide valid parcel information', errors);
  }

  // 4. Call controller with real operator data from JWT
  const result = await operatorController.checkInParcel({
    trackingId: tracking_id,
    weightKg: parseFloat(weight_kg),
    isDamaged: is_damaged || false,
    notes,
    operatorId: user.id,
    hubId: user.hub_id || '', // Provide empty string if null
  });

  // 5. Return created response (201)
  return createdResponse(result.data, result.message);
});

/**
 * Example Response (201):
 * {
 *   "success": true,
 *   "data": {
 *     "parcel": {
 *       "id": "parcel-123",
 *       "tracking_id": "PT1A2B3C4D",
 *       "status": "READY_FOR_PICKUP",
 *       "weight_kg": 1.5,
 *       "storage_location": "A-15",
 *       "fee_amount": 1.50,
 *       "recipient": {
 *         "name": "John Doe",
 *         "phone": "+60129876543"
 *       }
 *     },
 *     "matched": true,
 *     "storage_location": "A-15",
 *     "fee_amount": 1.50
 *   },
 *   "message": "✓ Parcel matched! Assigned to A-15. Recipient will be notified.",
 *   "meta": {
 *     "timestamp": "2025-11-03T10:00:00Z"
 *   }
 * }
 */

/**
 * SUCCESS - Unmatched Parcel (Guest)
 * POST /api/v1/operator/check-in
 * Body: { "tracking_id": "XYZ999", "weight_kg": 3.2 }
 * 
 * Response (201):
 * {
 *   "success": true,
 *   "data": {
 *     "parcel": {
 *       "id": "parcel-456",
 *       "tracking_id": "XYZ999",
 *       "status": "ARRIVED_UNCLAIMED",
 *       "weight_kg": 3.2,
 *       "storage_location": "B-42",
 *       "fee_amount": 2.00
 *     },
 *     "matched": false,
 *     "storage_location": "B-42",
 *     "fee_amount": 2.00
 *   },
 *   "message": "⚠ No pre-registration found. Parcel stored at B-42. Guest must claim at counter.",
 *   "meta": {
 *     "timestamp": "2025-11-03T10:00:00Z"
 *   }
 * }
 */

/**
 * ERROR - Validation Error
 * POST /api/v1/operator/check-in
 * Body: { "tracking_id": "" }
 * 
 * Response (422):
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "Please provide valid parcel information",
 *     "details": {
 *       "errors": {
 *         "tracking_id": ["Tracking ID is required"],
 *         "weight_kg": ["Weight is required"]
 *       }
 *     }
 *   }
 * }
 */

/**
 * ERROR - Unauthorized
 * POST /api/v1/operator/check-in (without auth token)
 * 
 * Response (401):
 * {
 *   "success": false,
 *   "error": {
 *     "code": "UNAUTHORIZED",
 *     "message": "Please login to perform this operation"
 *   }
 * }
 */

/**
 * ERROR - Forbidden
 * POST /api/v1/operator/check-in (as RECIPIENT role)
 * 
 * Response (403):
 * {
 *   "success": false,
 *   "error": {
 *     "code": "FORBIDDEN",
 *     "message": "Only operators can check-in parcels"
 *   }
 * }
 */

/**
 * ERROR - Database Error (handled automatically by asyncHandler)
 * 
 * Response (500):
 * {
 *   "success": false,
 *   "error": {
 *     "code": "DATABASE_ERROR",
 *     "message": "Database operation failed"
 *   }
 * }
 */
