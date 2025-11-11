/**
 * API Type Definitions
 * 
 * Standard API request and response types
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationResult;
}

// Auth API Types
export interface RegisterRequest {
  email: string;
  phone?: string;
  password: string;
  full_name: string;
  student_id?: string;
  unit_number?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
  token: string;
  expiresIn: number;
}

// Recipient API Types
export interface PreRegisterRequest {
  tracking_id: string;
  expected_arrival_date?: string;
}

// Operator API Types
export interface CheckInRequest {
  tracking_id: string;
  weight_kg: number;
  is_damaged?: boolean;
  notes?: string;
}

export interface CheckOutRequest {
  parcel_id: string;
  payment_method: 'CASH' | 'QR_CODE' | 'CARD';
  payment_amount: number;
  recipient_name?: string;
  recipient_phone?: string;
  notes?: string;
}

// Search API Types
export interface SearchRequest {
  q: string;
  status?: string;
  page?: number;
  limit?: number;
}
