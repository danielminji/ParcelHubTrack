/**
 * JWT Authentication Helper
 * Extracts and validates user data from JWT tokens in API routes
 */

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export interface JWTUser {
  id: string;
  email: string | null;
  phone: string;
  full_name: string;
  role: 'RECIPIENT' | 'OPERATOR' | 'ADMIN';
  hub_id: string | null;
}

/**
 * Extract and verify JWT token from request
 * Returns user data if valid, null if invalid/missing
 */
export async function getUserFromToken(request: NextRequest | Request): Promise<JWTUser | null> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTUser;

    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

/**
 * Require authentication - returns user or throws error
 */
export async function requireAuth(
  request: NextRequest | Request,
  allowedRoles?: Array<'RECIPIENT' | 'OPERATOR' | 'ADMIN'>
): Promise<JWTUser> {
  const user = await getUserFromToken(request as NextRequest);

  if (!user) {
    throw new Error('UNAUTHORIZED');
  }

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error('FORBIDDEN');
  }

  return user;
}

/**
 * Check if user has specific role
 */
export function hasRole(user: JWTUser, role: 'RECIPIENT' | 'OPERATOR' | 'ADMIN'): boolean {
  return user.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: JWTUser, roles: Array<'RECIPIENT' | 'OPERATOR' | 'ADMIN'>): boolean {
  return roles.includes(user.role);
}
