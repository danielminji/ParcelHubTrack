/**
 * Operator Search API Route
 * 
 * GET /api/v1/operator/search
 * Search parcels by tracking ID, recipient name, or phone
 */

import {
  asyncHandler,
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api-response';
import * as operatorController from '@/controllers/operator.controller';

/**
 * GET /api/v1/operator/search
 * Search parcels
 */
export const GET = asyncHandler(async (request) => {
  // 1. Extract query parameter
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  // Validation
  if (!query || query.trim().length === 0) {
    return validationErrorResponse('Search query cannot be empty', {
      q: ['Please provide a tracking ID, name, or phone number'],
    });
  }

  // 2. Get operator ID from session/token
  // TODO: Implement authentication middleware
  const operatorId = 'operator-123'; // From auth session

  if (!operatorId) {
    return unauthorizedResponse('Please login to search parcels');
  }

  // 3. Check if user has operator role
  const userRole = 'OPERATOR'; // From auth session
  if (userRole !== 'OPERATOR' && userRole !== 'ADMIN') {
    return forbiddenResponse('Only operators can search parcels');
  }

  // 4. Call controller
  const result = await operatorController.searchParcels(query.trim());

  // 5. Return response
  return successResponse(result.data, result.message);
});
