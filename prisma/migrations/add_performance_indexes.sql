-- Add Performance Indexes for Large Data Handling
-- Run this after the initial migration

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS "parcels_status_created_at_idx" ON "parcels"("status", "created_at");
CREATE INDEX IF NOT EXISTS "parcels_recipient_id_status_idx" ON "parcels"("recipient_id", "status");
CREATE INDEX IF NOT EXISTS "parcels_storage_location_status_idx" ON "parcels"("storage_location", "status");
CREATE INDEX IF NOT EXISTS "parcels_tracking_id_status_idx" ON "parcels"("tracking_id", "status");

-- Time-based indexes for analytics
CREATE INDEX IF NOT EXISTS "parcels_checked_in_at_idx" ON "parcels"("checked_in_at");
CREATE INDEX IF NOT EXISTS "parcels_checked_out_at_idx" ON "parcels"("checked_out_at");

-- Tracking log performance
CREATE INDEX IF NOT EXISTS "tracking_logs_parcel_id_created_at_idx" ON "tracking_logs"("parcel_id", "created_at");
CREATE INDEX IF NOT EXISTS "tracking_logs_status_created_at_idx" ON "tracking_logs"("status", "created_at");

-- User queries
CREATE INDEX IF NOT EXISTS "users_role_status_idx" ON "users"("role", "status");
CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users"("created_at");

-- Analyze tables to update statistics
ANALYZE parcels;
ANALYZE tracking_logs;
ANALYZE users;

-- Output success message
SELECT 'Performance indexes created successfully!' as status;
