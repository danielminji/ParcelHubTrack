/**
 * Application Constants
 * 
 * Centralized configuration values
 */

export const APP_NAME = 'ParcelTrack';
export const APP_VERSION = '1.0.0';

// User Roles
export const USER_ROLES = {
  RECIPIENT: 'RECIPIENT',
  OPERATOR: 'OPERATOR',
  ADMIN: 'ADMIN',
} as const;

// Parcel Status
export const PARCEL_STATUS = {
  EXPECTED: 'EXPECTED',
  ARRIVED_UNCLAIMED: 'ARRIVED_UNCLAIMED',
  READY_FOR_PICKUP: 'READY_FOR_PICKUP',
  COLLECTED: 'COLLECTED',
  RETURNED: 'RETURNED',
  CANCELLED: 'CANCELLED',
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  WAIVED: 'WAIVED',
  REFUNDED: 'REFUNDED',
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'CASH',
  QR_CODE: 'QR_CODE',
  CARD: 'CARD',
  ONLINE: 'ONLINE',
} as const;

// Storage Zones (based on weight)
export const STORAGE_ZONES = {
  A: { label: 'Small Items', maxWeight: 1.0 },
  B: { label: 'Medium Items', maxWeight: 5.0 },
  C: { label: 'Large Items', maxWeight: Infinity },
} as const;

// Pricing Configuration (base values, can be overridden in database)
export const PRICING = {
  BASE_FEE: 1.50,           // First 2kg
  BASE_WEIGHT: 2.0,          // kg
  ADDITIONAL_PER_KG: 0.50,   // Per kg after base weight
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  PARCEL_ARRIVED: 'PARCEL_ARRIVED',
  READY_FOR_PICKUP: 'READY_FOR_PICKUP',
  PAYMENT_REMINDER: 'PAYMENT_REMINDER',
  COLLECTION_REMINDER: 'COLLECTION_REMINDER',
  PARCEL_RETURNING: 'PARCEL_RETURNING',
  SYSTEM_ALERT: 'SYSTEM_ALERT',
} as const;

// Notification Channels
export const NOTIFICATION_CHANNELS = {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  WHATSAPP: 'WHATSAPP',
  PUSH: 'PUSH',
} as const;

// Parcel Retention Policy
export const RETENTION_POLICY = {
  WARNING_DAYS: 30,      // Send reminder after 30 days
  RETURN_DAYS: 45,       // Return to sender after 45 days
} as const;

// API Rate Limits (requests per window)
export const RATE_LIMITS = {
  AUTH: { requests: 5, window: 15 * 60 * 1000 },        // 5 requests per 15 minutes
  PUBLIC: { requests: 30, window: 60 * 1000 },           // 30 requests per minute
  RECIPIENT: { requests: 100, window: 60 * 60 * 1000 },  // 100 requests per hour
  OPERATOR: { requests: 500, window: 60 * 60 * 1000 },   // 500 requests per hour
  ADMIN: { requests: 1000, window: 60 * 60 * 1000 },     // 1000 requests per hour
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  TRACKING_ID_MIN_LENGTH: 5,
  TRACKING_ID_MAX_LENGTH: 100,
} as const;
