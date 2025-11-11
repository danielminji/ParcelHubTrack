/**
 * User Model
 * 
 * Database operations for User entity
 * All CRUD operations for users (recipients, operators, admins)
 * Includes optimized selective field fetching for security and performance
 */

import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

// ============================================
// SELECTIVE FIELD SETS (Performance & Security)
// ============================================

/**
 * Fields for authentication (includes password)
 * Use: Login verification only
 * Security: Never expose this beyond auth layer
 */
const USER_AUTH_SELECT = {
  id: true,
  email: true,
  phone: true,
  password_hash: true,
  full_name: true,
  role: true,
  status: true,
  hub_id: true,
} as const;

/**
 * Fields for user profile (excludes password)
 * Use: Profile pages, settings
 */
const USER_PROFILE_SELECT = {
  id: true,
  email: true,
  phone: true,
  full_name: true,
  role: true,
  status: true,
  hub_id: true,
  created_at: true,
  updated_at: true,
  last_login_at: true,
} as const;

/**
 * Fields for user lists (minimal data)
 * Use: Admin user management, search results
 */
const USER_LIST_SELECT = {
  id: true,
  email: true,
  full_name: true,
  role: true,
  status: true,
  last_login_at: true,
} as const;

/**
 * Minimal fields for references
 * Use: Display names, operator references
 */
const USER_SUMMARY_SELECT = {
  id: true,
  full_name: true,
  email: true,
  role: true,
} as const;

// ============================================
// AUTHENTICATION & BASIC OPERATIONS
// ============================================

/**
 * Find user by ID (profile view - no password)
 */
export async function findUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: USER_PROFILE_SELECT,
  });
}

/**
 * Find user by email for authentication (includes password)
 * SECURITY: Only use this for login/auth purposes
 */
export async function findUserByEmailForAuth(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    select: USER_AUTH_SELECT,
  });
}

/**
 * Find user by email (profile view - no password)
 */
export async function findUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    select: USER_PROFILE_SELECT,
  });
}

/**
 * Find user by phone
 */
export async function findUserByPhone(phone: string) {
  return await prisma.user.findUnique({
    where: { phone },
  });
}

/**
 * Create new user (with validation)
 */
export async function createUser(data: Prisma.UserCreateInput) {
  try {
    // Check if email already exists (if provided)
    if (data.email && await emailExists(data.email)) {
      return {
        success: false,
        data: null,
        message: 'Email already registered'
      };
    }

    // Check if phone already exists
    if (await phoneExists(data.phone)) {
      return {
        success: false,
        data: null,
        message: 'Phone number already registered'
      };
    }

    const user = await prisma.user.create({
      data,
      select: USER_PROFILE_SELECT,
    });

    return {
      success: true,
      data: user,
      message: 'User created successfully'
    };
  } catch (error: any) {
    console.error('Create user error:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Failed to create user'
    };
  }
}

/**
 * Update user
 */
export async function updateUser(id: string, data: Prisma.UserUpdateInput) {
  return await prisma.user.update({
    where: { id },
    data,
  });
}

/**
 * Delete user (soft delete - set status to DELETED)
 */
export async function deleteUser(id: string) {
  return await prisma.user.update({
    where: { id },
    data: { status: 'DELETED' },
  });
}

/**
 * Get all users with filters (optimized)
 */
export async function findUsers(filters?: {
  role?: 'RECIPIENT' | 'OPERATOR' | 'ADMIN';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { role, status, search, page = 1, limit = 20 } = filters || {};

  const where: Prisma.UserWhereInput = {
    ...(role && { role: role as any }),
    ...(status && { status: status as any }),
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { full_name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: USER_LIST_SELECT,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ============================================
// UTILITY FUNCTIONS (Optimized)
// ============================================

/**
 * Check if email exists (lightweight query)
 */
export async function emailExists(email: string): Promise<boolean> {
  const count = await prisma.user.count({
    where: { email },
  });
  return count > 0;
}

/**
 * Check if phone exists (lightweight query)
 */
export async function phoneExists(phone: string): Promise<boolean> {
  const count = await prisma.user.count({
    where: { phone },
  });
  return count > 0;
}

/**
 * Get users by role (for admin management)
 */
export async function getUsersByRole(role: 'RECIPIENT' | 'OPERATOR' | 'ADMIN') {
  return await prisma.user.findMany({
    where: { role, status: 'ACTIVE' },
    select: USER_LIST_SELECT,
    orderBy: { full_name: 'asc' },
  });
}

/**
 * Search users (optimized for quick lookups)
 */
export async function searchUsers(query: string, limit = 10) {
  return await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: query, mode: 'insensitive' } },
        { full_name: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query } },
      ],
      status: { not: 'DELETED' },
    },
    select: USER_SUMMARY_SELECT,
    take: limit,
  });
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(id: string) {
  return await prisma.user.update({
    where: { id },
    data: { last_login_at: new Date() },
  });
}
