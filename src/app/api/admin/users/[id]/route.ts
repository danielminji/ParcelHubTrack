/**
 * Admin User Detail API
 * PATCH /api/admin/users/[id] - Update user
 * DELETE /api/admin/users/[id] - Deactivate user
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/jwt-helper';
import bcrypt from 'bcryptjs';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and require ADMIN role
    let user;
    try {
      user = await requireAuth(request, ['ADMIN']);
    } catch (error: any) {
      if (error.message === 'UNAUTHORIZED') {
        return unauthorizedResponse('Please login to update users');
      }
      if (error.message === 'FORBIDDEN') {
        return forbiddenResponse('Only administrators can update users');
      }
      throw error;
    }

    const userId = params.id;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return errorResponse(
        ERROR_CODES.NOT_FOUND,
        'User not found',
        HTTP_STATUS.NOT_FOUND
      );
    }

    const body = await request.json();
    const { full_name, email, phone, password, role, hub_id, status } = body;

    // Build update data
    const updateData: any = {};

    if (full_name !== undefined) updateData.full_name = full_name;
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (status !== undefined) updateData.status = status;
    if (role !== undefined) {
      if (!['RECIPIENT', 'OPERATOR', 'ADMIN'].includes(role)) {
        return errorResponse(
          ERROR_CODES.VALIDATION_ERROR,
          'Invalid role. Must be RECIPIENT, OPERATOR, or ADMIN',
          HTTP_STATUS.BAD_REQUEST
        );
      }
      updateData.role = role;
    }

    if (hub_id !== undefined) {
      if (hub_id) {
        // Verify hub exists
        const hub = await prisma.hub.findUnique({
          where: { id: hub_id },
        });
        if (!hub) {
          return errorResponse(
            ERROR_CODES.NOT_FOUND,
            'Hub not found',
            HTTP_STATUS.NOT_FOUND
          );
        }
      }
      updateData.hub_id = hub_id || null;
    }

    // Validate operators must have hub
    const finalRole = role || existingUser.role;
    const finalHubId = hub_id !== undefined ? hub_id : existingUser.hub_id;
    if (finalRole === 'OPERATOR' && !finalHubId) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Operators must be assigned to a hub',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Check for duplicate email
    if (email && email !== existingUser.email) {
      const duplicateEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (duplicateEmail) {
        return errorResponse(
          ERROR_CODES.DUPLICATE_ENTRY,
          'User with this email already exists',
          HTTP_STATUS.CONFLICT
        );
      }
    }

    // Check for duplicate phone
    if (phone && phone !== existingUser.phone) {
      const duplicatePhone = await prisma.user.findUnique({
        where: { phone },
      });
      if (duplicatePhone) {
        return errorResponse(
          ERROR_CODES.DUPLICATE_ENTRY,
          'User with this phone number already exists',
          HTTP_STATUS.CONFLICT
        );
      }
    }

    // Hash password if provided
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        hub_id: true,
        created_at: true,
        updated_at: true,
        hub: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    return successResponse(
      { user: updatedUser },
      'User updated successfully'
    );

  } catch (error: any) {
    console.error('Update user error:', error);
    return errorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Failed to update user',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and require ADMIN role
    let user;
    try {
      user = await requireAuth(request, ['ADMIN']);
    } catch (error: any) {
      if (error.message === 'UNAUTHORIZED') {
        return unauthorizedResponse('Please login to deactivate users');
      }
      if (error.message === 'FORBIDDEN') {
        return forbiddenResponse('Only administrators can deactivate users');
      }
      throw error;
    }

    const userId = params.id;

    // Prevent self-deletion
    if (userId === user.id) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'You cannot deactivate your own account',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return errorResponse(
        ERROR_CODES.NOT_FOUND,
        'User not found',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Soft delete by setting status to INACTIVE
    const deactivatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: 'INACTIVE' },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
      },
    });

    return successResponse(
      { user: deactivatedUser },
      'User deactivated successfully'
    );

  } catch (error: any) {
    console.error('Deactivate user error:', error);
    return errorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Failed to deactivate user',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
