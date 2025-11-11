/**
 * Operator Dashboard API Route
 * 
 * GET /api/v1/operator/dashboard
 * Get operator dashboard statistics
 */

import {
  asyncHandler,
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api-response';
import * as operatorController from '@/controllers/operator.controller';

/**
 * GET /api/v1/operator/dashboard
 * Get dashboard stats
 */
export const GET = asyncHandler(async (request) => {
  // 1. Get operator ID from session/token
  // TODO: Implement authentication middleware
  const operatorId = 'operator-123'; // From auth session

  if (!operatorId) {
    return unauthorizedResponse('Please login to view dashboard');
  }

  // 2. Check if user has operator role
  const userRole = 'OPERATOR'; // From auth session
  if (userRole !== 'OPERATOR' && userRole !== 'ADMIN') {
    return forbiddenResponse('Only operators can view operator dashboard');
  }

  // 3. Call controller
  const result = await operatorController.getOperatorDashboard();

  // 4. Return response
  return successResponse(result.data, result.message);
});
