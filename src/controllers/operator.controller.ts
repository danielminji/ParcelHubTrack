/**
 * Operator Controller
 * 
 * Business logic for operator operations
 * Handles parcel check-in, check-out, and search
 * 
 * Updated with standardized API response format
 */

import * as parcelModel from '@/models/parcel.model';
import { PARCEL_STATUS, STORAGE_ZONES, PRICING } from '@/lib/constants';
import type { ApiSuccessResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';

/**
 * Find next available storage location for a hub
 * Returns null if no locations are available
 */
async function findAvailableStorageLocation(
  hubId: string,
  weight: number
): Promise<string | null> {
  // Determine zone based on weight
  let zone = 'C'; // Default to large
  if (weight <= STORAGE_ZONES.A.maxWeight) {
    zone = 'A';
  } else if (weight <= STORAGE_ZONES.B.maxWeight) {
    zone = 'B';
  }

  // Get all storage locations for this hub and zone that are active
  const allLocations = await prisma.storageLocation.findMany({
    where: {
      hub_id: hubId,
      zone: zone,
      is_occupied: false,
    },
    select: {
      code: true,
    },
    orderBy: {
      code: 'asc',
    },
  });

  if (allLocations.length === 0) {
    // No storage locations configured for this hub/zone
    return null;
  }

  // Get currently occupied locations (parcels that are in storage)
  const occupiedParcels = await prisma.parcel.findMany({
    where: {
      hub_id: hubId,
      status: {
        in: ['READY_FOR_PICKUP', 'ARRIVED_UNCLAIMED'],
      },
      storage_location: {
        not: null,
        startsWith: zone, // Only locations in this zone
      },
    },
    select: {
      storage_location: true,
    },
  });

  const occupiedLocations = new Set(
    occupiedParcels.map(p => p.storage_location).filter(Boolean)
  );

  // Find first available location
  for (const location of allLocations) {
    if (!occupiedLocations.has(location.code)) {
      return location.code;
    }
  }

  // All locations are occupied
  return null;
}

/**
 * Generate storage location based on weight
 * Now with database-backed auto-assignment
 */
async function generateStorageLocation(
  weight: number,
  hubId: string
): Promise<{
  zone: string;
  code: string;
}> {
  // Try to find available location from database
  const availableLocation = await findAvailableStorageLocation(hubId, weight);

  if (availableLocation) {
    // Extract zone from location code (e.g., "A-15" -> "A")
    const zone = availableLocation.split('-')[0];
    return { zone, code: availableLocation };
  }

  // Fallback: Generate location if no storage_locations configured
  let zone = 'C';
  if (weight <= STORAGE_ZONES.A.maxWeight) {
    zone = 'A';
  } else if (weight <= STORAGE_ZONES.B.maxWeight) {
    zone = 'B';
  }

  // Generate a location code (fallback for hubs without configured locations)
  const position = Math.floor(Math.random() * 100) + 1;
  const code = `${zone}-${String(position).padStart(2, '0')}`;

  return { zone, code };
}

/**
 * Calculate fee based on weight
 */
function calculateFee(weight: number): number {
  if (weight <= PRICING.BASE_WEIGHT) {
    return PRICING.BASE_FEE;
  }

  const additionalWeight = weight - PRICING.BASE_WEIGHT;
  const additionalFee = Math.ceil(additionalWeight) * PRICING.ADDITIONAL_PER_KG;

  return PRICING.BASE_FEE + additionalFee;
}

/**
 * Check-in a parcel (scan barcode)
 * Returns standardized API response with match status
 */
export async function checkInParcel(data: {
  trackingId: string;
  weightKg: number;
  isDamaged?: boolean;
  notes?: string;
  operatorId: string;
  hubId: string;
}): Promise<ApiSuccessResponse<{
  parcel: any;
  matched: boolean;
  storage_location: string;
  fee_amount: number;
}>> {
  // Validation
  if (!data.trackingId || data.trackingId.trim() === '') {
    const error = new Error('Tracking ID is required');
    (error as any).code = 'MISSING_TRACKING_ID';
    (error as any).statusCode = 400;
    throw error;
  }

  if (!data.weightKg || data.weightKg <= 0) {
    const error = new Error('Valid weight is required');
    (error as any).code = 'INVALID_WEIGHT';
    (error as any).statusCode = 400;
    throw error;
  }

  if (!data.hubId) {
    const error = new Error('Hub ID is required');
    (error as any).code = 'MISSING_HUB_ID';
    (error as any).statusCode = 400;
    throw error;
  }

  // 1. Check if parcel is pre-registered
  let parcel = await parcelModel.findParcelByTrackingId(data.trackingId);
  const isMatched = !!parcel;

  // 2. Generate storage location (now with auto-assignment)
  const storage = await generateStorageLocation(data.weightKg, data.hubId);

  // 3. Calculate fee
  const fee = calculateFee(data.weightKg);

  // 4. Update or create parcel
  if (parcel) {
    // Pre-registered parcel - UPDATE
    await parcelModel.updateParcel(parcel.id, {
      status: PARCEL_STATUS.READY_FOR_PICKUP,
      weight_kg: data.weightKg,
      storage_location: storage.code,
      storage_zone: storage.zone,
      fee_amount: fee,
      checked_in_at: new Date(),
      checkedInBy: {
        connect: { id: data.operatorId }
      },
    });

    // Re-fetch with relations
    parcel = await parcelModel.findParcelById(parcel.id);
    
    // TODO: Send notification to recipient
  } else {
    // Unmatched parcel - CREATE with minimal info
    // Recipient must claim it at counter
    const createdParcel = await parcelModel.createParcel({
      tracking_id: data.trackingId,
      recipient_name: 'Walk-in Guest', // Placeholder
      recipient_phone: '000000000', // Placeholder
      status: PARCEL_STATUS.ARRIVED_UNCLAIMED,
      weight_kg: data.weightKg,
      storage_location: storage.code,
      storage_zone: storage.zone,
      fee_amount: fee,
      checked_in_at: new Date(),
      checkedInBy: {
        connect: { id: data.operatorId }
      },
    });
    
    // Fetch with relations
    parcel = await parcelModel.findParcelById(createdParcel.id);
  }

  // TODO: Create tracking log entry

  return {
    success: true,
    data: {
      parcel,
      matched: isMatched,
      storage_location: storage.code,
      fee_amount: fee,
    },
    message: isMatched
      ? `✓ Parcel matched! Assigned to ${storage.code}. Recipient will be notified.`
      : `⚠ No pre-registration found. Parcel stored at ${storage.code}. Guest must claim at counter.`,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Check-out a parcel (pickup)
 * Returns standardized API response with payment details
 */
export async function checkOutParcel(data: {
  parcelId: string;
  paymentMethod: string;
  paymentAmount: number;
  recipientName?: string;
  recipientPhone?: string;
  operatorId: string;
  notes?: string;
}): Promise<ApiSuccessResponse<{
  parcel: any;
  payment: {
    method: string;
    amount: number;
    timestamp: string;
  };
}>> {
  // 1. Find parcel
  const parcel = await parcelModel.findParcelById(data.parcelId);

  if (!parcel) {
    const error = new Error('Parcel not found');
    (error as any).code = 'PARCEL_NOT_FOUND';
    (error as any).statusCode = 404;
    throw error;
  }

  // 2. Verify parcel is ready for pickup
  if (
    parcel.status !== PARCEL_STATUS.READY_FOR_PICKUP &&
    parcel.status !== PARCEL_STATUS.ARRIVED_UNCLAIMED
  ) {
    const error = new Error(
      `Parcel cannot be collected. Current status: ${parcel.status}`
    );
    (error as any).code = 'INVALID_STATUS';
    (error as any).statusCode = 400;
    (error as any).details = {
      currentStatus: parcel.status,
      allowedStatuses: [
        PARCEL_STATUS.READY_FOR_PICKUP,
        PARCEL_STATUS.ARRIVED_UNCLAIMED,
      ],
    };
    throw error;
  }

  // 3. Validate payment amount
  const feeAmount = parcel.fee_amount || 0;
  if (data.paymentAmount < feeAmount) {
    const error = new Error(
      `Insufficient payment. Required: RM${feeAmount}, Received: RM${data.paymentAmount}`
    );
    (error as any).code = 'INSUFFICIENT_PAYMENT';
    (error as any).statusCode = 400;
    (error as any).details = {
      required: feeAmount,
      received: data.paymentAmount,
      shortage: feeAmount - data.paymentAmount,
    };
    throw error;
  }

  const timestamp = new Date();

  // 4. Update parcel to COLLECTED
  const updatedParcel = await parcelModel.updateParcel(parcel.id, {
    status: PARCEL_STATUS.COLLECTED,
    checked_out_at: timestamp,
    checkedOutBy: {
      connect: { id: data.operatorId }
    },
    payment_status: 'PAID',
    ...(data.recipientName && { recipient_name: data.recipientName }),
    ...(data.recipientPhone && { recipient_phone: data.recipientPhone }),
  });

  // TODO: Create payment record in payments table
  // TODO: Create tracking log entry
  // TODO: Send confirmation notification

  const paymentInfo = {
    method: data.paymentMethod,
    amount: data.paymentAmount,
    timestamp: timestamp.toISOString(),
  };

  return {
    success: true,
    data: {
      parcel: updatedParcel,
      payment: paymentInfo,
    },
    message: `✓ Parcel checked out successfully. Change: RM${(data.paymentAmount - feeAmount).toFixed(2)}`,
    meta: {
      timestamp: timestamp.toISOString(),
    },
  };
}

/**
 * Search parcels by tracking ID, recipient name, or phone
 * Returns standardized API response with search results
 */
export async function searchParcels(
  query: string
): Promise<ApiSuccessResponse<any[]>> {
  if (!query || query.trim() === '') {
    const error = new Error('Search query is required');
    (error as any).code = 'MISSING_SEARCH_QUERY';
    (error as any).statusCode = 400;
    throw error;
  }

  const parcels = await parcelModel.searchParcels(query.trim());

  return {
    success: true,
    data: parcels,
    message: parcels.length > 0
      ? `Found ${parcels.length} parcel(s) matching "${query}"`
      : `No parcels found matching "${query}"`,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Get operator dashboard statistics
 * Returns standardized API response with comprehensive stats
 */
export async function getOperatorDashboard(): Promise<ApiSuccessResponse<{
  today: {
    checked_in: number;
    checked_out: number;
    pending_pickup: number;
  };
  storage: {
    total_capacity: number;
    occupied: number;
    available: number;
  };
  stats: any;
}>> {
  const stats = await parcelModel.getParcelStats();

  // TODO: Get today's check-in/out count from tracking_logs
  // TODO: Get storage capacity from system_settings

  const totalCapacity = 300; // 100 per zone (A, B, C)
  const occupied = stats.ready + stats.unclaimed;
  
  return {
    success: true,
    data: {
      today: {
        checked_in: 0, // TODO: Implement today's count
        checked_out: 0, // TODO: Implement today's count
        pending_pickup: stats.ready + stats.unclaimed,
      },
      storage: {
        total_capacity: totalCapacity,
        occupied: occupied,
        available: totalCapacity - occupied,
      },
      stats: {
        expected: stats.expected || 0,
        ready_for_pickup: stats.ready || 0,
        arrived_unclaimed: stats.unclaimed || 0,
        collected_total: stats.collected || 0,
        returned: 0, // Not in current stats
        cancelled: 0, // Not in current stats
      },
    },
    message: 'Dashboard data retrieved successfully',
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Get inventory overview
 * Returns inventory statistics and breakdown by location
 */
export async function getInventoryOverview(): Promise<ApiSuccessResponse> {
  const [stats, locationInventory] = await Promise.all([
    parcelModel.getInventoryStats(),
    parcelModel.getInventoryByLocation()
  ]);

  return {
    success: true,
    data: {
      summary: stats,
      locations: locationInventory
    },
    message: 'Inventory data retrieved successfully',
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}
