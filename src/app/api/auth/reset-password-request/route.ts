/**
 * Password Reset Request API Route
 * POST /api/auth/reset-password-request
 * Generates reset token and sends email/SMS to user
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailOrPhone } = body;

    if (!emailOrPhone) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Email or phone number is required',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Determine if input is email or phone
    const isEmail = emailOrPhone.includes('@');
    
    // Find user by email or phone
    const user = await prisma.user.findFirst({
      where: isEmail 
        ? { email: emailOrPhone }
        : { phone: emailOrPhone }
    });

    // Don't reveal if user exists (security best practice)
    if (!user) {
      return successResponse(
        { message: 'If an account exists, a reset link has been sent' },
        'Password reset request processed'
      );
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry,
      },
    });

    // TODO: Send email or SMS with reset link
    // const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/confirm?token=${resetToken}`;
    // 
    // if (isEmail) {
    //   await sendEmail({
    //     to: user.email,
    //     subject: 'Password Reset Request',
    //     html: `Click here to reset your password: ${resetUrl}`,
    //   });
    // } else {
    //   await sendSMS({
    //     to: user.phone,
    //     message: `Reset your ParcelTrack password: ${resetUrl}`,
    //   });
    // }

    console.log('Password reset requested for:', emailOrPhone);
    console.log('Reset token:', resetToken);
    console.log('Reset URL would be:', `/reset-password/confirm?token=${resetToken}`);

    return successResponse(
      { message: 'If an account exists, a reset link has been sent' },
      'Password reset request processed'
    );
  } catch (error: any) {
    console.error('Password reset request error:', error);
    return errorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Failed to process password reset request',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
