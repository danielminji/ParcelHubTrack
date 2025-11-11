/**
 * Recipient Dashboard API Route
 * 
 * GET /api/v1/recipient/dashboard
 * Get dashboard statistics and recent parcels
 */

import {
  asyncHandler,
  successResponse,
  unauthorizedResponse,
} from '@/lib/api-response';
import * as recipientController from '@/controllers/recipient.controller';

/**
 * GET /api/v1/recipient/dashboard
 * Get dashboard data
 */
export const GET = asyncHandler(async (request) => {
  // 1. Get recipient ID from session/token
  // TODO: Implement authentication middleware
  const recipientId = 'user-123'; // From auth session

  if (!recipientId) {
    return unauthorizedResponse('Please login to view dashboard');
  }

  // 2. Call controller
  const result = await recipientController.getRecipientDashboard(recipientId);

  // 3. Return response
  return successResponse(result.data, result.message);
});
