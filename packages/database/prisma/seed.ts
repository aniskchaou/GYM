import { PrismaClient, UserRole, MembershipType, GymStatus, GymPlanTier } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Seeding GymFlow database...');

  // ── 1. Create a demo gym ────────────────────────────────────────────────
  const gym = await prisma.gym.upsert({
    where: { slug: 'demo-gym' },
    update: {},
    create: {
      name: 'Demo Fitness Center',
      slug: 'demo-gym',
      email: 'owner@demogym.com',
      phone: '+32 123 456 789',
      primaryColor: '#6366f1',
      city: 'Brussels',
      country: 'BE',
      timezone: 'Europe/Brussels',
      currency: 'EUR',
      status: GymStatus.ACTIVE,
      planTier: GymPlanTier.PROFESSIONAL,
      maxMembers: 500,
      maxBranches: 3,
    },
  });

  // ── 2. Create a branch ──────────────────────────────────────────────────
  const branch = await prisma.branch.upsert({
    where: { id: 'branch-main' },
    update: {},
    create: {
      id: 'branch-main',
      gymId: gym.id,
      name: 'Main Branch',
      address: '12 Fitness Street',
      city: 'Brussels',
      phone: '+32 123 456 789',
      capacity: 120,
    },
  });

  // ── 3. Seed users ───────────────────────────────────────────────────────
  const hash = (pw: string) => bcrypt.hash(pw, 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@gymflow.com' },
    update: {},
    create: {
      role: UserRole.SUPER_ADMIN,
      email: 'superadmin@gymflow.com',
      passwordHash: await hash('Admin@1234'),
      firstName: 'Super',
      lastName: 'Admin',
      isEmailVerified: true,
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: 'owner@demogym.com' },
    update: {},
    create: {
      gymId: gym.id,
      branchId: branch.id,
      role: UserRole.GYM_OWNER,
      email: 'owner@demogym.com',
      passwordHash: await hash('Owner@1234'),
      firstName: 'John',
      lastName: 'Owner',
      isEmailVerified: true,
    },
  });

  const receptionist = await prisma.user.upsert({
    where: { email: 'reception@demogym.com' },
    update: {},
    create: {
      gymId: gym.id,
      branchId: branch.id,
      role: UserRole.RECEPTIONIST,
      email: 'reception@demogym.com',
      passwordHash: await hash('Reception@1234'),
      firstName: 'Sara',
      lastName: 'Front',
      isEmailVerified: true,
    },
  });

  const trainer = await prisma.user.upsert({
    where: { email: 'trainer@demogym.com' },
    update: {},
    create: {
      gymId: gym.id,
      branchId: branch.id,
      role: UserRole.TRAINER,
      email: 'trainer@demogym.com',
      passwordHash: await hash('Trainer@1234'),
      firstName: 'Mike',
      lastName: 'Fit',
      isEmailVerified: true,
    },
  });

  await prisma.trainerProfile.upsert({
    where: { userId: trainer.id },
    update: {},
    create: {
      userId: trainer.id,
      specialties: ['CrossFit', 'HIIT', 'Strength Training'],
      certifications: ['ACE CPT', 'CrossFit Level 2'],
      bio: 'Certified personal trainer with 7 years of experience.',
      experience: 7,
      rating: 4.8,
      commissionPercent: 30,
      sessionRate: 60,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: 'member@demogym.com' },
    update: {},
    create: {
      gymId: gym.id,
      branchId: branch.id,
      role: UserRole.MEMBER,
      email: 'member@demogym.com',
      passwordHash: await hash('Member@1234'),
      firstName: 'Alice',
      lastName: 'Smith',
      gender: 'FEMALE',
      dateOfBirth: new Date('1995-06-15'),
      isEmailVerified: true,
    },
  });

  await prisma.memberProfile.upsert({
    where: { userId: member.id },
    update: {},
    create: {
      userId: member.id,
      memberNumber: 'MBR-0001',
      qrCode: `QR-${member.id}`,
      fitnessGoals: ['Lose weight', 'Build muscle'],
    },
  });

  // ── 4. Membership Plans ─────────────────────────────────────────────────
  const plans = [
    { name: 'Monthly Basic', type: MembershipType.MONTHLY, price: 29.99, durationDays: 30, features: ['Unlimited gym access', 'Locker room access'] },
    { name: 'Monthly Premium', type: MembershipType.MONTHLY, price: 49.99, durationDays: 30, features: ['Unlimited gym access', '2 classes/week', 'Nutrition consultation'] },
    { name: 'Annual Basic', type: MembershipType.ANNUAL, price: 299.99, durationDays: 365, features: ['Unlimited gym access', '2 months free'] },
    { name: 'Annual Premium', type: MembershipType.ANNUAL, price: 499.99, durationDays: 365, features: ['Unlimited gym access', 'Unlimited classes', 'PT session/month'] },
    { name: 'Student Plan', type: MembershipType.STUDENT, price: 19.99, durationDays: 30, features: ['Weekday access', 'Basic facilities'] },
    { name: 'Day Pass', type: MembershipType.DAY_PASS, price: 9.99, durationDays: 1, features: ['Full-day access'] },
  ];

  for (const plan of plans) {
    await prisma.membershipPlan.upsert({
      where: { id: `plan-${plan.name.toLowerCase().replace(/\s/g, '-')}` },
      update: {},
      create: {
        id: `plan-${plan.name.toLowerCase().replace(/\s/g, '-')}`,
        gymId: gym.id,
        ...plan,
      },
    });
  }

  // ── 5. Gym Classes ──────────────────────────────────────────────────────
  const classes = [
    { name: 'HIIT Blast', category: 'hiit', duration: 45, difficulty: 'intermediate' },
    { name: 'Morning Yoga', category: 'yoga', duration: 60, difficulty: 'beginner' },
    { name: 'CrossFit WOD', category: 'crossfit', duration: 60, difficulty: 'advanced' },
    { name: 'Spin Cycle', category: 'cycling', duration: 45, difficulty: 'intermediate' },
    { name: 'Zumba Party', category: 'zumba', duration: 60, difficulty: 'beginner' },
    { name: 'Power Pilates', category: 'pilates', duration: 50, difficulty: 'intermediate' },
  ];

  for (const c of classes) {
    await prisma.gymClass.upsert({
      where: { id: `class-${c.name.toLowerCase().replace(/\s/g, '-')}` },
      update: {},
      create: {
        id: `class-${c.name.toLowerCase().replace(/\s/g, '-')}`,
        gymId: gym.id,
        ...c,
      },
    });
  }

  // ── 6. Exercises ────────────────────────────────────────────────────────
  const exercises = [
    { name: 'Barbell Squat', category: 'strength', muscleGroup: ['quads', 'glutes', 'hamstrings'] },
    { name: 'Push-Up', category: 'bodyweight', muscleGroup: ['chest', 'triceps', 'shoulders'] },
    { name: 'Pull-Up', category: 'bodyweight', muscleGroup: ['back', 'biceps'] },
    { name: 'Deadlift', category: 'strength', muscleGroup: ['hamstrings', 'glutes', 'lower back'] },
    { name: 'Plank', category: 'core', muscleGroup: ['core', 'shoulders'] },
    { name: 'Bench Press', category: 'strength', muscleGroup: ['chest', 'triceps', 'shoulders'] },
    { name: 'Running', category: 'cardio', muscleGroup: ['full body'] },
    { name: 'Burpee', category: 'cardio', muscleGroup: ['full body'] },
  ];

  for (const ex of exercises) {
    await prisma.exercise.upsert({
      where: { id: `ex-${ex.name.toLowerCase().replace(/\s/g, '-')}` },
      update: {},
      create: {
        id: `ex-${ex.name.toLowerCase().replace(/\s/g, '-')}`,
        ...ex,
      },
    });
  }

  console.log('✅  Seed complete!');
  console.log('');
  console.log('Demo accounts:');
  console.log('  Super Admin : superadmin@gymflow.com / Admin@1234');
  console.log('  Gym Owner   : owner@demogym.com     / Owner@1234');
  console.log('  Receptionist: reception@demogym.com / Reception@1234');
  console.log('  Trainer     : trainer@demogym.com   / Trainer@1234');
  console.log('  Member      : member@demogym.com    / Member@1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
