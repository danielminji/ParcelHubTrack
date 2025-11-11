/**
 * Admin Users API
 * GET /api/admin/users - List all users with filters
 * POST /api/admin/users - Create new user
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS, unauthorizedResponse, forbiddenResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/jwt-helper';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    // Authenticate and require ADMIN role
    let user;
    try {
      user = await requireAuth(request, ['ADMIN']);
    } catch (error: any) {
      if (error.message === 'UNAUTHORIZED') {
        return unauthorizedResponse('Please login to view users');
      }
      if (error.message === 'FORBIDDEN') {
        return forbiddenResponse('Only administrators can access user management');
      }
      throw error;
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // RECIPIENT, OPERATOR, ADMIN
    const hub_id = searchParams.get('hub_id');
    const status = searchParams.get('status'); // ACTIVE, INACTIVE
    const search = searchParams.get('search'); // Search by name, email, or phone
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (hub_id) {
      where.hub_id = hub_id;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
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
      orderBy: {
        created_at: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return successResponse({
      users,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    }, 'Users retrieved successfully');

  } catch (error: any) {
    console.error('Get users error:', error);
    return errorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Failed to retrieve users',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate and require ADMIN role
    let user;
    try {
      user = await requireAuth(request, ['ADMIN']);
    } catch (error: any) {
      if (error.message === 'UNAUTHORIZED') {
        return unauthorizedResponse('Please login to create users');
      }
      if (error.message === 'FORBIDDEN') {
        return forbiddenResponse('Only administrators can create users');
      }
      throw error;
    }

    const body = await request.json();
    const { full_name, email, phone, password, role, hub_id, status } = body;

    // Validate required fields
    if (!full_name || !role) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Full name and role are required',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validate at least email or phone
    if (!email && !phone) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Either email or phone is required',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validate role
    if (!['RECIPIENT', 'OPERATOR', 'ADMIN'].includes(role)) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid role. Must be RECIPIENT, OPERATOR, or ADMIN',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Operators must have a hub assigned
    if (role === 'OPERATOR' && !hub_id) {
      return errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Operators must be assigned to a hub',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Check if user already exists
    if (email) {
      const existingByEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingByEmail) {
        return errorResponse(
          ERROR_CODES.DUPLICATE_ENTRY,
          'User with this email already exists',
          HTTP_STATUS.CONFLICT
        );
      }
    }

    if (phone) {
      const existingByPhone = await prisma.user.findUnique({
        where: { phone },
      });
      if (existingByPhone) {
        return errorResponse(
          ERROR_CODES.DUPLICATE_ENTRY,
          'User with this phone number already exists',
          HTTP_STATUS.CONFLICT
        );
      }
    }

    // Verify hub exists if provided
    if (hub_id) {
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

    // Hash password if provided, otherwise generate a temporary one
    const hashedPassword = password 
      ? await bcrypt.hash(password, 10)
      : await bcrypt.hash(`temp${Date.now()}`, 10); // Generate temporary password

    // Create user
    const newUser = await prisma.user.create({
      data: {
        full_name,
        email: email || null,
        phone: phone || null,
        password_hash: hashedPassword,
        role,
        hub_id: hub_id || null,
        status: status || 'ACTIVE',
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        hub_id: true,
        created_at: true,
        hub: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    return successResponse(
      { user: newUser },
      'User created successfully',
      HTTP_STATUS.CREATED
    );

  } catch (error: any) {
    console.error('Create user error:', error);
    return errorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'Failed to create user',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
