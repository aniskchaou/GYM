#!/usr/bin/env node
/**
 * GymFlow Server — seed.js
 * Populates the database with demo users and sample data.
 *
 * Usage (run from inside server/):
 *   node seed.js
 *
 * Or trigger via start.js:
 *   node start.js --seed
 */
'use strict';

var fs      = require('fs');
var path    = require('path');
var execSync = require('child_process').execSync;

// ── Load .env ────────────────────────────────────────────────────────────
var envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  require(path.join(__dirname, 'node_modules', 'dotenv')).config({ path: envFile });
}
if (!process.env.DATABASE_URL) {
  var dataDir = path.join(__dirname, 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  var dbFile  = path.join(dataDir, 'gymflow.db').replace(/\\/g, '/');
  process.env.DATABASE_URL = 'file:' + dbFile;
}
if ((process.env.DATABASE_URL || '').startsWith('file:')) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// ── SQLite enum shim — must run BEFORE any require('@prisma/client') ─────
var PRISMA_ENUMS = {
  UserRole:           ['SUPER_ADMIN','GYM_OWNER','BRANCH_MANAGER','RECEPTIONIST','TRAINER','MEMBER'],
  Gender:             ['MALE','FEMALE','OTHER','PREFER_NOT_TO_SAY'],
  MembershipStatus:   ['ACTIVE','INACTIVE','FROZEN','CANCELLED','EXPIRED','PENDING'],
  MembershipType:     ['MONTHLY','ANNUAL','PAY_PER_VISIT','FAMILY','STUDENT','CORPORATE','DAY_PASS'],
  PaymentStatus:      ['PENDING','PAID','FAILED','REFUNDED','PARTIALLY_REFUNDED'],
  PaymentMethod:      ['STRIPE','PAYPAL','APPLE_PAY','GOOGLE_PAY','BANK_TRANSFER','CASH'],
  AttendanceMethod:   ['QR_CODE','RFID','FACE_RECOGNITION','MOBILE_APP','RECEPTION','MANUAL'],
  ClassStatus:        ['SCHEDULED','ONGOING','COMPLETED','CANCELLED'],
  BookingStatus:      ['CONFIRMED','WAITLISTED','CANCELLED','NO_SHOW','ATTENDED'],
  NotificationChannel:['EMAIL','SMS','PUSH','IN_APP','WHATSAPP'],
  NotificationStatus: ['PENDING','SENT','FAILED','READ'],
  StaffShiftStatus:   ['SCHEDULED','CHECKED_IN','CHECKED_OUT','ABSENT'],
  GymPlanTier:        ['STARTER','PROFESSIONAL','ENTERPRISE'],
  GymStatus:          ['ACTIVE','SUSPENDED','TRIAL','CANCELLED'],
  TicketStatus:       ['OPEN','IN_PROGRESS','RESOLVED','CLOSED'],
  TransactionType:    ['SUBSCRIPTION','CLASS_BOOKING','PT_SESSION','PRODUCT_SALE','REFUND','PENALTY'],
};

if ((process.env.DATABASE_URL || 'file:').startsWith('file:')) {
  var MARKER    = '// === SQLite Enum Shims';
  var jsLines   = ['\n' + MARKER + ' ==='];
  Object.keys(PRISMA_ENUMS).forEach(function (name) {
    var pairs = PRISMA_ENUMS[name].map(function (v) { return "  '" + v + "': '" + v + "'"; }).join(',\n');
    jsLines.push('module.exports.' + name + ' = {\n' + pairs + '\n};');
  });
  var jsShim = jsLines.join('\n') + '\n';
  [
    path.join(__dirname, 'node_modules', '@prisma',  'client',  'index.js'),
    path.join(__dirname, 'node_modules', '.prisma',  'client',  'default.js'),
  ].forEach(function (f) {
    if (!fs.existsSync(f)) return;
    var src = fs.readFileSync(f, 'utf8');
    if (src.indexOf(MARKER) !== -1) return;
    fs.appendFileSync(f, jsShim, 'utf8');
  });
}

// ── Load Prisma & bcrypt (AFTER shims) ───────────────────────────────────
var PrismaClient = require(path.join(__dirname, 'node_modules', '@prisma', 'client')).PrismaClient;
var bcrypt       = require(path.join(__dirname, 'node_modules', 'bcrypt'));

var prisma = new PrismaClient();
var aiDietPlanDelegate = prisma.ai_diet_plans || prisma.aiDietPlan;

// ── Helpers ───────────────────────────────────────────────────────────────
function hash(pw) { return bcrypt.hash(pw, 10); }

var EXTRA_GYMS = [
  {
    name: 'Iron Forge Fitness',
    slug: 'iron-forge-fitness',
    city: 'Chicago',
    country: 'US',
    email: 'contact@ironforgefit.com',
    ownerEmail: 'owner.ironforge@example.com',
    ownerFirstName: 'Alex',
    ownerLastName: 'Stone',
    planTier: 'PROFESSIONAL',
    maxMembers: 1000,
    maxBranches: 5,
  },
  {
    name: 'Pulse Studio Downtown',
    slug: 'pulse-studio-downtown',
    city: 'Miami',
    country: 'US',
    email: 'hello@pulsestudio.com',
    ownerEmail: 'owner.pulse@example.com',
    ownerFirstName: 'Maya',
    ownerLastName: 'Reed',
    planTier: 'STARTER',
    maxMembers: 100,
    maxBranches: 1,
  },
  {
    name: 'Summit Strength Club',
    slug: 'summit-strength-club',
    city: 'Denver',
    country: 'US',
    email: 'admin@summitstrength.com',
    ownerEmail: 'owner.summit@example.com',
    ownerFirstName: 'Jordan',
    ownerLastName: 'Blake',
    planTier: 'ENTERPRISE',
    maxMembers: 5000,
    maxBranches: 20,
  },
];

// ── Main seed ─────────────────────────────────────────────────────────────
async function seed() {
  console.log('\n\uD83C\uDF31  Seeding GymFlow database...\n');

  // 1. Demo gym
  var gym = await prisma.gym.upsert({
    where:  { slug: 'demo-gym' },
    update: {},
    create: {
      name:          'Demo Fitness Center',
      slug:          'demo-gym',
      email:         'owner@demogym.com',
      phone:         '+32 123 456 789',
      primaryColor:  '#6366f1',
      city:          'Brussels',
      country:       'BE',
      timezone:      'Europe/Brussels',
      currency:      'EUR',
      status:        'ACTIVE',
      planTier:      'PROFESSIONAL',
      maxMembers:    500,
      maxBranches:   3,
    },
  });
  console.log('  \u2713  Gym: ' + gym.name);

  // 2. Branch
  var branch = await prisma.branch.upsert({
    where:  { id: 'branch-main' },
    update: {},
    create: {
      id:       'branch-main',
      gymId:    gym.id,
      name:     'Main Branch',
      address:  '12 Fitness Street',
      city:     'Brussels',
      phone:    '+32 123 456 789',
      capacity: 120,
    },
  });
  console.log('  \u2713  Branch: ' + branch.name);

  // 2b. Additional discover gyms
  for (var g of EXTRA_GYMS) {
    var seededGym = await prisma.gym.upsert({
      where: { slug: g.slug },
      update: {},
      create: {
        name: g.name,
        slug: g.slug,
        email: g.email,
        city: g.city,
        country: g.country,
        timezone: 'America/Chicago',
        currency: 'USD',
        status: 'ACTIVE',
        planTier: g.planTier,
        maxMembers: g.maxMembers,
        maxBranches: g.maxBranches,
      },
    });

    var mainBranchId = 'branch-' + g.slug;
    await prisma.branch.upsert({
      where: { id: mainBranchId },
      update: {},
      create: {
        id: mainBranchId,
        gymId: seededGym.id,
        name: 'Main Branch',
        city: g.city,
        capacity: 120,
      },
    });

    await prisma.user.upsert({
      where: { email: g.ownerEmail },
      update: {},
      create: {
        gymId: seededGym.id,
        branchId: mainBranchId,
        role: 'GYM_OWNER',
        email: g.ownerEmail,
        passwordHash: await hash('Owner@1234'),
        firstName: g.ownerFirstName,
        lastName: g.ownerLastName,
        isEmailVerified: true,
      },
    });
  }

  // 3. Users
  var superAdmin = await prisma.user.upsert({
    where:  { email: 'superadmin@gymflow.com' },
    update: {},
    create: {
      role:            'SUPER_ADMIN',
      email:           'superadmin@gymflow.com',
      passwordHash:    await hash('Admin@1234'),
      firstName:       'Super',
      lastName:        'Admin',
      isEmailVerified: true,
    },
  });
  console.log('  \u2713  User: ' + superAdmin.email + ' (SUPER_ADMIN)');

  var owner = await prisma.user.upsert({
    where:  { email: 'owner@demogym.com' },
    update: {},
    create: {
      gymId:           gym.id,
      branchId:        branch.id,
      role:            'GYM_OWNER',
      email:           'owner@demogym.com',
      passwordHash:    await hash('Owner@1234'),
      firstName:       'John',
      lastName:        'Owner',
      isEmailVerified: true,
    },
  });
  console.log('  \u2713  User: ' + owner.email + ' (GYM_OWNER)');

  var manager = await prisma.user.upsert({
    where:  { email: 'manager@demogym.com' },
    update: {},
    create: {
      gymId:           gym.id,
      branchId:        branch.id,
      role:            'BRANCH_MANAGER',
      email:           'manager@demogym.com',
      passwordHash:    await hash('Manager@1234'),
      firstName:       'David',
      lastName:        'Manager',
      isEmailVerified: true,
    },
  });
  console.log('  \u2713  User: ' + manager.email + ' (BRANCH_MANAGER)');

  var receptionist = await prisma.user.upsert({
    where:  { email: 'reception@demogym.com' },
    update: {},
    create: {
      gymId:           gym.id,
      branchId:        branch.id,
      role:            'RECEPTIONIST',
      email:           'reception@demogym.com',
      passwordHash:    await hash('Reception@1234'),
      firstName:       'Sara',
      lastName:        'Front',
      isEmailVerified: true,
    },
  });
  console.log('  \u2713  User: ' + receptionist.email + ' (RECEPTIONIST)');

  var trainer = await prisma.user.upsert({
    where:  { email: 'trainer@demogym.com' },
    update: {},
    create: {
      gymId:           gym.id,
      branchId:        branch.id,
      role:            'TRAINER',
      email:           'trainer@demogym.com',
      passwordHash:    await hash('Trainer@1234'),
      firstName:       'Mike',
      lastName:        'Fit',
      isEmailVerified: true,
    },
  });
  console.log('  \u2713  User: ' + trainer.email + ' (TRAINER)');

  await prisma.trainerProfile.upsert({
    where:  { userId: trainer.id },
    update: {},
    create: {
      userId:           trainer.id,
      specialties:      JSON.stringify(['CrossFit', 'HIIT', 'Strength Training']),
      certifications:   JSON.stringify(['ACE CPT', 'CrossFit Level 2']),
      bio:              'Certified personal trainer with 7 years of experience.',
      experience:       7,
      rating:           4.8,
      commissionPercent:30,
      sessionRate:      60,
    },
  });

  var member = await prisma.user.upsert({
    where:  { email: 'member@demogym.com' },
    update: {},
    create: {
      gymId:           gym.id,
      branchId:        branch.id,
      role:            'MEMBER',
      email:           'member@demogym.com',
      passwordHash:    await hash('Member@1234'),
      firstName:       'Alice',
      lastName:        'Smith',
      gender:          'FEMALE',
      dateOfBirth:     new Date('1995-06-15'),
      isEmailVerified: true,
    },
  });
  console.log('  \u2713  User: ' + member.email + ' (MEMBER)');

  await prisma.memberProfile.upsert({
    where:  { userId: member.id },
    update: {},
    create: {
      userId:       member.id,
      memberNumber: 'MBR-0001',
      qrCode:       'QR-' + member.id,
      fitnessGoals: JSON.stringify(['Lose weight', 'Build muscle']),
    },
  });

  // Extra member 2
  var member2 = await prisma.user.upsert({
    where:  { email: 'bob@demogym.com' },
    update: {},
    create: {
      gymId:           gym.id,
      branchId:        branch.id,
      role:            'MEMBER',
      email:           'bob@demogym.com',
      passwordHash:    await hash('Member@1234'),
      firstName:       'Bob',
      lastName:        'Jones',
      gender:          'MALE',
      dateOfBirth:     new Date('1990-03-22'),
      isEmailVerified: true,
    },
  });
  await prisma.memberProfile.upsert({
    where:  { userId: member2.id },
    update: {},
    create: {
      userId:       member2.id,
      memberNumber: 'MBR-0002',
      qrCode:       'QR-' + member2.id,
      fitnessGoals: JSON.stringify(['Build muscle']),
    },
  });
  console.log('  \u2713  User: ' + member2.email + ' (MEMBER)');

  var extraMembers = [
    {
      id: 'user-member-alex',
      email: 'alex@demogym.com',
      firstName: 'Alex',
      lastName: 'Carter',
      gender: 'MALE',
      dateOfBirth: new Date('1992-04-11'),
      memberNumber: 'MBR-0003',
      fitnessGoals: ['Build endurance', 'Lose weight'],
      membershipId: 'mem-alex-001',
      membershipPlanId: 'plan-monthly-basic',
      membershipStatus: 'ACTIVE',
      membershipPrice: 29.99,
    },
    {
      id: 'user-member-nina',
      email: 'nina@demogym.com',
      firstName: 'Nina',
      lastName: 'Lopez',
      gender: 'FEMALE',
      dateOfBirth: new Date('1998-09-03'),
      memberNumber: 'MBR-0004',
      fitnessGoals: ['Improve mobility', 'General fitness'],
      membershipId: 'mem-nina-001',
      membershipPlanId: 'plan-monthly-premium',
      membershipStatus: 'ACTIVE',
      membershipPrice: 49.99,
    },
    {
      id: 'user-member-omar',
      email: 'omar@demogym.com',
      firstName: 'Omar',
      lastName: 'Haddad',
      gender: 'MALE',
      dateOfBirth: new Date('1988-12-20'),
      memberNumber: 'MBR-0005',
      fitnessGoals: ['Strength', 'Athletic performance'],
      membershipId: 'mem-omar-001',
      membershipPlanId: 'plan-annual-basic',
      membershipStatus: 'ACTIVE',
      membershipPrice: 299.99,
    },
    {
      id: 'user-member-sophie',
      email: 'sophie@demogym.com',
      firstName: 'Sophie',
      lastName: 'Martin',
      gender: 'FEMALE',
      dateOfBirth: new Date('1996-01-27'),
      memberNumber: 'MBR-0006',
      fitnessGoals: ['Weight maintenance', 'Yoga'],
      membershipId: 'mem-sophie-001',
      membershipPlanId: 'plan-student-plan',
      membershipStatus: 'ACTIVE',
      membershipPrice: 19.99,
    },
  ];

  for (var extraMember of extraMembers) {
    await prisma.user.upsert({
      where: { email: extraMember.email },
      update: {},
      create: {
        id: extraMember.id,
        gymId: gym.id,
        branchId: branch.id,
        role: 'MEMBER',
        email: extraMember.email,
        passwordHash: await hash('Member@1234'),
        firstName: extraMember.firstName,
        lastName: extraMember.lastName,
        gender: extraMember.gender,
        dateOfBirth: extraMember.dateOfBirth,
        isEmailVerified: true,
      },
    });

    await prisma.memberProfile.upsert({
      where: { userId: extraMember.id },
      update: {},
      create: {
        userId: extraMember.id,
        memberNumber: extraMember.memberNumber,
        qrCode: 'QR-' + extraMember.id,
        fitnessGoals: JSON.stringify(extraMember.fitnessGoals),
      },
    });
  }
  console.log('  \u2713  Extra members: ' + extraMembers.length);

  // 4. Membership plans
  var plans = [
    { id: 'plan-monthly-basic',   name: 'Monthly Basic',   type: 'MONTHLY', price: 29.99,  durationDays: 30,  features: JSON.stringify(['Unlimited gym access', 'Locker room access']) },
    { id: 'plan-monthly-premium', name: 'Monthly Premium', type: 'MONTHLY', price: 49.99,  durationDays: 30,  features: JSON.stringify(['Unlimited gym access', '2 classes/week', 'Nutrition consultation']) },
    { id: 'plan-annual-basic',    name: 'Annual Basic',    type: 'ANNUAL',  price: 299.99, durationDays: 365, features: JSON.stringify(['Unlimited gym access', '2 months free']) },
    { id: 'plan-annual-premium',  name: 'Annual Premium',  type: 'ANNUAL',  price: 499.99, durationDays: 365, features: JSON.stringify(['Unlimited gym access', 'Unlimited classes', 'PT session/month']) },
    { id: 'plan-student-plan',    name: 'Student Plan',    type: 'STUDENT', price: 19.99,  durationDays: 30,  features: JSON.stringify(['Weekday access', 'Basic facilities']) },
    { id: 'plan-day-pass',        name: 'Day Pass',        type: 'DAY_PASS',price: 9.99,   durationDays: 1,   features: JSON.stringify(['Full-day access']) },
  ];
  for (var p of plans) {
    await prisma.membershipPlan.upsert({
      where:  { id: p.id },
      update: {},
      create: { gymId: gym.id, ...p },
    });
  }
  console.log('  \u2713  Membership plans: ' + plans.length);

  // 5. Active membership for member
  var activePlan = plans.find(function(x){ return x.id === 'plan-monthly-premium'; });
  var now = new Date();
  var end = new Date(now); end.setDate(end.getDate() + 30);
  await prisma.membership.upsert({
    where:  { id: 'mem-alice-001' },
    update: {},
    create: {
      id:         'mem-alice-001',
      memberId:   member.id,
      planId:     activePlan.id,
      status:     'ACTIVE',
      startDate:  now,
      endDate:    end,
      finalPrice: 49.99,
    },
  });
  console.log('  \u2713  Active membership for Alice');

  for (var seededMember of extraMembers) {
    var seededEnd = new Date(now);
    seededEnd.setDate(seededEnd.getDate() + (seededMember.membershipPlanId === 'plan-annual-basic' ? 365 : 30));

    await prisma.membership.upsert({
      where: { id: seededMember.membershipId },
      update: {},
      create: {
        id: seededMember.membershipId,
        memberId: seededMember.id,
        planId: seededMember.membershipPlanId,
        status: seededMember.membershipStatus,
        startDate: now,
        endDate: seededEnd,
        finalPrice: seededMember.membershipPrice,
      },
    });
  }
  console.log('  \u2713  Active memberships for extra members');

  // 5b. Additional pending members (for approvals)
  var pendingMembers = [
    {
      id: 'user-member-charlie',
      email: 'charlie@demogym.com',
      firstName: 'Charlie',
      lastName: 'Stone',
      memberNumber: 'MBR-0101',
    },
    {
      id: 'user-member-emma',
      email: 'emma@demogym.com',
      firstName: 'Emma',
      lastName: 'Cole',
      memberNumber: 'MBR-0102',
    },
  ];

  for (var pm of pendingMembers) {
    await prisma.user.upsert({
      where: { email: pm.email },
      update: {},
      create: {
        id: pm.id,
        gymId: gym.id,
        branchId: branch.id,
        role: 'MEMBER',
        email: pm.email,
        passwordHash: await hash('Member@1234'),
        firstName: pm.firstName,
        lastName: pm.lastName,
        isEmailVerified: true,
      },
    });

    await prisma.memberProfile.upsert({
      where: { userId: pm.id },
      update: {},
      create: {
        userId: pm.id,
        memberNumber: pm.memberNumber,
        qrCode: 'QR-' + pm.memberNumber,
        fitnessGoals: JSON.stringify(['General fitness']),
      },
    });
  }

  var pendingEnd = new Date(now); pendingEnd.setDate(pendingEnd.getDate() + 30);

  await prisma.membership.upsert({
    where: { id: 'mem-charlie-active' },
    update: {},
    create: {
      id: 'mem-charlie-active',
      memberId: 'user-member-charlie',
      planId: 'plan-monthly-basic',
      status: 'ACTIVE',
      startDate: now,
      endDate: pendingEnd,
      finalPrice: 29.99,
    },
  });

  // Emma has a pending membership request (still shows in approvals list)
  await prisma.membership.upsert({
    where: { id: 'mem-emma-pending' },
    update: {},
    create: {
      id: 'mem-emma-pending',
      memberId: 'user-member-emma',
      planId: 'plan-monthly-basic',
      status: 'PENDING',
      startDate: now,
      endDate: pendingEnd,
      finalPrice: 29.99,
    },
  });

  // 5c. Attendance demo rows (for occupancy + today's report)
  var nowTs = Date.now();
  var inA = new Date(nowTs - 3 * 60 * 60 * 1000);
  var outA = new Date(nowTs - 2 * 60 * 60 * 1000);
  var inB = new Date(nowTs - 90 * 60 * 1000);
  var inC = new Date(nowTs - 50 * 60 * 1000);
  var outC = new Date(nowTs - 20 * 60 * 1000);

  await prisma.attendance.upsert({
    where: { id: 'att-alice-001' },
    update: {},
    create: {
      id: 'att-alice-001',
      userId: member.id,
      branchId: branch.id,
      method: 'QR_CODE',
      checkedInAt: inA,
      checkedOutAt: outA,
      durationMin: 60,
    },
  });
  await prisma.attendance.upsert({
    where: { id: 'att-bob-open-001' },
    update: {},
    create: {
      id: 'att-bob-open-001',
      userId: member2.id,
      branchId: branch.id,
      method: 'MANUAL',
      checkedInAt: inB,
    },
  });
  await prisma.attendance.upsert({
    where: { id: 'att-charlie-001' },
    update: {},
    create: {
      id: 'att-charlie-001',
      userId: 'user-member-charlie',
      branchId: branch.id,
      method: 'QR_CODE',
      checkedInAt: inC,
      checkedOutAt: outC,
      durationMin: 30,
    },
  });
  console.log('  \u2713  Attendance logs seeded');

  // 5d. Access logs (for access page recent events)
  await prisma.access_logs.upsert({
    where: { id: 'access-log-001' },
    update: {},
    create: {
      id: 'access-log-001',
      userId: member.id,
      branchId: branch.id,
      gymId: gym.id,
      qrCode: 'QR-' + member.id,
      result: 'ALLOWED',
      direction: 'IN',
      createdAt: inA,
    },
  });
  await prisma.access_logs.upsert({
    where: { id: 'access-log-002' },
    update: {},
    create: {
      id: 'access-log-002',
      userId: member2.id,
      branchId: branch.id,
      gymId: gym.id,
      qrCode: 'QR-' + member2.id,
      result: 'ALLOWED',
      direction: 'IN',
      createdAt: inB,
    },
  });
  await prisma.access_logs.upsert({
    where: { id: 'access-log-003' },
    update: {},
    create: {
      id: 'access-log-003',
      userId: 'user-member-charlie',
      branchId: branch.id,
      gymId: gym.id,
      qrCode: 'QR-MBR-0101',
      result: 'DENIED',
      reason: 'no_active_membership',
      direction: 'IN',
      createdAt: new Date(nowTs - 10 * 60 * 1000),
    },
  });
  console.log('  \u2713  Access logs seeded');

  // 5e. Payments demo rows (for payments page)
  await prisma.payment.upsert({
    where: { id: 'pay-001' },
    update: {},
    create: {
      id: 'pay-001',
      userId: member.id,
      membershipId: 'mem-alice-001',
      amount: 49.99,
      currency: 'USD',
      status: 'PAID',
      method: 'CASH',
      type: 'SUBSCRIPTION',
      notes: 'Front desk monthly renewal',
      createdAt: new Date(nowTs - 4 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.payment.upsert({
    where: { id: 'pay-002' },
    update: {},
    create: {
      id: 'pay-002',
      userId: member2.id,
      amount: 29.99,
      currency: 'USD',
      status: 'PENDING',
      method: 'BANK_TRANSFER',
      type: 'SUBSCRIPTION',
      notes: 'Awaiting transfer confirmation',
      createdAt: new Date(nowTs - 2 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.payment.upsert({
    where: { id: 'pay-003' },
    update: {},
    create: {
      id: 'pay-003',
      userId: member.id,
      amount: 19.99,
      currency: 'USD',
      status: 'REFUNDED',
      method: 'STRIPE',
      type: 'PRODUCT_SALE',
      refundedAmount: 19.99,
      refundedAt: new Date(nowTs - 24 * 60 * 60 * 1000),
      notes: 'Duplicate charge refunded',
      createdAt: new Date(nowTs - 3 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.payment.upsert({
    where: { id: 'pay-004' },
    update: {},
    create: {
      id: 'pay-004',
      userId: 'user-member-charlie',
      amount: 39.99,
      currency: 'USD',
      status: 'FAILED',
      method: 'PAYPAL',
      type: 'SUBSCRIPTION',
      notes: 'Card authorization declined',
      createdAt: new Date(nowTs - 8 * 60 * 60 * 1000),
    },
  });
  console.log('  \u2713  Payments seeded');

  // 5f. Equipment + maintenance status + bookings
  var equipments = [
    { id: 'eq-rower-01', name: 'Concept2 Rower', category: 'Cardio', code: 'EQ-ROW-01', status: 'AVAILABLE', slotMinutes: 30 },
    { id: 'eq-bike-01', name: 'Assault Bike', category: 'Cardio', code: 'EQ-BIK-01', status: 'MAINTENANCE', slotMinutes: 30 },
    { id: 'eq-bench-01', name: 'Adjustable Bench', category: 'Strength', code: 'EQ-BEN-01', status: 'AVAILABLE', slotMinutes: 45 },
    { id: 'eq-cable-01', name: 'Cable Station', category: 'Strength', code: 'EQ-CAB-01', status: 'AVAILABLE', slotMinutes: 30 },
  ];
  for (var eq of equipments) {
    await prisma.equipments.upsert({
      where: { id: eq.id },
      update: {},
      create: {
        id: eq.id,
        gymId: gym.id,
        branchId: branch.id,
        name: eq.name,
        category: eq.category,
        code: eq.code,
        status: eq.status,
        slotMinutes: eq.slotMinutes,
        updatedAt: new Date(),
      },
    });
  }

  await prisma.equipment_bookings.upsert({
    where: { id: 'eq-book-001' },
    update: {},
    create: {
      id: 'eq-book-001',
      equipmentId: 'eq-rower-01',
      userId: member.id,
      startTime: new Date(nowTs + 60 * 60 * 1000),
      endTime: new Date(nowTs + 90 * 60 * 1000),
      status: 'CONFIRMED',
    },
  });
  await prisma.equipment_bookings.upsert({
    where: { id: 'eq-book-002' },
    update: {},
    create: {
      id: 'eq-book-002',
      equipmentId: 'eq-rower-01',
      userId: member2.id,
      startTime: new Date(nowTs + 70 * 60 * 1000),
      endTime: new Date(nowTs + 100 * 60 * 1000),
      status: 'WAITLISTED',
    },
  });
  console.log('  \u2713  Equipment & bookings seeded');

  // 5g. Inventory products, suppliers, and stock movements
  var products = [
    { id: 'prd-protein', name: 'Whey Protein 1kg', category: 'Supplements', price: 34.99, stock: 3, sku: 'SKU-PRO-001' },
    { id: 'prd-shaker',  name: 'Gym Shaker Bottle', category: 'Accessories', price: 9.99, stock: 18, sku: 'SKU-SHK-001' },
    { id: 'prd-towel',   name: 'Microfiber Gym Towel', category: 'Accessories', price: 7.5, stock: 6, sku: 'SKU-TWL-001' },
  ];
  for (var prd of products) {
    await prisma.product.upsert({
      where: { id: prd.id },
      update: {},
      create: {
        id: prd.id,
        gymId: gym.id,
        name: prd.name,
        category: prd.category,
        price: prd.price,
        currency: 'USD',
        stock: prd.stock,
        sku: prd.sku,
        isActive: true,
      },
    });
  }

  var suppliers = [
    { id: 'sup-fit-warehouse', name: 'Fit Warehouse Co.', contact: 'Liam +1-555-1000', email: 'sales@fitwarehouse.example' },
    { id: 'sup-nutri-labs', name: 'NutriLabs Distribution', contact: 'Nora +1-555-2200', email: 'hello@nutrilabs.example' },
  ];
  for (var sup of suppliers) {
    await prisma.suppliers.upsert({
      where: { id: sup.id },
      update: {},
      create: {
        id: sup.id,
        gymId: gym.id,
        name: sup.name,
        contact: sup.contact,
        email: sup.email,
        updatedAt: new Date(),
      },
    });
  }

  var movements = [
    { id: 'mov-001', productId: 'prd-protein', type: 'PURCHASE', quantity: 20, reason: 'Monthly restock', reference: 'PO-1001', createdAt: new Date(nowTs - 5 * 24 * 60 * 60 * 1000) },
    { id: 'mov-002', productId: 'prd-protein', type: 'SALE', quantity: 17, reason: 'Front desk sales', reference: 'POS-5001', createdAt: new Date(nowTs - 1 * 24 * 60 * 60 * 1000) },
    { id: 'mov-003', productId: 'prd-shaker', type: 'PURCHASE', quantity: 30, reason: 'Supplier refill', reference: 'PO-1002', createdAt: new Date(nowTs - 3 * 24 * 60 * 60 * 1000) },
    { id: 'mov-004', productId: 'prd-towel', type: 'ADJUSTMENT', quantity: 2, reason: 'Count correction', reference: 'ADJ-002', createdAt: new Date(nowTs - 6 * 60 * 60 * 1000) },
  ];
  for (var mv of movements) {
    await prisma.stock_movements.upsert({
      where: { id: mv.id },
      update: {},
      create: mv,
    });
  }
  console.log('  \u2713  Inventory seeded');

  // 5h. Complaint tickets
  var tickets = [
    {
      id: 'ticket-001',
      subject: 'Treadmill belt slipping',
      description: 'Treadmill near window jerks at high speed.',
      priority: 'HIGH',
      status: 'OPEN',
      createdAt: new Date(nowTs - 36 * 60 * 60 * 1000),
    },
    {
      id: 'ticket-002',
      subject: 'Locker room cleaning request',
      description: 'Please increase cleaning frequency after evening classes.',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      createdAt: new Date(nowTs - 20 * 60 * 60 * 1000),
    },
    {
      id: 'ticket-003',
      subject: 'Music volume too high in studio',
      description: 'Volume during HIIT was uncomfortable near front speakers.',
      priority: 'LOW',
      status: 'RESOLVED',
      createdAt: new Date(nowTs - 7 * 24 * 60 * 60 * 1000),
    },
  ];
  for (var t of tickets) {
    await prisma.supportTicket.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        gymId: gym.id,
        subject: t.subject,
        description: t.description,
        priority: t.priority,
        status: t.status,
        createdAt: t.createdAt,
      },
    });
  }
  console.log('  \u2713  Complaints seeded');

  // 6. Gym classes
  var classes = [
    { id: 'class-hiit-blast',    name: 'HIIT Blast',    category: 'hiit',     duration: 45, difficulty: 'intermediate', _cap: 20 },
    { id: 'class-morning-yoga',  name: 'Morning Yoga',  category: 'yoga',     duration: 60, difficulty: 'beginner',     _cap: 15 },
    { id: 'class-crossfit-wod',  name: 'CrossFit WOD',  category: 'crossfit', duration: 60, difficulty: 'advanced',     _cap: 12 },
    { id: 'class-spin-cycle',    name: 'Spin Cycle',    category: 'cycling',  duration: 45, difficulty: 'intermediate', _cap: 20 },
    { id: 'class-zumba-party',   name: 'Zumba Party',   category: 'zumba',    duration: 60, difficulty: 'beginner',     _cap: 25 },
    { id: 'class-power-pilates', name: 'Power Pilates', category: 'pilates',  duration: 50, difficulty: 'intermediate', _cap: 12 },
  ];
  for (var c of classes) {
    await prisma.gymClass.upsert({
      where:  { id: c.id },
      update: {},
      create: { gymId: gym.id, id: c.id, name: c.name, category: c.category, duration: c.duration, difficulty: c.difficulty },
    });
  }
  console.log('  \u2713  Gym classes: ' + classes.length);

  // 7. Class schedules (upcoming week)
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var schedules = [
    { classId: 'class-hiit-blast',    startHour: 7,  day: 0 },
    { classId: 'class-morning-yoga',  startHour: 8,  day: 0 },
    { classId: 'class-crossfit-wod',  startHour: 10, day: 1 },
    { classId: 'class-spin-cycle',    startHour: 9,  day: 2 },
    { classId: 'class-zumba-party',   startHour: 18, day: 3 },
    { classId: 'class-power-pilates', startHour: 11, day: 4 },
  ];
  for (var i = 0; i < schedules.length; i++) {
    var s = schedules[i];
    var start = new Date(today);
    start.setDate(start.getDate() + s.day + 1);
    start.setHours(s.startHour, 0, 0, 0);
    var finish = new Date(start);
    var cls = classes.find(function(x){ return x.id === s.classId; });
    finish.setMinutes(finish.getMinutes() + cls.duration);
    var schedId = 'sched-' + s.classId + '-' + i;
    await prisma.classSchedule.upsert({
      where:  { id: schedId },
      update: {},
      create: {
        id:          schedId,
        classId:     s.classId,
        branchId:    branch.id,
        trainerId:   trainer.id,
        startTime:   start,
        endTime:     finish,
        status:      'SCHEDULED',
        maxCapacity: cls._cap,
      },
    });
  }
  console.log('  \u2713  Class schedules: ' + schedules.length);

  // 8. Exercises
  var exercises = [
    { id: 'ex-barbell-squat', name: 'Barbell Squat', category: 'strength',  muscleGroup: JSON.stringify(['quads', 'glutes', 'hamstrings']) },
    { id: 'ex-push-up',       name: 'Push-Up',       category: 'bodyweight',muscleGroup: JSON.stringify(['chest', 'triceps', 'shoulders']) },
    { id: 'ex-pull-up',       name: 'Pull-Up',       category: 'bodyweight',muscleGroup: JSON.stringify(['back', 'biceps']) },
    { id: 'ex-deadlift',      name: 'Deadlift',      category: 'strength',  muscleGroup: JSON.stringify(['hamstrings', 'glutes', 'lower back']) },
    { id: 'ex-plank',         name: 'Plank',         category: 'core',      muscleGroup: JSON.stringify(['core', 'shoulders']) },
    { id: 'ex-bench-press',   name: 'Bench Press',   category: 'strength',  muscleGroup: JSON.stringify(['chest', 'triceps', 'shoulders']) },
    { id: 'ex-running',       name: 'Running',       category: 'cardio',    muscleGroup: JSON.stringify(['full body']) },
    { id: 'ex-burpee',        name: 'Burpee',        category: 'cardio',    muscleGroup: JSON.stringify(['full body']) },
  ];
  for (var ex of exercises) {
    await prisma.exercise.upsert({
      where:  { id: ex.id },
      update: {},
      create: ex,
    });
  }
  console.log('  \u2713  Exercises: ' + exercises.length);

  // 9. PT sessions, workout plans, and measurements
  var trainerProfile = await prisma.trainerProfile.findUnique({ where: { userId: trainer.id } });
  var aliceProfile = await prisma.memberProfile.findUnique({ where: { userId: member.id } });
  var bobProfile = await prisma.memberProfile.findUnique({ where: { userId: member2.id } });
  var alexProfile = await prisma.memberProfile.findUnique({ where: { userId: 'user-member-alex' } });
  var charlieProfile = await prisma.memberProfile.findUnique({ where: { userId: 'user-member-charlie' } });
  var ninaProfile = await prisma.memberProfile.findUnique({ where: { userId: 'user-member-nina' } });

  if (trainerProfile && aliceProfile && bobProfile && alexProfile && charlieProfile && ninaProfile) {
    var ptSessions = [
      {
        id: 'pt-session-001',
        trainerId: trainerProfile.id,
        memberId: aliceProfile.id,
        startTime: new Date(nowTs + 2 * 60 * 60 * 1000),
        endTime: new Date(nowTs + 3 * 60 * 60 * 1000),
        status: 'SCHEDULED',
        sessionNumber: 1,
        totalSessions: 8,
        pricePerSession: 45,
        notes: 'Lower body strength focus',
      },
      {
        id: 'pt-session-002',
        trainerId: trainerProfile.id,
        memberId: alexProfile.id,
        startTime: new Date(nowTs - 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(nowTs - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        status: 'COMPLETED',
        sessionNumber: 3,
        totalSessions: 6,
        pricePerSession: 40,
        notes: 'Conditioning circuit and rowing intervals',
        trainerNotes: 'Good pacing, improve hip hinge pattern.',
      },
      {
        id: 'pt-session-003',
        trainerId: trainerProfile.id,
        memberId: ninaProfile.id,
        startTime: new Date(nowTs + 24 * 60 * 60 * 1000),
        endTime: new Date(nowTs + 25 * 60 * 60 * 1000),
        status: 'SCHEDULED',
        sessionNumber: 2,
        totalSessions: 10,
        pricePerSession: 50,
        notes: 'Mobility and core stability session',
      },
    ];

    for (var session of ptSessions) {
      await prisma.ptSession.upsert({
        where: { id: session.id },
        update: {},
        create: session,
      });
    }
    console.log('  \u2713  PT sessions seeded');

    var workoutPlans = [
      {
        id: 'workout-plan-alice',
        memberId: aliceProfile.id,
        title: 'Alice 4-Week Strength Builder',
        description: 'Progressive full-body strength plan with conditioning finisher.',
        weeks: 4,
        goals: JSON.stringify(['Build muscle', 'Lose weight']),
        days: [
          {
            id: 'workout-day-alice-1',
            dayOfWeek: 1,
            name: 'Lower Body',
            exercises: [
              { id: 'workout-ex-alice-1', exerciseId: 'ex-barbell-squat', sets: 4, reps: '8', order: 0 },
              { id: 'workout-ex-alice-2', exerciseId: 'ex-plank', sets: 3, reps: '45s', order: 1 },
            ],
          },
          {
            id: 'workout-day-alice-2',
            dayOfWeek: 3,
            name: 'Upper Body',
            exercises: [
              { id: 'workout-ex-alice-3', exerciseId: 'ex-bench-press', sets: 4, reps: '8', order: 0 },
              { id: 'workout-ex-alice-4', exerciseId: 'ex-pull-up', sets: 3, reps: '6', order: 1 },
            ],
          },
        ],
      },
      {
        id: 'workout-plan-alex',
        memberId: alexProfile.id,
        title: 'Alex Endurance Upgrade',
        description: 'Cardio-focused split with rowing and bodyweight conditioning.',
        weeks: 6,
        goals: JSON.stringify(['Build endurance', 'Lose weight']),
        days: [
          {
            id: 'workout-day-alex-1',
            dayOfWeek: 2,
            name: 'Engine Day',
            exercises: [
              { id: 'workout-ex-alex-1', exerciseId: 'ex-running', sets: 1, duration: 30, order: 0 },
              { id: 'workout-ex-alex-2', exerciseId: 'ex-burpee', sets: 5, reps: '12', order: 1 },
            ],
          },
        ],
      },
    ];

    for (var plan of workoutPlans) {
      await prisma.workoutPlan.upsert({
        where: { id: plan.id },
        update: {},
        create: {
          id: plan.id,
          memberId: plan.memberId,
          title: plan.title,
          description: plan.description,
          weeks: plan.weeks,
          goals: plan.goals,
          days: {
            create: plan.days.map((day) => ({
              id: day.id,
              dayOfWeek: day.dayOfWeek,
              name: day.name,
              exercises: {
                create: day.exercises,
              },
            })),
          },
        },
      });
    }
    console.log('  \u2713  Workout plans seeded');

    var bodyMeasurements = [
      { id: 'measure-alice-1', memberId: aliceProfile.id, date: new Date(nowTs - 21 * 24 * 60 * 60 * 1000), weightKg: 68.1, bodyFatPct: 25.4, waistCm: 79.5, chestCm: 92, armCm: 29.2, notes: 'Initial trainer assessment' },
      { id: 'measure-alice-2', memberId: aliceProfile.id, date: new Date(nowTs - 14 * 24 * 60 * 60 * 1000), weightKg: 67.2, bodyFatPct: 24.8, waistCm: 78, chestCm: 92.5, armCm: 29.5, notes: 'Cardio consistency improving' },
      { id: 'measure-alice-3', memberId: aliceProfile.id, date: new Date(nowTs - 2 * 24 * 60 * 60 * 1000), weightKg: 66.4, bodyFatPct: 24.1, waistCm: 76.5, chestCm: 93, armCm: 30.1, notes: 'Improved consistency and energy' },
      { id: 'measure-alex-1', memberId: alexProfile.id, date: new Date(nowTs - 10 * 24 * 60 * 60 * 1000), weightKg: 84.5, bodyFatPct: 19.4, waistCm: 88, chestCm: 104, armCm: 35, notes: 'Aerobic base assessment' },
      { id: 'measure-charlie-1', memberId: charlieProfile.id, date: new Date(nowTs - 7 * 24 * 60 * 60 * 1000), weightKg: 79.2, bodyFatPct: 18.8, waistCm: 84, chestCm: 101, armCm: 34.2, notes: 'General fitness baseline' },
      { id: 'measure-nina-1', memberId: ninaProfile.id, date: new Date(nowTs - 5 * 24 * 60 * 60 * 1000), weightKg: 61.1, bodyFatPct: 23.3, waistCm: 72, chestCm: 88, armCm: 27.1, notes: 'Mobility and posture check' },
    ];

    for (var measure of bodyMeasurements) {
      await prisma.bodyMeasurement.upsert({
        where: { id: measure.id },
        update: {},
        create: measure,
      });
    }
    console.log('  \u2713  Body measurements seeded');

    if (aiDietPlanDelegate) {
      var aliceDietPlan = {
        summary: 'maintenance plan at ~2140 kcal/day',
        macros: { calories: 2140, proteinG: 120, carbsG: 255, fatG: 58 },
        meals: {
          breakfast: 'Greek yogurt parfait with berries and oats',
          snack1: 'Apple slices with peanut butter',
          lunch: 'Chicken quinoa bowl with roasted vegetables',
          snack2: 'Protein smoothie with banana',
          dinner: 'Baked salmon, jasmine rice, and broccoli',
        },
        hydration: '2350 ml water per day',
        notes: [
          'Front-load protein at breakfast and lunch.',
          'Keep a recovery snack within 45 minutes after training.',
          'Use the Sunday meal prep block to stay consistent mid-week.',
        ],
      };

      await aiDietPlanDelegate.upsert({
        where: { id: 'ai-diet-alice-001' },
        update: {},
        create: {
          id: 'ai-diet-alice-001',
          userId: member.id,
          goal: 'maintenance',
          calories: 2140,
          proteinG: 120,
          carbsG: 255,
          fatG: 58,
          allergies: JSON.stringify(['shellfish']),
          plan: JSON.stringify(aliceDietPlan),
          createdAt: new Date(nowTs - 24 * 60 * 60 * 1000),
        },
      });
      console.log('  \u2713  AI diet plans seeded');
    }

    var memberNotifications = [
      {
        id: 'notif-member-msg-001',
        userId: member.id,
        channel: 'IN_APP',
        status: 'SENT',
        subject: 'Message from your trainer',
        body: 'Strong work this week. Keep your squat depth consistent and add a 10-minute cooldown walk after leg day.',
        sentAt: new Date(nowTs - 6 * 60 * 60 * 1000),
        createdAt: new Date(nowTs - 6 * 60 * 60 * 1000),
      },
      {
        id: 'notif-member-msg-002',
        userId: member.id,
        channel: 'IN_APP',
        status: 'READ',
        subject: 'Message from your trainer',
        body: 'Nutrition note: aim for a protein-rich breakfast on training days so your afternoon sessions feel easier.',
        sentAt: new Date(nowTs - 30 * 60 * 60 * 1000),
        readAt: new Date(nowTs - 28 * 60 * 60 * 1000),
        createdAt: new Date(nowTs - 30 * 60 * 60 * 1000),
      },
      {
        id: 'notif-member-msg-003',
        userId: member.id,
        channel: 'IN_APP',
        status: 'SENT',
        subject: 'Class Reminder',
        body: 'Your mobility class starts tomorrow at 18:30 in Studio B.',
        sentAt: new Date(nowTs - 2 * 60 * 60 * 1000),
        createdAt: new Date(nowTs - 2 * 60 * 60 * 1000),
      },
    ];

    for (var notification of memberNotifications) {
      await prisma.notification.upsert({
        where: { id: notification.id },
        update: {},
        create: notification,
      });
    }
    console.log('  \u2713  Member notifications seeded');
  }

  // (PT session types model not in base schema — skipped)

  // ── Print credentials table ───────────────────────────────────────────
  console.log('\n\u2714\uFE0F  Seed complete!\n');
  var line = '+' + '-'.repeat(35) + '+' + '-'.repeat(22) + '+' + '-'.repeat(20) + '+';
  console.log(line);
  console.log('| ' + pad('Email', 33) + ' | ' + pad('Password', 20) + ' | ' + pad('Role', 18) + ' |');
  console.log(line);
  var rows = [
    ['superadmin@gymflow.com', 'Admin@1234',      'SUPER_ADMIN'],
    ['owner@demogym.com',      'Owner@1234',      'GYM_OWNER'],
    ['manager@demogym.com',    'Manager@1234',    'BRANCH_MANAGER'],
    ['reception@demogym.com',  'Reception@1234',  'RECEPTIONIST'],
    ['trainer@demogym.com',    'Trainer@1234',    'TRAINER'],
    ['member@demogym.com',     'Member@1234',     'MEMBER'],
    ['bob@demogym.com',        'Member@1234',     'MEMBER'],
  ];
  rows.forEach(function (r) {
    console.log('| ' + pad(r[0], 33) + ' | ' + pad(r[1], 20) + ' | ' + pad(r[2], 18) + ' |');
  });
  console.log(line + '\n');
  console.log('  API  \u2192  http://localhost:' + (process.env.API_PORT || 4000) + '/api/v1');
  console.log('  Docs \u2192  http://localhost:' + (process.env.API_PORT || 4000) + '/api/docs');
  console.log('  Web  \u2192  http://localhost:' + (process.env.NEXT_PORT || 3000) + '\n');
}

function pad(str, len) {
  return (str + ' '.repeat(len)).slice(0, len);
}

seed()
  .catch(function (e) {
    console.error('\n  Seed failed: ' + e.message);
    console.error(e);
    process.exit(1);
  })
  .finally(function () {
    return prisma.$disconnect();
  });
