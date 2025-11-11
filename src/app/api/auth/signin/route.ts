/**
 * Sign In API Route
 * POST /api/auth/signin
 * Authenticates user and returns JWT token
 */

import { NextRequest } from 'next/server';
import { findUserByPhone, findUserByEmailForAuth, updateUser } from '@/models/user.model';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS } from '@/lib/api-response';
import { generateToken } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, email, password } = body;

    // Validation
    if (!password || (!phone && !email)) {
      return errorResponse(
        ERROR_CODES.MISSING_REQUIRED_FIELD,
        'Phone/email and password are required',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Find user by phone or email (with password for verification)
    let user;
    if (email) {
      user = await findUserByEmailForAuth(email);
    } else if (phone) {
      user = await findUserByPhone(phone);
    }

    if (!user) {
      return errorResponse(
        ERROR_CODES.NOT_FOUND,
        'Invalid credentials',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return errorResponse(
        ERROR_CODES.FORBIDDEN,
        `Account is ${user.status.toLowerCase()}`,
        HTTP_STATUS.FORBIDDEN
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return errorResponse(
        ERROR_CODES.UNAUTHORIZED,
        'Invalid credentials',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Update last login
    await updateUser(user.id, {
      last_login_at: new Date(),
    });

    // Generate JWT token
    const { password_hash: _, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword as any);

    return successResponse(
      {
        user: userWithoutPassword,
        token,
      },
      'Sign in successful'
    );
  } catch (error: any) {
    console.error('Signin error:', error);
    return errorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Internal server error',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      { stack: error.stack }
    );
  }
}
