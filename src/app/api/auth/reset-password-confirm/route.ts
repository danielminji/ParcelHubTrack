/**
 * Password Reset Confirmation API Route
 * POST /api/auth/reset-password-confirm
 * Validates token and updates user password
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Token and new password are required',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Password must be at least 8 characters long',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        reset_token: token,
        reset_token_expiry: {
          gte: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid or expired reset token',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Hash the new password
    const password_hash = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash,
        reset_token: null,
        reset_token_expiry: null,
      },
    });

    console.log('Password reset successful for user:', user.email || user.phone);

    return successResponse(
      { message: 'Password has been reset successfully' },
      'Password reset successful'
    );
  } catch (error: any) {
    console.error('Password reset confirmation error:', error);
    return errorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Failed to reset password',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
