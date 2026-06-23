/**
 * Additive seed for the newer modules (Coupons, POS, Workouts, PT Sessions,
 * Body Measurements, Fitness Goals, Nutrition, Audit Logs).
 *
 * Idempotent: each section checks whether data already exists for the model
 * (scoped to the demo gym) and skips if so. Safe to re-run.
 *
 * Run with: npx ts-node prisma/seed-modules.ts
 */
import {
  PrismaClient, PaymentStatus, PaymentMethod, ClassStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

const pick = <T,>(a: T[], i: number) => a[Math.abs(i) % a.length];
const dAgo = (d: number) => new Date(Date.now() - d * 86_400_000);
const dFromNow = (d: number) => new Date(Date.now() + d * 86_400_000);
const hFromNow = (h: number) => new Date(Date.now() + h * 3_600_000);

async function main() {
  console.log('🌱  Seeding new-module data...');

  const gym = await prisma.gym.findUnique({ where: { slug: 'demo-gym' } });
  if (!gym) {
    console.error('❌  Demo gym not found — run `npm run db:seed` first.');
    process.exit(1);
  }
  const gymId = gym.id;
  const branch = await prisma.branch.findFirst({ where: { gymId } });
  if (!branch) {
    console.error('❌  No branch — run main seed first.');
    process.exit(1);
  }

  const owner = await prisma.user.findUnique({ where: { email: 'owner@demogym.com' } });
  const trainerUser = await prisma.user.findUnique({ where: { email: 'trainer@demogym.com' } });
  const trainerProfile = trainerUser
    ? await prisma.trainerProfile.findUnique({ where: { userId: trainerUser.id } })
    : null;

  const memberProfiles = await prisma.memberProfile.findMany({ take: 20, include: { user: true } });
  if (!memberProfiles.length) {
    console.error('❌  No members in DB.');
    process.exit(1);
  }

  // ── Coupons ───────────────────────────────────────────────────────────
  if ((await prisma.coupon.count({ where: { gymId } })) === 0) {
    const coupons = [
      { code: 'WELCOME10', discountType: 'PERCENT', discountValue: 10, maxUses: 100, currentUses: 12, validUntil: null as Date | null },
      { code: 'SUMMER25', discountType: 'PERCENT', discountValue: 25, maxUses: 50, currentUses: 8, validUntil: dFromNow(60) },
      { code: 'FLAT5', discountType: 'FIXED', discountValue: 5, maxUses: 200, currentUses: 47, validUntil: null as Date | null },
      { code: 'STUDENT15', discountType: 'PERCENT', discountValue: 15, maxUses: null as number | null, currentUses: 3, validUntil: null as Date | null },
      { code: 'BLACKFRIDAY', discountType: 'PERCENT', discountValue: 40, maxUses: 300, currentUses: 0, validUntil: dFromNow(180) },
      { code: 'NEWYEAR20', discountType: 'PERCENT', discountValue: 20, maxUses: 500, currentUses: 25, validUntil: dFromNow(45) },
    ];
    for (const c of coupons) await prisma.coupon.create({ data: { gymId, ...c } });
    console.log(`   ✓ ${coupons.length} coupons`);
  } else console.log('   - coupons: already present');

  // ── Products ─────────────────────────────────────────────────────────
  let products = await prisma.product.findMany({ where: { gymId } });
  if (products.length === 0) {
    const specs = [
      { name: 'Whey Protein 2kg', category: 'supplement', price: 49.99, stock: 50, sku: 'SUP-WHEY-2KG' },
      { name: 'Creatine 500g', category: 'supplement', price: 24.99, stock: 80, sku: 'SUP-CRT-500' },
      { name: 'Pre-Workout 300g', category: 'supplement', price: 34.99, stock: 40, sku: 'SUP-PRE-300' },
      { name: 'BCAA 400g', category: 'supplement', price: 22.99, stock: 60, sku: 'SUP-BCAA-400' },
      { name: 'GymFlow T-Shirt', category: 'apparel', price: 19.99, stock: 100, sku: 'APP-TS-001' },
      { name: 'GymFlow Hoodie', category: 'apparel', price: 39.99, stock: 60, sku: 'APP-HD-001' },
      { name: 'Shaker Bottle', category: 'accessory', price: 9.99, stock: 200, sku: 'ACC-SHK-001' },
      { name: 'Lifting Belt', category: 'equipment', price: 44.99, stock: 25, sku: 'EQ-BELT-001' },
      { name: 'Resistance Band Set', category: 'equipment', price: 29.99, stock: 35, sku: 'EQ-BAND-001' },
      { name: 'Day Pass', category: 'daypass', price: 12.0, stock: 999, sku: 'PASS-DAY-001' },
      { name: 'Energy Drink', category: 'drink', price: 3.5, stock: 250, sku: 'DR-ENRG-001' },
    ];
    for (const p of specs) {
      const prod = await prisma.product.create({ data: { gymId, ...p } });
      products.push(prod);
    }
    console.log(`   ✓ ${products.length} products`);
  } else console.log(`   - products: ${products.length} already present`);

  // ── Orders ───────────────────────────────────────────────────────────
  if ((await prisma.order.count()) === 0 && products.length) {
    for (let i = 0; i < 15; i++) {
      const buyer = pick(memberProfiles, i);
      const items = [pick(products, i), pick(products, i + 1), pick(products, i + 2)];
      const total = items.reduce((s, it) => s + it.price, 0);
      const order = await prisma.order.create({
        data: {
          customerId: buyer.userId,
          totalAmount: +total.toFixed(2),
          status: PaymentStatus.PAID,
          method: pick([PaymentMethod.STRIPE, PaymentMethod.CASH, PaymentMethod.BANK_TRANSFER], i),
          createdAt: dAgo(i),
        },
      });
      for (const it of items) {
        await prisma.orderItem.create({
          data: { orderId: order.id, productId: it.id, quantity: 1 + (i % 2), unitPrice: it.price },
        });
      }
    }
    console.log('   ✓ 15 orders');
  } else console.log('   - orders: already present');

  // ── Exercises (library) ──────────────────────────────────────────────
  let exercises = await prisma.exercise.findMany();
  if (exercises.length === 0) {
    const list = [
      { name: 'Barbell Squat', category: 'strength', muscleGroup: ['quads', 'glutes'] },
      { name: 'Push-Up', category: 'bodyweight', muscleGroup: ['chest', 'triceps'] },
      { name: 'Pull-Up', category: 'bodyweight', muscleGroup: ['back', 'biceps'] },
      { name: 'Deadlift', category: 'strength', muscleGroup: ['hamstrings', 'back'] },
      { name: 'Plank', category: 'core', muscleGroup: ['core'] },
      { name: 'Bench Press', category: 'strength', muscleGroup: ['chest'] },
      { name: 'Running', category: 'cardio', muscleGroup: ['full body'] },
      { name: 'Burpee', category: 'cardio', muscleGroup: ['full body'] },
      { name: 'Overhead Press', category: 'strength', muscleGroup: ['shoulders'] },
      { name: 'Lunges', category: 'strength', muscleGroup: ['quads', 'glutes'] },
    ];
    for (const e of list) exercises.push(await prisma.exercise.create({ data: e }));
    console.log(`   ✓ ${exercises.length} exercises`);
  } else console.log(`   - exercises: ${exercises.length} already present`);

  // ── Workout Plans ────────────────────────────────────────────────────
  if ((await prisma.workoutPlan.count()) === 0 && exercises.length) {
    const goals = ['Lose weight', 'Build muscle', 'Improve endurance', 'Gain flexibility'];
    for (let i = 0; i < Math.min(10, memberProfiles.length); i++) {
      const mp = memberProfiles[i];
      const wp = await prisma.workoutPlan.create({
        data: {
          memberId: mp.id,
          title: `4-Week ${pick(['Strength', 'Cardio', 'HIIT', 'Hypertrophy'], i)} Plan`,
          description: 'Structured plan covering full body.',
          goals: [pick(goals, i)], weeks: 4,
        },
      });
      for (let d = 1; d <= 3; d++) {
        const day = await prisma.workoutDay.create({
          data: { planId: wp.id, dayOfWeek: d * 2, name: pick(['Upper Body', 'Lower Body', 'Core & Cardio'], d) },
        });
        for (let e = 0; e < 4; e++) {
          await prisma.workoutExercise.create({
            data: {
              dayId: day.id, exerciseId: pick(exercises, i + d + e).id,
              sets: 3 + (e % 2), reps: pick(['8-10', '10-12', '12-15', '15-20'], e),
              weight: pick(['bodyweight', '15kg', '30kg', '60kg'], e),
              restTime: 60 + (e % 2) * 30, order: e,
            },
          });
        }
      }
    }
    console.log('   ✓ 10 workout plans');
  } else console.log('   - workout plans: already present');

  // ── PT Sessions ──────────────────────────────────────────────────────
  if ((await prisma.ptSession.count()) === 0 && trainerProfile) {
    for (let i = 0; i < 12; i++) {
      const mp = pick(memberProfiles, i);
      const future = i >= 6;
      const start = future ? hFromNow(24 * (i - 5)) : dAgo(i + 1);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      await prisma.ptSession.create({
        data: {
          trainerId: trainerProfile.id,
          memberId: mp.id,
          startTime: start, endTime: end,
          status: future ? ClassStatus.SCHEDULED : ClassStatus.COMPLETED,
          sessionNumber: (i % 10) + 1, totalSessions: 10, pricePerSession: 45.0,
          notes: future ? 'Upcoming session' : 'Great session, member made progress.',
        },
      });
    }
    console.log('   ✓ 12 PT sessions');
  } else console.log('   - pt sessions: already present or no trainer');

  // ── Body measurements ────────────────────────────────────────────────
  if ((await prisma.bodyMeasurement.count()) === 0) {
    for (let i = 0; i < memberProfiles.length; i++) {
      const mp = memberProfiles[i];
      for (let w = 0; w < 4; w++) {
        const weight = 60 + (i % 30) - w * 0.5;
        const height = 160 + (i % 30);
        await prisma.bodyMeasurement.create({
          data: {
            memberId: mp.id, date: dAgo(w * 14),
            weightKg: +weight.toFixed(1), heightCm: height,
            bmi: +(weight / Math.pow(height / 100, 2)).toFixed(1),
            bodyFatPct: 15 + (i % 15) - w,
            chestCm: 90 + (i % 15), waistCm: 75 + (i % 15),
            hipsCm: 95 + (i % 15), armCm: 30 + (i % 10), thighCm: 55 + (i % 10),
          },
        });
      }
    }
    console.log(`   ✓ body measurements (${memberProfiles.length * 4})`);
  } else console.log('   - body measurements: already present');

  // ── Fitness goals ────────────────────────────────────────────────────
  if ((await prisma.fitnessGoal.count()) === 0) {
    const titles = ['Lose 5 kg', 'Bench 100 kg', 'Run 10 km', 'Touch toes', 'Do 20 pull-ups'];
    for (let i = 0; i < memberProfiles.length; i++) {
      const mp = memberProfiles[i];
      await prisma.fitnessGoal.create({
        data: {
          memberId: mp.id, title: pick(titles, i),
          description: 'Personal milestone',
          targetDate: dFromNow(60 + i),
          isAchieved: i % 5 === 0, achievedAt: i % 5 === 0 ? dAgo(3) : null,
        },
      });
    }
    console.log(`   ✓ fitness goals (${memberProfiles.length})`);
  } else console.log('   - fitness goals: already present');

  // ── Nutrition logs ───────────────────────────────────────────────────
  if ((await prisma.nutritionLog.count()) === 0) {
    const meals = [
      { name: 'Oatmeal & berries', type: 'breakfast', calories: 350, protein: 12, carbs: 60, fat: 8 },
      { name: 'Chicken salad', type: 'lunch', calories: 550, protein: 45, carbs: 30, fat: 20 },
      { name: 'Salmon & rice', type: 'dinner', calories: 700, protein: 50, carbs: 80, fat: 22 },
      { name: 'Protein shake', type: 'snack', calories: 200, protein: 25, carbs: 10, fat: 5 },
    ];
    for (let i = 0; i < Math.min(15, memberProfiles.length); i++) {
      const mp = memberProfiles[i];
      for (let d = 0; d < 3; d++) {
        const log = await prisma.nutritionLog.create({
          data: {
            memberId: mp.id, date: dAgo(d),
            calories: 1800 + (i % 5) * 100, proteinG: 110 + (i % 10),
            carbsG: 200 + (i % 20), fatG: 60 + (i % 10),
            waterMl: 2000 + (i % 4) * 250,
          },
        });
        for (const m of meals) await prisma.mealEntry.create({ data: { logId: log.id, ...m } });
      }
    }
    console.log('   ✓ nutrition logs');
  } else console.log('   - nutrition logs: already present');

  // ═══════════════════════════════════════════════════════════════════════
  // NEW MODULES (Batches 1-6)
  // ═══════════════════════════════════════════════════════════════════════

  // ── Lockers ──────────────────────────────────────────────────────────
  if ((await prisma.locker.count({ where: { gymId } })) === 0) {
    const zones = ['Men', 'Women', 'Premium'];
    const sizes = ['small', 'medium', 'large'];
    for (let i = 1; i <= 20; i++) {
      await prisma.locker.create({
        data: {
          gymId, branchId: branch.id,
          code: `L-${String(i).padStart(3, '0')}`,
          zone: pick(zones, i), size: pick(sizes, i),
          hasBluetooth: i % 3 === 0, hasNfc: i % 2 === 0,
        },
      });
    }
    console.log('   ✓ 20 lockers');
  } else console.log('   - lockers: already present');

  // ── Equipment ────────────────────────────────────────────────────────
  if ((await prisma.equipment.count({ where: { gymId } })) === 0) {
    const items = [
      { name: 'Bench Press 1', category: 'rack', slotMinutes: 30 },
      { name: 'Bench Press 2', category: 'rack', slotMinutes: 30 },
      { name: 'Squat Rack 1', category: 'rack', slotMinutes: 45 },
      { name: 'Squat Rack 2', category: 'rack', slotMinutes: 45 },
      { name: 'Treadmill 1', category: 'treadmill', slotMinutes: 30 },
      { name: 'Treadmill 2', category: 'treadmill', slotMinutes: 30 },
      { name: 'Treadmill 3', category: 'treadmill', slotMinutes: 30 },
      { name: 'Spin Bike 1', category: 'bike', slotMinutes: 30 },
      { name: 'Spin Bike 2', category: 'bike', slotMinutes: 30 },
      { name: 'Rower', category: 'rower', slotMinutes: 20 },
      { name: 'Cable Machine', category: 'machine', slotMinutes: 30 },
    ];
    for (let i = 0; i < items.length; i++) {
      await prisma.equipment.create({
        data: { gymId, branchId: branch.id, ...items[i], code: `EQ-${String(i + 1).padStart(3, '0')}` },
      });
    }
    console.log(`   ✓ ${items.length} equipment`);
  } else console.log('   - equipment: already present');

  // ── Activities ───────────────────────────────────────────────────────
  if ((await prisma.activity.count({ where: { gymId } })) === 0) {
    const activities = [
      { title: '30-Day Push-up Challenge', description: 'Build upper body strength', type: 'challenge', rewardPoints: 200, badgeName: 'Push Master', startDate: dAgo(5), endDate: dFromNow(25) },
      { title: '5K Run Tournament', description: 'Run 5km this month', type: 'tournament', rewardPoints: 300, badgeName: 'Runner', startDate: dAgo(2), endDate: dFromNow(28) },
      { title: 'Hydration Habit', description: 'Drink 3L water daily for 14 days', type: 'task', rewardPoints: 100, startDate: dAgo(1), endDate: dFromNow(14) },
    ];
    for (const a of activities) {
      const act = await prisma.activity.create({ data: { gymId, status: 'ACTIVE', ...a } });
      // enroll a few members
      for (let i = 0; i < Math.min(5, memberProfiles.length); i++) {
        await prisma.activityParticipant.create({
          data: { activityId: act.id, userId: memberProfiles[i].userId, progress: (i % 5) * 20 },
        });
      }
    }
    console.log(`   ✓ ${activities.length} activities`);
  } else console.log('   - activities: already present');

  // ── Gym Events ───────────────────────────────────────────────────────
  if ((await prisma.gymEvent.count({ where: { gymId } })) === 0) {
    const events = [
      { title: 'Saturday Bootcamp', description: 'Outdoor HIIT in the park', category: 'bootcamp', location: 'Central Park', startTime: dFromNow(7), endTime: hFromNow(7 * 24 + 2), capacity: 30, price: 0 },
      { title: 'Nutrition Seminar', description: 'Macros made simple', category: 'seminar', location: 'Studio A', startTime: dFromNow(14), endTime: hFromNow(14 * 24 + 1), capacity: 50, price: 10 },
    ];
    for (const e of events) await prisma.gymEvent.create({ data: { gymId, ...e } });
    console.log(`   ✓ ${events.length} gym events`);
  } else console.log('   - gym events: already present');

  // ── Community Groups ─────────────────────────────────────────────────
  if ((await prisma.communityGroup.count({ where: { gymId } })) === 0 && owner) {
    const groups = [
      { name: 'Strength Squad', description: 'Powerlifting & strength training', topics: ['strength', 'powerlifting'], isOfficial: true },
      { name: 'Cardio Crew', description: 'Runners and cyclists', topics: ['running', 'cycling'], isOfficial: true },
      { name: 'Yoga & Mobility', description: 'Flexibility and mindfulness', topics: ['yoga', 'mobility'], isOfficial: false },
    ];
    for (const g of groups) {
      const grp = await prisma.communityGroup.create({ data: { gymId, visibility: 'PUBLIC', ...g } });
      await prisma.groupMember.create({ data: { groupId: grp.id, userId: owner.id, role: 'ADMIN' } });
      for (let i = 0; i < Math.min(4, memberProfiles.length); i++) {
        await prisma.groupMember.create({ data: { groupId: grp.id, userId: memberProfiles[i].userId } });
      }
      await prisma.groupPost.create({
        data: { groupId: grp.id, authorId: owner.id, content: `Welcome to ${g.name}! Share your progress here.`, pinned: true, likes: 5 },
      });
    }
    console.log(`   ✓ ${groups.length} community groups`);
  } else console.log('   - community groups: already present');

  // ── Suppliers + Stock Movements ──────────────────────────────────────
  if ((await prisma.supplier.count({ where: { gymId } })) === 0) {
    const suppliers = [
      { name: 'Optimum Nutrition Inc.', contact: 'Sales Team', email: 'sales@optimum.example', phone: '+1-555-0101' },
      { name: 'Gymshark Apparel', contact: 'Wholesale Dept.', email: 'wholesale@gymshark.example', phone: '+44-20-5550' },
      { name: 'Local Beverages Co.', contact: 'Maria Lopez', email: 'maria@beverages.example', phone: '+34-91-555-0099' },
    ];
    for (const s of suppliers) await prisma.supplier.create({ data: { gymId, ...s } });
    console.log(`   ✓ ${suppliers.length} suppliers`);

    const products = await prisma.product.findMany({ where: { gymId }, take: 10 });
    const moveTypes: Array<'PURCHASE' | 'SALE' | 'ADJUSTMENT'> = ['PURCHASE', 'SALE', 'ADJUSTMENT'];
    for (let i = 0; i < products.length; i++) {
      const t = pick(moveTypes, i);
      await prisma.stockMovement.create({
        data: {
          productId: products[i].id,
          type: t,
          quantity: t === 'SALE' ? -(1 + (i % 3)) : 10 + (i % 5),
          reason: t === 'PURCHASE' ? 'Initial stock' : t === 'SALE' ? 'POS sale' : 'Recount',
        },
      });
    }
    console.log(`   ✓ ${products.length} stock movements`);
  } else console.log('   - suppliers: already present');

  // ── Loyalty Tiers + Rewards ──────────────────────────────────────────
  if ((await prisma.loyaltyTier.count({ where: { gymId } })) === 0) {
    const tiers = [
      { name: 'Bronze', minPoints: 0, multiplier: 1, perks: ['Welcome bonus'], color: '#cd7f32' },
      { name: 'Silver', minPoints: 500, multiplier: 1.2, perks: ['10% off merch', 'Birthday gift'], color: '#c0c0c0' },
      { name: 'Gold', minPoints: 2000, multiplier: 1.5, perks: ['Priority booking', '20% off PT'], color: '#ffd700' },
      { name: 'Platinum', minPoints: 5000, multiplier: 2, perks: ['Free monthly PT', 'VIP events'], color: '#e5e4e2' },
    ];
    for (const t of tiers) await prisma.loyaltyTier.create({ data: { gymId, ...t } });
    console.log(`   ✓ ${tiers.length} loyalty tiers`);
  } else console.log('   - loyalty tiers: already present');

  if ((await prisma.loyaltyReward.count({ where: { gymId } })) === 0) {
    const rewards = [
      { name: 'Free Protein Smoothie', description: 'One smoothie of your choice', costPoints: 100, stock: 50 },
      { name: 'Gym T-Shirt', description: 'Branded merch', costPoints: 300, stock: 20 },
      { name: 'Personal Training Session', description: '1-hour 1:1 with a trainer', costPoints: 500, stock: 10 },
      { name: 'Free Monthly Membership', description: 'One free month', costPoints: 2000, stock: 5 },
    ];
    for (const r of rewards) await prisma.loyaltyReward.create({ data: { gymId, ...r } });
    console.log(`   ✓ ${rewards.length} loyalty rewards`);
  } else console.log('   - loyalty rewards: already present');

  // ── Gift Cards ───────────────────────────────────────────────────────
  if ((await prisma.giftCard.count({ where: { gymId } })) === 0) {
    const codes = ['GIFT-WELCOME-25', 'GIFT-BIRTHDAY-50', 'GIFT-VIP-100'];
    const amounts = [25, 50, 100];
    for (let i = 0; i < codes.length; i++) {
      await prisma.giftCard.create({
        data: { gymId, code: codes[i], amount: amounts[i], balance: amounts[i], status: 'ACTIVE', purchaserId: owner?.id, expiresAt: dFromNow(365) },
      });
    }
    console.log(`   ✓ ${codes.length} gift cards`);
  } else console.log('   - gift cards: already present');

  // ── Marketing Campaigns ──────────────────────────────────────────────
  if ((await prisma.marketingCampaign.count({ where: { gymId } })) === 0) {
    const camps: Array<{ name: string; subject: string; body: string; channel: any; segment: any }> = [
      { name: 'Welcome Email', subject: 'Welcome to GymFlow!', body: 'Thanks for joining us — here is your starter guide.', channel: 'EMAIL', segment: 'NEW_MEMBERS_30D' },
      { name: 'Win-Back SMS', subject: 'We miss you', body: 'Come back this week for a free smoothie!', channel: 'SMS', segment: 'INACTIVE_30D' },
      { name: 'VIP Push', subject: 'Exclusive event', body: 'Platinum members: free workshop next Sat.', channel: 'PUSH', segment: 'HIGH_VALUE' },
    ];
    for (const c of camps) await prisma.marketingCampaign.create({ data: { gymId, status: 'DRAFT', ...c } });
    console.log(`   ✓ ${camps.length} marketing campaigns`);
  } else console.log('   - marketing campaigns: already present');

  // ── Live Classes ─────────────────────────────────────────────────────
  if ((await prisma.liveClass.count({ where: { gymId } })) === 0 && trainerUser) {
    const classes = [
      { title: 'Morning HIIT Live', description: 'High-intensity from your living room', category: 'hiit', startTime: dFromNow(2), endTime: hFromNow(2 * 24 + 1), capacity: 100, streamUrl: 'https://stream.example/hiit' },
      { title: 'Evening Yoga Flow', description: 'Wind down with a guided flow', category: 'yoga', startTime: dFromNow(3), endTime: hFromNow(3 * 24 + 1), capacity: 80, streamUrl: 'https://stream.example/yoga' },
    ];
    for (const c of classes) await prisma.liveClass.create({ data: { gymId, hostId: trainerUser.id, ...c } });
    console.log(`   ✓ ${classes.length} live classes`);
  } else console.log('   - live classes: already present');

  // ── Programs ─────────────────────────────────────────────────────────
  if ((await prisma.program.count({ where: { gymId } })) === 0) {
    const prog = await prisma.program.create({
      data: {
        gymId, authorId: trainerUser?.id ?? owner?.id,
        title: 'Beginner Full-Body 4-Week',
        description: 'Build a base of strength and movement quality',
        goal: 'muscle_gain', level: 'BEGINNER', weeks: 4, isPublished: true,
      },
    });
    const dayTemplates = [
      { title: 'Push Day', content: { blocks: [{ name: 'Bench Press', sets: 4, reps: 8 }, { name: 'Overhead Press', sets: 3, reps: 10 }, { name: 'Push-ups', sets: 3, reps: 'AMRAP' }] } },
      { title: 'Rest', content: { blocks: [{ name: 'Walk', duration: '30min' }] } },
      { title: 'Pull Day', content: { blocks: [{ name: 'Deadlift', sets: 4, reps: 6 }, { name: 'Rows', sets: 3, reps: 10 }, { name: 'Pull-ups', sets: 3, reps: 'AMRAP' }] } },
      { title: 'Mobility', content: { blocks: [{ name: 'Yoga flow', duration: '20min' }] } },
      { title: 'Leg Day', content: { blocks: [{ name: 'Back Squat', sets: 4, reps: 8 }, { name: 'RDL', sets: 3, reps: 10 }, { name: 'Lunges', sets: 3, reps: 12 }] } },
      { title: 'Cardio', content: { blocks: [{ name: 'Run', duration: '25min' }] } },
      { title: 'Rest', content: { blocks: [{ name: 'Stretch', duration: '15min' }] } },
    ];
    for (let w = 1; w <= 4; w++) {
      for (let d = 1; d <= 7; d++) {
        const tpl = dayTemplates[d - 1];
        await prisma.programDay.create({
          data: { programId: prog.id, weekNumber: w, dayNumber: d, title: `W${w} ${tpl.title}`, content: tpl.content },
        });
      }
    }
    // enroll a few members
    for (let i = 0; i < Math.min(3, memberProfiles.length); i++) {
      await prisma.programEnrollment.create({ data: { programId: prog.id, userId: memberProfiles[i].userId } });
    }
    console.log('   ✓ 1 program with 28 days + 3 enrollments');
  } else console.log('   - programs: already present');

  // ── Food Items & Meal Plans ──────────────────────────────────────────
  if ((await prisma.foodItem.count()) === 0) {
    const foods = [
      { name: 'Chicken Breast', category: 'protein', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingG: 100 },
      { name: 'Brown Rice', category: 'grain', calories: 112, protein: 2.6, carbs: 24, fat: 0.9, servingG: 100 },
      { name: 'Oats', category: 'grain', calories: 389, protein: 16.9, carbs: 66, fat: 6.9, servingG: 100 },
      { name: 'Eggs', category: 'protein', calories: 155, protein: 13, carbs: 1.1, fat: 11, servingG: 100 },
      { name: 'Salmon', category: 'protein', calories: 208, protein: 20, carbs: 0, fat: 13, servingG: 100 },
      { name: 'Broccoli', category: 'vegetable', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, servingG: 100 },
      { name: 'Sweet Potato', category: 'grain', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, servingG: 100 },
      { name: 'Greek Yogurt', category: 'dairy', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, servingG: 100 },
      { name: 'Almonds', category: 'fat', calories: 579, protein: 21, carbs: 22, fat: 50, servingG: 100 },
      { name: 'Banana', category: 'fruit', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, servingG: 100 },
      { name: 'Avocado', category: 'fat', calories: 160, protein: 2, carbs: 9, fat: 15, servingG: 100 },
      { name: 'Tuna', category: 'protein', calories: 132, protein: 28, carbs: 0, fat: 1.3, servingG: 100 },
      { name: 'Quinoa', category: 'grain', calories: 120, protein: 4.4, carbs: 21, fat: 1.9, servingG: 100 },
      { name: 'Spinach', category: 'vegetable', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, servingG: 100 },
      { name: 'Whey Protein Scoop', category: 'supplement', calories: 120, protein: 24, carbs: 3, fat: 1.5, servingG: 30 },
      { name: 'Peanut Butter', category: 'fat', calories: 588, protein: 25, carbs: 20, fat: 50, servingG: 100 },
      { name: 'Cottage Cheese', category: 'dairy', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, servingG: 100 },
      { name: 'Apple', category: 'fruit', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, servingG: 100 },
      { name: 'Olive Oil', category: 'fat', calories: 884, protein: 0, carbs: 0, fat: 100, servingG: 100 },
      { name: 'Lentils', category: 'protein', calories: 116, protein: 9, carbs: 20, fat: 0.4, servingG: 100 },
    ];
    for (const f of foods) await prisma.foodItem.create({ data: f });
    console.log(`   ✓ ${foods.length} food items`);
  } else console.log('   - food items: already present');

  if ((await prisma.mealPlan.count({ where: { gymId } })) === 0 && trainerUser && memberProfiles.length > 0) {
    const plan = await prisma.mealPlan.create({
      data: {
        gymId, memberId: memberProfiles[0].userId, authorId: trainerUser.id,
        title: 'Lean Bulk – 2400kcal',
        goal: 'muscle_gain', calories: 2400, proteinG: 180, carbsG: 280, fatG: 70,
      },
    });
    const meals = [
      { type: 'breakfast', name: 'Oats + Whey + Banana', calories: 500, protein: 35, carbs: 70, fat: 10 },
      { type: 'lunch', name: 'Chicken, Rice, Broccoli', calories: 650, protein: 50, carbs: 80, fat: 12 },
      { type: 'dinner', name: 'Salmon, Sweet Potato, Spinach', calories: 700, protein: 45, carbs: 70, fat: 25 },
      { type: 'snack', name: 'Greek Yogurt + Almonds', calories: 350, protein: 25, carbs: 20, fat: 18 },
    ];
    for (let d = 1; d <= 7; d++) {
      const day = await prisma.mealPlanDay.create({ data: { planId: plan.id, dayNumber: d } });
      for (const m of meals) await prisma.mealPlanMeal.create({ data: { dayId: day.id, ...m } });
    }
    console.log('   ✓ 1 meal plan with 7 days × 4 meals');
  } else console.log('   - meal plans: already present');

  // ── AI Insights ──────────────────────────────────────────────────────
  if ((await prisma.aiInsight.count({ where: { gymId } })) === 0) {
    const types: Array<'CHURN_RISK' | 'UPGRADE_PROPENSITY' | 'INACTIVITY' | 'HIGH_ENGAGEMENT' | 'REVENUE_POTENTIAL'> =
      ['CHURN_RISK', 'UPGRADE_PROPENSITY', 'INACTIVITY', 'HIGH_ENGAGEMENT', 'REVENUE_POTENTIAL'];
    const summaries: Record<string, string> = {
      CHURN_RISK: 'Member has not attended in 14+ days and last booking was cancelled',
      UPGRADE_PROPENSITY: 'High attendance frequency suggests upgrade-ready',
      INACTIVITY: 'No check-ins this week',
      HIGH_ENGAGEMENT: 'Top 10% attendance and class bookings',
      REVENUE_POTENTIAL: 'Multiple add-on purchases this month',
    };
    for (let i = 0; i < Math.min(10, memberProfiles.length); i++) {
      const t = pick(types, i);
      await prisma.aiInsight.create({
        data: {
          gymId, userId: memberProfiles[i].userId, type: t,
          score: 50 + ((i * 7) % 50),
          summary: summaries[t],
          details: { generatedBy: 'seed', heuristic: 'rule-based' },
        },
      });
    }
    console.log('   ✓ 10 AI insights');
  } else console.log('   - AI insights: already present');

  // ── Audit logs ───────────────────────────────────────────────────────
  if ((await prisma.auditLog.count({ where: { gymId } })) === 0 && owner) {
    const actions = ['POST /members', 'PATCH /memberships/:id', 'POST /payments', 'POST /attendance', 'DELETE /bookings/:id', 'POST /classes'];
    const entities = ['Member', 'Membership', 'Payment', 'Attendance', 'Booking', 'Class'];
    for (let i = 0; i < 30; i++) {
      await prisma.auditLog.create({
        data: {
          gymId,
          userId: owner.id,
          action: pick(actions, i), entity: pick(entities, i),
          entityId: `demo-${i}`,
          ipAddress: `192.168.0.${10 + (i % 200)}`,
          userAgent: 'Mozilla/5.0 (demo)',
          createdAt: dAgo(i),
        },
      });
    }
    console.log('   ✓ 30 audit logs');
  } else console.log('   - audit logs: already present');

  console.log('✅  Module seed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
