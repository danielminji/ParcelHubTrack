/**
 * Sign Up API Route
 * POST /api/auth/signup
 * Creates a new user account
 */

import { NextRequest } from 'next/server';
import { createUser } from '@/models/user.model';
import { successResponse, errorResponse, createdResponse, ERROR_CODES, HTTP_STATUS } from '@/lib/api-response';
import * as bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, password, role, hubId } = body;

    // Validation
    if (!firstName || !lastName || !phone || !password) {
      return errorResponse(
        ERROR_CODES.MISSING_REQUIRED_FIELD,
        'All fields are required',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validate role (only RECIPIENT and OPERATOR can sign up)
    if (role && !['RECIPIENT', 'OPERATOR'].includes(role)) {
      return errorResponse(
        ERROR_CODES.INVALID_INPUT,
        'Invalid role. Only RECIPIENT and OPERATOR can sign up.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validate hub_id is required
    if (!hubId) {
      return errorResponse(
        ERROR_CODES.MISSING_REQUIRED_FIELD,
        'Hub selection is required',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validate phone format (basic)
    if (!/^\+?[\d\s-()]+$/.test(phone)) {
      return errorResponse(
        ERROR_CODES.INVALID_INPUT,
        'Invalid phone number format',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validate email if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse(
        ERROR_CODES.INVALID_INPUT,
        'Invalid email format',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with specified role (default to RECIPIENT if not provided)
    const userData = {
      full_name: `${firstName} ${lastName}`,
      email: email || null,
      phone,
      password_hash: passwordHash,
      role: (role || 'RECIPIENT') as 'RECIPIENT' | 'OPERATOR',
      hub_id: hubId,
    };

    const result = await createUser(userData);

    if (!result.success) {
      return errorResponse(
        ERROR_CODES.OPERATION_FAILED,
        result.message,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Return user data without password
    return createdResponse(result.data, 'User created successfully');
  } catch (error: any) {
    console.error('Signup error:', error);
    return errorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Internal server error',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      { stack: error.stack }
    );
  }
}
