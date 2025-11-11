/**
 * User Type Definitions
 */

export type UserRole = 'RECIPIENT' | 'OPERATOR' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export interface User {
  id: string;
  email: string;
  phone: string | null;
  password_hash: string;
  full_name: string;
  student_id: string | null;
  unit_number: string | null;
  role: UserRole;
  status: UserStatus;
  email_verified: boolean;
  phone_verified: boolean;
  notification_whatsapp: boolean;
  notification_email: boolean;
  notification_sms: boolean;
  language: string;
  created_at: Date;
  updated_at: Date;
  last_login_at: Date | null;
  created_by: string | null;
}

export interface CreateUserInput {
  email: string;
  phone?: string;
  password: string;
  full_name: string;
  student_id?: string;
  unit_number?: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  email?: string;
  phone?: string;
  full_name?: string;
  student_id?: string;
  unit_number?: string;
  notification_whatsapp?: boolean;
  notification_email?: boolean;
  notification_sms?: boolean;
  language?: string;
}

export interface UserSession {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}
