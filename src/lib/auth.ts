/**
 * Authentication Utilities
 * 
 * JWT token generation and verification
 * User authentication helpers
 */

import * as jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { findUserById } from '@/models/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

export interface JwtPayload {
  userId: string;
  role: string;
  hubId?: string;
  email?: string;
}

export interface AuthUser {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  role: 'RECIPIENT' | 'OPERATOR' | 'ADMIN';
  hub_id: string | null;
  status: string;
}

/**
 * Generate JWT token for user
 */
export function generateToken(user: AuthUser): string {
  const payload: JwtPayload = {
    userId: user.id,
    role: user.role,
    hubId: user.hub_id || undefined,
    email: user.email || undefined,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token and return payload
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return null;
  }

  // Support both "Bearer TOKEN" and just "TOKEN"
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : authHeader;

  return token || null;
}

/**
 * Get authenticated user from request
 * Returns user object or null if not authenticated
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const token = extractToken(request);

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  // Fetch fresh user data from database
  const user = await findUserById(payload.userId);

  if (!user || user.status !== 'ACTIVE') {
    return null;
  }

  return user as AuthUser;
}

/**
 * Require authentication middleware
 * Throws error if user is not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(request);

  if (!user) {
    const error = new Error('Authentication required');
    (error as any).statusCode = 401;
    (error as any).code = 'UNAUTHORIZED';
    throw error;
  }

  return user;
}

/**
 * Require specific role
 * Throws error if user doesn't have required role
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: ('RECIPIENT' | 'OPERATOR' | 'ADMIN')[]
): Promise<AuthUser> {
  const user = await requireAuth(request);

  if (!allowedRoles.includes(user.role)) {
    const error = new Error('Insufficient permissions');
    (error as any).statusCode = 403;
    (error as any).code = 'FORBIDDEN';
    throw error;
  }

  return user;
}

/**
 * Require hub assignment
 * Throws error if user is not assigned to a hub
 */
export async function requireHub(request: NextRequest): Promise<AuthUser> {
  const user = await requireAuth(request);

  if (!user.hub_id) {
    const error = new Error('User must be assigned to a hub');
    (error as any).statusCode = 400;
    (error as any).code = 'NO_HUB_ASSIGNED';
    throw error;
  }

  return user;
}

/**
 * Verify user has access to specific hub
 */
export function verifyHubAccess(user: AuthUser, hubId: string): boolean {
  // Admin can access all hubs
  if (user.role === 'ADMIN') {
    return true;
  }

  // Others can only access their assigned hub
  return user.hub_id === hubId;
}
