/**
 * Additive seed — 50 gyms across major US cities
 * Run with:  npx ts-node prisma/seed-gyms.ts
 */
import { PrismaClient, GymStatus, GymPlanTier, MembershipType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const hash = (pw: string) => bcrypt.hash(pw, 10);

const GYM_DATA = [
  { slug: 'peakfit-new-york',        name: 'PeakFit Studio',             city: 'New York',    country: 'US', currency: 'USD', timezone: 'America/New_York',    tier: GymPlanTier.PROFESSIONAL, color: '#ef4444', specialty: 'HIIT & Cardio',            price: 45 },
  { slug: 'ironhouse-chicago',       name: 'IronHouse Performance',      city: 'Chicago',     country: 'US', currency: 'USD', timezone: 'America/Chicago',      tier: GymPlanTier.ENTERPRISE,   color: '#1e293b', specialty: 'Strength & Powerlifting',  price: 55 },
  { slug: 'zen-wellness-la',         name: 'Zen Wellness Hub',           city: 'Los Angeles', country: 'US', currency: 'USD', timezone: 'America/Los_Angeles',  tier: GymPlanTier.PROFESSIONAL, color: '#10b981', specialty: 'Yoga & Pilates',           price: 65 },
  { slug: 'aquaflex-miami',          name: 'AquaFlex Center',            city: 'Miami',       country: 'US', currency: 'USD', timezone: 'America/New_York',     tier: GymPlanTier.PROFESSIONAL, color: '#06b6d4', specialty: 'Swimming & Spa',           price: 49 },
  { slug: 'crosscore-houston',       name: 'CrossCore Gym',              city: 'Houston',     country: 'US', currency: 'USD', timezone: 'America/Chicago',      tier: GymPlanTier.STARTER,      color: '#f59e0b', specialty: 'CrossFit',                 price: 39 },
  { slug: 'fightfit-phoenix',        name: 'FightFit Academy',           city: 'Phoenix',     country: 'US', currency: 'USD', timezone: 'America/Phoenix',      tier: GymPlanTier.PROFESSIONAL, color: '#8b5cf6', specialty: 'Boxing & MMA',             price: 49 },
  { slug: 'urban-iron-seattle',      name: 'Urban Iron Gym',             city: 'Seattle',     country: 'US', currency: 'USD', timezone: 'America/Los_Angeles',  tier: GymPlanTier.PROFESSIONAL, color: '#475569', specialty: 'Weightlifting',            price: 42 },
  { slug: 'boston-athletic-club',    name: 'Boston Athletic Club',       city: 'Boston',      country: 'US', currency: 'USD', timezone: 'America/New_York',     tier: GymPlanTier.ENTERPRISE,   color: '#dc2626', specialty: 'Multi-Sport',              price: 75 },
  { slug: 'mile-high-fitness-denver',name: 'Mile High Fitness',          city: 'Denver',      country: 'US', currency: 'USD', timezone: 'America/Denver',       tier: GymPlanTier.PROFESSIONAL, color: '#2563eb', specialty: 'Altitude Training',        price: 48 },
  { slug: 'lone-star-gym-austin',    name: 'Lone Star Gym',              city: 'Austin',      country: 'US', currency: 'USD', timezone: 'America/Chicago',      tier: GymPlanTier.STARTER,      color: '#b45309', specialty: 'Functional Fitness',       price: 35 },
  { slug: 'empire-fitness-nyc',      name: 'Empire Fitness',             city: 'New York',    country: 'US', currency: 'USD', timezone: 'America/New_York',     tier: GymPlanTier.ENTERPRISE,   color: '#7c3aed', specialty: 'Personal Training',        price: 120 },
  { slug: 'sunset-yoga-la',          name: 'Sunset Yoga Studio',         city: 'Los Angeles', country: 'US', currency: 'USD', timezone: 'America/Los_Angeles',  tier: GymPlanTier.STARTER,      color: '#f97316', specialty: 'Yoga & Meditation',        price: 40 },
  { slug: 'windy-city-crossfit',     name: 'Windy City CrossFit',        city: 'Chicago',     country: 'US', currency: 'USD', timezone: 'America/Chicago',      tier: GymPlanTier.PROFESSIONAL, color: '#0ea5e9', specialty: 'CrossFit',                 price: 55 },
  { slug: 'south-beach-spin-miami',  name: 'South Beach Spin',           city: 'Miami',       country: 'US', currency: 'USD', timezone: 'America/New_York',     tier: GymPlanTier.PROFESSIONAL, color: '#ec4899', specialty: 'Indoor Cycling',           price: 45 },
  { slug: 'space-city-strength',     name: 'Space City Strength',        city: 'Houston',     country: 'US', currency: 'USD', timezone: 'America/Chicago',      tier: GymPlanTier.PROFESSIONAL, color: '#64748b', specialty: 'Barbell Club',             price: 50 },
  { slug: 'desert-iron-phoenix',     name: 'Desert Iron Gym',            city: 'Phoenix',     country: 'US', currency: 'USD', timezone: 'America/Phoenix',      tier: GymPlanTier.STARTER,      color: '#d97706', specialty: 'Bodybuilding',             price: 30 },
  { slug: 'cascade-fitness-seattle', name: 'Cascade Fitness',            city: 'Seattle',     country: 'US', currency: 'USD', timezone: 'America/Los_Angeles',  tier: GymPlanTier.PROFESSIONAL, color: '#16a34a', specialty: 'Group Fitness',            price: 44 },
  { slug: 'freedom-trail-fitness',   name: 'Freedom Trail Fitness',      city: 'Boston',      country: 'US', currency: 'USD', timezone: 'America/New_York',     tier: GymPlanTier.STARTER,      color: '#1d4ed8', specialty: 'Functional Training',      price: 38 },
  { slug: 'rocky-mountain-gym',      name: 'Rocky Mountain Gym',         city: 'Denver',      country: 'US', currency: 'USD', timezone: 'America/Denver',       tier: GymPlanTier.STARTER,      color: '#78716c', specialty: 'Climbing & Fitness',       price: 42 },
  { slug: 'keep-austin-fit',         name: 'Keep Austin Fit',            city: 'Austin',      country: 'US', currency: 'USD', timezone: 'America/Chicago',      tier: GymPlanTier.PROFESSIONAL, color: '#84cc16', specialty: 'Outdoor & Indoor',         price: 45 },
  { slug: 'five-boroughs-fitness',   name: 'Five Boroughs Fitness',      city: 'New York',    country: 'US', currency: 'USD', timezone: 'America/New_York',     tier: GymPlanTier.PROFESSIONAL, color: '#0f766e', specialty: 'HIIT & Bootcamp',          price: 50 },
  { slug: 'venice-beach-iron',       name: 'Venice Beach Iron',          city: 'Los Angeles', country: 'US', currency: 'USD', timezone: 'America/Los_Angeles',  tier: GymPlanTier.ENTERPRISE,   color: '#b91c1c', specialty: 'Outdoor Bodybuilding',     price: 35 },
  { slug: 'lake-shore-athletic',     name: 'Lake Shore Athletic Club',   city: 'Chicago',     country: 'US', currency: 'USD', timezone: 'America/Chicago',      tier: GymPlanTier.ENTERPRISE,   color: '#1e40af', specialty: 'Multi-Sport Club',         price: 85 },
  { slug: 'brickell-bootcamp',       name: 'Brickell Bootcamp',          city: 'Miami',       country: 'US', currency: 'USD', timezone: 'America/New_York',     tier: GymPlanTier.STARTER,      color: '#c026d3', specialty: 'Bootcamp',                 price: 35 },
  { slug: 'bayou-barbell-houston',   name: 'Bayou Barbell Club',         city: 'Houston',     country: 'US', currency: 'USD', timezone: 'America/Chicago',      tier: GymPlanTier.STARTER,      color: '#a16207', specialty: 'Olympic Lifting',          price: 40 },
  { slug: 'saguaro-sports-phoenix',  name: 'Saguaro Sports Complex',     city: 'Phoenix',     country: 'US', currency: 'USD', timezone: 'America/Phoenix',      tier: GymPlanTier.ENTERPRISE,   color: '#15803d', specialty: 'Sports Complex',           price: 70 },
  { slug: 'puget-performance',       name: 'Puget Sound Performance',    city: 'Seattle',     country: 'US', currency: 'USD', timezone: 'America/Los_Angeles',  tier: GymPlanTier.PROFESSIONAL, color: '#0369a1', specialty: 'Athletic Performance',     price: 60 },
  { slug: 'harvard-sq-fitness',      name: 'Harvard Square Fitness',     city: 'Boston',      country: 'US', currency: 'USD', timezone: 'America/New_York',     tier: GymPlanTier.PROFESSIONAL, color: '#9f1239', specialty: 'Student & Sports',         price: 30 },
  { slug: 'lodo-lifting-denver',     name: 'LoDo Lifting Club',          city: 'Denver',      country: 'US', currency: 'USD', timezone: 'America/Denver',       tier: GymPlanTier.PROFESSIONAL, color: '#374151', specialty: 'Powerlifting',             price: 45 },
  { slug: 'east-6th-fitness-austin', name: 'East 6th Fitness',           city: 'Austin',      country: 'US', currency: 'USD', timezone: 'America/Chicago',      tier: GymPlanTier.STARTER,      color: '#059669', specialty: 'Circuit Training',         price: 32 },
  { slug: 'midtown-sweat-nyc',       name: 'Midtown Sweat NYC',          city: 'New York',    country: 'US', currency: 'USD', timezone: 'America/New_York',     tier: GymPlanTier.ENTERPRISE,   color: '#6d28d9', specialty: 'Premium Fitness Club',     price: 150 },
  { slug: 'koreatown-kickboxing',    name: 'Koreatown Kickboxing',       city: 'Los Angeles', country: 'US', currency: 'USD', timezone: 'America/Los_Angeles',  tier: GymPlanTier.STARTER,      color: '#dc2626', specialty: 'Kickboxing',               price: 38 },
  { slug: 'wicker-park-wellness',    name: 'Wicker Park Wellness',       city: 'Chicago',     country: 'US', currency: 'USD', timezone: 'America/Chicago',      tier: GymPlanTier.PROFESSIONAL, color: '#6366f1', specialty: 'Holistic Wellness',        price: 55 },
  { slug: 'coral-gables-crossfit',   name: 'Coral Gables CrossFit',      city: 'Miami',       country: 'US', currency: 'USD', timezone: 'America/New_York',     tier: GymPlanTier.PROFESSIONAL, color: '#059669', specialty: 'CrossFit',                 price: 58 },
  { slug: 'midtown-move-houston',    name: 'Midtown Move Studios',       city: 'Houston',     country: 'US', currency: 'USD', timezone: 'America/Chicago',      tier: GymPlanTier.PROFESSIONAL, color: '#0284c7', specialty: 'Dance & Barre',            price: 52 },
  { slug: 'arcadia-athletic-phx',    name: 'Arcadia Athletic Club',      city: 'Phoenix',     country: 'US', currency: 'USD', timezone: 'America/Phoenix',      tier: GymPlanTier.ENTERPRISE,   color: '#b45309', specialty: 'Racquet & Fitness',        price: 80 },
  { slug: 'capitol-hill-gym-sea',    name: 'Capitol Hill Gym',           city: 'Seattle',     country: 'US', currency: 'USD', timezone: 'America/Los_Angeles',  tier: GymPlanTier.STARTER,      color: '#4b5563', specialty: 'Community Gym',            price: 28 },
  { slug: 'south-end-strength',      name: 'South End Strength',         city: 'Boston',      country: 'US', currency: 'USD', timezone: 'America/New_York',     tier: GymPlanTier.PROFESSIONAL, color: '#7c3aed', specialty: 'Strength & Conditioning',  price: 52 },
  { slug: 'cheesman-park-fit',       name: 'Cheesman Park Fitness',      city: 'Denver',      country: 'US', currency: 'USD', timezone: 'America/Denver',       tier: GymPlanTier.STARTER,      color: '#84cc16', specialty: 'Outdoor Bootcamp',         price: 30 },
  { slug: 'travis-heights-training', name: 'Travis Heights Training',    city: 'Austin',      country: 'US', currency: 'USD', timezone: 'America/Chicago',      tier: GymPlanTier.PROFESSIONAL, color: '#f43f5e', specialty: 'Personal Training',        price: 90 },
  { slug: 'gold-coast-gym-chicago',  name: 'Gold Coast Gym',             city: 'Chicago',     country: 'US', currency: 'USD', timezone: 'America/Chicago',      tier: GymPlanTier.ENTERPRISE,   color: '#ca8a04', specialty: 'Luxury Fitness',           price: 95 },
  { slug: 'westwood-wellness-la',    name: 'Westwood Wellness Center',   city: 'Los Angeles', country: 'US', currency: 'USD', timezone: 'America/Los_Angeles',  tier: GymPlanTier.PROFESSIONAL, color: '#0d9488', specialty: 'Rehab & Wellness',         price: 70 },
  { slug: 'brooklyn-barbell-nyc',    name: 'Brooklyn Barbell Co.',       city: 'New York',    country: 'US', currency: 'USD', timezone: 'America/New_York',     tier: GymPlanTier.PROFESSIONAL, color: '#1e293b', specialty: 'Barbell & Strength',       price: 48 },
  { slug: 'bayfront-bootcamp-miami', name: 'Bayfront Bootcamp',          city: 'Miami',       country: 'US', currency: 'USD', timezone: 'America/New_York',     tier: GymPlanTier.STARTER,      color: '#14b8a6', specialty: 'Outdoor Bootcamp',         price: 33 },
  { slug: 'heights-hiit-houston',    name: 'The Heights HIIT',           city: 'Houston',     country: 'US', currency: 'USD', timezone: 'America/Chicago',      tier: GymPlanTier.PROFESSIONAL, color: '#e11d48', specialty: 'HIIT & Metabolic',         price: 47 },
  { slug: 'ahwatukee-athletics',     name: 'Ahwatukee Athletics',        city: 'Phoenix',     country: 'US', currency: 'USD', timezone: 'America/Phoenix',      tier: GymPlanTier.PROFESSIONAL, color: '#16a34a', specialty: 'Family Fitness',           price: 55 },
  { slug: 'fremont-fitness-seattle', name: 'Fremont Fitness Lab',        city: 'Seattle',     country: 'US', currency: 'USD', timezone: 'America/Los_Angeles',  tier: GymPlanTier.PROFESSIONAL, color: '#7c3aed', specialty: 'Science-Based Training',   price: 58 },
  { slug: 'fenway-functional',       name: 'Fenway Functional Fitness',  city: 'Boston',      country: 'US', currency: 'USD', timezone: 'America/New_York',     tier: GymPlanTier.STARTER,      color: '#dc2626', specialty: 'Functional Fitness',       price: 36 },
  { slug: 'rino-strength-denver',    name: 'RiNo Strength Collective',   city: 'Denver',      country: 'US', currency: 'USD', timezone: 'America/Denver',       tier: GymPlanTier.PROFESSIONAL, color: '#0ea5e9', specialty: 'Strength Community',       price: 50 },
  { slug: 'south-congress-yoga',     name: 'South Congress Yoga',        city: 'Austin',      country: 'US', currency: 'USD', timezone: 'America/Chicago',      tier: GymPlanTier.STARTER,      color: '#a855f7', specialty: 'Hot Yoga',                 price: 29 },
];

async function main() {
  console.log('🌱  Seeding 50 gyms into PostgreSQL...');
  let created = 0;

  for (let i = 0; i < GYM_DATA.length; i++) {
    const g = GYM_DATA[i];
    const maxMembers  = g.tier === GymPlanTier.ENTERPRISE   ? 2000 : g.tier === GymPlanTier.PROFESSIONAL ? 500 : 100;
    const maxBranches = g.tier === GymPlanTier.ENTERPRISE   ? 10   : g.tier === GymPlanTier.PROFESSIONAL ? 3   : 1;
    const capacity    = g.tier === GymPlanTier.ENTERPRISE   ? 200  : g.tier === GymPlanTier.PROFESSIONAL ? 120 : 60;

    const gym = await prisma.gym.upsert({
      where:  { slug: g.slug },
      update: {},
      create: {
        name:         g.name,
        slug:         g.slug,
        email:        `owner@${g.slug}.com`,
        phone:        `+1 555 ${String(100 + i).padStart(3, '0')} ${String(1000 + i).padStart(4, '0')}`,
        primaryColor: g.color,
        city:         g.city,
        country:      g.country,
        timezone:     g.timezone,
        currency:     g.currency,
        status:       GymStatus.ACTIVE,
        planTier:     g.tier,
        maxMembers,
        maxBranches,
        address:      `${100 + i} Fitness Ave`,
        description:  `${g.name} — specializing in ${g.specialty}`,
        rating:       3.5 + Math.random() * 1.5,
      },
    });

    await prisma.branch.upsert({
      where:  { id: `branch-${g.slug}` },
      update: {},
      create: {
        id:       `branch-${g.slug}`,
        gymId:    gym.id,
        name:     'Main Branch',
        address:  `${100 + i} Fitness Ave`,
        city:     g.city,
        phone:    `+1 555 ${String(100 + i).padStart(3, '0')} ${String(1000 + i).padStart(4, '0')}`,
        capacity,
      },
    });

    const ownerEmail = `owner@${g.slug}.com`;
    await prisma.user.upsert({
      where:  { email: ownerEmail },
      update: {},
      create: {
        gymId:           gym.id,
        role:            UserRole.GYM_OWNER,
        email:           ownerEmail,
        passwordHash:    await hash('Owner@1234'),
        firstName:       'Owner',
        lastName:        g.name.split(' ')[0],
        isEmailVerified: true,
      },
    });

    for (const plan of [
      {
        id:           `plan-${g.slug}-monthly`,
        name:         'Monthly Membership',
        type:         MembershipType.MONTHLY,
        price:        g.price,
        durationDays: 30,
        features:     ['Unlimited gym access', 'Locker room', g.specialty],
      },
      {
        id:           `plan-${g.slug}-annual`,
        name:         'Annual Membership',
        type:         MembershipType.ANNUAL,
        price:        Math.round(g.price * 10 * 0.85),
        durationDays: 365,
        features:     ['Unlimited gym access', 'Locker room', g.specialty, '2 months free'],
      },
    ]) {
      await prisma.membershipPlan.upsert({
        where:  { id: plan.id },
        update: {},
        create: { gymId: gym.id, ...plan },
      });
    }

    created++;
    if (created % 10 === 0) console.log(`  ✓ ${created} gyms seeded...`);
  }

  console.log(`\n✅  Done! ${created} gyms added to PostgreSQL.`);
  console.log('   All gym owner passwords: Owner@1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
