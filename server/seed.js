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

// ── Helpers ───────────────────────────────────────────────────────────────
function hash(pw) { return bcrypt.hash(pw, 10); }

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
