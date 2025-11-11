// =================================================================
// API Response Wrapper Utility
// Standard REST API Response Format
// =================================================================
// Based on industry best practices:
// - JSend specification
// - Microsoft REST API Guidelines
// - Google JSON Style Guide
// =================================================================

/**
 * Standard API Response Structure
 * 
 * Success Response:
 * {
 *   success: true,
 *   data: { ... },
 *   message?: string,
 *   meta?: { ... }
 * }
 * 
 * Error Response:
 * {
 *   success: false,
 *   error: {
 *     code: string,
 *     message: string,
 *     details?: any
 *   }
 * }
 */

import { NextResponse } from 'next/server';

// =================================================================
// TYPE DEFINITIONS
// =================================================================

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: ResponseMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    stack?: string; // Only in development
  };
}

export interface ResponseMeta {
  timestamp: string;
  requestId?: string;
  version?: string;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface PaginationMeta extends ResponseMeta {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// =================================================================
// HTTP STATUS CODES
// =================================================================

export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// =================================================================
// ERROR CODES (Standardized across application)
// =================================================================

export const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  FORBIDDEN: 'FORBIDDEN',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Resource
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // Business Logic
  OPERATION_FAILED: 'OPERATION_FAILED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  INVALID_STATUS: 'INVALID_STATUS',
  
  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

// =================================================================
// CORE RESPONSE BUILDERS
// =================================================================

/**
 * Create success response
 * @param data - Response data
 * @param message - Optional success message
 * @param statusCode - HTTP status code (default: 200)
 * @param meta - Additional metadata
 */
export function successResponse<T>(
  data: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK,
  meta?: Partial<ResponseMeta>
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Create error response
 * @param code - Error code from ERROR_CODES
 * @param message - User-friendly error message
 * @param statusCode - HTTP status code (default: 400)
 * @param details - Additional error details (validation errors, etc.)
 */
export function errorResponse(
  code: string,
  message: string,
  statusCode: number = HTTP_STATUS.BAD_REQUEST,
  details?: any
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      // Include stack trace only in development
      ...(process.env.NODE_ENV === 'development' && details?.stack && {
        stack: details.stack,
      }),
    },
  };

  return NextResponse.json(response, { status: statusCode });
}

// =================================================================
// SPECIALIZED SUCCESS RESPONSES
// =================================================================

/**
 * Success response for resource creation (201)
 */
export function createdResponse<T>(
  data: T,
  message: string = 'Resource created successfully'
): NextResponse<ApiSuccessResponse<T>> {
  return successResponse(data, message, HTTP_STATUS.CREATED);
}

/**
 * Success response with no content (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT });
}

/**
 * Success response for updates
 */
export function updatedResponse<T>(
  data: T,
  message: string = 'Resource updated successfully'
): NextResponse<ApiSuccessResponse<T>> {
  return successResponse(data, message, HTTP_STATUS.OK);
}

/**
 * Success response for deletions
 */
export function deletedResponse(
  message: string = 'Resource deleted successfully'
): NextResponse<ApiSuccessResponse<null>> {
  return successResponse(null, message, HTTP_STATUS.OK);
}

// =================================================================
// PAGINATED RESPONSE
// =================================================================

/**
 * Paginated response with metadata
 * @param data - Array of items
 * @param page - Current page number
 * @param limit - Items per page
 * @param total - Total number of items
 * @param message - Optional message
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): NextResponse<ApiSuccessResponse<T[]>> {
  const totalPages = Math.ceil(total / limit);
  
  const response: ApiSuccessResponse<T[]> = {
    success: true,
    data,
    ...(message && { message }),
    meta: {
      timestamp: new Date().toISOString(),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  };

  return NextResponse.json(response, { status: HTTP_STATUS.OK });
}

// =================================================================
// SPECIALIZED ERROR RESPONSES
// =================================================================

/**
 * Validation error response (422)
 */
export function validationErrorResponse(
  message: string = 'Validation failed',
  errors: Record<string, string[]>
): NextResponse<ApiErrorResponse> {
  return errorResponse(
    ERROR_CODES.VALIDATION_ERROR,
    message,
    HTTP_STATUS.UNPROCESSABLE_ENTITY,
    { errors }
  );
}

/**
 * Not found error response (404)
 */
export function notFoundResponse(
  resource: string = 'Resource',
  identifier?: string
): NextResponse<ApiErrorResponse> {
  const message = identifier
    ? `${resource} with identifier '${identifier}' not found`
    : `${resource} not found`;

  return errorResponse(
    ERROR_CODES.NOT_FOUND,
    message,
    HTTP_STATUS.NOT_FOUND
  );
}

/**
 * Unauthorized error response (401)
 */
export function unauthorizedResponse(
  message: string = 'Authentication required'
): NextResponse<ApiErrorResponse> {
  return errorResponse(
    ERROR_CODES.UNAUTHORIZED,
    message,
    HTTP_STATUS.UNAUTHORIZED
  );
}

/**
 * Forbidden error response (403)
 */
export function forbiddenResponse(
  message: string = 'You do not have permission to access this resource'
): NextResponse<ApiErrorResponse> {
  return errorResponse(
    ERROR_CODES.FORBIDDEN,
    message,
    HTTP_STATUS.FORBIDDEN
  );
}

/**
 * Conflict error response (409) - for duplicate entries
 */
export function conflictResponse(
  message: string = 'Resource already exists',
  details?: any
): NextResponse<ApiErrorResponse> {
  return errorResponse(
    ERROR_CODES.ALREADY_EXISTS,
    message,
    HTTP_STATUS.CONFLICT,
    details
  );
}

/**
 * Internal server error response (500)
 */
export function internalErrorResponse(
  message: string = 'An internal error occurred',
  error?: Error
): NextResponse<ApiErrorResponse> {
  // Log error for debugging
  if (error) {
    console.error('Internal Error:', error);
  }

  return errorResponse(
    ERROR_CODES.INTERNAL_ERROR,
    message,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    process.env.NODE_ENV === 'development' ? error : undefined
  );
}

/**
 * Database error response (500)
 */
export function databaseErrorResponse(
  message: string = 'Database operation failed',
  error?: any
): NextResponse<ApiErrorResponse> {
  // Log error for debugging
  console.error('Database Error:', error);

  return errorResponse(
    ERROR_CODES.DATABASE_ERROR,
    message,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    process.env.NODE_ENV === 'development' ? error : undefined
  );
}

/**
 * Rate limit error response (429)
 */
export function rateLimitResponse(
  message: string = 'Too many requests, please try again later',
  retryAfter?: number
): NextResponse<ApiErrorResponse> {
  const response = errorResponse(
    ERROR_CODES.RATE_LIMIT_EXCEEDED,
    message,
    HTTP_STATUS.TOO_MANY_REQUESTS
  );

  if (retryAfter) {
    response.headers.set('Retry-After', retryAfter.toString());
  }

  return response;
}

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Extract error message from various error types
 */
export function extractErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error?.message) return error.error.message;
  return 'An unexpected error occurred';
}

/**
 * Check if error is a Prisma error
 */
export function isPrismaError(error: any): boolean {
  return error?.code?.startsWith('P');
}

/**
 * Handle Prisma errors and return appropriate response
 */
export function handlePrismaError(error: any): NextResponse<ApiErrorResponse> {
  const errorCode = error.code;

  switch (errorCode) {
    case 'P2002': // Unique constraint violation
      return conflictResponse(
        'A record with this value already exists',
        { field: error.meta?.target }
      );
    
    case 'P2025': // Record not found
      return notFoundResponse('Record');
    
    case 'P2003': // Foreign key constraint violation
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid reference to related record',
        HTTP_STATUS.BAD_REQUEST,
        { field: error.meta?.field_name }
      );
    
    default:
      return databaseErrorResponse(
        'Database operation failed',
        error
      );
  }
}

/**
 * Catch-all error handler for API routes
 */
export function handleApiError(error: any): NextResponse<ApiErrorResponse> {
  // Prisma errors
  if (isPrismaError(error)) {
    return handlePrismaError(error);
  }

  // Custom application errors
  if (error?.statusCode && error?.code) {
    return errorResponse(
      error.code,
      error.message,
      error.statusCode,
      error.details
    );
  }

  // Default to internal server error
  return internalErrorResponse(
    extractErrorMessage(error),
    error
  );
}

// =================================================================
// ASYNC WRAPPER (Error handling wrapper for route handlers)
// =================================================================

/**
 * Wraps an async route handler with error handling
 * Automatically catches errors and returns proper error responses
 * 
 * Usage:
 * export const GET = asyncHandler(async (request) => {
 *   const data = await someAsyncOperation();
 *   return successResponse(data);
 * });
 */
export function asyncHandler(
  handler: (request: Request, context?: any) => Promise<NextResponse>
) {
  return async (request: Request, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

// =================================================================
// EXPORT ALL
// =================================================================

export default {
  // Success responses
  success: successResponse,
  created: createdResponse,
  updated: updatedResponse,
  deleted: deletedResponse,
  noContent: noContentResponse,
  paginated: paginatedResponse,

  // Error responses
  error: errorResponse,
  validationError: validationErrorResponse,
  notFound: notFoundResponse,
  unauthorized: unauthorizedResponse,
  forbidden: forbiddenResponse,
  conflict: conflictResponse,
  internalError: internalErrorResponse,
  databaseError: databaseErrorResponse,
  rateLimit: rateLimitResponse,

  // Utilities
  asyncHandler,
  handleApiError,
  extractErrorMessage,

  // Constants
  HTTP_STATUS,
  ERROR_CODES,
};
