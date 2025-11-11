import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ============================================
  // 1. CREATE DEFAULT USERS
  // ============================================
  console.log('\n📝 Creating default users...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const operatorPassword = await bcrypt.hash('Operator@123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@parceltrack.com' },
    update: {},
    create: {
      full_name: 'System Administrator',
      email: 'admin@parceltrack.com',
      phone: '+60123456789',
      password_hash: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create operator user
  const operator = await prisma.user.upsert({
    where: { email: 'operator@parceltrack.com' },
    update: {},
    create: {
      full_name: 'Front Desk Operator',
      email: 'operator@parceltrack.com',
      phone: '+60123456780',
      password_hash: operatorPassword,
      role: 'OPERATOR',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Operator user created:', operator.email);

  // Create test recipient user
  const recipientPassword = await bcrypt.hash('Recipient@123', 10);
  const recipient = await prisma.user.upsert({
    where: { email: 'john.doe@student.com' },
    update: {},
    create: {
      full_name: 'John Doe',
      email: 'john.doe@student.com',
      phone: '+60129876543',
      password_hash: recipientPassword,
      role: 'RECIPIENT',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Test recipient created:', recipient.email);

  // ============================================
  // 2. CREATE STORAGE LOCATIONS
  // ============================================
  console.log('\n📦 Creating storage locations...');

  const zones = [
    { zone: 'A', description: 'Zone A - Light parcels (≤1kg)', count: 100 },
    { zone: 'B', description: 'Zone B - Medium parcels (1-5kg)', count: 100 },
    { zone: 'C', description: 'Zone C - Heavy parcels (>5kg)', count: 100 },
  ];

  let totalSlots = 0;
  for (const zoneInfo of zones) {
    const existingCount = await prisma.storageLocation.count({
      where: { zone: zoneInfo.zone },
    });

    if (existingCount === 0) {
      const locations = [];
      for (let i = 1; i <= zoneInfo.count; i++) {
        locations.push({
          zone: zoneInfo.zone,
          code: `${zoneInfo.zone}-${String(i).padStart(2, '0')}`,
          description: zoneInfo.description,
          capacity: 1,
          is_occupied: false,
        });
      }

      await prisma.storageLocation.createMany({
        data: locations,
        skipDuplicates: true,
      });
      
      totalSlots += zoneInfo.count;
      console.log(`✅ Created ${zoneInfo.count} slots for Zone ${zoneInfo.zone}`);
    } else {
      console.log(`⏭️  Zone ${zoneInfo.zone} already has ${existingCount} slots, skipping...`);
    }
  }

  // ============================================
  // 3. CREATE SYSTEM SETTINGS
  // ============================================
  console.log('\n⚙️  Creating system settings...');

  const settings = [
    {
      key: 'BASE_FEE',
      value: '1.50',
      description: 'Base storage fee in MYR for parcels up to 2kg',
    },
    {
      key: 'BASE_WEIGHT',
      value: '2.0',
      description: 'Base weight in kg before additional charges apply',
    },
    {
      key: 'ADDITIONAL_FEE_PER_KG',
      value: '0.50',
      description: 'Additional fee per kg above base weight in MYR',
    },
    {
      key: 'RETENTION_WARNING_DAYS',
      value: '30',
      description: 'Days before sending return warning notification',
    },
    {
      key: 'RETENTION_RETURN_DAYS',
      value: '45',
      description: 'Days before returning parcel to sender',
    },
    {
      key: 'SYSTEM_NAME',
      value: 'ParcelTrack',
      description: 'System display name',
    },
    {
      key: 'SYSTEM_EMAIL',
      value: 'noreply@parceltrack.com',
      description: 'System sender email address',
    },
    {
      key: 'WHATSAPP_NOTIFICATIONS_ENABLED',
      value: 'false',
      description: 'Enable WhatsApp notifications',
    },
    {
      key: 'EMAIL_NOTIFICATIONS_ENABLED',
      value: 'true',
      description: 'Enable email notifications',
    },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, description: setting.description },
      create: setting,
    });
  }
  console.log(`✅ Created ${settings.length} system settings`);

  // ============================================
  // 4. CREATE SAMPLE PARCELS (Optional)
  // ============================================
  console.log('\n📮 Creating sample parcels...');

  // Sample 1: Pre-registered parcel (EXPECTED)
  const sampleParcel1 = await prisma.parcel.upsert({
    where: { tracking_id: 'PT1A2B3C4D' },
    update: {},
    create: {
      tracking_id: 'PT1A2B3C4D',
      recipient_id: recipient.id,
      recipient_name: recipient.full_name,
      recipient_phone: recipient.phone,
      recipient_email: recipient.email,
      status: 'EXPECTED',
      payment_status: 'UNPAID',
    },
  });
  console.log('✅ Sample pre-registered parcel:', sampleParcel1.tracking_id);

  // Sample 2: Checked-in parcel (READY_FOR_PICKUP)
  const sampleParcel2 = await prisma.parcel.upsert({
    where: { tracking_id: 'PT5E6F7G8H' },
    update: {},
    create: {
      tracking_id: 'PT5E6F7G8H',
      recipient_id: recipient.id,
      recipient_name: recipient.full_name,
      recipient_phone: recipient.phone,
      recipient_email: recipient.email,
      status: 'READY_FOR_PICKUP',
      weight_kg: 1.5,
      storage_location: 'A-15',
      storage_zone: 'A',
      fee_amount: 1.50,
      payment_status: 'UNPAID',
      checked_in_at: new Date(),
      checked_in_by_id: operator.id,
    },
  });
  console.log('✅ Sample ready parcel:', sampleParcel2.tracking_id);

  // Create tracking log for sample parcel 2
  await prisma.trackingLog.create({
    data: {
      parcel_id: sampleParcel2.id,
      status: 'READY_FOR_PICKUP',
      description: 'Parcel checked in and ready for collection',
      created_by: operator.full_name,
    },
  });

  // ============================================
  // 5. SUMMARY
  // ============================================
  console.log('\n✅ Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log('─────────────────────────────────────');
  
  const userCount = await prisma.user.count();
  const parcelCount = await prisma.parcel.count();
  const storageCount = await prisma.storageLocation.count();
  const settingsCount = await prisma.systemSetting.count();
  
  console.log(`👥 Users: ${userCount}`);
  console.log(`📦 Parcels: ${parcelCount}`);
  console.log(`🏢 Storage Locations: ${storageCount}`);
  console.log(`⚙️  System Settings: ${settingsCount}`);
  console.log('─────────────────────────────────────');
  
  console.log('\n🔐 Login Credentials:');
  console.log('─────────────────────────────────────');
  console.log('Admin:');
  console.log('  Email: admin@parceltrack.com');
  console.log('  Password: Admin@123');
  console.log('\nOperator:');
  console.log('  Email: operator@parceltrack.com');
  console.log('  Password: Operator@123');
  console.log('\nTest Recipient:');
  console.log('  Email: john.doe@student.com');
  console.log('  Password: Recipient@123');
  console.log('─────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
