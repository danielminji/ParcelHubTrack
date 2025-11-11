import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // ============================================
  // 1. CREATE HUBS
  // ============================================
  console.log('📍 Creating hubs...');
  
  const hub1 = await prisma.hub.upsert({
    where: { code: 'CONDO1' },
    update: {},
    create: {
      name: 'Condominium Tower A',
      code: 'CONDO1',
      address: 'Jalan Ampang, Kuala Lumpur, Malaysia',
      contact_person: 'Ahmad Hassan',
      contact_phone: '+60123456789',
      contact_email: 'condo1@parceltrack.com',
      status: 'ACTIVE',
    },
  });

  const hub2 = await prisma.hub.upsert({
    where: { code: 'CONDO2' },
    update: {},
    create: {
      name: 'Condominium Tower B',
      code: 'CONDO2',
      address: 'Jalan Sultan Ismail, Kuala Lumpur, Malaysia',
      contact_person: 'Sarah Lee',
      contact_phone: '+60198765432',
      contact_email: 'condo2@parceltrack.com',
      status: 'ACTIVE',
    },
  });

  const hub3 = await prisma.hub.upsert({
    where: { code: 'OFFICE1' },
    update: {},
    create: {
      name: 'Corporate Office Plaza',
      code: 'OFFICE1',
      address: 'KLCC, Kuala Lumpur, Malaysia',
      contact_person: 'Michael Tan',
      contact_phone: '+60112223333',
      contact_email: 'office1@parceltrack.com',
      status: 'ACTIVE',
    },
  });

  console.log(`✓ Created hub: ${hub1.name} (${hub1.code})`);
  console.log(`✓ Created hub: ${hub2.name} (${hub2.code})`);
  console.log(`✓ Created hub: ${hub3.name} (${hub3.code})\n`);

  // ============================================
  // 2. CREATE USERS
  // ============================================
  console.log('👥 Creating users...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@parceltrack.com' },
    update: {},
    create: {
      full_name: 'System Administrator',
      email: 'admin@parceltrack.com',
      phone: '+60100000001',
      password_hash: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log(`✓ Admin: ${admin.full_name} (${admin.email})`);

  // Operators for each hub
  const operator1 = await prisma.user.upsert({
    where: { email: 'operator1@condo1.com' },
    update: {},
    create: {
      full_name: 'Ali Rahman',
      email: 'operator1@condo1.com',
      phone: '+60100000002',
      password_hash: hashedPassword,
      role: 'OPERATOR',
      status: 'ACTIVE',
      hub_id: hub1.id,
    },
  });
  console.log(`✓ Operator: ${operator1.full_name} @ ${hub1.name}`);

  const operator2 = await prisma.user.upsert({
    where: { email: 'operator2@condo1.com' },
    update: {},
    create: {
      full_name: 'Siti Aminah',
      email: 'operator2@condo1.com',
      phone: '+60100000003',
      password_hash: hashedPassword,
      role: 'OPERATOR',
      status: 'ACTIVE',
      hub_id: hub1.id,
    },
  });
  console.log(`✓ Operator: ${operator2.full_name} @ ${hub1.name}`);

  const operator3 = await prisma.user.upsert({
    where: { email: 'operator1@condo2.com' },
    update: {},
    create: {
      full_name: 'John Lim',
      email: 'operator1@condo2.com',
      phone: '+60100000004',
      password_hash: hashedPassword,
      role: 'OPERATOR',
      status: 'ACTIVE',
      hub_id: hub2.id,
    },
  });
  console.log(`✓ Operator: ${operator3.full_name} @ ${hub2.name}`);

  // Recipients for each hub
  const recipient1 = await prisma.user.upsert({
    where: { email: 'john.doe@email.com' },
    update: {},
    create: {
      full_name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+60121111111',
      password_hash: hashedPassword,
      role: 'RECIPIENT',
      status: 'ACTIVE',
      hub_id: hub1.id,
    },
  });
  console.log(`✓ Recipient: ${recipient1.full_name} @ ${hub1.name}`);

  const recipient2 = await prisma.user.upsert({
    where: { email: 'jane.smith@email.com' },
    update: {},
    create: {
      full_name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '+60122222222',
      password_hash: hashedPassword,
      role: 'RECIPIENT',
      status: 'ACTIVE',
      hub_id: hub1.id,
    },
  });
  console.log(`✓ Recipient: ${recipient2.full_name} @ ${hub1.name}`);

  const recipient3 = await prisma.user.upsert({
    where: { email: 'alex.tan@email.com' },
    update: {},
    create: {
      full_name: 'Alex Tan',
      email: 'alex.tan@email.com',
      phone: '+60123333333',
      password_hash: hashedPassword,
      role: 'RECIPIENT',
      status: 'ACTIVE',
      hub_id: hub2.id,
    },
  });
  console.log(`✓ Recipient: ${recipient3.full_name} @ ${hub2.name}\n`);

  // ============================================
  // 3. CREATE STORAGE LOCATIONS
  // ============================================
  console.log('📦 Creating storage locations...');
  
  // Hub 1 storage locations
  for (let zone of ['A', 'B', 'C']) {
    for (let num = 1; num <= 10; num++) {
      await prisma.storageLocation.upsert({
        where: { code: `${hub1.code}-${zone}${num.toString().padStart(2, '0')}` },
        update: {},
        create: {
          hub_id: hub1.id,
          zone: zone,
          code: `${hub1.code}-${zone}${num.toString().padStart(2, '0')}`,
          description: `Zone ${zone}, Slot ${num}`,
          capacity: 1,
          is_occupied: false,
        },
      });
    }
  }
  console.log(`✓ Created 30 storage locations for ${hub1.name}`);

  // Hub 2 storage locations
  for (let zone of ['A', 'B']) {
    for (let num = 1; num <= 15; num++) {
      await prisma.storageLocation.upsert({
        where: { code: `${hub2.code}-${zone}${num.toString().padStart(2, '0')}` },
        update: {},
        create: {
          hub_id: hub2.id,
          zone: zone,
          code: `${hub2.code}-${zone}${num.toString().padStart(2, '0')}`,
          description: `Zone ${zone}, Slot ${num}`,
          capacity: 1,
          is_occupied: false,
        },
      });
    }
  }
  console.log(`✓ Created 30 storage locations for ${hub2.name}\n`);

  // ============================================
  // 4. CREATE SAMPLE PARCELS
  // ============================================
  console.log('📮 Creating sample parcels...');

  // Expected parcels (pre-registered by recipients)
  await prisma.parcel.create({
    data: {
      tracking_id: 'DHL1234567890',
      recipient_id: recipient1.id,
      recipient_name: recipient1.full_name,
      recipient_phone: recipient1.phone,
      recipient_email: recipient1.email,
      hub_id: hub1.id,
      status: 'EXPECTED',
    },
  });
  console.log(`✓ EXPECTED: DHL1234567890 for ${recipient1.full_name}`);

  await prisma.parcel.create({
    data: {
      tracking_id: 'FEDEX9876543210',
      recipient_id: recipient2.id,
      recipient_name: recipient2.full_name,
      recipient_phone: recipient2.phone,
      recipient_email: recipient2.email,
      hub_id: hub1.id,
      status: 'EXPECTED',
    },
  });
  console.log(`✓ EXPECTED: FEDEX9876543210 for ${recipient2.full_name}`);

  // Ready for pickup parcels
  await prisma.parcel.create({
    data: {
      tracking_id: 'POSLAJU1111111',
      recipient_id: recipient1.id,
      recipient_name: recipient1.full_name,
      recipient_phone: recipient1.phone,
      recipient_email: recipient1.email,
      hub_id: hub1.id,
      status: 'READY_FOR_PICKUP',
      storage_location: 'CONDO1-A05',
      storage_zone: 'A',
      weight_kg: 2.5,
      checked_in_at: new Date(),
      checked_in_by_id: operator1.id,
    },
  });
  console.log(`✓ READY_FOR_PICKUP: POSLAJU1111111 for ${recipient1.full_name}`);

  await prisma.parcel.create({
    data: {
      tracking_id: 'ARAMEX2222222',
      recipient_id: recipient3.id,
      recipient_name: recipient3.full_name,
      recipient_phone: recipient3.phone,
      recipient_email: recipient3.email,
      hub_id: hub2.id,
      status: 'READY_FOR_PICKUP',
      storage_location: 'CONDO2-A12',
      storage_zone: 'A',
      weight_kg: 1.2,
      checked_in_at: new Date(),
      checked_in_by_id: operator3.id,
    },
  });
  console.log(`✓ READY_FOR_PICKUP: ARAMEX2222222 for ${recipient3.full_name}`);

  // Collected parcels
  await prisma.parcel.create({
    data: {
      tracking_id: 'NINJA3333333',
      recipient_id: recipient2.id,
      recipient_name: recipient2.full_name,
      recipient_phone: recipient2.phone,
      recipient_email: recipient2.email,
      hub_id: hub1.id,
      status: 'COLLECTED',
      storage_location: 'CONDO1-B10',
      storage_zone: 'B',
      weight_kg: 3.0,
      checked_in_at: new Date(Date.now() - 86400000), // Yesterday
      checked_in_by_id: operator1.id,
      checked_out_at: new Date(),
      checked_out_by_id: operator2.id,
    },
  });
  console.log(`✓ COLLECTED: NINJA3333333 for ${recipient2.full_name}\n`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('✅ Database seeding complete!\n');
  console.log('📊 Summary:');
  console.log(`   • ${await prisma.hub.count()} hubs`);
  console.log(`   • ${await prisma.user.count()} users`);
  console.log(`   • ${await prisma.storageLocation.count()} storage locations`);
  console.log(`   • ${await prisma.parcel.count()} parcels\n`);
  
  console.log('🔑 Test Credentials (password: password123):');
  console.log('   Admin:     admin@parceltrack.com');
  console.log('   Operator:  operator1@condo1.com (Hub: Condo Tower A)');
  console.log('   Operator:  operator1@condo2.com (Hub: Condo Tower B)');
  console.log('   Recipient: john.doe@email.com (Hub: Condo Tower A)');
  console.log('   Recipient: alex.tan@email.com (Hub: Condo Tower B)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
