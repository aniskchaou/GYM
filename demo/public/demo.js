// ==================== DEMO DATA ====================

const DEMO_USERS = {
  owner:     { firstName: 'Alex',   lastName: 'Morgan',  role: 'GYM_OWNER',    email: 'owner@demogym.com',      password: 'Owner@1234' },
  trainer:   { firstName: 'Jordan', lastName: 'Lee',     role: 'TRAINER',       email: 'trainer@demogym.com',    password: 'Trainer@1234' },
  member:    { firstName: 'Sam',    lastName: 'Davis',   role: 'MEMBER',        email: 'member@demogym.com',     password: 'Member@1234' },
  reception: { firstName: 'Casey',  lastName: 'Smith',   role: 'RECEPTIONIST',  email: 'reception@demogym.com',  password: 'Reception@1234' },
  superadmin:{ firstName: 'Chris',  lastName: 'Admin',   role: 'SUPER_ADMIN',   email: 'superadmin@gymflow.com', password: 'Super@1234' },
};

const DEMO_MEMBERS = [
  { id: 1, firstName: 'Oliver',  lastName: 'Brown',   email: 'oliver@demo.com',  memberNumber: 'GF-001', plan: 'Premium', status: 'ACTIVE',   joined: '2024-01-15' },
  { id: 2, firstName: 'Emma',    lastName: 'Wilson',  email: 'emma@demo.com',    memberNumber: 'GF-002', plan: 'Elite',   status: 'ACTIVE',   joined: '2024-02-03' },
  { id: 3, firstName: 'Noah',    lastName: 'Taylor',  email: 'noah@demo.com',    memberNumber: 'GF-003', plan: 'Basic',   status: 'ACTIVE',   joined: '2024-03-20' },
  { id: 4, firstName: 'Ava',     lastName: 'Martinez',email: 'ava@demo.com',     memberNumber: 'GF-004', plan: 'Premium', status: 'EXPIRED',  joined: '2023-11-10' },
  { id: 5, firstName: 'Liam',    lastName: 'Anderson',email: 'liam@demo.com',    memberNumber: 'GF-005', plan: 'Basic',   status: 'ACTIVE',   joined: '2024-04-05' },
  { id: 6, firstName: 'Sophia',  lastName: 'Thomas',  email: 'sophia@demo.com',  memberNumber: 'GF-006', plan: 'Elite',   status: 'ACTIVE',   joined: '2024-04-18' },
  { id: 7, firstName: 'Mason',   lastName: 'Jackson', email: 'mason@demo.com',   memberNumber: 'GF-007', plan: 'Premium', status: 'SUSPENDED',joined: '2023-09-01' },
  { id: 8, firstName: 'Isabella',lastName: 'White',   email: 'isabella@demo.com',memberNumber: 'GF-008', plan: 'Basic',   status: 'ACTIVE',   joined: '2024-05-02' },
  { id: 9, firstName: 'James',   lastName: 'Harris',  email: 'james@demo.com',   memberNumber: 'GF-009', plan: 'Premium', status: 'ACTIVE',   joined: '2024-05-10' },
  { id:10, firstName: 'Charlotte',lastName:'Clark',   email: 'charlotte@demo.com',memberNumber:'GF-010', plan: 'Elite',   status: 'ACTIVE',   joined: '2024-05-22' },
];

const DEMO_CLASSES = [
  { day: 'MONDAY',    name: 'Morning HIIT',     trainer: 'Jordan Lee',  time: '07:00–08:00', capacity: 20, booked: 18, category: 'hiit',     difficulty: 'intermediate' },
  { day: 'MONDAY',    name: 'Yoga Flow',         trainer: 'Maya Patel',  time: '09:00–10:00', capacity: 15, booked: 12, category: 'yoga',     difficulty: 'beginner' },
  { day: 'TUESDAY',   name: 'CrossFit',          trainer: 'Chris Evans', time: '06:30–07:30', capacity: 16, booked: 16, category: 'crossfit', difficulty: 'advanced' },
  { day: 'TUESDAY',   name: 'Pilates Core',      trainer: 'Sofia Ruiz',  time: '10:00–11:00', capacity: 12, booked: 9,  category: 'pilates',  difficulty: 'beginner' },
  { day: 'WEDNESDAY', name: 'Cycling Blast',     trainer: 'Jordan Lee',  time: '07:00–08:00', capacity: 20, booked: 20, category: 'cycling',  difficulty: 'intermediate' },
  { day: 'WEDNESDAY', name: 'Zumba Party',       trainer: 'Maya Patel',  time: '18:00–19:00', capacity: 25, booked: 22, category: 'zumba',   difficulty: 'beginner' },
  { day: 'THURSDAY',  name: 'Strength & Power',  trainer: 'Chris Evans', time: '06:30–07:30', capacity: 14, booked: 11, category: 'strength', difficulty: 'advanced' },
  { day: 'THURSDAY',  name: 'Boxing Basics',     trainer: 'Jordan Lee',  time: '19:00–20:00', capacity: 16, booked: 14, category: 'boxing',   difficulty: 'beginner' },
  { day: 'FRIDAY',    name: 'HIIT Cardio',        trainer: 'Sofia Ruiz',  time: '07:00–08:00', capacity: 20, booked: 17, category: 'hiit',     difficulty: 'intermediate' },
  { day: 'FRIDAY',    name: 'Weekend Yoga',       trainer: 'Maya Patel',  time: '09:00–10:00', capacity: 15, booked: 10, category: 'yoga',     difficulty: 'beginner' },
  { day: 'SATURDAY',  name: 'Full Body Burn',     trainer: 'Chris Evans', time: '10:00–11:30', capacity: 18, booked: 18, category: 'cardio',  difficulty: 'intermediate' },
  { day: 'SUNDAY',    name: 'Recovery & Stretch', trainer: 'Maya Patel',  time: '11:00–12:00', capacity: 20, booked: 8,  category: 'yoga',     difficulty: 'beginner' },
];

const DEMO_PAYMENTS = [
  { id: 'INV-001', member: 'Oliver Brown',   plan: 'Premium', amount: 49, status: 'PAID',    date: '2025-05-01' },
  { id: 'INV-002', member: 'Emma Wilson',    plan: 'Elite',   amount: 89, status: 'PAID',    date: '2025-05-01' },
  { id: 'INV-003', member: 'Noah Taylor',    plan: 'Basic',   amount: 29, status: 'PAID',    date: '2025-05-02' },
  { id: 'INV-004', member: 'Ava Martinez',   plan: 'Premium', amount: 49, status: 'OVERDUE', date: '2025-04-01' },
  { id: 'INV-005', member: 'Liam Anderson',  plan: 'Basic',   amount: 29, status: 'PAID',    date: '2025-05-03' },
  { id: 'INV-006', member: 'Sophia Thomas',  plan: 'Elite',   amount: 89, status: 'PAID',    date: '2025-05-04' },
  { id: 'INV-007', member: 'James Harris',   plan: 'Premium', amount: 49, status: 'PENDING', date: '2025-05-10' },
  { id: 'INV-008', member: 'Charlotte Clark',plan: 'Elite',   amount: 89, status: 'PAID',    date: '2025-05-22' },
];

const DEMO_TRAINERS = [
  { name: 'Jordan Lee',  email: 'jordan@gymflow.com', specialization: 'HIIT, Boxing, Cycling', classes: 4, rating: 4.9, status: 'ACTIVE' },
  { name: 'Maya Patel',  email: 'maya@gymflow.com',   specialization: 'Yoga, Pilates, Stretch', classes: 4, rating: 4.8, status: 'ACTIVE' },
  { name: 'Chris Evans', email: 'chris@gymflow.com',  specialization: 'CrossFit, Strength',     classes: 3, rating: 4.7, status: 'ACTIVE' },
  { name: 'Sofia Ruiz',  email: 'sofia@gymflow.com',  specialization: 'Pilates, Cardio, HIIT',  classes: 2, rating: 4.9, status: 'ACTIVE' },
];

const DEMO_ATTENDANCE = [
  { member: 'Oliver Brown',    time: '07:02', date: '2025-05-30', branch: 'Main Branch' },
  { member: 'Emma Wilson',     time: '07:15', date: '2025-05-30', branch: 'Main Branch' },
  { member: 'Liam Anderson',   time: '08:00', date: '2025-05-30', branch: 'Downtown' },
  { member: 'Sophia Thomas',   time: '09:10', date: '2025-05-30', branch: 'Main Branch' },
  { member: 'James Harris',    time: '09:30', date: '2025-05-30', branch: 'Main Branch' },
  { member: 'Charlotte Clark', time: '10:00', date: '2025-05-30', branch: 'Uptown' },
  { member: 'Noah Taylor',     time: '10:45', date: '2025-05-30', branch: 'Downtown' },
  { member: 'Isabella White',  time: '11:05', date: '2025-05-30', branch: 'Main Branch' },
];

const DEMO_NOTIFICATIONS = [
  { icon: '💳', title: 'Payment received', desc: 'Emma Wilson paid $89 for Elite plan.', time: '2 min ago', unread: true },
  { icon: '👤', title: 'New member registered', desc: 'Charlotte Clark joined with Elite plan.', time: '15 min ago', unread: true },
  { icon: '⚠️', title: 'Membership expiring soon', desc: 'Ava Martinez\'s plan expires in 3 days.', time: '1 hr ago', unread: true },
  { icon: '📅', title: 'Class fully booked', desc: 'CrossFit Tuesday 06:30 is at full capacity.', time: '2 hrs ago', unread: false },
  { icon: '🏋️', title: 'New trainer assigned', desc: 'Sofia Ruiz has been assigned to Friday HIIT.', time: '1 day ago', unread: false },
];

const REVENUE_CHART = [
  { month: 'Dec', revenue: 18400 },
  { month: 'Jan', revenue: 22100 },
  { month: 'Feb', revenue: 21300 },
  { month: 'Mar', revenue: 25800 },
  { month: 'Apr', revenue: 24200 },
  { month: 'May', revenue: 28400 },
];

const MEMBER_GROWTH_CHART = [
  { month: 'Dec', members: 95 },
  { month: 'Jan', members: 102 },
  { month: 'Feb', members: 108 },
  { month: 'Mar', members: 113 },
  { month: 'Apr', members: 118 },
  { month: 'May', members: 124 },
];

const DEMO_BRANCHES = [
  { id:1, name:'Main Branch',  address:'42 Fitness Ave',  city:'London', phone:'+44 20 1234 5678', email:'main@gymflow.com',     capacity:200, members:85, status:'ACTIVE' },
  { id:2, name:'Downtown',     address:'10 City Walk',    city:'London', phone:'+44 20 9876 5432', email:'downtown@gymflow.com', capacity:150, members:52, status:'ACTIVE' },
  { id:3, name:'Uptown',       address:'77 North Street', city:'London', phone:'+44 20 1111 2222', email:'uptown@gymflow.com',   capacity:100, members:31, status:'ACTIVE' },
];

const DEMO_MEMBERSHIP_PLANS = [
  { id:1, name:'Basic',          type:'MONTHLY',  price:29,  durationDays:30,  members:38, features:['Open gym access','Locker room','Free Wi-Fi','Mobile app'] },
  { id:2, name:'Premium',        type:'MONTHLY',  price:49,  durationDays:30,  members:54, features:['Everything in Basic','Group classes','Trainer access','Nutrition plans','2 guest passes/mo'] },
  { id:3, name:'Elite',          type:'MONTHLY',  price:89,  durationDays:30,  members:22, features:['Everything in Premium','1-on-1 PT (4×/mo)','AI diet & program','Recovery zone','Unlimited guests'] },
  { id:4, name:'Annual Premium', type:'ANNUAL',   price:499, durationDays:365, members:10, features:['All Premium features','2 months free','Priority booking'] },
];

const DEMO_WORKOUTS = [
  { id:1, name:'Full Body Blast',    category:'STRENGTH',    difficulty:'INTERMEDIATE', duration:45, exercises:8,  description:'A balanced full-body workout targeting all major muscle groups.' },
  { id:2, name:'HIIT Burn',          category:'HIIT',        difficulty:'ADVANCED',     duration:30, exercises:6,  description:'High-intensity intervals to torch calories and boost metabolism.' },
  { id:3, name:'Yoga Flow',          category:'YOGA',        difficulty:'BEGINNER',     duration:60, exercises:12, description:'Gentle yoga sequences to improve flexibility and reduce stress.' },
  { id:4, name:'Core Power',         category:'CORE',        difficulty:'INTERMEDIATE', duration:25, exercises:7,  description:'Targeted core exercises for stability and strength.' },
  { id:5, name:'Cardio Endurance',   category:'CARDIO',      difficulty:'BEGINNER',     duration:40, exercises:5,  description:'Steady-state cardio to build aerobic base and stamina.' },
  { id:6, name:'Upper Body Pump',    category:'STRENGTH',    difficulty:'ADVANCED',     duration:50, exercises:9,  description:'Chest, shoulders, back and arms hypertrophy program.' },
  { id:7, name:'Pilates Basics',     category:'PILATES',     difficulty:'BEGINNER',     duration:45, exercises:10, description:'Introduction to Pilates principles and foundational movements.' },
  { id:8, name:'Leg Day',            category:'STRENGTH',    difficulty:'INTERMEDIATE', duration:55, exercises:8,  description:'Comprehensive lower body workout for strength and size.' },
  { id:9, name:'Boxing Circuit',     category:'HIIT',        difficulty:'INTERMEDIATE', duration:35, exercises:6,  description:'Boxing-inspired circuit training for power and coordination.' },
];

const DEMO_EVENTS = [
  { id:1, title:'Summer Fitness Challenge', description:'A 4-week transformation challenge with prizes.',        start:'Jun 1 – Jun 28', capacity:50, registered:32, status:'UPCOMING' },
  { id:2, title:'Nutrition Workshop',       description:'Meal prep, macros and supplements with our experts.',   start:'Jun 5 · 14:00',  capacity:30, registered:28, status:'UPCOMING' },
  { id:3, title:'CrossFit Open Qualifier',  description:'Local qualifier for the CrossFit Open season.',         start:'May 25 · 10:00', capacity:40, registered:40, status:'COMPLETED' },
  { id:4, title:'Yoga & Mindfulness Day',   description:'Full day of yoga, meditation and breathing workshops.', start:'Jun 15 · 08:00', capacity:60, registered:18, status:'UPCOMING' },
  { id:5, title:'Partner WOD Competition',  description:'Team-based workout competition open to all members.',   start:'Jun 22 · 09:00', capacity:32, registered:12, status:'UPCOMING' },
];

const DEMO_PT_SESSIONS = [
  { id:1, trainer:'Jordan Lee',  member:'Oliver Brown',    date:'2025-05-30', time:'09:00 – 10:00', branch:'Main Branch', status:'SCHEDULED', notes:'Squat form & deadlift technique' },
  { id:2, trainer:'Chris Evans', member:'Emma Wilson',     date:'2025-05-30', time:'11:00 – 12:00', branch:'Downtown',    status:'COMPLETED', notes:'Upper body strength session' },
  { id:3, trainer:'Jordan Lee',  member:'Liam Anderson',   date:'2025-05-31', time:'08:00 – 09:00', branch:'Main Branch', status:'SCHEDULED', notes:'Cardio and conditioning' },
  { id:4, trainer:'Sofia Ruiz',  member:'Sophia Thomas',   date:'2025-05-31', time:'14:00 – 15:00', branch:'Main Branch', status:'SCHEDULED', notes:'Pilates assessment' },
  { id:5, trainer:'Maya Patel',  member:'Charlotte Clark', date:'2025-06-01', time:'10:00 – 11:00', branch:'Uptown',      status:'SCHEDULED', notes:'Yoga for beginners' },
  { id:6, trainer:'Chris Evans', member:'James Harris',    date:'2025-06-02', time:'07:00 – 08:00', branch:'Downtown',    status:'SCHEDULED', notes:'Olympic lifting basics' },
];

const DEMO_PROGRAMS = [
  { id:1, name:'12-Week Transformation',    description:'Complete body transformation combining strength, cardio and nutrition.',  weeks:12, level:'Intermediate', enrolled:24, trainer:'Jordan Lee',  category:'Transformation' },
  { id:2, name:'Beginner Fitness Foundation',description:'Perfect starting point. Learn the basics and build lasting habits.',     weeks:6,  level:'Beginner',     enrolled:38, trainer:'Maya Patel',  category:'Beginner' },
  { id:3, name:'Athletic Performance',      description:'Sport-specific training for athletes looking to improve performance.',    weeks:8,  level:'Advanced',     enrolled:12, trainer:'Chris Evans', category:'Athletic' },
  { id:4, name:'Strength & Power',          description:'Progressive overload focused on squat, bench and deadlift.',             weeks:10, level:'Intermediate', enrolled:18, trainer:'Jordan Lee',  category:'Strength' },
  { id:5, name:'Mind & Body Wellness',      description:'Yoga, meditation and mindfulness combined with light movement.',          weeks:8,  level:'Beginner',     enrolled:31, trainer:'Maya Patel',  category:'Wellness' },
  { id:6, name:'HIIT Elite Program',        description:'High-intensity interval training for rapid fat loss and conditioning.',   weeks:6,  level:'Advanced',     enrolled:15, trainer:'Sofia Ruiz',  category:'HIIT' },
];

const DEMO_EQUIPMENT = [
  { id:1, name:'Treadmill Pro 3000',    category:'Cardio',     branch:'Main Branch', qty:12, status:'OPERATIONAL', lastService:'2025-04-15' },
  { id:2, name:'Olympic Barbell',       category:'Strength',   branch:'Main Branch', qty:20, status:'OPERATIONAL', lastService:'2025-03-01' },
  { id:3, name:'Dumbbell Set (5–50kg)', category:'Strength',   branch:'Main Branch', qty:8,  status:'OPERATIONAL', lastService:'2025-04-01' },
  { id:4, name:'Rowing Machine',        category:'Cardio',     branch:'Downtown',    qty:6,  status:'OPERATIONAL', lastService:'2025-04-20' },
  { id:5, name:'Spin Bike',             category:'Cardio',     branch:'Downtown',    qty:20, status:'MAINTENANCE', lastService:'2025-05-10' },
  { id:6, name:'Cable Machine',         category:'Strength',   branch:'Uptown',      qty:4,  status:'OPERATIONAL', lastService:'2025-02-28' },
  { id:7, name:'Squat Rack',            category:'Strength',   branch:'Main Branch', qty:6,  status:'OPERATIONAL', lastService:'2025-03-15' },
  { id:8, name:'Kettlebell Set',        category:'Functional', branch:'Uptown',      qty:5,  status:'OPERATIONAL', lastService:'2025-04-10' },
];

const DEMO_COUPONS = [
  { id:1, code:'SUMMER25',  discount:25, type:'PERCENTAGE', plan:'All plans', uses:45,  maxUses:100, expires:'2025-08-31', status:'ACTIVE' },
  { id:2, code:'NEWMEMBER', discount:20, type:'FIXED',      plan:'Premium',   uses:28,  maxUses:50,  expires:'2025-12-31', status:'ACTIVE' },
  { id:3, code:'FRIEND10',  discount:10, type:'PERCENTAGE', plan:'All plans', uses:15,  maxUses:200, expires:'2025-06-30', status:'ACTIVE' },
  { id:4, code:'WINTER50',  discount:50, type:'FIXED',      plan:'Annual',    uses:50,  maxUses:50,  expires:'2025-01-31', status:'EXPIRED' },
];

const DEMO_LOYALTY = {
  points:1240, tier:'Gold', nextTier:'Platinum', pointsToNext:760,
  history:[
    { action:'Class attended',            points:+50,  date:'2025-05-30' },
    { action:'PT Session completed',      points:+100, date:'2025-05-28' },
    { action:'Monthly check-in streak',   points:+200, date:'2025-05-25' },
    { action:'Referred a friend',         points:+150, date:'2025-05-20' },
    { action:'Redeemed: Free class pass', points:-200, date:'2025-05-15' },
  ],
  rewards:[
    { name:'Free Class Pass', points:200,  icon:'🎟️' },
    { name:'Protein Shake',   points:150,  icon:'🥤' },
    { name:'PT Session',      points:500,  icon:'💪' },
    { name:'1 Month Free',    points:2000, icon:'🎁' },
  ],
};

const DEMO_NUTRITION = {
  calories:{ target:2200, consumed:1840 },
  macros:{ protein:{target:180,consumed:155}, carbs:{target:250,consumed:220}, fat:{target:70,consumed:58} },
  meals:[
    { name:'Breakfast',    items:['Oatmeal with berries','Greek yogurt','Black coffee'],          calories:420, time:'07:30' },
    { name:'Lunch',        items:['Grilled chicken breast','Brown rice','Steamed broccoli'],       calories:680, time:'12:30' },
    { name:'Pre-workout',  items:['Banana','Whey protein shake'],                                 calories:280, time:'16:00' },
    { name:'Dinner',       items:['Salmon fillet','Quinoa','Mixed salad'],                        calories:460, time:'19:30' },
  ],
};

const DEMO_LIVE_CLASSES = [
  { id:1, name:'Morning HIIT Live',    trainer:'Jordan Lee',  time:'07:00', duration:'45 min', viewers:24,  status:'LIVE' },
  { id:2, name:'Yoga Basics',          trainer:'Maya Patel',  time:'09:00', duration:'60 min', viewers:0,   status:'UPCOMING' },
  { id:3, name:'Upper Body Strength',  trainer:'Chris Evans', time:'17:00', duration:'50 min', viewers:0,   status:'UPCOMING' },
  { id:4, name:'Friday HIIT Session',  trainer:'Sofia Ruiz',  time:'',      duration:'35 min', viewers:156, status:'RECORDED' },
  { id:5, name:'Pilates Core',         trainer:'Sofia Ruiz',  time:'',      duration:'40 min', viewers:89,  status:'RECORDED' },
];

const DEMO_ACTIVITIES = [
  { action:'New member registered',         user:'Charlotte Clark',       time:'10 min ago',  type:'member' },
  { action:'Payment received $89',          user:'Emma Wilson',           time:'25 min ago',  type:'payment' },
  { action:'Class booked: CrossFit',        user:'Oliver Brown',          time:'1 hr ago',    type:'booking' },
  { action:'Membership plan updated',       user:'Admin (Alex Morgan)',   time:'2 hrs ago',   type:'admin' },
  { action:'New trainer added: Sofia Ruiz', user:'Admin (Alex Morgan)',   time:'3 hrs ago',   type:'admin' },
  { action:'Check-in via QR',              user:'Liam Anderson',         time:'4 hrs ago',   type:'attendance' },
  { action:'Coupon SUMMER25 created',       user:'Admin (Alex Morgan)',   time:'1 day ago',   type:'admin' },
  { action:'Branch Uptown created',         user:'Admin (Alex Morgan)',   time:'2 days ago',  type:'admin' },
];

const DEMO_GROUPS = [
  { id:1, name:'VIP Elite Members',       description:'High-value members with Elite plan',          members:22 },
  { id:2, name:'New Member Onboarding',   description:'Members who joined in the last 30 days',      members:6  },
  { id:3, name:'CrossFit Enthusiasts',    description:'Regular CrossFit class attendees',             members:16 },
  { id:4, name:'Corporate Accounts',      description:'Corporate partnership members',                members:34 },
];

const DEMO_ACCESS = [
  { member:'Oliver Brown',    memberNumber:'GF-001', accessType:'QR Code', level:'All Areas',    status:'ACTIVE',    lastEntry:'07:02 today' },
  { member:'Emma Wilson',     memberNumber:'GF-002', accessType:'RFID',    level:'All Areas',    status:'ACTIVE',    lastEntry:'07:15 today' },
  { member:'Mason Jackson',   memberNumber:'GF-007', accessType:'QR Code', level:'Restricted',   status:'SUSPENDED', lastEntry:'2025-04-12' },
  { member:'Ava Martinez',    memberNumber:'GF-004', accessType:'RFID',    level:'Basic Areas',  status:'EXPIRED',   lastEntry:'2025-04-01' },
];

const DEMO_POS_SALES = [
  { item:'Day Pass',           member:'Walk-in',        amount:15, time:'09:15', method:'Card' },
  { item:'Protein Shake',      member:'Oliver Brown',   amount:8,  time:'09:30', method:'Cash' },
  { item:'Monthly Premium',    member:'New Sign-up',    amount:49, time:'10:00', method:'Card' },
  { item:'PT Session (60 min)',member:'Isabella White', amount:65, time:'10:45', method:'Card' },
  { item:'Gym T-Shirt',        member:'James Harris',   amount:25, time:'11:10', method:'Cash' },
];

const DEMO_POS_PRODUCTS = [
  { name:'Day Pass',            price:15, category:'Access'       },
  { name:'Protein Shake',       price:8,  category:'Supplements'  },
  { name:'Gym T-Shirt',         price:25, category:'Merchandise'  },
  { name:'PT Session (60 min)', price:65, category:'Services'     },
  { name:'Guest Pass',          price:12, category:'Access'       },
  { name:'Gym Bag',             price:35, category:'Merchandise'  },
];

const DEMO_INVENTORY = [
  { name:'Protein Shake Mix (1kg)', category:'Supplements', stock:45, reorder:20, price:45, supplier:'NutraFit Ltd' },
  { name:'Gym T-Shirt (S/M/L)',     category:'Merchandise', stock:78, reorder:30, price:25, supplier:'SportWear Co' },
  { name:'Yoga Mat',                category:'Equipment',   stock:12, reorder:10, price:22, supplier:'FitGear Supply' },
  { name:'Resistance Band Set',     category:'Equipment',   stock:8,  reorder:15, price:18, supplier:'FitGear Supply' },
  { name:'Gym Bag',                 category:'Merchandise', stock:34, reorder:15, price:35, supplier:'SportWear Co' },
  { name:'Pre-workout Powder',      category:'Supplements', stock:22, reorder:20, price:38, supplier:'NutraFit Ltd' },
];

const DEMO_LOCKERS = [
  { id:'A01', member:'Oliver Brown',  size:'Standard', expires:'2025-06-01', status:'OCCUPIED'   },
  { id:'A02', member:null,            size:'Standard', expires:null,         status:'AVAILABLE'  },
  { id:'A03', member:'Emma Wilson',   size:'Large',    expires:'2025-07-01', status:'OCCUPIED'   },
  { id:'A04', member:null,            size:'Standard', expires:null,         status:'MAINTENANCE' },
  { id:'A05', member:'James Harris',  size:'Standard', expires:'2025-05-31', status:'OCCUPIED'   },
  { id:'B01', member:null,            size:'Large',    expires:null,         status:'AVAILABLE'  },
  { id:'B02', member:'Sophia Thomas', size:'Standard', expires:'2025-06-15', status:'OCCUPIED'   },
  { id:'B03', member:null,            size:'Standard', expires:null,         status:'AVAILABLE'  },
];

const DEMO_MARKETING_CAMPAIGNS = [
  { name:'Summer Sale 2025',       type:'Email',   target:'All Members',      sent:124, opens:89, clicks:45, status:'SENT'  },
  { name:'New Class Announcement', type:'Push',    target:'Premium Members',  sent:76,  opens:62, clicks:38, status:'SENT'  },
  { name:'Re-engagement Drive',    type:'Email',   target:'Inactive Members', sent:0,   opens:0,  clicks:0,  status:'DRAFT' },
  { name:'Referral Reward Promo',  type:'SMS',     target:'All Members',      sent:124, opens:90, clicks:52, status:'SENT'  },
];

const DEMO_BOOKINGS = [
  { id:1, cls:'Morning HIIT',    day:'Monday',    time:'07:00–08:00', trainer:'Jordan Lee',  status:'CONFIRMED', date:'2025-06-02' },
  { id:2, cls:'Cycling Blast',   day:'Wednesday', time:'07:00–08:00', trainer:'Jordan Lee',  status:'CONFIRMED', date:'2025-06-04' },
  { id:3, cls:'Yoga Flow',       day:'Friday',    time:'09:00–10:00', trainer:'Maya Patel',  status:'WAITLISTED',date:'2025-06-06' },
  { id:4, cls:'CrossFit',        day:'Tuesday',   time:'06:30–07:30', trainer:'Chris Evans', status:'CANCELLED', date:'2025-05-28' },
  { id:5, cls:'Full Body Burn',  day:'Saturday',  time:'10:00–11:30', trainer:'Chris Evans', status:'ATTENDED',  date:'2025-05-24' },
];

const DEMO_AI_DIET = {
  calories:2100, protein:175, carbs:225, fat:65,
  meals:[
    { name:'Breakfast',     foods:['Oats (80g)','Banana','Skim milk (200ml)','Almonds (15g)'],                   calories:490, protein:18 },
    { name:'Morning Snack', foods:['Greek yogurt (150g)','Blueberries (80g)'],                                   calories:165, protein:15 },
    { name:'Lunch',         foods:['Grilled chicken (200g)','Brown rice (150g)','Broccoli (100g)','Olive oil'],  calories:620, protein:52 },
    { name:'Pre-Workout',   foods:['Banana','Whey protein shake'],                                               calories:280, protein:30 },
    { name:'Dinner',        foods:['Salmon fillet (180g)','Sweet potato (200g)','Mixed greens','Lemon dressing'],calories:545, protein:40 },
  ],
};

const DEMO_AI_INSIGHTS = [
  { icon:'📈', type:'positive', title:'Revenue Trend',    text:'Monthly revenue hit $28,400 — highest ever. Elite plan upgrades drove 42% of the increase.' },
  { icon:'⚠️', type:'warning',  title:'Churn Risk',       text:'14 members have not checked in for 3+ weeks. Consider a re-engagement email campaign.' },
  { icon:'💡', type:'info',     title:'Peak Hours',       text:'Busiest times are 7–9am and 5–7pm on weekdays. Adding an extra morning class could reduce overcrowding.' },
  { icon:'🏆', type:'positive', title:'Top Performer',    text:'Jordan Lee has the highest trainer rating (4.9) and lowest class cancellation rate — great for retention.' },
  { icon:'💡', type:'info',     title:'Upsell Opportunity',text:'38 Basic plan members attend 4+ classes/week — ideal candidates for Premium upgrades.' },
  { icon:'⚠️', type:'warning',  title:'Capacity Issue',   text:'CrossFit Tuesday and Cycling Wednesday are consistently at full capacity. A second slot could increase revenue.' },
];

const DEMO_GIFT_CARDS = [
  { code:'GC-XK92F', value:100, remaining:100, purchasedBy:'Emma Wilson',    recipient:'Gift',         date:'2025-05-20', status:'ACTIVE' },
  { code:'GC-TL44P', value:50,  remaining:32,  purchasedBy:'Oliver Brown',   recipient:'Gift',         date:'2025-04-15', status:'ACTIVE' },
  { code:'GC-WQ71A', value:200, remaining:0,   purchasedBy:'Charlotte Clark', recipient:'Gift',        date:'2025-03-01', status:'REDEEMED' },
  { code:'GC-MN55Z', value:75,  remaining:75,  purchasedBy:'Admin Promo',    recipient:'Competition winner', date:'2025-05-28', status:'ACTIVE' },
];

// ==================== STATE ====================
let currentUser = null;
let currentSub = 'owner';
let revenueChartInst = null;
let memberChartInst = null;

// ==================== ROUTING ====================
function navigate(page, sub) {
  document.querySelectorAll('[data-page]').forEach(el => el.classList.remove('active'));
  const el = document.querySelector(`[data-page="${page}"]`);
  if (el) { el.classList.add('active'); window.scrollTo(0, 0); }
  if (page === 'dashboard') renderDashboard();
  if (page === 'public') {
    window.scrollTo(0, 0);
    renderPublicPage(sub || 'about');
  }
}

// ==================== LOGIN ====================
function demoLogin(role) {
  currentUser = DEMO_USERS[role];
  navigate('dashboard');
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  const user = Object.values(DEMO_USERS).find(u => u.email.toLowerCase() === email);
  if (!user || user.password !== password) {
    errEl.textContent = 'Invalid email or password. Try a demo account above.';
    errEl.classList.remove('hidden');
    return;
  }
  errEl.classList.add('hidden');
  currentUser = user;
  navigate('dashboard');
}

// ==================== SIDEBAR ====================
const NAV_ITEMS = [
  // ── Gym Owner / Branch Manager (mirrors sidebar.tsx exactly) ─────────────
  { label:'Dashboard',       sub:'owner',            icon:'🏠', roles:['GYM_OWNER','BRANCH_MANAGER'] },
  { label:'My Gyms',         sub:'my-gyms',          icon:'🏢', roles:['GYM_OWNER'] },
  { label:'Members',         sub:'members',          icon:'👥', roles:['GYM_OWNER','BRANCH_MANAGER'] },
  { label:'Approvals',       sub:'approvals',        icon:'✔️', roles:['GYM_OWNER','BRANCH_MANAGER'] },
  { label:'Staff',           sub:'staff',            icon:'👔', roles:['GYM_OWNER','BRANCH_MANAGER'] },
  { label:'Attendance',      sub:'attendance',       icon:'✅', roles:['GYM_OWNER','BRANCH_MANAGER'] },
  { label:'Classes',         sub:'classes',          icon:'📅', roles:['GYM_OWNER','BRANCH_MANAGER'] },
  { label:'Trainers',        sub:'trainers',         icon:'🏋️', roles:['GYM_OWNER','BRANCH_MANAGER'] },
  { label:'Memberships',     sub:'memberships',      icon:'💎', roles:['GYM_OWNER','BRANCH_MANAGER'] },
  { label:'Payments',        sub:'payments',         icon:'💳', roles:['GYM_OWNER','BRANCH_MANAGER'] },
  { label:'Payroll',         sub:'payroll',          icon:'💰', roles:['GYM_OWNER','BRANCH_MANAGER'] },
  { label:'Schedule',        sub:'schedule',         icon:'🗓️', roles:['GYM_OWNER','BRANCH_MANAGER'] },
  { label:'Analytics',       sub:'reports',          icon:'📊', roles:['GYM_OWNER','BRANCH_MANAGER'] },
  { label:'Branches',        sub:'branches',         icon:'🌐', roles:['GYM_OWNER'] },
  { label:'Equipment',       sub:'equipment',        icon:'⚙️', roles:['GYM_OWNER','BRANCH_MANAGER'] },
  { label:'Maintenance',     sub:'maintenance',      icon:'🔧', roles:['GYM_OWNER','BRANCH_MANAGER'] },
  { label:'Inventory',       sub:'inventory',        icon:'📦', roles:['GYM_OWNER','BRANCH_MANAGER'] },
  { label:'Access Control',  sub:'access',           icon:'🔐', roles:['GYM_OWNER','BRANCH_MANAGER'] },
  { label:'Complaints',      sub:'complaints',       icon:'💬', roles:['GYM_OWNER','BRANCH_MANAGER'] },
  { label:'Leads',           sub:'leads',            icon:'📈', roles:['GYM_OWNER','BRANCH_MANAGER'] },
  { label:'Policies',        sub:'policies',         icon:'🛡️', roles:['GYM_OWNER'] },
  { label:'My Workouts',     sub:'workouts',         icon:'💪', roles:['GYM_OWNER','BRANCH_MANAGER'] },
  { label:'Notifications',   sub:'notifications',    icon:'🔔', roles:['GYM_OWNER','BRANCH_MANAGER'] },
  { label:'Settings',        sub:'settings',         icon:'⚙️', roles:['GYM_OWNER','BRANCH_MANAGER'] },

  // ── Receptionist ──────────────────────────────────────────────────────────
  { label:'Dashboard',        sub:'reception',        icon:'🏠', roles:['RECEPTIONIST'] },
  { label:'Check-in',         sub:'attendance',       icon:'✅', roles:['RECEPTIONIST'] },
  { label:'Visitors',         sub:'visitors',         icon:'🚪', roles:['RECEPTIONIST'] },
  { label:'Register Member',  sub:'register-member',  icon:'➕', roles:['RECEPTIONIST'] },
  { label:'Members',          sub:'members',          icon:'👥', roles:['RECEPTIONIST'] },
  { label:'Approvals',        sub:'approvals',        icon:'✔️', roles:['RECEPTIONIST'] },
  { label:'Memberships',      sub:'memberships',      icon:'💎', roles:['RECEPTIONIST'] },
  { label:'Classes',          sub:'classes',          icon:'📅', roles:['RECEPTIONIST'] },
  { label:'Collect Payment',  sub:'collect-payment',  icon:'💵', roles:['RECEPTIONIST'] },
  { label:'Invoices',         sub:'invoices',         icon:'🧾', roles:['RECEPTIONIST'] },
  { label:'Daily Report',     sub:'daily-report',     icon:'📋', roles:['RECEPTIONIST'] },
  { label:'Complaints',       sub:'complaints',       icon:'💬', roles:['RECEPTIONIST'] },
  { label:'Notifications',    sub:'notifications',    icon:'🔔', roles:['RECEPTIONIST'] },

  // ── Trainer ───────────────────────────────────────────────────────────────
  { label:'Dashboard',       sub:'trainer-home',     icon:'🏠', roles:['TRAINER'] },
  { label:'My Clients',      sub:'trainer-clients',  icon:'👥', roles:['TRAINER'] },
  { label:'PT Sessions',     sub:'pt-sessions',      icon:'🤝', roles:['TRAINER'] },
  { label:'Workout Plans',   sub:'workout-plans',    icon:'📋', roles:['TRAINER'] },
  { label:'Assessments',     sub:'assessments',      icon:'📝', roles:['TRAINER'] },
  { label:'Progress',        sub:'trainer-progress', icon:'📈', roles:['TRAINER'] },
  { label:'Classes',         sub:'classes',          icon:'📅', roles:['TRAINER'] },
  { label:'Attendance',      sub:'attendance',       icon:'✅', roles:['TRAINER'] },
  { label:'Messages',        sub:'messages',         icon:'💬', roles:['TRAINER'] },
  { label:'My Workouts',     sub:'workouts',         icon:'💪', roles:['TRAINER'] },
  { label:'Notifications',   sub:'notifications',    icon:'🔔', roles:['TRAINER'] },

  // ── Member ────────────────────────────────────────────────────────────────
  { label:'Dashboard',       sub:'member-home',      icon:'🏠', roles:['MEMBER'] },
  { label:'My Profile',      sub:'member-profile',   icon:'👤', roles:['MEMBER'] },
  { label:'My Membership',   sub:'my-membership',    icon:'💎', roles:['MEMBER'] },
  { label:'My Progress',     sub:'member-progress',  icon:'📈', roles:['MEMBER'] },
  { label:'Book Classes',    sub:'bookings',         icon:'📆', roles:['MEMBER'] },
  { label:'Classes',         sub:'classes',          icon:'📅', roles:['MEMBER'] },
  { label:'Workout Plans',   sub:'workout-plans',    icon:'📋', roles:['MEMBER'] },
  { label:'Diet Plans',      sub:'ai-diet',          icon:'🥗', roles:['MEMBER'] },
  { label:'My Workouts',     sub:'workouts',         icon:'💪', roles:['MEMBER'] },
  { label:'My Invoices',     sub:'member-invoices',  icon:'🧾', roles:['MEMBER'] },
  { label:'Messages',        sub:'messages',         icon:'💬', roles:['MEMBER'] },
  { label:'Feedback',        sub:'member-feedback',  icon:'⭐', roles:['MEMBER'] },
  { label:'Notifications',   sub:'notifications',    icon:'🔔', roles:['MEMBER'] },

  // ── Super Admin ───────────────────────────────────────────────────────────
  { label:'All Users',       sub:'sa-users',         icon:'👤', roles:['SUPER_ADMIN'] },
  { label:'All Gyms',        sub:'sa-gyms',          icon:'🏢', roles:['SUPER_ADMIN'] },
  { label:'Subscriptions',   sub:'sa-subscriptions', icon:'💎', roles:['SUPER_ADMIN'] },
  { label:'Audit Log',       sub:'audit',            icon:'📋', roles:['SUPER_ADMIN'] },
  { label:'System Settings', sub:'settings',         icon:'⚙️', roles:['SUPER_ADMIN'] },
];

function renderSidebar() {
  const nav = document.getElementById('sidebar-nav');
  const visible = NAV_ITEMS.filter(n => n.roles.includes(currentUser.role));
  const seen = new Set();
  nav.innerHTML = visible.filter(n => {
    const key = n.sub;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map(n => `
    <button onclick="showSub('${n.sub}')" data-sub="${n.sub}"
      class="sidebar-link w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors text-left">
      <span>${n.icon}</span>${n.label}
    </button>
  `).join('');

  const userEl = document.getElementById('sidebar-user');
  const initials = currentUser.firstName[0] + currentUser.lastName[0];
  userEl.innerHTML = `
    <div class="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">${initials}</div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-white truncate">${currentUser.firstName} ${currentUser.lastName}</p>
      <p class="text-xs text-slate-400 truncate">${currentUser.role.replace(/_/g,' ')}</p>
    </div>
  `;
}

function showSub(sub) {
  currentSub = sub;
  document.querySelectorAll('.sub-page').forEach(el => el.classList.add('hidden'));
  const el = document.getElementById(`sub-${sub}`);
  if (el) el.classList.remove('hidden');
  // update active link
  document.querySelectorAll('.sidebar-link').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.sub === sub);
  });
  // title
  const titles = {
    'owner':'Owner Dashboard','members':'Members','classes':'Classes','payments':'Payments',
    'attendance':'Attendance','trainers':'Trainers','notifications':'Notifications',
    'member-home':'Member Dashboard','trainer-home':'Trainer Dashboard',
    'branches':'Branches','memberships':'Membership Plans','reports':'Analytics & Reports',
    'ai-insights':'AI Insights','programs':'Programs','events':'Gym Events',
    'pt-sessions':'Personal Training','workouts':'Workout Library','live-classes':'Live Classes',
    'equipment':'Equipment','inventory':'Inventory','lockers':'Lockers',
    'groups':'Member Groups','access':'Access Control','loyalty':'Loyalty Program',
    'coupons':'Coupons','gift-cards':'Gift Cards','marketing':'Marketing',
    'audit':'Audit Log','settings':'Settings','bookings':'My Bookings',
    'my-membership':'My Membership','ai-diet':'AI Diet Planner','nutrition':'Nutrition Tracker',
    'pos':'Point of Sale','activities':'Activities','reception':'Reception Dashboard',
    'workout-plans':'Workout Plans',
    'collect-payment':'Collect Payment','visitors':'Visitor Log','daily-report':'Daily Report',
    'trainer-clients':'My Clients','assessments':'Fitness Assessments','messages':'Messages',
    'member-profile':'My Profile','member-progress':'My Progress','member-feedback':'Feedback',
    'member-invoices':'My Invoices',
    'my-gyms':'My Gyms','approvals':'Approvals','staff':'Staff','payroll':'Payroll',
    'schedule':'Schedule','maintenance':'Maintenance','complaints':'Complaints',
    'leads':'Leads','policies':'Policies','register-member':'Register Member',
    'invoices':'Invoices','trainer-progress':'Progress',
    'sa-users':'All Users','sa-gyms':'All Gyms','sa-subscriptions':'Subscriptions',
  };
  document.getElementById('dash-title').textContent = titles[sub] || 'Dashboard';
  renderSubPage(sub);
}

// ==================== DASHBOARD RENDER ====================
function renderDashboard() {
  renderSidebar();
  // topbar avatar
  const initials = currentUser.firstName[0] + currentUser.lastName[0];
  document.getElementById('dash-avatar').textContent = initials;

  // default sub-page
  let defaultSub = 'owner';
  if (currentUser.role === 'TRAINER') defaultSub = 'trainer-home';
  else if (currentUser.role === 'MEMBER') defaultSub = 'member-home';
  else if (currentUser.role === 'RECEPTIONIST') defaultSub = 'reception';
  else if (currentUser.role === 'SUPER_ADMIN') defaultSub = 'sa-users';
  showSub(defaultSub);
}

function renderSubPage(sub) {
  const el = document.getElementById(`sub-${sub}`);
  if (!el) return;
  switch (sub) {
    case 'owner':          renderOwnerDashboard(el); break;
    case 'members':        renderMembers(el);         break;
    case 'classes':        renderClasses(el);         break;
    case 'payments':       renderPayments(el);        break;
    case 'attendance':     renderAttendance(el);      break;
    case 'trainers':       renderTrainers(el);        break;
    case 'notifications':  renderNotifications(el);   break;
    case 'member-home':    renderMemberHome(el);      break;
    case 'trainer-home':   renderTrainerHome(el);     break;
    case 'branches':       renderBranches(el);        break;
    case 'memberships':    renderMemberships(el);     break;
    case 'reports':        renderReports(el);         break;
    case 'ai-insights':    renderAiInsights(el);      break;
    case 'programs':       renderPrograms(el);        break;
    case 'events':         renderEvents(el);          break;
    case 'pt-sessions':    renderPtSessions(el);      break;
    case 'workouts':       renderWorkouts(el);        break;
    case 'live-classes':   renderLiveClasses(el);     break;
    case 'equipment':      renderEquipment(el);       break;
    case 'inventory':      renderInventory(el);       break;
    case 'lockers':        renderLockers(el);         break;
    case 'groups':         renderGroups(el);          break;
    case 'access':         renderAccess(el);          break;
    case 'loyalty':        renderLoyalty(el);         break;
    case 'coupons':        renderCoupons(el);         break;
    case 'gift-cards':     renderGiftCards(el);       break;
    case 'marketing':      renderMarketing(el);       break;
    case 'audit':          renderAudit(el);           break;
    case 'settings':       renderSettings(el);        break;
    case 'bookings':       renderBookings(el);        break;
    case 'my-membership':  renderMyMembership(el);    break;
    case 'ai-diet':        renderAiDiet(el);          break;
    case 'nutrition':      renderNutrition(el);       break;
    case 'pos':            renderPos(el);             break;
    case 'activities':     renderActivities(el);      break;
    case 'reception':      renderReception(el);       break;
    case 'workout-plans':  renderWorkoutPlans(el);    break;
    case 'collect-payment': renderCollectPayment(el); break;
    case 'visitors':       renderVisitors(el);        break;
    case 'daily-report':   renderDailyReport(el);     break;
    case 'trainer-clients': renderTrainerClients(el); break;
    case 'assessments':    renderAssessments(el);     break;
    case 'messages':       renderMessages(el);        break;
    case 'member-profile': renderMemberProfile(el);   break;
    case 'member-progress': renderMemberProgress(el); break;
    case 'member-feedback': renderMemberFeedback(el); break;
    case 'member-invoices': renderMemberInvoices(el); break;
    case 'my-gyms':        renderMyGyms(el);          break;
    case 'approvals':      renderApprovals(el);       break;
    case 'staff':          renderStaff(el);           break;
    case 'payroll':        renderPayroll(el);         break;
    case 'schedule':       renderSchedule(el);        break;
    case 'maintenance':    renderMaintenance(el);     break;
    case 'complaints':     renderComplaints(el);      break;
    case 'leads':          renderLeads(el);           break;
    case 'policies':       renderPolicies(el);        break;
    case 'register-member': renderRegisterMember(el); break;
    case 'invoices':       renderReceptionInvoices(el); break;
    case 'trainer-progress': renderTrainerProgress(el); break;
    case 'sa-users':       renderSuperAdminUsers(el);  break;
    case 'sa-gyms':        renderSuperAdminGyms(el);   break;
    case 'sa-subscriptions': renderSuperAdminSubs(el); break;
  }
}

// ==================== OWNER DASHBOARD ====================
function renderOwnerDashboard(el) {
  el.innerHTML = `
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div class="flex items-start justify-between">
            <div><p class="text-sm text-slate-500 font-medium">Active Members</p><p class="text-2xl font-bold text-slate-800 mt-1">124</p><p class="text-xs text-slate-400 mt-0.5">6 new this month</p></div>
            <div class="p-3 rounded-xl bg-indigo-500 text-white text-lg">👥</div>
          </div>
          <div class="flex items-center gap-1 mt-3 text-xs font-medium text-green-600">↑ 8% vs last month</div>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div class="flex items-start justify-between">
            <div><p class="text-sm text-slate-500 font-medium">Revenue This Month</p><p class="text-2xl font-bold text-slate-800 mt-1">$28,400</p><p class="text-xs text-slate-400 mt-0.5">Total: $148,200</p></div>
            <div class="p-3 rounded-xl bg-green-500 text-white text-lg">💳</div>
          </div>
          <div class="flex items-center gap-1 mt-3 text-xs font-medium text-green-600">↑ 17% vs last month</div>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div class="flex items-start justify-between">
            <div><p class="text-sm text-slate-500 font-medium">Today's Check-ins</p><p class="text-2xl font-bold text-slate-800 mt-1">38</p></div>
            <div class="p-3 rounded-xl bg-blue-500 text-white text-lg">✅</div>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div class="flex items-start justify-between">
            <div><p class="text-sm text-slate-500 font-medium">Churn Rate</p><p class="text-2xl font-bold text-slate-800 mt-1">3.2%</p><p class="text-xs text-slate-400 mt-0.5">8 classes today</p></div>
            <div class="p-3 rounded-xl bg-orange-500 text-white text-lg">📈</div>
          </div>
          <div class="flex items-center gap-1 mt-3 text-xs font-medium text-green-600">↓ 0.5% vs last month</div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 class="font-semibold text-slate-800 mb-4">Revenue — Last 6 months</h3>
          <div style="position:relative;height:200px"><canvas id="revenueChart"></canvas></div>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 class="font-semibold text-slate-800 mb-4">Member Growth</h3>
          <div style="position:relative;height:200px"><canvas id="memberChart"></canvas></div>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 class="font-semibold text-slate-800 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button onclick="showSub('members')" class="rounded-xl p-4 text-center text-sm font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">Add Member</button>
          <button onclick="showSub('attendance')" class="rounded-xl p-4 text-center text-sm font-medium bg-green-50 text-green-600 hover:bg-green-100 transition-colors">Check In</button>
          <button onclick="showSub('classes')" class="rounded-xl p-4 text-center text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">View Classes</button>
          <button onclick="showSub('payments')" class="rounded-xl p-4 text-center text-sm font-medium bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors">Payments</button>
        </div>
      </div>
    </div>
  `;
  renderCharts();
}

function renderCharts() {
  setTimeout(() => {
    const rc = document.getElementById('revenueChart');
    const mc = document.getElementById('memberChart');
    if (!rc || !mc) return;
    if (revenueChartInst) revenueChartInst.destroy();
    if (memberChartInst) memberChartInst.destroy();
    revenueChartInst = new Chart(rc, {
      type: 'line',
      data: {
        labels: REVENUE_CHART.map(d => d.month),
        datasets: [{
          label: 'Revenue ($)',
          data: REVENUE_CHART.map(d => d.revenue),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#6366f1',
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
          y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 11 }, callback: v => '$' + (v/1000).toFixed(0) + 'k' } }
        }
      }
    });
    memberChartInst = new Chart(mc, {
      type: 'bar',
      data: {
        labels: MEMBER_GROWTH_CHART.map(d => d.month),
        datasets: [{
          label: 'Members',
          data: MEMBER_GROWTH_CHART.map(d => d.members),
          backgroundColor: '#6366f1',
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
          y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 11 } }, min: 80 }
        }
      }
    });
  }, 50);
}

// ==================== MEMBERS ====================
function renderMembers(el) {
  const statusColor = { ACTIVE: 'bg-green-100 text-green-700', EXPIRED: 'bg-red-100 text-red-700', SUSPENDED: 'bg-yellow-100 text-yellow-700' };
  el.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Members</h2><p class="text-sm text-slate-500">${DEMO_MEMBERS.length} total members</p></div>
        <button onclick="showAddMemberToast()" class="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          + Add Member
        </button>
      </div>
      <div class="flex gap-3">
        <div class="flex-1 relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input id="member-search" oninput="filterMembers()" placeholder="Search by name, email or member number…"
            class="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"/>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50">
                <th class="text-left px-5 py-3 text-slate-500 font-medium">Member</th>
                <th class="text-left px-5 py-3 text-slate-500 font-medium">Member #</th>
                <th class="text-left px-5 py-3 text-slate-500 font-medium">Plan</th>
                <th class="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
                <th class="text-left px-5 py-3 text-slate-500 font-medium">Joined</th>
                <th class="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody id="members-tbody" class="divide-y divide-slate-50">
              ${DEMO_MEMBERS.map(m => `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">${m.firstName[0]}${m.lastName[0]}</div>
                      <div><p class="font-medium text-slate-800">${m.firstName} ${m.lastName}</p><p class="text-xs text-slate-400">${m.email}</p></div>
                    </div>
                  </td>
                  <td class="px-5 py-4 text-slate-600 font-mono text-xs">${m.memberNumber}</td>
                  <td class="px-5 py-4 text-slate-600">${m.plan}</td>
                  <td class="px-5 py-4"><span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor[m.status] || 'bg-slate-100 text-slate-500'}">${m.status}</span></td>
                  <td class="px-5 py-4 text-slate-500 text-xs">${m.joined}</td>
                  <td class="px-5 py-4 text-right"><button onclick="showDemoToast('Member profile: ${m.firstName} ${m.lastName}')" class="text-indigo-500 hover:text-indigo-400 text-xs font-medium">View →</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function filterMembers() {
  const q = document.getElementById('member-search').value.toLowerCase();
  document.querySelectorAll('#members-tbody tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function showAddMemberToast() { showDemoToast('Add Member form would open here in the full app.'); }

// ==================== CLASSES ====================
function renderClasses(el) {
  const DAY_COLORS = {
    MONDAY:'bg-indigo-50 text-indigo-700 border-indigo-200',
    TUESDAY:'bg-blue-50 text-blue-700 border-blue-200',
    WEDNESDAY:'bg-green-50 text-green-700 border-green-200',
    THURSDAY:'bg-purple-50 text-purple-700 border-purple-200',
    FRIDAY:'bg-orange-50 text-orange-700 border-orange-200',
    SATURDAY:'bg-pink-50 text-pink-700 border-pink-200',
    SUNDAY:'bg-rose-50 text-rose-700 border-rose-200',
  };
  const days = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
  const byDay = {};
  DEMO_CLASSES.forEach(c => { if (!byDay[c.day]) byDay[c.day] = []; byDay[c.day].push(c); });

  el.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Class Schedule</h2><p class="text-sm text-slate-500">${DEMO_CLASSES.length} classes per week</p></div>
        <button onclick="showDemoToast('Add Class form would open here.')" class="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">+ Add Class</button>
      </div>
      ${days.filter(d => byDay[d]).map(day => `
        <div>
          <h3 class="font-semibold text-slate-700 mb-3">${day.charAt(0)+day.slice(1).toLowerCase()}</h3>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            ${byDay[day].map(c => {
              const pct = Math.round((c.booked/c.capacity)*100);
              const full = c.booked >= c.capacity;
              return `
                <div class="bg-white rounded-2xl p-4 border ${DAY_COLORS[day]} shadow-sm">
                  <div class="flex items-start justify-between mb-2">
                    <div>
                      <p class="font-semibold text-slate-800">${c.name}</p>
                      <p class="text-xs text-slate-500 mt-0.5">🕐 ${c.time}</p>
                      <p class="text-xs text-slate-500">🏋️ ${c.trainer}</p>
                    </div>
                    <span class="text-xs px-2 py-0.5 rounded-full ${DAY_COLORS[day]} border font-medium">${c.category}</span>
                  </div>
                  <div class="mt-3">
                    <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>${c.booked}/${c.capacity} booked</span>
                      <span>${full ? '<span class="text-red-500 font-semibold">Full</span>' : pct+'%'}</span>
                    </div>
                    <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full rounded-full ${full ? 'bg-red-400' : 'bg-indigo-400'}" style="width:${pct}%"></div>
                    </div>
                  </div>
                  <button onclick="showDemoToast('Book ${c.name} — ${c.time}')" class="mt-3 w-full text-xs font-medium py-1.5 rounded-lg border border-current transition-colors ${full ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}">${full ? 'Full' : 'Book spot'}</button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ==================== PAYMENTS ====================
function renderPayments(el) {
  const statusColor = { PAID: 'bg-green-100 text-green-700', PENDING: 'bg-yellow-100 text-yellow-700', OVERDUE: 'bg-red-100 text-red-700' };
  const total = DEMO_PAYMENTS.filter(p => p.status === 'PAID').reduce((s,p) => s+p.amount, 0);
  el.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Payments</h2><p class="text-sm text-slate-500">${DEMO_PAYMENTS.length} invoices</p></div>
        <div class="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-sm text-green-700 font-semibold">Collected: $${total}</div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50">
                <th class="text-left px-5 py-3 text-slate-500 font-medium">Invoice</th>
                <th class="text-left px-5 py-3 text-slate-500 font-medium">Member</th>
                <th class="text-left px-5 py-3 text-slate-500 font-medium">Plan</th>
                <th class="text-left px-5 py-3 text-slate-500 font-medium">Amount</th>
                <th class="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
                <th class="text-left px-5 py-3 text-slate-500 font-medium">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              ${DEMO_PAYMENTS.map(p => `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-5 py-4 font-mono text-xs text-slate-600">${p.id}</td>
                  <td class="px-5 py-4 text-slate-800 font-medium">${p.member}</td>
                  <td class="px-5 py-4 text-slate-600">${p.plan}</td>
                  <td class="px-5 py-4 font-semibold text-slate-800">$${p.amount}</td>
                  <td class="px-5 py-4"><span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor[p.status]||''}">${p.status}</span></td>
                  <td class="px-5 py-4 text-slate-500 text-xs">${p.date}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ==================== ATTENDANCE ====================
function renderAttendance(el) {
  el.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Attendance</h2><p class="text-sm text-slate-500">Today — ${DEMO_ATTENDANCE.length} check-ins</p></div>
        <button onclick="showDemoToast('QR / RFID check-in scanner would open here.')" class="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">✅ Check In</button>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-100 bg-slate-50">
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Member</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Time</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Branch</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Date</th>
          </tr></thead>
          <tbody class="divide-y divide-slate-50">
            ${DEMO_ATTENDANCE.map(a => `
              <tr class="hover:bg-slate-50">
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">${a.member.split(' ').map(w=>w[0]).join('')}</div>
                    <span class="font-medium text-slate-800">${a.member}</span>
                  </div>
                </td>
                <td class="px-5 py-4 text-slate-600">${a.time}</td>
                <td class="px-5 py-4 text-slate-600">${a.branch}</td>
                <td class="px-5 py-4 text-slate-500 text-xs">${a.date}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ==================== TRAINERS ====================
function renderTrainers(el) {
  el.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Trainers</h2><p class="text-sm text-slate-500">${DEMO_TRAINERS.length} certified trainers</p></div>
        <button onclick="showDemoToast('Add Trainer form would open here.')" class="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">+ Add Trainer</button>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
        ${DEMO_TRAINERS.map(t => `
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-start gap-4">
            <div class="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white text-lg font-bold shrink-0">
              ${t.name.split(' ').map(w=>w[0]).join('')}
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <p class="font-semibold text-slate-800">${t.name}</p>
                <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">${t.status}</span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">${t.email}</p>
              <p class="text-xs text-slate-600 mt-1.5">🏋️ ${t.specialization}</p>
              <div class="flex items-center gap-4 mt-2 text-xs text-slate-500">
                <span>📅 ${t.classes} classes/wk</span>
                <span>⭐ ${t.rating}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ==================== NOTIFICATIONS ====================
function renderNotifications(el) {
  el.innerHTML = `
    <div class="space-y-4">
      <div><h2 class="text-lg font-semibold text-slate-800">Notifications</h2><p class="text-sm text-slate-500">${DEMO_NOTIFICATIONS.filter(n=>n.unread).length} unread</p></div>
      <div class="space-y-2">
        ${DEMO_NOTIFICATIONS.map(n => `
          <div class="flex items-start gap-4 p-4 bg-white rounded-2xl border ${n.unread ? 'border-indigo-200 bg-indigo-50/40' : 'border-slate-100'} shadow-sm">
            <span class="text-2xl mt-0.5">${n.icon}</span>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <p class="font-semibold text-slate-800 text-sm">${n.title}</p>
                ${n.unread ? '<span class="w-2 h-2 rounded-full bg-indigo-500"></span>' : ''}
              </div>
              <p class="text-xs text-slate-500 mt-0.5">${n.desc}</p>
              <p class="text-xs text-slate-400 mt-1">${n.time}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ==================== MEMBER HOME ====================
function renderMemberHome(el) {
  el.innerHTML = `
    <div class="space-y-6">
      <!-- Digital membership card -->
      <div class="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-indigo-200 text-xs font-semibold uppercase tracking-widest">Digital Membership</p>
            <h2 class="text-2xl font-bold mt-1">${currentUser.firstName} ${currentUser.lastName}</h2>
            <p class="font-mono text-indigo-200 text-sm mt-1">GF-012</p>
          </div>
          <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl">🏋️</div>
        </div>
        <div class="mt-5 flex items-center justify-between">
          <div>
            <p class="text-indigo-200 text-xs">Plan</p>
            <p class="font-semibold">Premium Plan</p>
          </div>
          <div>
            <p class="text-indigo-200 text-xs">Valid Until</p>
            <p class="font-semibold">Jun 17, 2025</p>
          </div>
          <span class="bg-green-400 text-green-900 text-xs font-bold px-3 py-1 rounded-full">ACTIVE</span>
        </div>
      </div>
      <!-- QR code section -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col items-center">
        <h3 class="text-sm font-semibold text-slate-700 mb-3">Your Check-in QR Code</h3>
        <svg width="120" height="120" viewBox="0 0 120 120" class="text-slate-800">
          <!-- Outer finder patterns -->
          <rect x="5" y="5" width="34" height="34" rx="3" fill="none" stroke="currentColor" stroke-width="4"/>
          <rect x="14" y="14" width="16" height="16" fill="currentColor"/>
          <rect x="81" y="5" width="34" height="34" rx="3" fill="none" stroke="currentColor" stroke-width="4"/>
          <rect x="90" y="14" width="16" height="16" fill="currentColor"/>
          <rect x="5" y="81" width="34" height="34" rx="3" fill="none" stroke="currentColor" stroke-width="4"/>
          <rect x="14" y="90" width="16" height="16" fill="currentColor"/>
          <!-- Data modules (mock) -->
          <rect x="48" y="5" width="6" height="6" fill="currentColor"/><rect x="60" y="5" width="6" height="6" fill="currentColor"/>
          <rect x="48" y="17" width="6" height="6" fill="currentColor"/><rect x="66" y="17" width="6" height="6" fill="currentColor"/>
          <rect x="54" y="29" width="6" height="6" fill="currentColor"/><rect x="72" y="29" width="6" height="6" fill="currentColor"/>
          <rect x="48" y="48" width="6" height="6" fill="currentColor"/><rect x="60" y="48" width="6" height="6" fill="currentColor"/><rect x="72" y="48" width="6" height="6" fill="currentColor"/>
          <rect x="54" y="60" width="6" height="6" fill="currentColor"/><rect x="66" y="60" width="6" height="6" fill="currentColor"/>
          <rect x="48" y="72" width="6" height="6" fill="currentColor"/><rect x="72" y="72" width="6" height="6" fill="currentColor"/>
          <rect x="48" y="84" width="6" height="6" fill="currentColor"/><rect x="60" y="84" width="6" height="6" fill="currentColor"/>
          <rect x="54" y="96" width="6" height="6" fill="currentColor"/><rect x="72" y="96" width="6" height="6" fill="currentColor"/>
          <rect x="84" y="48" width="6" height="6" fill="currentColor"/><rect x="96" y="48" width="6" height="6" fill="currentColor"/>
          <rect x="90" y="60" width="6" height="6" fill="currentColor"/><rect x="84" y="72" width="6" height="6" fill="currentColor"/>
          <rect x="96" y="84" width="6" height="6" fill="currentColor"/><rect x="84" y="96" width="6" height="6" fill="currentColor"/>
        </svg>
        <p class="text-xs text-slate-400 mt-2">Show at the front desk to check in</p>
      </div>
      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
          <div class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-2 text-white text-lg">✅</div>
          <p class="text-2xl font-bold text-slate-800">24</p>
          <p class="text-xs text-slate-500 mt-0.5">Check-ins This Month</p>
        </div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
          <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2 text-white text-lg">📅</div>
          <p class="text-2xl font-bold text-slate-800">3</p>
          <p class="text-xs text-slate-500 mt-0.5">Classes Booked</p>
        </div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
          <div class="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-2 text-white text-lg">⏳</div>
          <p class="text-2xl font-bold text-slate-800">18</p>
          <p class="text-xs text-slate-500 mt-0.5">Days Remaining</p>
        </div>
      </div>
      <!-- Upcoming classes -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-semibold text-slate-800">Upcoming Classes</h3>
          <button onclick="showSub('classes')" class="text-xs text-indigo-600 hover:underline">View all</button>
        </div>
        <div class="divide-y divide-slate-50">
          ${DEMO_CLASSES.slice(0,3).map(c => `
            <div class="flex items-center justify-between px-5 py-3">
              <div><p class="text-sm font-medium text-slate-800">${c.name}</p><p class="text-xs text-slate-400">${c.day.charAt(0)+c.day.slice(1).toLowerCase()} · ${c.time} · ${c.trainer}</p></div>
              <button onclick="showDemoToast('Booked: ${c.name}')" class="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 shrink-0">Book</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ==================== TRAINER HOME ====================
function renderTrainerHome(el) {
  const myClasses = DEMO_CLASSES.filter(c => c.trainer.includes(currentUser.firstName));
  const QUICK_ACTIONS = [
    { label:'My Clients',    sub:'trainer-clients',  icon:'👥', color:'bg-blue-500' },
    { label:'PT Sessions',   sub:'pt-sessions',      icon:'🤝', color:'bg-purple-500' },
    { label:'Workout Plans', sub:'workout-plans',    icon:'🏋️', color:'bg-green-500' },
    { label:'Assessments',   sub:'assessments',      icon:'📝', color:'bg-amber-500' },
    { label:'Progress',      sub:'trainer-progress', icon:'📈', color:'bg-indigo-500' },
    { label:'Messages',      sub:'messages',         icon:'💬', color:'bg-rose-500' },
  ];
  el.innerHTML = `
    <div class="space-y-6">
      <!-- Welcome banner -->
      <div class="bg-gradient-to-br from-green-600 to-teal-700 rounded-2xl p-6 text-white">
        <h2 class="text-2xl font-bold">Welcome, ${currentUser.firstName}!</h2>
        <p class="text-green-200 mt-1">Trainer Panel — manage your clients, sessions and programs</p>
      </div>
      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
          <div class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-2 text-white text-lg">📅</div>
          <p class="text-2xl font-bold text-slate-800">${myClasses.length}</p>
          <p class="text-xs text-slate-500 mt-0.5">Classes This Week</p>
        </div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
          <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2 text-white text-lg">👥</div>
          <p class="text-2xl font-bold text-slate-800">8</p>
          <p class="text-xs text-slate-500 mt-0.5">Active Clients</p>
        </div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
          <div class="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-2 text-white text-lg">🤝</div>
          <p class="text-2xl font-bold text-slate-800">3</p>
          <p class="text-xs text-slate-500 mt-0.5">Upcoming Sessions</p>
        </div>
      </div>
      <!-- Quick actions -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h3 class="font-semibold text-slate-800 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          ${QUICK_ACTIONS.map(a => `
            <button onclick="showSub('${a.sub}')" class="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-left">
              <div class="w-8 h-8 ${a.color} rounded-lg flex items-center justify-center shrink-0 text-sm">${a.icon}</div>
              <span class="text-sm font-medium text-slate-700">${a.label}</span>
            </button>
          `).join('')}
        </div>
      </div>
      <!-- Upcoming PT sessions -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-semibold text-slate-800">Upcoming PT Sessions</h3>
          <button onclick="showSub('pt-sessions')" class="text-xs text-indigo-600 hover:underline">View all</button>
        </div>
        <div class="divide-y divide-slate-50">
          ${[
            { member:'Oliver Brown',    time:'Mon 10:00 AM', status:'SCHEDULED' },
            { member:'Emma Wilson',     time:'Tue 09:00 AM', status:'SCHEDULED' },
            { member:'Noah Taylor',     time:'Wed 11:00 AM', status:'PENDING' },
          ].map(s => `
            <div class="flex items-center justify-between px-5 py-3">
              <div><p class="text-sm font-medium text-slate-800">${s.member}</p><p class="text-xs text-slate-400">${s.time}</p></div>
              <span class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">${s.status}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <!-- My classes -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100">
          <h3 class="font-semibold text-slate-800">Upcoming Classes</h3>
        </div>
        <div class="divide-y divide-slate-50">
          ${myClasses.length
            ? myClasses.map(c=>`
              <div class="flex items-center justify-between px-5 py-3">
                <div><p class="text-sm font-medium text-slate-800">${c.name}</p><p class="text-xs text-slate-400">${c.day.charAt(0)+c.day.slice(1).toLowerCase()} · ${c.time}</p></div>
                <span class="bg-green-100 text-green-700 text-xs px-2.5 py-0.5 rounded-full">SCHEDULED</span>
              </div>`).join('')
            : '<p class="px-5 py-6 text-sm text-slate-400 text-center">No upcoming classes.</p>'}
        </div>
      </div>
    </div>
  `;
}

// ==================== BRANCHES ====================
function renderBranches(el) {
  const statusBadge = { ACTIVE:'bg-green-100 text-green-700', INACTIVE:'bg-red-100 text-red-700' };
  el.innerHTML = `
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Branches</h2><p class="text-sm text-slate-500">${DEMO_BRANCHES.length} locations</p></div>
        <button onclick="showDemoToast('Add Branch form would open here.')" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium">+ Add Branch</button>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        ${DEMO_BRANCHES.map(b => `
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl">🏢</div>
              <span class="text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge[b.status]||'bg-slate-100 text-slate-500'}">${b.status}</span>
            </div>
            <h3 class="font-semibold text-slate-800">${b.name}</h3>
            <p class="text-xs text-slate-500 mt-1">📍 ${b.address}, ${b.city}</p>
            <p class="text-xs text-slate-500">📞 ${b.phone}</p>
            <p class="text-xs text-slate-500">✉️ ${b.email}</p>
            <div class="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 text-center">
              <div><p class="text-lg font-bold text-indigo-600">${b.members}</p><p class="text-xs text-slate-400">Members</p></div>
              <div><p class="text-lg font-bold text-slate-600">${b.capacity}</p><p class="text-xs text-slate-400">Capacity</p></div>
              <div><p class="text-lg font-bold text-green-600">${Math.round(b.members/b.capacity*100)}%</p><p class="text-xs text-slate-400">Used</p></div>
            </div>
            <button onclick="showDemoToast('Managing ${b.name}')" class="mt-3 w-full text-xs font-medium py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">Manage →</button>
          </div>
        `).join('')}
      </div>
    </div>`;
}

// ==================== MEMBERSHIPS ====================
function renderMemberships(el) {
  const totalRevenue = DEMO_MEMBERSHIP_PLANS.reduce((s,p) => s + p.price * p.members, 0);
  el.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Membership Plans</h2><p class="text-sm text-slate-500">Manage plans and active memberships</p></div>
        <button onclick="showDemoToast('New Membership Plan form would open here.')" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium">+ New Plan</button>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-indigo-600">${DEMO_MEMBERSHIP_PLANS.reduce((s,p)=>s+p.members,0)}</p><p class="text-xs text-slate-500 mt-1">Active Memberships</p></div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-green-600">${DEMO_MEMBERSHIP_PLANS.length}</p><p class="text-xs text-slate-500 mt-1">Plans Available</p></div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-orange-500">$${totalRevenue.toLocaleString()}</p><p class="text-xs text-slate-500 mt-1">Monthly MRR</p></div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-purple-600">97%</p><p class="text-xs text-slate-500 mt-1">Renewal Rate</p></div>
      </div>
      <div class="grid sm:grid-cols-2 gap-5">
        ${DEMO_MEMBERSHIP_PLANS.map(plan => `
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div class="flex items-start justify-between mb-3">
              <div><h3 class="font-semibold text-slate-800">${plan.name}</h3><p class="text-xs text-slate-500 mt-0.5">${plan.type.replace(/_/g,' ')}</p></div>
              <div class="text-right"><p class="text-xl font-bold text-indigo-600">$${plan.price}</p><p class="text-xs text-slate-400">/${plan.durationDays===30?'mo':plan.durationDays===365?'yr':plan.durationDays+' days'}</p></div>
            </div>
            <ul class="space-y-1 mb-3">${plan.features.map(f=>`<li class="text-xs text-slate-600 flex items-center gap-1.5"><span class="text-green-500">✓</span>${f}</li>`).join('')}</ul>
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span class="text-sm font-semibold text-slate-700">${plan.members} members</span>
              <div class="flex gap-3">
                <button onclick="showDemoToast('Edit plan: ${plan.name}')" class="text-xs text-indigo-500 font-medium">Edit</button>
                <button onclick="showDemoToast('Deactivate plan: ${plan.name}')" class="text-xs text-red-400 font-medium">Deactivate</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
}

// ==================== REPORTS ====================
function renderReports(el) {
  el.innerHTML = `
    <div class="space-y-6">
      <div><h2 class="text-xl font-bold text-slate-800">Analytics &amp; Reports</h2><p class="text-sm text-slate-500">Business intelligence overview</p></div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"><p class="text-sm text-slate-500">Total Members</p><p class="text-2xl font-bold text-slate-800 mt-1">124</p><p class="text-xs text-green-600 mt-1">↑ 8% vs last month</p></div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"><p class="text-sm text-slate-500">Monthly Revenue</p><p class="text-2xl font-bold text-slate-800 mt-1">$28,400</p><p class="text-xs text-green-600 mt-1">↑ 17% vs last month</p></div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"><p class="text-sm text-slate-500">Avg Daily Check-ins</p><p class="text-2xl font-bold text-slate-800 mt-1">38</p><p class="text-xs text-slate-400 mt-1">Peak: 7–9am</p></div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"><p class="text-sm text-slate-500">Retention Rate</p><p class="text-2xl font-bold text-slate-800 mt-1">96.8%</p><p class="text-xs text-green-600 mt-1">↑ 0.5% vs last month</p></div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 class="font-semibold text-slate-800 mb-4">Revenue — Last 6 months</h3>
          <div style="position:relative;height:200px"><canvas id="reportRevenueChart"></canvas></div>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 class="font-semibold text-slate-800 mb-4">Member Growth</h3>
          <div style="position:relative;height:200px"><canvas id="reportMemberChart"></canvas></div>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 class="font-semibold text-slate-800 mb-4">Top Classes by Attendance</h3>
        <div class="space-y-3">
          ${[
            {name:'CrossFit',pct:100},{name:'Cycling Blast',pct:100},{name:'Full Body Burn',pct:100},
            {name:'Zumba Party',pct:88},{name:'Morning HIIT',pct:90},{name:'Boxing Basics',pct:88}
          ].map(c=>`
            <div class="flex items-center gap-3">
              <span class="text-sm text-slate-600 w-40 shrink-0">${c.name}</span>
              <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-indigo-400 rounded-full" style="width:${c.pct}%"></div></div>
              <span class="text-xs text-slate-500 w-10 text-right">${c.pct}%</span>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
  setTimeout(() => {
    const r = document.getElementById('reportRevenueChart');
    const m = document.getElementById('reportMemberChart');
    if (!r || !m) return;
    new Chart(r, { type:'line', data:{ labels:REVENUE_CHART.map(d=>d.month), datasets:[{label:'Revenue',data:REVENUE_CHART.map(d=>d.revenue),borderColor:'#6366f1',backgroundColor:'rgba(99,102,241,0.1)',fill:true,tension:0.4}]}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{color:'#94a3b8',font:{size:11}}},y:{grid:{color:'#f1f5f9'},ticks:{color:'#94a3b8',font:{size:11},callback:v=>'$'+(v/1000).toFixed(0)+'k'}}}} });
    new Chart(m, { type:'bar', data:{ labels:MEMBER_GROWTH_CHART.map(d=>d.month), datasets:[{label:'Members',data:MEMBER_GROWTH_CHART.map(d=>d.members),backgroundColor:'#6366f1',borderRadius:4}]}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{color:'#94a3b8',font:{size:11}}},y:{grid:{color:'#f1f5f9'},ticks:{color:'#94a3b8',font:{size:11}},min:80}}} });
  }, 50);
}

// ==================== AI INSIGHTS ====================
function renderAiInsights(el) {
  const typeColor = { positive:'border-green-200 bg-green-50', warning:'border-yellow-200 bg-yellow-50', info:'border-blue-200 bg-blue-50' };
  const typeText  = { positive:'text-green-700', warning:'text-yellow-700', info:'text-blue-700' };
  el.innerHTML = `
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">AI Insights</h2><p class="text-sm text-slate-500">AI-powered business intelligence for your gym</p></div>
        <span class="text-xs bg-purple-100 text-purple-600 px-3 py-1 rounded-full font-semibold">✨ Powered by AI</span>
      </div>
      <div class="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-5">
        <p class="font-semibold text-slate-800 mb-1">📊 Executive Summary</p>
        <p class="text-sm text-slate-600">Revenue is up 17% month-over-month, driven primarily by Elite membership upgrades and increased PT session bookings. Churn risk is low at 3.2% but 14 members need re-engagement outreach.</p>
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        ${DEMO_AI_INSIGHTS.map(i => `
          <div class="bg-white rounded-2xl p-5 border ${typeColor[i.type]||'border-slate-200'} shadow-sm">
            <div class="flex items-start gap-3">
              <span class="text-2xl mt-0.5">${i.icon}</span>
              <div>
                <p class="font-semibold text-slate-800 text-sm">${i.title}</p>
                <p class="text-xs ${typeText[i.type]||'text-slate-600'} mt-1 leading-relaxed">${i.text}</p>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
}

// ==================== PROGRAMS ====================
function renderPrograms(el) {
  const levelColor = { Beginner:'bg-green-100 text-green-700', Intermediate:'bg-yellow-100 text-yellow-700', Advanced:'bg-red-100 text-red-700' };
  el.innerHTML = `
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Fitness Programs</h2><p class="text-sm text-slate-500">${DEMO_PROGRAMS.length} programs available</p></div>
        ${currentUser.role !== 'MEMBER' ? `<button onclick="showDemoToast('Create Program form would open here.')" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium">+ New Program</button>` : ''}
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        ${DEMO_PROGRAMS.map(p => `
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between mb-2">
              <span class="text-xs font-medium px-2 py-0.5 rounded-full ${levelColor[p.level]||'bg-slate-100 text-slate-500'}">${p.level}</span>
              <span class="text-xs text-slate-400">${p.weeks} weeks</span>
            </div>
            <h3 class="font-semibold text-slate-800 mt-2">${p.name}</h3>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">${p.description}</p>
            <div class="mt-3 flex items-center gap-3 text-xs text-slate-500">
              <span>🏋️ ${p.trainer}</span>
              <span>👥 ${p.enrolled} enrolled</span>
            </div>
            <button onclick="showDemoToast('${currentUser.role==='MEMBER'?'Enrolled in':'Managing'}: ${p.name}')" class="mt-4 w-full py-1.5 rounded-lg text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-colors">
              ${currentUser.role === 'MEMBER' ? 'Enroll Now' : 'View Program'}
            </button>
          </div>
        `).join('')}
      </div>
    </div>`;
}

// ==================== EVENTS ====================
function renderEvents(el) {
  const statusColor = { UPCOMING:'bg-blue-100 text-blue-700', COMPLETED:'bg-slate-100 text-slate-500', CANCELLED:'bg-red-100 text-red-500' };
  el.innerHTML = `
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Gym Events</h2><p class="text-sm text-slate-500">Workshops, competitions, social meetups</p></div>
        ${currentUser.role !== 'MEMBER' ? `<button onclick="showDemoToast('Create Event form would open here.')" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium">+ New Event</button>` : ''}
      </div>
      <div class="grid sm:grid-cols-2 gap-5">
        ${DEMO_EVENTS.map(e => {
          const pct = Math.round(e.registered / e.capacity * 100);
          return `
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div class="flex items-start justify-between mb-2">
              <h3 class="font-semibold text-slate-800">${e.title}</h3>
              <span class="text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[e.status]||'bg-slate-100 text-slate-500'} ml-2 shrink-0">${e.status}</span>
            </div>
            <p class="text-xs text-slate-500 leading-relaxed mb-3">${e.description}</p>
            <p class="text-xs text-indigo-600 font-medium mb-3">📅 ${e.start}</p>
            <div class="text-xs text-slate-500 mb-1">${e.registered}/${e.capacity} registered (${pct}%)</div>
            <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
              <div class="h-full bg-indigo-400 rounded-full" style="width:${pct}%"></div>
            </div>
            <button onclick="showDemoToast('${currentUser.role==='MEMBER'?'Registered for':'Managing'}: ${e.title}')" class="w-full py-1.5 rounded-lg text-xs font-semibold ${e.status==='COMPLETED'?'bg-slate-100 text-slate-400 cursor-not-allowed':'bg-indigo-500 hover:bg-indigo-600 text-white transition-colors'}">
              ${e.status==='COMPLETED' ? 'Completed' : currentUser.role==='MEMBER' ? 'Register' : 'Manage Event'}
            </button>
          </div>`;
        }).join('')}
      </div>
    </div>`;
}

// ==================== PT SESSIONS ====================
function renderPtSessions(el) {
  const statusColor = { SCHEDULED:'bg-blue-100 text-blue-700', COMPLETED:'bg-green-100 text-green-700', CANCELLED:'bg-red-100 text-red-500' };
  el.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Personal Training Sessions</h2><p class="text-sm text-slate-500">${DEMO_PT_SESSIONS.length} sessions scheduled</p></div>
        <button onclick="showDemoToast('Schedule PT Session form would open here.')" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium">+ Schedule</button>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="border-b border-slate-100 bg-slate-50">
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Trainer</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Member</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Date &amp; Time</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Branch</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Notes</th>
            </tr></thead>
            <tbody class="divide-y divide-slate-50">
              ${DEMO_PT_SESSIONS.map(s => `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-5 py-4 font-medium text-slate-800">${s.trainer}</td>
                  <td class="px-5 py-4 text-slate-600">${s.member}</td>
                  <td class="px-5 py-4 text-slate-600"><p>${s.date}</p><p class="text-xs text-slate-400">${s.time}</p></td>
                  <td class="px-5 py-4 text-slate-600">${s.branch}</td>
                  <td class="px-5 py-4"><span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor[s.status]||'bg-slate-100 text-slate-500'}">${s.status}</span></td>
                  <td class="px-5 py-4 text-xs text-slate-500 italic">${s.notes}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
}

// ==================== WORKOUTS ====================
function renderWorkouts(el) {
  const diffColor = { BEGINNER:'bg-green-50 text-green-600', INTERMEDIATE:'bg-yellow-50 text-yellow-600', ADVANCED:'bg-red-50 text-red-500' };
  const catColor  = { STRENGTH:'bg-red-50 text-red-600', HIIT:'bg-pink-50 text-pink-600', YOGA:'bg-teal-50 text-teal-600', CORE:'bg-indigo-50 text-indigo-600', CARDIO:'bg-orange-50 text-orange-600', PILATES:'bg-purple-50 text-purple-600' };
  el.innerHTML = `
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Workout Library</h2><p class="text-sm text-slate-500">${DEMO_WORKOUTS.length} exercises available</p></div>
        ${currentUser.role !== 'MEMBER' ? `<button onclick="showDemoToast('Add Workout form would open here.')" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium">+ Add Workout</button>` : ''}
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${DEMO_WORKOUTS.map(w => `
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl">💪</div>
              <span class="text-xs font-medium px-2 py-0.5 rounded-full ${diffColor[w.difficulty]||'bg-slate-50 text-slate-500'}">${w.difficulty}</span>
            </div>
            <h3 class="font-semibold text-slate-800">${w.name}</h3>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">${w.description}</p>
            <div class="mt-3 flex items-center gap-3">
              <span class="text-xs px-2 py-0.5 rounded-full ${catColor[w.category]||'bg-slate-50 text-slate-500'}">${w.category}</span>
              <span class="text-xs text-slate-400">⏱ ${w.duration} min · ${w.exercises} exercises</span>
            </div>
            <button onclick="showDemoToast('Start workout: ${w.name}')" class="mt-4 w-full py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-colors">View Details →</button>
          </div>
        `).join('')}
      </div>
    </div>`;
}

// ==================== LIVE CLASSES ====================
function renderLiveClasses(el) {
  const statusStyle = { LIVE:'bg-red-500 text-white', UPCOMING:'bg-blue-100 text-blue-700', RECORDED:'bg-slate-100 text-slate-600' };
  el.innerHTML = `
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Live Classes</h2><p class="text-sm text-slate-500">Stream, schedule and watch classes online</p></div>
        ${currentUser.role !== 'MEMBER' ? `<button onclick="showDemoToast('Schedule Live Class form would open here.')" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium">+ Go Live</button>` : ''}
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${DEMO_LIVE_CLASSES.map(c => `
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between mb-3">
              <span class="text-3xl">${c.status==='LIVE'?'🔴':c.status==='UPCOMING'?'🔜':'▶️'}</span>
              <span class="text-xs font-bold px-2 py-0.5 rounded-full ${statusStyle[c.status]||''}">${c.status}</span>
            </div>
            <h3 class="font-semibold text-slate-800">${c.name}</h3>
            <p class="text-xs text-slate-500 mt-1">🏋️ ${c.trainer}</p>
            ${c.time ? `<p class="text-xs text-slate-500">🕐 ${c.time}</p>` : ''}
            <div class="mt-3 flex items-center gap-3 text-xs text-slate-400">
              <span>⏱ ${c.duration}</span>
              ${c.viewers>0 ? `<span>👁 ${c.viewers} ${c.status==='LIVE'?'watching':'views'}</span>` : ''}
            </div>
            <button onclick="showDemoToast('${c.status==='LIVE'?'Joining live: ':'Watching: '}${c.name}')" class="mt-4 w-full py-1.5 rounded-lg text-xs font-semibold ${c.status==='LIVE'?'bg-red-500 hover:bg-red-600 text-white':c.status==='UPCOMING'?'bg-blue-50 text-blue-600 hover:bg-blue-100':'bg-slate-100 text-slate-600 hover:bg-slate-200'} transition-colors">
              ${c.status==='LIVE'?'Join Live →':c.status==='UPCOMING'?'Set Reminder':'Watch Recording'}
            </button>
          </div>
        `).join('')}
      </div>
    </div>`;
}

// ==================== EQUIPMENT ====================
function renderEquipment(el) {
  const statusColor = { OPERATIONAL:'bg-green-100 text-green-700', MAINTENANCE:'bg-yellow-100 text-yellow-700', BROKEN:'bg-red-100 text-red-600' };
  el.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Equipment</h2><p class="text-sm text-slate-500">${DEMO_EQUIPMENT.length} items tracked</p></div>
        <button onclick="showDemoToast('Add Equipment form would open here.')" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium">+ Add Item</button>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="border-b border-slate-100 bg-slate-50">
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Equipment</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Category</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Branch</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Qty</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Last Service</th>
            </tr></thead>
            <tbody class="divide-y divide-slate-50">
              ${DEMO_EQUIPMENT.map(e => `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-5 py-4 font-medium text-slate-800">${e.name}</td>
                  <td class="px-5 py-4 text-slate-600">${e.category}</td>
                  <td class="px-5 py-4 text-slate-600">${e.branch}</td>
                  <td class="px-5 py-4 text-slate-600 font-semibold">${e.qty}</td>
                  <td class="px-5 py-4"><span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor[e.status]||'bg-slate-100 text-slate-500'}">${e.status}</span></td>
                  <td class="px-5 py-4 text-slate-500 text-xs">${e.lastService}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
}

// ==================== INVENTORY ====================
function renderInventory(el) {
  el.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Inventory</h2><p class="text-sm text-slate-500">${DEMO_INVENTORY.length} products tracked</p></div>
        <button onclick="showDemoToast('Add Inventory Item form would open here.')" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium">+ Add Item</button>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="border-b border-slate-100 bg-slate-50">
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Product</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Category</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Stock</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Reorder Point</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Unit Price</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Supplier</th>
            </tr></thead>
            <tbody class="divide-y divide-slate-50">
              ${DEMO_INVENTORY.map(i => `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-5 py-4 font-medium text-slate-800">${i.name}</td>
                  <td class="px-5 py-4 text-slate-600">${i.category}</td>
                  <td class="px-5 py-4"><span class="${i.stock <= i.reorder ? 'text-red-600 font-bold' : 'text-slate-700 font-semibold'}">${i.stock}</span>${i.stock<=i.reorder?' <span class="text-xs text-red-400">Low</span>':''}</td>
                  <td class="px-5 py-4 text-slate-500">${i.reorder}</td>
                  <td class="px-5 py-4 text-slate-700 font-medium">$${i.price}</td>
                  <td class="px-5 py-4 text-slate-500 text-xs">${i.supplier}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
}

// ==================== LOCKERS ====================
function renderLockers(el) {
  const statusColor = { OCCUPIED:'bg-indigo-100 text-indigo-700', AVAILABLE:'bg-green-100 text-green-700', MAINTENANCE:'bg-yellow-100 text-yellow-700' };
  el.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Lockers</h2><p class="text-sm text-slate-500">${DEMO_LOCKERS.filter(l=>l.status==='AVAILABLE').length} of ${DEMO_LOCKERS.length} available</p></div>
        <button onclick="showDemoToast('Assign Locker form would open here.')" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium">+ Assign</button>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        ${DEMO_LOCKERS.map(l => `
          <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
            <p class="text-xl font-bold text-slate-700 mb-1">${l.id}</p>
            <p class="text-xs text-slate-500">${l.size}</p>
            <span class="mt-2 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[l.status]||'bg-slate-100 text-slate-500'}">${l.status}</span>
            ${l.member ? `<p class="text-xs text-slate-600 mt-1 font-medium truncate">${l.member}</p><p class="text-xs text-slate-400">Exp: ${l.expires}</p>` : ''}
          </div>
        `).join('')}
      </div>
    </div>`;
}

// ==================== GROUPS ====================
function renderGroups(el) {
  el.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Member Groups</h2><p class="text-sm text-slate-500">Segment members for targeted actions</p></div>
        <button onclick="showDemoToast('Create Group form would open here.')" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium">+ New Group</button>
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        ${DEMO_GROUPS.map(g => `
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl">🫂</div>
              <div class="flex-1">
                <h3 class="font-semibold text-slate-800">${g.name}</h3>
                <p class="text-xs text-slate-500 mt-0.5">${g.description}</p>
                <div class="flex items-center gap-4 mt-2">
                  <span class="text-sm font-bold text-indigo-600">${g.members} members</span>
                  <button onclick="showDemoToast('Send message to: ${g.name}')" class="text-xs text-indigo-500 hover:text-indigo-600 font-medium">Message</button>
                  <button onclick="showDemoToast('Managing group: ${g.name}')" class="text-xs text-slate-500 hover:text-slate-600 font-medium">Manage</button>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
}

// ==================== ACCESS CONTROL ====================
function renderAccess(el) {
  const statusColor = { ACTIVE:'bg-green-100 text-green-700', SUSPENDED:'bg-yellow-100 text-yellow-700', EXPIRED:'bg-red-100 text-red-600' };
  el.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Access Control</h2><p class="text-sm text-slate-500">QR code &amp; RFID access management</p></div>
        <button onclick="showDemoToast('Manage Access form would open here.')" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium">+ Grant Access</button>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="border-b border-slate-100 bg-slate-50">
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Member</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Member #</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Access Type</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Level</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Last Entry</th>
            </tr></thead>
            <tbody class="divide-y divide-slate-50">
              ${DEMO_ACCESS.map(a => `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-5 py-4 font-medium text-slate-800">${a.member}</td>
                  <td class="px-5 py-4 font-mono text-xs text-slate-600">${a.memberNumber}</td>
                  <td class="px-5 py-4 text-slate-600">${a.accessType}</td>
                  <td class="px-5 py-4 text-slate-600">${a.level}</td>
                  <td class="px-5 py-4"><span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor[a.status]||'bg-slate-100 text-slate-500'}">${a.status}</span></td>
                  <td class="px-5 py-4 text-slate-500 text-xs">${a.lastEntry}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
}

// ==================== LOYALTY ====================
function renderLoyalty(el) {
  if (currentUser.role === 'MEMBER') {
    el.innerHTML = `
      <div class="space-y-5">
        <div><h2 class="text-lg font-semibold text-slate-800">Loyalty Program</h2><p class="text-sm text-slate-500">Earn points with every visit and redeem amazing rewards</p></div>
        <div class="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
          <p class="text-sm font-medium opacity-80">Your Points Balance</p>
          <p class="text-4xl font-extrabold mt-1">${DEMO_LOYALTY.points.toLocaleString()}</p>
          <p class="text-sm mt-1 opacity-80">🏅 ${DEMO_LOYALTY.tier} Tier · ${DEMO_LOYALTY.pointsToNext} pts to ${DEMO_LOYALTY.nextTier}</p>
          <div class="mt-3 h-2 bg-white/30 rounded-full overflow-hidden">
            <div class="h-full bg-white rounded-full" style="width:${Math.round(DEMO_LOYALTY.points/(DEMO_LOYALTY.points+DEMO_LOYALTY.pointsToNext)*100)}%"></div>
          </div>
        </div>
        <div class="grid sm:grid-cols-2 gap-5">
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 class="font-semibold text-slate-800 mb-3">Redeem Rewards</h3>
            <div class="space-y-2">
              ${DEMO_LOYALTY.rewards.map(r => `
                <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div class="flex items-center gap-2"><span class="text-lg">${r.icon}</span><span class="text-sm font-medium text-slate-700">${r.name}</span></div>
                  <button onclick="showDemoToast('Redeeming: ${r.name}')" class="text-xs bg-indigo-500 text-white px-3 py-1 rounded-lg hover:bg-indigo-600 ${DEMO_LOYALTY.points < r.points ? 'opacity-50 cursor-not-allowed' : ''}">
                    ${r.points} pts
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 class="font-semibold text-slate-800 mb-3">Points History</h3>
            <div class="space-y-2">
              ${DEMO_LOYALTY.history.map(h => `
                <div class="flex items-center justify-between text-sm">
                  <div><p class="text-slate-700">${h.action}</p><p class="text-xs text-slate-400">${h.date}</p></div>
                  <span class="font-bold ${h.points > 0 ? 'text-green-600' : 'text-red-500'}">${h.points > 0 ? '+' : ''}${h.points}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>`;
  } else {
    el.innerHTML = `
      <div class="space-y-5">
        <div class="flex items-center justify-between">
          <div><h2 class="text-lg font-semibold text-slate-800">Loyalty Program</h2><p class="text-sm text-slate-500">124 members enrolled — boosting retention</p></div>
          <button onclick="showDemoToast('Loyalty Program settings would open here.')" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium">Configure</button>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-yellow-500">124</p><p class="text-xs text-slate-500 mt-1">Members Enrolled</p></div>
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-orange-500">48.2k</p><p class="text-xs text-slate-500 mt-1">Total Points Issued</p></div>
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-indigo-600">12.1k</p><p class="text-xs text-slate-500 mt-1">Points Redeemed</p></div>
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-green-600">89%</p><p class="text-xs text-slate-500 mt-1">Engagement Rate</p></div>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 class="font-semibold text-slate-800 mb-3">Available Rewards</h3>
          <div class="grid sm:grid-cols-2 gap-3">
            ${DEMO_LOYALTY.rewards.map(r=>`<div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl"><div class="flex items-center gap-2"><span class="text-lg">${r.icon}</span><span class="text-sm font-medium text-slate-700">${r.name}</span></div><span class="text-xs text-indigo-600 font-semibold">${r.points} pts</span></div>`).join('')}
          </div>
        </div>
      </div>`;
  }
}

// ==================== COUPONS ====================
function renderCoupons(el) {
  const statusColor = { ACTIVE:'bg-green-100 text-green-700', EXPIRED:'bg-slate-100 text-slate-400' };
  el.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Coupons</h2><p class="text-sm text-slate-500">${DEMO_COUPONS.filter(c=>c.status==='ACTIVE').length} active coupons</p></div>
        <button onclick="showDemoToast('Create Coupon form would open here.')" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium">+ Create Coupon</button>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-100 bg-slate-50">
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Code</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Discount</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Plan</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Uses</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Expires</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
          </tr></thead>
          <tbody class="divide-y divide-slate-50">
            ${DEMO_COUPONS.map(c => `
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-5 py-4 font-mono font-bold text-indigo-600">${c.code}</td>
                <td class="px-5 py-4 font-semibold text-slate-800">${c.discount}${c.type==='PERCENTAGE'?'%':'$'} off</td>
                <td class="px-5 py-4 text-slate-600">${c.plan}</td>
                <td class="px-5 py-4 text-slate-600">${c.uses}/${c.maxUses}</td>
                <td class="px-5 py-4 text-slate-500 text-xs">${c.expires}</td>
                <td class="px-5 py-4"><span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor[c.status]||''}">${c.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ==================== GIFT CARDS ====================
function renderGiftCards(el) {
  const statusColor = { ACTIVE:'bg-green-100 text-green-700', REDEEMED:'bg-slate-100 text-slate-500' };
  el.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Gift Cards</h2><p class="text-sm text-slate-500">${DEMO_GIFT_CARDS.length} gift cards issued</p></div>
        <button onclick="showDemoToast('Issue Gift Card form would open here.')" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium">+ Issue Card</button>
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        ${DEMO_GIFT_CARDS.map(g => `
          <div class="bg-gradient-to-br ${g.status==='ACTIVE'?'from-indigo-500 to-purple-600':'from-slate-400 to-slate-500'} rounded-2xl p-5 text-white shadow-md">
            <div class="flex justify-between items-start mb-4">
              <span class="text-2xl">🎁</span>
              <span class="text-xs font-bold px-2 py-0.5 rounded-full ${g.status==='ACTIVE'?'bg-white/20 text-white':'bg-white/10 text-white/70'}">${g.status}</span>
            </div>
            <p class="font-mono text-lg font-bold tracking-widest">${g.code}</p>
            <div class="mt-3 flex justify-between items-end">
              <div><p class="text-xs opacity-70">Remaining</p><p class="text-2xl font-extrabold">${g.remaining === g.value ? `$${g.value}` : `$${g.remaining}/$${g.value}`}</p></div>
              <div class="text-right"><p class="text-xs opacity-70">Purchased by</p><p class="text-sm font-medium">${g.purchasedBy}</p></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
}

// ==================== MARKETING ====================
function renderMarketing(el) {
  el.innerHTML = `
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Marketing</h2><p class="text-sm text-slate-500">Email, SMS and push notification campaigns</p></div>
        <button onclick="showDemoToast('Create Campaign form would open here.')" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium">+ New Campaign</button>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-indigo-600">4</p><p class="text-xs text-slate-500 mt-1">Campaigns</p></div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-green-600">324</p><p class="text-xs text-slate-500 mt-1">Emails Sent</p></div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-blue-600">72%</p><p class="text-xs text-slate-500 mt-1">Open Rate</p></div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-orange-500">38%</p><p class="text-xs text-slate-500 mt-1">Click Rate</p></div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-100 bg-slate-50">
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Campaign</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Type</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Target</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Sent</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Opens</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Clicks</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
          </tr></thead>
          <tbody class="divide-y divide-slate-50">
            ${DEMO_MARKETING_CAMPAIGNS.map(c => `
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-5 py-4 font-medium text-slate-800">${c.name}</td>
                <td class="px-5 py-4 text-slate-600">${c.type}</td>
                <td class="px-5 py-4 text-slate-600 text-xs">${c.target}</td>
                <td class="px-5 py-4 text-slate-600">${c.sent}</td>
                <td class="px-5 py-4 text-slate-600">${c.opens}</td>
                <td class="px-5 py-4 text-slate-600">${c.clicks}</td>
                <td class="px-5 py-4"><span class="px-2 py-1 rounded-full text-xs font-medium ${c.status==='SENT'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}">${c.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ==================== AUDIT LOG ====================
function renderAudit(el) {
  const typeIcon = { member:'👤', payment:'💳', booking:'📅', admin:'⚙️', attendance:'✅' };
  el.innerHTML = `
    <div class="space-y-4">
      <div><h2 class="text-lg font-semibold text-slate-800">Audit Log</h2><p class="text-sm text-slate-500">Full system activity trail</p></div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
        ${DEMO_ACTIVITIES.map(a => `
          <div class="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
            <span class="text-xl w-8 text-center shrink-0">${typeIcon[a.type]||'📌'}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-800">${a.action}</p>
              <p class="text-xs text-slate-500">by ${a.user}</p>
            </div>
            <span class="text-xs text-slate-400 shrink-0">${a.time}</span>
          </div>
        `).join('')}
      </div>
    </div>`;
}

// ==================== SETTINGS ====================
function renderSettings(el) {
  el.innerHTML = `
    <div class="space-y-5">
      <div><h2 class="text-lg font-semibold text-slate-800">Settings</h2><p class="text-sm text-slate-500">Manage your account and preferences</p></div>
      <div class="flex gap-2 flex-wrap" id="settings-tabs">
        ${['Profile','Gym Info','Notifications','Billing'].map((t,i) => `<button onclick="settingsTab('${t.toLowerCase().replace(' ','-')}')" id="stab-${t.toLowerCase().replace(' ','-')}" class="px-4 py-2 rounded-xl text-sm font-medium ${i===0?'bg-indigo-500 text-white':'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'} transition-colors">${t}</button>`).join('')}
      </div>
      <div id="settings-content" class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"></div>
    </div>`;
  settingsTab('profile');
}

function settingsTab(tab) {
  document.querySelectorAll('[id^="stab-"]').forEach(b => { b.className = 'px-4 py-2 rounded-xl text-sm font-medium bg-white text-slate-600 border border-slate-200 hover:border-slate-400 transition-colors'; });
  const active = document.getElementById('stab-' + tab);
  if (active) active.className = 'px-4 py-2 rounded-xl text-sm font-medium bg-indigo-500 text-white transition-colors';
  const c = document.getElementById('settings-content');
  if (!c) return;
  const content = {
    'profile': `
      <h3 class="font-semibold text-slate-800 mb-4">Profile</h3>
      <div class="flex items-center gap-4 mb-6">
        <div class="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xl font-bold">${currentUser.firstName[0]}${currentUser.lastName[0]}</div>
        <div><p class="font-semibold text-slate-800">${currentUser.firstName} ${currentUser.lastName}</p><p class="text-sm text-slate-500">${currentUser.email}</p></div>
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div><label class="block text-xs font-medium text-slate-600 mb-1">First Name</label><input value="${currentUser.firstName}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400" /></div>
        <div><label class="block text-xs font-medium text-slate-600 mb-1">Last Name</label><input value="${currentUser.lastName}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400" /></div>
        <div class="sm:col-span-2"><label class="block text-xs font-medium text-slate-600 mb-1">Email</label><input value="${currentUser.email}" type="email" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400" /></div>
        <div><label class="block text-xs font-medium text-slate-600 mb-1">Phone</label><input value="+44 20 0000 0000" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400" /></div>
      </div>
      <button onclick="showDemoToast('Profile saved!')" class="mt-5 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors">Save Changes</button>`,
    'gym-info': `
      <h3 class="font-semibold text-slate-800 mb-4">Gym Info</h3>
      <div class="grid sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2"><label class="block text-xs font-medium text-slate-600 mb-1">Gym Name</label><input value="GymFlow" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400" /></div>
        <div><label class="block text-xs font-medium text-slate-600 mb-1">Website</label><input value="https://gymflow.demo" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400" /></div>
        <div><label class="block text-xs font-medium text-slate-600 mb-1">Phone</label><input value="+44 20 1234 5678" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400" /></div>
        <div class="sm:col-span-2"><label class="block text-xs font-medium text-slate-600 mb-1">Address</label><input value="42 Fitness Ave, London" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400" /></div>
      </div>
      <button onclick="showDemoToast('Gym info saved!')" class="mt-5 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors">Save Changes</button>`,
    'notifications': `
      <h3 class="font-semibold text-slate-800 mb-4">Notification Preferences</h3>
      <div class="space-y-4">
        ${[
          ['New member registration', true],['Payment received', true],['Membership expiry alert', true],
          ['Class booking', false],['Low inventory alert', true],['Daily summary email', false]
        ].map(([label, on]) => `
          <div class="flex items-center justify-between py-2 border-b border-slate-100">
            <span class="text-sm text-slate-700">${label}</span>
            <button onclick="showDemoToast('Notification preference updated')" class="w-11 h-6 rounded-full ${on?'bg-indigo-500':'bg-slate-200'} relative transition-colors">
              <span class="absolute top-0.5 ${on?'right-0.5':'left-0.5'} w-5 h-5 bg-white rounded-full shadow transition-all"></span>
            </button>
          </div>
        `).join('')}
      </div>`,
    'billing': `
      <h3 class="font-semibold text-slate-800 mb-4">Billing</h3>
      <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
        <p class="font-semibold text-indigo-800">GymFlow Pro Plan</p>
        <p class="text-sm text-indigo-600 mt-1">$149/month · Renews June 1, 2025</p>
      </div>
      <div class="flex items-center gap-3 p-4 border border-slate-200 rounded-xl mb-4">
        <span class="text-2xl">💳</span>
        <div><p class="text-sm font-medium text-slate-800">Visa ending in 4242</p><p class="text-xs text-slate-500">Expires 12/2026</p></div>
      </div>
      <button onclick="showDemoToast('Billing portal would open here.')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors">Manage Billing</button>`
  };
  c.innerHTML = content[tab] || '';
}

// ==================== MY BOOKINGS ====================
function renderBookings(el) {
  const statusColor = { CONFIRMED:'bg-green-100 text-green-700', WAITLISTED:'bg-yellow-100 text-yellow-700', CANCELLED:'bg-slate-100 text-slate-400 line-through', ATTENDED:'bg-blue-100 text-blue-700' };
  const upcoming = DEMO_CLASSES.slice(0, 4);
  el.innerHTML = `
    <div class="space-y-6">
      <div><h2 class="text-lg font-semibold text-slate-800">My Bookings</h2></div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 class="font-semibold text-slate-800 mb-4">Available Classes This Week</h3>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          ${upcoming.map(c => `
            <div class="border border-slate-100 rounded-xl p-4 hover:border-indigo-200 transition-colors">
              <div class="flex justify-between mb-2"><h4 class="font-medium text-slate-800 text-sm">${c.name}</h4><span class="text-xs text-slate-400">${c.day.slice(0,3)}</span></div>
              <p class="text-xs text-slate-500 mb-1">🕐 ${c.time}</p>
              <p class="text-xs text-slate-500 mb-3">👥 ${c.booked}/${c.capacity}</p>
              <button onclick="showDemoToast('Booked: ${c.name}')" ${c.booked>=c.capacity?'disabled':''} class="w-full text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white py-1.5 rounded-lg transition-colors">${c.booked>=c.capacity?'Full':'Book'}</button>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="px-5 pt-4 pb-2 font-semibold text-slate-800">Your Bookings</div>
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-100 bg-slate-50">
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Class</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Day</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Time</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Trainer</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
            <th class="px-5 py-3"></th>
          </tr></thead>
          <tbody class="divide-y divide-slate-50">
            ${DEMO_BOOKINGS.map(b => `
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-5 py-4 font-medium text-slate-800">${b.cls}</td>
                <td class="px-5 py-4 text-slate-600">${b.day}</td>
                <td class="px-5 py-4 text-slate-600">${b.time}</td>
                <td class="px-5 py-4 text-slate-600">${b.trainer}</td>
                <td class="px-5 py-4"><span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor[b.status]||''}">${b.status}</span></td>
                <td class="px-5 py-4 text-right">${b.status==='CONFIRMED'||b.status==='WAITLISTED'?`<button onclick="showDemoToast('Cancelled: ${b.cls}')" class="text-xs text-red-400 hover:text-red-500 font-medium">Cancel</button>`:''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ==================== MY MEMBERSHIP ====================
function renderMyMembership(el) {
  el.innerHTML = `
    <div class="space-y-5">
      <div><h2 class="text-lg font-semibold text-slate-800">My Membership</h2></div>
      <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <div><p class="text-sm opacity-75">Member since Jan 2024</p><p class="text-2xl font-extrabold mt-1">Premium Plan</p></div>
          <div class="text-right"><p class="text-xs opacity-75">Member ID</p><p class="font-mono font-bold text-lg">GF-012</p></div>
        </div>
        <div class="flex items-center justify-between">
          <div><p class="text-xs opacity-75">Monthly fee</p><p class="text-xl font-bold">$49/mo</p></div>
          <div class="text-right"><p class="text-xs opacity-75">Renews</p><p class="font-semibold">Jun 17, 2025</p></div>
          <span class="bg-white/20 border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full">ACTIVE</span>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 class="font-semibold text-slate-800 mb-3">Plan includes</h3>
        <ul class="space-y-2">
          ${DEMO_MEMBERSHIP_PLANS[1].features.map(f=>`<li class="text-sm text-slate-600 flex items-center gap-2"><span class="text-green-500 font-bold">✓</span>${f}</li>`).join('')}
        </ul>
      </div>
      <div class="grid sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-indigo-600">24</p><p class="text-xs text-slate-500 mt-1">Check-ins this month</p></div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-green-500">3</p><p class="text-xs text-slate-500 mt-1">Classes booked</p></div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-orange-500">18</p><p class="text-xs text-slate-500 mt-1">Days until renewal</p></div>
      </div>
      <div class="flex gap-3">
        <button onclick="showDemoToast('Upgrade to Elite for more features!')" class="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">Upgrade to Elite</button>
        <button onclick="showDemoToast('Membership cancellation form would open here.')" class="border border-slate-200 hover:border-slate-400 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">Cancel Membership</button>
      </div>
    </div>`;
}

// ==================== AI DIET ====================
function renderAiDiet(el) {
  el.innerHTML = `
    <div class="space-y-5">
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-semibold text-slate-800">AI Diet Planner</h2>
        <span class="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-semibold">✨ AI</span>
      </div>
      <div class="grid lg:grid-cols-2 gap-5">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 class="font-semibold text-slate-800 mb-4">Your Profile</h3>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div><label class="block text-xs text-slate-500 mb-1">Age</label><input type="number" value="30" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div>
            <div><label class="block text-xs text-slate-500 mb-1">Gender</label><select class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"><option>Male</option><option>Female</option></select></div>
            <div><label class="block text-xs text-slate-500 mb-1">Weight (kg)</label><input type="number" value="78" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div>
            <div><label class="block text-xs text-slate-500 mb-1">Height (cm)</label><input type="number" value="175" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div>
            <div><label class="block text-xs text-slate-500 mb-1">Activity Level</label><select class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"><option>Moderate</option><option>Light</option><option>Active</option><option>Very Active</option></select></div>
            <div><label class="block text-xs text-slate-500 mb-1">Goal</label><select class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"><option>Maintenance</option><option>Weight Loss</option><option>Muscle Gain</option></select></div>
            <div class="col-span-2"><label class="block text-xs text-slate-500 mb-1">Allergies</label><input value="None" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div>
          </div>
          <button onclick="showDemoToast('AI diet plan generated!')" class="mt-4 w-full py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-pink-500 text-white hover:opacity-90 transition-opacity">✨ Generate AI Plan</button>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 class="font-semibold text-slate-800 mb-1">Your Plan</h3>
          <p class="text-xs text-slate-500 mb-4">${DEMO_AI_DIET.calories} cal · ${DEMO_AI_DIET.protein}g protein · ${DEMO_AI_DIET.carbs}g carbs · ${DEMO_AI_DIET.fat}g fat</p>
          <div class="space-y-3">
            ${DEMO_AI_DIET.meals.map(m => `
              <div class="p-3 bg-slate-50 rounded-xl">
                <div class="flex justify-between items-center mb-1">
                  <p class="text-sm font-semibold text-slate-800">${m.name}</p>
                  <span class="text-xs text-indigo-600 font-semibold">${m.calories} cal</span>
                </div>
                <p class="text-xs text-slate-500">${m.foods.join(' · ')}</p>
                <p class="text-xs text-slate-400 mt-0.5">Protein: ${m.protein}g</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>`;
}

// ==================== NUTRITION ====================
function renderNutrition(el) {
  const n = DEMO_NUTRITION;
  const calPct = Math.round(n.calories.consumed / n.calories.target * 100);
  el.innerHTML = `
    <div class="space-y-5">
      <div><h2 class="text-lg font-semibold text-slate-800">Nutrition Tracker</h2><p class="text-sm text-slate-500">Today's food log</p></div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p class="text-xs text-slate-500">Calories</p>
          <p class="text-2xl font-bold text-slate-800 mt-1">${n.calories.consumed}<span class="text-sm text-slate-400 font-normal">/${n.calories.target}</span></p>
          <div class="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-orange-400 rounded-full" style="width:${calPct}%"></div></div>
        </div>
        ${[
          {label:'Protein',c:n.macros.protein.consumed,t:n.macros.protein.target,unit:'g',color:'bg-blue-400'},
          {label:'Carbs',  c:n.macros.carbs.consumed,  t:n.macros.carbs.target,  unit:'g',color:'bg-yellow-400'},
          {label:'Fat',    c:n.macros.fat.consumed,    t:n.macros.fat.target,    unit:'g',color:'bg-pink-400'},
        ].map(m=>`<div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p class="text-xs text-slate-500">${m.label}</p>
          <p class="text-2xl font-bold text-slate-800 mt-1">${m.c}${m.unit}<span class="text-sm text-slate-400 font-normal">/${m.t}${m.unit}</span></p>
          <div class="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full ${m.color} rounded-full" style="width:${Math.round(m.c/m.t*100)}%"></div></div>
        </div>`).join('')}
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div class="flex items-center justify-between mb-4"><h3 class="font-semibold text-slate-800">Today's Meals</h3><button onclick="showDemoToast('Add food/meal form would open here.')" class="text-xs bg-indigo-500 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-600">+ Add Meal</button></div>
        <div class="space-y-3">
          ${n.meals.map(m=>`
            <div class="flex items-start justify-between p-3 bg-slate-50 rounded-xl">
              <div><p class="text-sm font-semibold text-slate-800">${m.name}</p><p class="text-xs text-slate-500 mt-0.5">${m.items.join(' · ')}</p></div>
              <div class="text-right ml-3"><p class="text-sm font-bold text-slate-700">${m.calories} cal</p><p class="text-xs text-slate-400">${m.time}</p></div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`;
}

// ==================== POS ====================
function renderPos(el) {
  const todayTotal = DEMO_POS_SALES.reduce((s, p) => s + p.amount, 0);
  el.innerHTML = `
    <div class="space-y-5">
      <div><h2 class="text-lg font-semibold text-slate-800">Point of Sale</h2><p class="text-sm text-slate-500">Process payments and sell products</p></div>
      <div class="grid lg:grid-cols-2 gap-5">
        <div class="space-y-4">
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 class="font-semibold text-slate-800 mb-3">Quick Sale</h3>
            <div class="grid grid-cols-2 gap-2">
              ${DEMO_POS_PRODUCTS.map(p=>`<button onclick="showDemoToast('Added to cart: ${p.name} — $${p.price}')" class="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-colors"><p class="text-sm font-medium text-slate-800">${p.name}</p><p class="text-xs text-indigo-600 font-bold mt-0.5">$${p.price}</p><p class="text-xs text-slate-400">${p.category}</p></button>`).join('')}
            </div>
          </div>
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 class="font-semibold text-slate-800 mb-3">Scan Member</h3>
            <div class="flex gap-2">
              <input placeholder="Member ID or scan QR code…" class="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>
              <button onclick="showDemoToast('Member looked up: GF-001 — Oliver Brown')" class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">Scan</button>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-slate-800">Recent Sales Today</h3>
            <span class="text-sm font-bold text-green-600">$${todayTotal} total</span>
          </div>
          <div class="space-y-2">
            ${DEMO_POS_SALES.map(s=>`
              <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm">
                <div><p class="font-medium text-slate-800">${s.item}</p><p class="text-xs text-slate-400">${s.member} · ${s.method}</p></div>
                <div class="text-right"><p class="font-bold text-slate-800">$${s.amount}</p><p class="text-xs text-slate-400">${s.time}</p></div>
              </div>
            `).join('')}
          </div>
          <button onclick="showDemoToast('Full POS terminal would open here.')" class="mt-4 w-full py-2 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-colors">Open Full POS →</button>
        </div>
      </div>
    </div>`;
}

// ==================== ACTIVITIES ====================
function renderActivities(el) {
  const typeIcon = { member:'👤', payment:'💳', booking:'📅', admin:'⚙️', attendance:'✅' };
  const typeColor = { member:'bg-blue-50 border-blue-200', payment:'bg-green-50 border-green-200', booking:'bg-indigo-50 border-indigo-200', admin:'bg-purple-50 border-purple-200', attendance:'bg-emerald-50 border-emerald-200' };
  el.innerHTML = `
    <div class="space-y-4">
      <div><h2 class="text-lg font-semibold text-slate-800">Activities</h2><p class="text-sm text-slate-500">Recent system activity</p></div>
      <div class="space-y-2">
        ${DEMO_ACTIVITIES.map(a=>`
          <div class="flex items-center gap-4 p-4 bg-white rounded-2xl border ${typeColor[a.type]||'border-slate-100'} shadow-sm">
            <span class="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-xl border border-current/10 shrink-0">${typeIcon[a.type]||'📌'}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-800">${a.action}</p>
              <p class="text-xs text-slate-500">by ${a.user}</p>
            </div>
            <span class="text-xs text-slate-400 shrink-0">${a.time}</span>
          </div>
        `).join('')}
      </div>
    </div>`;
}

// ==================== RECEPTION DASHBOARD ====================
function renderReception(el) {
  const current = 192, capacity = 300;
  const occupancy = Math.round(current / capacity * 100);
  const circ = 2 * Math.PI * 40;
  const dash = circ * (1 - occupancy / 100);
  const ACTIONS = [
    { icon:'✅', label:'Check In Member',  bg:'bg-green-100',  text:'text-green-700',  action:'attendance' },
    { icon:'🔍', label:'Search Members',   bg:'bg-blue-100',   text:'text-blue-700',   action:'members'   },
    { icon:'📅', label:"Today's Classes",  bg:'bg-purple-100', text:'text-purple-700', action:'classes'   },
    { icon:'📲', label:'Scan QR Code',     bg:'bg-orange-100', text:'text-orange-700', action:'attendance' },
  ];
  el.innerHTML = `
    <div class="space-y-6">
      <!-- Occupancy banner -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-200 text-sm font-semibold uppercase tracking-wide">Current Occupancy</p>
            <p class="text-7xl font-extrabold leading-none mt-2">${occupancy}%</p>
            <p class="text-blue-200 mt-2 text-sm">${current} of ${capacity} members inside</p>
          </div>
          <div class="relative w-28 h-28 shrink-0">
            <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="10"/>
              <circle cx="50" cy="50" r="40" fill="none" stroke="white" stroke-width="10"
                stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${dash.toFixed(1)}" stroke-linecap="round"/>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-xl font-bold">${occupancy}%</span>
              <span class="text-xs text-blue-200">capacity</span>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4 mt-4">
          <div class="bg-white/10 rounded-xl p-3 text-center">
            <p class="text-2xl font-bold">47</p><p class="text-xs text-blue-200">Check-ins Today</p>
          </div>
          <div class="bg-white/10 rounded-xl p-3 text-center">
            <p class="text-2xl font-bold">12</p><p class="text-xs text-blue-200">Active Classes</p>
          </div>
          <div class="bg-white/10 rounded-xl p-3 text-center">
            <p class="text-2xl font-bold">108</p><p class="text-xs text-blue-200">Available Spots</p>
          </div>
        </div>
      </div>
      <!-- Quick Actions 2x2 grid -->
      <div class="grid grid-cols-2 gap-4">
        ${ACTIONS.map(a => `
          <button onclick="showSub('${a.action}')"
            class="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-all text-left group">
            <div class="w-12 h-12 ${a.bg} ${a.text} rounded-xl flex items-center justify-center text-2xl mb-3">${a.icon}</div>
            <p class="font-semibold text-slate-800 group-hover:text-indigo-600">${a.label}</p>
          </button>
        `).join('')}
      </div>
      <!-- Open check-in station shortcut -->
      <button onclick="showSub('attendance')"
        class="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:opacity-90 transition-opacity shadow">
        Open Check-in Station →
      </button>
      <!-- Recent check-ins -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-semibold text-slate-800">Recent Check-ins</h3>
          <button onclick="showSub('attendance')" class="text-xs text-indigo-500 hover:underline">View all →</button>
        </div>
        <div class="divide-y divide-slate-50">
          ${[
            { name:'Emma Wilson',    time:'09:42 AM' },
            { name:'James Müller',   time:'09:38 AM' },
            { name:'Sara Kowalski',  time:'09:21 AM' },
            { name:'David Chen',     time:'09:15 AM' },
            { name:'Lena Dubois',    time:'09:04 AM' },
          ].map(c => `
            <div class="flex items-center justify-between px-5 py-3">
              <div class="flex items-center gap-3">
                <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">${c.name[0]}</div>
                <span class="text-sm font-medium text-slate-700">${c.name}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-slate-400">${c.time}</span>
                <span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Active</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`;
}

// ==================== WORKOUT PLANS ====================
function renderWorkoutPlans(el) {
  const plans = [
    { name:'Beginner Full Body', days:3, exercises:18, assignedTo:12, level:'Beginner',     color:'bg-emerald-100 text-emerald-700' },
    { name:'Hypertrophy Split',  days:5, exercises:30, assignedTo:8,  level:'Intermediate', color:'bg-indigo-100 text-indigo-700'   },
    { name:'Powerlifting Prep',  days:4, exercises:24, assignedTo:5,  level:'Advanced',     color:'bg-red-100 text-red-700'         },
    { name:'Home Cardio 20min',  days:5, exercises:12, assignedTo:22, level:'Beginner',     color:'bg-blue-100 text-blue-700'       },
    { name:'Athletic Performance',days:5,exercises:28, assignedTo:7, level:'Advanced',     color:'bg-purple-100 text-purple-700'   },
  ];
  const isStaff = ['GYM_OWNER','BRANCH_MANAGER','TRAINER'].includes(currentUser.role);
  el.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 class="text-xl font-bold text-slate-900">Workout Plans</h2>
          <p class="text-sm text-slate-500 mt-0.5">${isStaff ? 'Create and assign multi-day plans to members' : 'Your assigned training plans'}</p>
        </div>
        ${isStaff ? `<button onclick="showDemoToast('Create new workout plan — multi-day builder would open here.')" class="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">+ New Plan</button>` : ''}
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        ${plans.map(p => `
          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between mb-3">
              <h3 class="font-semibold text-slate-800">${p.name}</h3>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${p.color}">${p.level}</span>
            </div>
            <div class="grid grid-cols-3 gap-2 mb-4">
              <div class="text-center"><p class="text-lg font-bold text-slate-800">${p.days}</p><p class="text-xs text-slate-400">Days/wk</p></div>
              <div class="text-center"><p class="text-lg font-bold text-slate-800">${p.exercises}</p><p class="text-xs text-slate-400">Exercises</p></div>
              <div class="text-center"><p class="text-lg font-bold text-slate-800">${p.assignedTo}</p><p class="text-xs text-slate-400">Assigned</p></div>
            </div>
            <div class="flex gap-2">
              <button onclick="showDemoToast('Viewing plan: ${p.name}')" class="flex-1 py-1.5 rounded-lg text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors">View</button>
              ${isStaff ? `<button onclick="showDemoToast('Assign ${p.name} to member')" class="flex-1 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors">Assign</button>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      ${isStaff ? `
      <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 class="font-semibold text-slate-800 mb-3">Exercise Library</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          ${[
            {name:'Back Squat', cat:'Legs'},    {name:'Bench Press', cat:'Chest'},
            {name:'Deadlift',   cat:'Back'},    {name:'Pull-ups',    cat:'Back'},
            {name:'OHP',        cat:'Shoulders'},{name:'Romanian DL', cat:'Legs'},
            {name:'Dips',       cat:'Chest'},   {name:'Face Pulls',  cat:'Shoulders'},
          ].map(e => `
            <div class="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5">
              <span class="text-sm font-medium text-slate-700">${e.name}</span>
              <span class="text-xs text-slate-400">${e.cat}</span>
            </div>
          `).join('')}
        </div>
      </div>` : ''}
    </div>`;
}

// ==================== PUBLIC PAGES ====================
let currentPublicSub = 'about';
function renderPublicPage(sub) {
  currentPublicSub = sub;
  const el = document.getElementById('public-content');
  if (!el) return;
  window.scrollTo(0, 0);
  switch (sub) {
    case 'about':       renderPublicAbout(el);       break;
    case 'blog':        renderPublicBlog(el);        break;
    case 'classes':     renderPublicClasses(el);     break;
    case 'contact':     renderPublicContact(el);     break;
    case 'events':      renderPublicEvents(el);      break;
    case 'faq':         renderPublicFaq(el);         break;
    case 'free-trial':  renderPublicFreeTrial(el);   break;
    case 'locations':   renderPublicLocations(el);   break;
    case 'memberships': renderPublicMemberships(el); break;
    case 'nutrition':   renderPublicNutrition(el);   break;
    case 'pricing':     renderPublicPricing(el);     break;
    case 'programs':    renderPublicPrograms(el);    break;
    case 'trainers':    renderPublicTrainers(el);    break;
    default:            renderPublicAbout(el);
  }
}

function renderPublicAbout(el) {
  el.innerHTML = `
    <section class="pt-20 pb-16 px-6 bg-gradient-to-b from-slate-50 to-white text-center">
      <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Built by athletes, for everyone</h1>
      <p class="text-slate-500 max-w-xl mx-auto text-lg">We started with one belief: world-class fitness should be accessible to every body.</p>
    </section>
    <section class="px-6 pb-16">
      <div class="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 mb-4">Our story</h2>
          <p class="text-slate-600 leading-relaxed mb-4">GymFlow was founded in Amsterdam in 2019 by a group of athletes who were frustrated by overcrowded, overpriced gyms with no real community. We opened our first location in Centrum with a simple promise: great coaching, transparent pricing, and a space where you actually want to show up.</p>
          <p class="text-slate-600 leading-relaxed">Six years later we have 15 locations across Amsterdam, London, Berlin and Paris — and over 12,000 members. But the mission hasn't changed.</p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-indigo-50 rounded-2xl p-5 text-center"><p class="text-3xl font-extrabold text-indigo-600">2019</p><p class="text-sm text-slate-600 mt-1">Founded in Amsterdam</p></div>
          <div class="bg-indigo-50 rounded-2xl p-5 text-center"><p class="text-3xl font-extrabold text-indigo-600">15</p><p class="text-sm text-slate-600 mt-1">Locations</p></div>
          <div class="bg-indigo-50 rounded-2xl p-5 text-center"><p class="text-3xl font-extrabold text-indigo-600">12k+</p><p class="text-sm text-slate-600 mt-1">Active members</p></div>
          <div class="bg-indigo-50 rounded-2xl p-5 text-center"><p class="text-3xl font-extrabold text-indigo-600">120+</p><p class="text-sm text-slate-600 mt-1">Certified trainers</p></div>
        </div>
      </div>
    </section>
    <section class="px-6 pb-16 bg-slate-50">
      <div class="max-w-5xl mx-auto py-12">
        <h2 class="text-2xl font-bold text-slate-900 text-center mb-8">Our values</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          ${[
            { icon:'❤️',  title:'Health first',   desc:'Everything we do is guided by long-term wellbeing — physical and mental.' },
            { icon:'🤝', title:'Community',       desc:'No judgement. Everyone belongs, from day one to year ten.' },
            { icon:'🌍', title:'Accessible',      desc:'Fair pricing, flexible memberships, six cities and counting.' },
            { icon:'🏆', title:'Excellence',      desc:'120+ certified coaches pushing you and themselves every single day.' },
          ].map(v => `
            <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
              <div class="text-3xl mb-3">${v.icon}</div>
              <h3 class="font-semibold text-slate-800 mb-1">${v.title}</h3>
              <p class="text-sm text-slate-500 leading-relaxed">${v.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    <section class="px-6 pb-16">
      <div class="max-w-5xl mx-auto">
        <h2 class="text-2xl font-bold text-slate-900 text-center mb-8">Meet the leadership team</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${[
            { name:'Daniel Park',    role:'CEO & Co-founder',        color:'bg-indigo-500' },
            { name:'Maya Adler',     role:'COO & Co-founder',        color:'bg-purple-500' },
            { name:'Theo Laurent',   role:'Head of Training',        color:'bg-blue-500'   },
            { name:'Nadia Volkov',   role:'Head of Nutrition',       color:'bg-emerald-500'},
          ].map(t => `
            <div class="text-center">
              <div class="w-20 h-20 ${t.color} rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold mb-3">${t.name[0]}</div>
              <p class="font-semibold text-slate-800">${t.name}</p>
              <p class="text-sm text-slate-500">${t.role}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    <section class="px-6 py-16 bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-center">
      <h2 class="text-3xl font-extrabold mb-4">Ready to be part of it?</h2>
      <p class="text-indigo-100 mb-6">Your first week is free. No card needed.</p>
      <button onclick="navigate('public','free-trial')" class="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-3 rounded-xl font-bold transition-colors">Start free trial →</button>
    </section>`;
}

function renderPublicBlog(el) {
  const POSTS = [
    { id:1, title:'How deep should you squat?', cat:'Training',  author:'Alex Carter',  date:'May 18, 2026', readMin:5,  excerpt:'The answer depends on your anatomy, not Instagram.' },
    { id:2, title:'10 high-protein breakfasts ready in 5 minutes', cat:'Nutrition', author:'Nadia Volkov', date:'May 12, 2026', readMin:4, excerpt:'Start your day with 30+ grams of protein without a blender.' },
    { id:3, title:'Why sleep is your best recovery tool', cat:'Recovery',  author:'Theo Laurent', date:'May 5, 2026',  readMin:6,  excerpt:'Optimising sleep gave our members better results than most supplements.' },
    { id:4, title:"Sara's story: 14 kg down in 6 months", cat:'Stories',   author:'GymFlow Team', date:'Apr 28, 2026', readMin:3,  excerpt:'How a complete beginner rebuilt her confidence one session at a time.' },
    { id:5, title:'Programming HIIT without burning out', cat:'Training',  author:'Alex Carter',  date:'Apr 20, 2026', readMin:7,  excerpt:'Most people do HIIT wrong. Here is the evidence-backed approach.' },
    { id:6, title:'Carbs before endurance training: the full guide', cat:'Nutrition', author:'Nadia Volkov', date:'Apr 14, 2026', readMin:5, excerpt:'Fuelling your run or cycle session for maximum performance.' },
  ];
  const catColors = { Training:'bg-indigo-100 text-indigo-700', Nutrition:'bg-emerald-100 text-emerald-700', Recovery:'bg-blue-100 text-blue-700', Stories:'bg-orange-100 text-orange-700' };
  const gradients = ['from-indigo-400 to-purple-500','from-emerald-400 to-teal-500','from-blue-400 to-cyan-500','from-orange-400 to-pink-500','from-rose-400 to-fuchsia-500','from-amber-400 to-orange-500'];
  el.innerHTML = `
    <section class="pt-20 pb-10 px-6 bg-gradient-to-b from-slate-50 to-white text-center">
      <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">GymFlow Blog</h1>
      <p class="text-slate-500 max-w-xl mx-auto">Training, nutrition, recovery and real stories from our community.</p>
    </section>
    <section class="px-6 pb-16">
      <div class="max-w-6xl mx-auto">
        <div class="flex flex-wrap gap-2 mb-8 justify-center">
          ${['All','Training','Nutrition','Recovery','Stories'].map(c => `
            <button onclick="showDemoToast('Filter by: ${c}')" class="px-4 py-1.5 rounded-full text-sm font-medium border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-colors">${c}</button>
          `).join('')}
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${POSTS.map((p, i) => `
            <div class="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div class="h-36 bg-gradient-to-br ${gradients[i]} flex items-center justify-center">
                <span class="text-4xl">📝</span>
              </div>
              <div class="p-5">
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${catColors[p.cat] || 'bg-slate-100 text-slate-600'}">${p.cat}</span>
                <h3 class="font-bold text-slate-800 mt-2 mb-1 leading-snug">${p.title}</h3>
                <p class="text-sm text-slate-500 leading-relaxed mb-3">${p.excerpt}</p>
                <div class="flex items-center justify-between text-xs text-slate-400">
                  <span>${p.author}</span>
                  <span>${p.date} · ${p.readMin} min</span>
                </div>
              </div>
              <div class="px-5 pb-5">
                <button onclick="showDemoToast('Reading: ${p.title}')" class="w-full py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors">Read article →</button>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="mt-12 bg-indigo-50 rounded-2xl p-8 text-center max-w-xl mx-auto">
          <h3 class="font-bold text-slate-900 mb-2">Get new articles in your inbox</h3>
          <p class="text-sm text-slate-500 mb-4">Weekly tips on training, nutrition and recovery.</p>
          <div class="flex gap-2">
            <input type="email" placeholder="you@example.com" class="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-400"/>
            <button onclick="showDemoToast('Subscribed to newsletter!')" class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">Subscribe</button>
          </div>
        </div>
      </div>
    </section>`;
}

function renderPublicClasses(el) {
  const CLASSES = [
    { name:'Morning HIIT',       cat:'HIIT',     trainer:'Alex Carter',  level:'Intermediate', dur:45, cap:20, booked:14, day:'Mon', time:'07:00' },
    { name:'Power Yoga',         cat:'Yoga',     trainer:'Lena Schmidt', level:'Beginner',     dur:60, cap:25, booked:22, day:'Mon', time:'18:30' },
    { name:'Spin Cycle',         cat:'Cardio',   trainer:'Marco Rossi',  level:'Intermediate', dur:50, cap:30, booked:11, day:'Tue', time:'19:00' },
    { name:'Strength 101',       cat:'Strength', trainer:'Alex Carter',  level:'Beginner',     dur:60, cap:15, booked:8,  day:'Wed', time:'08:00' },
    { name:'Boxing Conditioning',cat:'Boxing',   trainer:'Jamal Dia',    level:'Advanced',     dur:60, cap:18, booked:18, day:'Wed', time:'20:00' },
    { name:'Pilates Flow',       cat:'Pilates',  trainer:'Sophie Moreau',level:'Beginner',     dur:45, cap:20, booked:9,  day:'Thu', time:'09:30' },
    { name:'CrossFit WOD',       cat:'CrossFit', trainer:'Marco Rossi',  level:'Advanced',     dur:60, cap:16, booked:12, day:'Fri', time:'17:00' },
    { name:'Zumba Party',        cat:'Dance',    trainer:'Sophie Moreau',level:'Beginner',     dur:50, cap:35, booked:28, day:'Sat', time:'10:00' },
    { name:'Sunday Stretch',     cat:'Yoga',     trainer:'Lena Schmidt', level:'Beginner',     dur:60, cap:25, booked:6,  day:'Sun', time:'11:00' },
  ];
  const levelColor = {Beginner:'bg-green-100 text-green-700',Intermediate:'bg-yellow-100 text-yellow-700',Advanced:'bg-red-100 text-red-700'};
  el.innerHTML = `
    <section class="pt-20 pb-10 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
      <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Live class schedule</h1>
      <p class="text-slate-500 max-w-xl mx-auto">45+ weekly classes. Book a trial class to try anything for free.</p>
    </section>
    <section class="px-6 pb-16">
      <div class="max-w-6xl mx-auto">
        <div class="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap gap-3 items-center mb-6">
          <span class="text-sm text-slate-500">Filter:</span>
          ${['All','Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => `
            <button onclick="showDemoToast('Filter day: ${d}')" class="px-3 py-1 rounded-lg text-xs font-medium border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-colors">${d}</button>
          `).join('')}
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          ${CLASSES.map(c => {
            const pct = Math.round(c.booked / c.cap * 100);
            const statusLabel = pct >= 100 ? 'Full' : pct >= 75 ? 'Filling fast' : 'Spots open';
            const statusColor = pct >= 100 ? 'bg-red-100 text-red-700' : pct >= 75 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700';
            return `
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="font-bold text-slate-800">${c.name}</h3>
                  <p class="text-xs text-slate-500 mt-0.5">${c.trainer}</p>
                </div>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${levelColor[c.level]}">${c.level}</span>
              </div>
              <div class="flex gap-3 text-xs text-slate-500 mb-3">
                <span>📅 ${c.day}</span><span>🕐 ${c.time}</span><span>⏱ ${c.dur}min</span>
              </div>
              <div class="flex items-center justify-between mb-3">
                <div class="flex-1 bg-slate-100 rounded-full h-1.5 mr-3">
                  <div class="h-1.5 rounded-full bg-indigo-400" style="width:${pct}%"></div>
                </div>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor}">${statusLabel}</span>
              </div>
              <button onclick="navigate('public','free-trial')" class="w-full py-2 rounded-xl text-xs font-semibold ${pct >= 100 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600 text-white transition-colors'}">${pct >= 100 ? 'Class full' : 'Book free trial'}</button>
            </div>`;
          }).join('')}
        </div>
      </div>
    </section>`;
}

function renderPublicContact(el) {
  el.innerHTML = `
    <section class="pt-20 pb-10 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
      <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Get in touch</h1>
      <p class="text-slate-500 max-w-xl mx-auto">A real person will reply within one business day.</p>
    </section>
    <section class="px-6 pb-16">
      <div class="max-w-5xl mx-auto grid lg:grid-cols-5 gap-10">
        <div class="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h2 class="text-xl font-bold text-slate-900 mb-6">Send a message</h2>
          <div class="space-y-4">
            <div class="grid sm:grid-cols-2 gap-4">
              <div><label class="block text-sm font-medium text-slate-700 mb-1.5">Full name</label><input type="text" placeholder="Your name" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"/></div>
              <div><label class="block text-sm font-medium text-slate-700 mb-1.5">Email</label><input type="email" placeholder="you@example.com" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"/></div>
            </div>
            <div><label class="block text-sm font-medium text-slate-700 mb-1.5">Topic</label>
              <select class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white">
                <option>Membership enquiry</option><option>Class booking</option><option>Personal training</option><option>Corporate wellness</option><option>Press & media</option><option>Other</option>
              </select>
            </div>
            <div><label class="block text-sm font-medium text-slate-700 mb-1.5">Message</label><textarea rows="4" placeholder="How can we help?" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none"></textarea></div>
            <button onclick="showDemoToast('Message sent! We will reply within 1 business day.')" class="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">Send message</button>
          </div>
        </div>
        <div class="lg:col-span-2 space-y-4">
          ${[
            { icon:'✉️', label:'Email us',    value:'hello@gymflow.com',       sub:'Reply within 24h' },
            { icon:'📞', label:'Call us',     value:'+31 20 123 4567',          sub:'Mon–Fri 8am–8pm' },
            { icon:'📍', label:'Head office', value:'Damrak 12, Amsterdam',     sub:'Open to visits by appointment' },
          ].map(c => `
            <div class="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-start gap-4">
              <div class="text-2xl">${c.icon}</div>
              <div><p class="font-semibold text-slate-800">${c.label}</p><p class="text-sm text-indigo-600 font-medium">${c.value}</p><p class="text-xs text-slate-400">${c.sub}</p></div>
            </div>
          `).join('')}
          <div class="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
            <p class="font-semibold text-slate-800 mb-1">Want to try before joining?</p>
            <p class="text-sm text-slate-500 mb-3">Book a free 7-day trial — no card needed.</p>
            <button onclick="navigate('public','free-trial')" class="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-xl text-sm font-semibold transition-colors">Start free trial</button>
          </div>
        </div>
      </div>
    </section>`;
}

function renderPublicEvents(el) {
  const EVENTS = [
    { title:'Spring Open House',    date:'Jun 8, 2026',  loc:'GymFlow Amsterdam Centrum',  price:'Free',                 tag:'Community',   img:'from-amber-400 to-orange-600',  desc:'Tour the gym, try classes, meet the trainers. Bring a friend!' },
    { title:'Charity HIIT Marathon',date:'Jun 22, 2026', loc:'All branches',               price:'$20 entry',            tag:'Charity',     img:'from-rose-500 to-pink-600',     desc:'4-hour HIIT relay. All proceeds to youth sports programs.' },
    { title:'Powerlifting Meet',    date:'Jul 15, 2026', loc:'London Shoreditch',           price:'$35 athlete · Free spectator', tag:'Competition', img:'from-indigo-600 to-purple-700', desc:'Local meet — open to all levels. Trophies & PRs guaranteed.' },
    { title:'Yoga in the Park',     date:'Jul 28, 2026', loc:'Vondelpark, Amsterdam',       price:'Free for members',     tag:'Wellness',    img:'from-emerald-400 to-teal-600',  desc:'Sunrise vinyasa flow with Lena. Mats provided.' },
  ];
  const tagColor = { Community:'bg-amber-100 text-amber-700', Charity:'bg-rose-100 text-rose-700', Competition:'bg-indigo-100 text-indigo-700', Wellness:'bg-emerald-100 text-emerald-700' };
  el.innerHTML = `
    <section class="pt-20 pb-10 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
      <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Upcoming events</h1>
      <p class="text-slate-500 max-w-xl mx-auto">Competitions, open days and community workouts across all locations.</p>
    </section>
    <section class="px-6 pb-16">
      <div class="max-w-5xl mx-auto grid sm:grid-cols-2 gap-6">
        ${EVENTS.map(e => `
          <div class="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div class="h-36 bg-gradient-to-br ${e.img} flex items-end p-4">
              <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-white">${e.tag}</span>
            </div>
            <div class="p-5">
              <h3 class="font-bold text-slate-800 text-lg mb-1">${e.title}</h3>
              <p class="text-sm text-slate-500 mb-3">${e.desc}</p>
              <div class="flex flex-col gap-1 text-xs text-slate-500 mb-4">
                <span>📅 ${e.date}</span>
                <span>📍 ${e.loc}</span>
                <span>🎟 ${e.price}</span>
              </div>
              <button onclick="navigate('public','free-trial')" class="w-full py-2 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-colors">Register</button>
            </div>
          </div>
        `).join('')}
      </div>
    </section>`;
}

function renderPublicFaq(el) {
  const FAQS = [
    { cat:'Membership', q:'Can I freeze my membership?',          a:'Yes — you can freeze for up to 60 days per year at no cost. Just submit a request 3 days before your next billing date.' },
    { cat:'Membership', q:'Is there a joining fee?',              a:'No joining fee — ever. You pay only your monthly or annual plan.' },
    { cat:'Membership', q:'Can I use all locations?',             a:'Premium and Elite plans include all 15 locations. Basic plan is limited to your home branch.' },
    { cat:'Billing',    q:'How does billing work?',               a:'Plans renew automatically each month or year. You receive an invoice by email before each renewal.' },
    { cat:'Billing',    q:'Can I cancel at any time?',            a:'Yes — cancel anytime with no penalty. Your access continues until the end of the billing period.' },
    { cat:'Billing',    q:'Do you offer student discounts?',      a:'Yes — use code STUDENT20 for 20% off any monthly plan. Verification required.' },
    { cat:'Classes',    q:'How do I book a class?',               a:'Book via the mobile app or member dashboard up to 7 days in advance. Trial members can book any one class for free.' },
    { cat:'Classes',    q:'What if I miss a booked class?',       a:'Cancel at least 2 hours before class to avoid a late-cancel fee. Three no-shows in a month will restrict future bookings.' },
    { cat:'Trainers',   q:'How do I book a PT session?',          a:'Elite members get 4 PT sessions per month included. All members can purchase individual sessions from the PT Sessions page.' },
    { cat:'Trainers',   q:'Can I change my trainer?',             a:'Absolutely. You can request a different trainer at any time — no questions asked.' },
    { cat:'Facilities', q:'What are the opening hours?',          a:'Most locations are open 06:00–22:00 on weekdays and 08:00–20:00 on weekends. Check your branch page for exact hours.' },
    { cat:'Facilities', q:'Is parking available?',                a:'Amsterdam and Berlin branches have dedicated bike parking. London and Paris branches are best reached by public transport.' },
  ];
  const cats = [...new Set(FAQS.map(f => f.cat))];
  el.innerHTML = `
    <section class="pt-20 pb-10 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
      <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Frequently asked questions</h1>
      <p class="text-slate-500 max-w-xl mx-auto">Can't find an answer? <button onclick="navigate('public','contact')" class="text-indigo-500 hover:underline">Contact us</button>.</p>
    </section>
    <section class="px-6 pb-16">
      <div class="max-w-3xl mx-auto">
        <div class="flex flex-wrap gap-2 justify-center mb-8">
          ${['All',...cats].map(c => `<button onclick="showDemoToast('Filter FAQ: ${c}')" class="px-4 py-1.5 rounded-full text-sm font-medium border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-colors">${c}</button>`).join('')}
        </div>
        <div class="space-y-3">
          ${FAQS.map((f, i) => `
            <details class="bg-white rounded-2xl border border-slate-100 shadow-sm group">
              <summary class="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                <div>
                  <span class="text-xs font-semibold text-indigo-500 mr-2">${f.cat}</span>
                  <span class="font-medium text-slate-800">${f.q}</span>
                </div>
                <span class="text-slate-400 group-open:rotate-90 transition-transform text-lg">›</span>
              </summary>
              <p class="px-5 pb-5 text-sm text-slate-600 leading-relaxed">${f.a}</p>
            </details>
          `).join('')}
        </div>
      </div>
    </section>`;
}

function renderPublicFreeTrial(el) {
  el.innerHTML = `
    <section class="min-h-screen px-6 py-20 bg-gradient-to-b from-slate-50 to-white flex items-start justify-center">
      <div class="w-full max-w-lg">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-extrabold tracking-tight mb-2">Start your free trial</h1>
          <p class="text-slate-500">7 days free. No credit card needed.</p>
        </div>
        <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div class="flex items-center justify-center gap-2 mb-8">
            ${[1,2,3].map(n => `
              <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${n === 1 ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'}">${n}</div>
              ${n < 3 ? '<div class="w-10 h-0.5 bg-slate-200"></div>' : ''}
            `).join('')}
          </div>
          <div class="space-y-4">
            <div class="grid sm:grid-cols-2 gap-4">
              <div><label class="block text-sm font-medium text-slate-700 mb-1.5">Full name</label><input type="text" placeholder="Sara Miller" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"/></div>
              <div><label class="block text-sm font-medium text-slate-700 mb-1.5">Email</label><input type="email" placeholder="sara@example.com" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"/></div>
            </div>
            <div><label class="block text-sm font-medium text-slate-700 mb-1.5">Phone</label><input type="tel" placeholder="+31 6 12345678" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"/></div>
            <div><label class="block text-sm font-medium text-slate-700 mb-1.5">Preferred branch</label>
              <select class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white">
                <option>Amsterdam Centrum</option><option>Amsterdam Zuid</option><option>London Shoreditch</option><option>London King's Cross</option><option>Berlin Mitte</option><option>Paris Marais</option>
              </select>
            </div>
            <div><label class="block text-sm font-medium text-slate-700 mb-1.5">Your goal</label>
              <select class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-white">
                <option>Lose weight</option><option>Build muscle</option><option>Get fit</option><option>Train for a sport</option><option>General health</option>
              </select>
            </div>
            <button onclick="showDemoToast('🎉 Trial booked! Check your email for your confirmation & QR code.')" class="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm transition-colors">Claim my free trial →</button>
          </div>
          <p class="text-center text-xs text-slate-400 mt-4">No credit card · Cancel anytime · Free for 7 days</p>
        </div>
        <div class="mt-6 grid grid-cols-3 gap-3">
          ${[{icon:'✅',text:'No credit card'},{icon:'🕐',text:'7 days free'},{icon:'❌',text:'Cancel anytime'}].map(b => `
            <div class="text-center text-xs text-slate-500 flex flex-col items-center gap-1"><span class="text-lg">${b.icon}</span>${b.text}</div>
          `).join('')}
        </div>
      </div>
    </section>`;
}

function renderPublicLocations(el) {
  const LOCS = [
    { name:'Amsterdam Centrum', addr:'Damrak 12, 1012 LG Amsterdam',      phone:'+31 20 123 4567', occ:72, hours:'06:00–22:00', facilities:['Weights','Cardio','Pool','Sauna','Spin studio'] },
    { name:'Amsterdam Zuid',    addr:'Apollolaan 155, 1077 AS Amsterdam',  phone:'+31 20 234 5678', occ:45, hours:'06:00–22:00', facilities:['Weights','Cardio','Yoga studio','Café'] },
    { name:'London Shoreditch', addr:'2 Curtain Rd, London EC2A 3JP',      phone:'+44 20 7123 4567',occ:81, hours:'05:30–23:00', facilities:['Weights','Cardio','Boxing','Sauna','Rooftop'] },
    { name:'London King\'s Cross',addr:'7 Pancras Rd, London N1C 4AG',    phone:'+44 20 8765 4321',occ:58, hours:'06:00–22:00', facilities:['Weights','Cardio','Functional','Spin'] },
    { name:'Berlin Mitte',      addr:'Unter den Linden 40, 10117 Berlin',  phone:'+49 30 123 4567', occ:37, hours:'06:00–22:00', facilities:['Weights','Cardio','CrossFit rig','Recovery zone'] },
    { name:'Paris Marais',      addr:'22 Rue des Archives, 75004 Paris',   phone:'+33 1 23 45 67 89',occ:63, hours:'06:30–22:00', facilities:['Weights','Cardio','Pilates studio','Nutrition bar'] },
  ];
  el.innerHTML = `
    <section class="pt-20 pb-10 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
      <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Our locations</h1>
      <p class="text-slate-500 max-w-xl mx-auto">6 premium gyms across Amsterdam, London, Berlin and Paris.</p>
    </section>
    <section class="px-6 pb-16">
      <div class="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        ${LOCS.map(l => {
          const occColor = l.occ >= 80 ? 'text-red-600' : l.occ >= 60 ? 'text-orange-600' : 'text-emerald-600';
          const ringColor = l.occ >= 80 ? 'stroke-red-500' : l.occ >= 60 ? 'stroke-orange-500' : 'stroke-emerald-500';
          const circ = 2*Math.PI*16;
          const dash = circ*(1-l.occ/100);
          return `
          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between mb-4">
              <h3 class="font-bold text-slate-800 leading-snug">${l.name}</h3>
              <div class="relative w-10 h-10 shrink-0 ml-2">
                <svg viewBox="0 0 40 40" class="w-full -rotate-90">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" stroke-width="4"/>
                  <circle cx="20" cy="20" r="16" fill="none" class="${ringColor}" stroke-width="4" stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${dash.toFixed(1)}" stroke-linecap="round"/>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center"><span class="text-xs font-bold ${occColor}">${l.occ}%</span></div>
              </div>
            </div>
            <div class="space-y-1 text-xs text-slate-500 mb-4">
              <div class="flex items-center gap-2">📍 <span>${l.addr}</span></div>
              <div class="flex items-center gap-2">📞 <span>${l.phone}</span></div>
              <div class="flex items-center gap-2">🕐 <span>${l.hours}</span></div>
            </div>
            <div class="flex flex-wrap gap-1 mb-4">
              ${l.facilities.map(f => `<span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">${f}</span>`).join('')}
            </div>
            <button onclick="navigate('public','free-trial')" class="w-full py-2 rounded-xl text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-colors">Try this location free</button>
          </div>`;
        }).join('')}
      </div>
    </section>`;
}

function renderPublicMemberships(el) {
  const TIERS = [
    { name:'Day Pass',       price:'$15',  period:'one-time', desc:'Walk in for a single workout.',        perks:['Full gym access for 24h','Locker & shower','No registration needed'], popular:false },
    { name:'10-Visit Pack',  price:'$110', period:'pack',     desc:'For occasional visitors.',             perks:['10 visits, valid 6 months','Shareable with friends','No monthly commitment'], popular:false },
    { name:'Monthly Open',   price:'$29',  period:'/mo',      desc:'Unlimited gym access.',                perks:['24/7 access','Locker room','Mobile app','Free Wi-Fi'], popular:false },
    { name:'Monthly Plus',   price:'$49',  period:'/mo',      desc:'Most popular for new members.',        perks:['Everything in Open','Unlimited group classes','Nutrition plans','2 guest passes/mo'], popular:true },
    { name:'Annual Elite',   price:'$890', period:'/yr',      desc:'Save big & unlock VIP perks.',         perks:['Everything in Plus','1-on-1 PT (4x/mo)','AI diet & program','Recovery zone','Priority bookings'], popular:false },
  ];
  el.innerHTML = `
    <section class="pt-20 pb-10 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
      <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Memberships for every lifestyle</h1>
      <p class="text-slate-500 max-w-xl mx-auto">Drop in for a day or commit for a year — choose the rhythm that suits you.</p>
    </section>
    <section class="px-6 pb-10">
      <div class="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
        ${TIERS.map(t => `
          <div class="relative rounded-2xl p-5 border ${t.popular ? 'border-2 border-indigo-400 shadow-lg shadow-indigo-100' : 'border-slate-200'} bg-white">
            ${t.popular ? '<span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">Most popular</span>' : ''}
            <h3 class="font-bold text-slate-900">${t.name}</h3>
            <p class="text-xs text-slate-500 mt-0.5 mb-3">${t.desc}</p>
            <div class="mb-3"><span class="text-2xl font-extrabold text-slate-900">${t.price}</span><span class="text-slate-500 text-xs ml-1">${t.period}</span></div>
            <ul class="space-y-1.5 mb-4 text-xs text-slate-600">
              ${t.perks.map(p => `<li class="flex items-center gap-1.5">✅ ${p}</li>`).join('')}
            </ul>
            <button onclick="navigate('public','free-trial')" class="w-full py-2 rounded-xl text-xs font-semibold transition-colors ${t.popular ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'border border-slate-200 hover:border-slate-400 text-slate-700'}">Get started</button>
          </div>
        `).join('')}
      </div>
    </section>
    <section class="px-6 pb-16">
      <div class="max-w-4xl mx-auto bg-slate-50 rounded-2xl p-8">
        <h2 class="text-xl font-bold text-slate-900 mb-6 text-center">Member benefits</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          ${[
            { icon:'⏸', title:'Freeze for free',  desc:'Pause up to 60 days/year.' },
            { icon:'🎁', title:'Refer & earn',     desc:'Give $20, get $20 credit.' },
            { icon:'👨‍👩‍👧', title:'Family bundle',  desc:'Add a partner, save 15%.' },
            { icon:'🎂', title:'Birthday boost',   desc:'Free PT + smoothie.' },
          ].map(b => `
            <div class="text-center">
              <div class="text-3xl mb-2">${b.icon}</div>
              <p class="font-semibold text-slate-800 text-sm">${b.title}</p>
              <p class="text-xs text-slate-500 mt-0.5">${b.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`;
}

function renderPublicNutrition(el) {
  const MEALS = [
    { name:'Power Oats Bowl',          kcal:420, protein:28, carbs:55, fat:12, tag:'Breakfast' },
    { name:'Grilled Chicken Quinoa',   kcal:560, protein:42, carbs:48, fat:18, tag:'Lunch'     },
    { name:'Salmon & Sweet Potato',    kcal:610, protein:38, carbs:52, fat:25, tag:'Dinner'    },
    { name:'Greek Yogurt + Berries',   kcal:220, protein:18, carbs:24, fat:5,  tag:'Snack'     },
    { name:'Tofu Stir-Fry',            kcal:480, protein:26, carbs:50, fat:16, tag:'Vegan'     },
    { name:'Protein Smoothie',         kcal:310, protein:32, carbs:28, fat:8,  tag:'Snack'     },
  ];
  const tagColor = {Breakfast:'bg-amber-100 text-amber-700',Lunch:'bg-blue-100 text-blue-700',Dinner:'bg-indigo-100 text-indigo-700',Snack:'bg-emerald-100 text-emerald-700',Vegan:'bg-green-100 text-green-700'};
  el.innerHTML = `
    <section class="pt-20 pb-10 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
      <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Eat for results</h1>
      <p class="text-slate-500 max-w-xl mx-auto">Plans built around your goals — backed by our AI nutrition coach.</p>
    </section>
    <section class="px-6 pb-10">
      <div class="max-w-5xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 class="font-bold text-slate-800 text-lg mb-4">TDEE calculator</h2>
        <div class="grid sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          ${[{l:'Weight (kg)',id:'n-w',v:'70'},{l:'Height (cm)',id:'n-h',v:'170'},{l:'Age',id:'n-age',v:'28'}].map(f => `
            <div class="lg:col-span-1"><label class="block text-xs font-medium text-slate-600 mb-1">${f.l}</label><input id="${f.id}" type="number" value="${f.v}" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div>
          `).join('')}
          <div><label class="block text-xs font-medium text-slate-600 mb-1">Sex</label><select id="n-sex" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"><option>Male</option><option>Female</option></select></div>
          <div><label class="block text-xs font-medium text-slate-600 mb-1">Activity</label><select id="n-act" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"><option>Sedentary</option><option selected>Moderate</option><option>Active</option></select></div>
          <div><label class="block text-xs font-medium text-slate-600 mb-1">Goal</label><select id="n-goal" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"><option>Lose weight</option><option selected>Maintain</option><option>Bulk</option></select></div>
        </div>
        <div id="n-result" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-indigo-50 rounded-xl p-4 text-center"><p class="text-2xl font-extrabold text-indigo-700">2320</p><p class="text-xs text-slate-500 mt-1">TDEE (kcal)</p></div>
          <div class="bg-emerald-50 rounded-xl p-4 text-center"><p class="text-2xl font-extrabold text-emerald-700">140g</p><p class="text-xs text-slate-500 mt-1">Protein</p></div>
          <div class="bg-amber-50 rounded-xl p-4 text-center"><p class="text-2xl font-extrabold text-amber-700">270g</p><p class="text-xs text-slate-500 mt-1">Carbs</p></div>
          <div class="bg-red-50 rounded-xl p-4 text-center"><p class="text-2xl font-extrabold text-red-700">65g</p><p class="text-xs text-slate-500 mt-1">Fat</p></div>
        </div>
      </div>
    </section>
    <section class="px-6 pb-16">
      <div class="max-w-5xl mx-auto">
        <h2 class="font-bold text-slate-900 text-xl mb-6">Sample meal ideas</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${MEALS.map(m => `
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-semibold text-slate-800">${m.name}</h3>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${tagColor[m.tag]}">${m.tag}</span>
              </div>
              <div class="grid grid-cols-4 gap-2 text-center">
                <div><p class="text-sm font-bold text-slate-800">${m.kcal}</p><p class="text-xs text-slate-400">kcal</p></div>
                <div><p class="text-sm font-bold text-emerald-600">${m.protein}g</p><p class="text-xs text-slate-400">protein</p></div>
                <div><p class="text-sm font-bold text-amber-600">${m.carbs}g</p><p class="text-xs text-slate-400">carbs</p></div>
                <div><p class="text-sm font-bold text-red-400">${m.fat}g</p><p class="text-xs text-slate-400">fat</p></div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="mt-8 text-center bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <h3 class="text-2xl font-bold mb-2">Want a personalised plan?</h3>
          <p class="text-indigo-100 mb-4">Join and get an AI-generated diet plan built around your goals, schedule and food preferences.</p>
          <button onclick="navigate('public','free-trial')" class="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-2.5 rounded-xl font-bold transition-colors">Start free trial →</button>
        </div>
      </div>
    </section>`;
}

function renderPublicPricing(el) {
  el.innerHTML = `
    <section class="pt-20 pb-10 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
      <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Simple, honest pricing</h1>
      <p class="text-slate-500 max-w-xl mx-auto">No contracts. No hidden fees. Cancel anytime.</p>
      <div class="inline-flex items-center gap-3 bg-slate-100 rounded-full p-1 mt-6">
        <button id="price-monthly" onclick="setPricingToggle(false)" class="px-5 py-2 rounded-full text-sm font-semibold bg-white shadow text-slate-900 transition-colors">Monthly</button>
        <button id="price-yearly"  onclick="setPricingToggle(true)"  class="px-5 py-2 rounded-full text-sm font-semibold text-slate-500 transition-colors">Yearly <span class="text-emerald-500 text-xs ml-1">Save 2 months</span></button>
      </div>
    </section>
    <section class="px-6 pb-10">
      <div class="max-w-5xl mx-auto grid sm:grid-cols-3 gap-6">
        ${[
          { name:'Basic',   mo:29,  yr:290,  desc:'Just the essentials',  color:'',        features:['Open gym access','Locker room','Free Wi-Fi','Mobile app','1 location'] },
          { name:'Premium', mo:49,  yr:490,  desc:'Most popular',         color:'popular', features:['Everything in Basic','Group classes','Trainer access','Nutrition plans','2 guest passes/mo','All 15 locations'] },
          { name:'Elite',   mo:89,  yr:890,  desc:'Full experience',      color:'',        features:['Everything in Premium','1-on-1 PT (4x/mo)','AI diet & program','Recovery zone','Unlimited guests','Priority bookings'] },
        ].map(p => `
          <div id="price-card-${p.name.toLowerCase()}" class="relative rounded-2xl p-6 border ${p.color === 'popular' ? 'border-2 border-indigo-400 shadow-xl shadow-indigo-100' : 'border-slate-200'} bg-white">
            ${p.color === 'popular' ? '<span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">Most popular</span>' : ''}
            <h3 class="font-bold text-lg text-slate-900">${p.name}</h3>
            <p class="text-slate-500 text-sm mt-1 mb-4">${p.desc}</p>
            <div class="mb-5">
              <span class="text-4xl font-extrabold text-slate-900" data-mo="${p.mo}" data-yr="${p.yr}">$${p.mo}</span>
              <span class="text-slate-500 text-sm price-period">/mo</span>
            </div>
            <ul class="space-y-2 mb-6 text-sm text-slate-600">
              ${p.features.map(f => `<li class="flex items-center gap-2">✅ ${f}</li>`).join('')}
            </ul>
            <button onclick="navigate('public','free-trial')" class="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${p.color === 'popular' ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'border border-slate-200 hover:border-slate-400 text-slate-700'}">Start free trial</button>
          </div>
        `).join('')}
      </div>
    </section>
    <section class="px-6 pb-10">
      <div class="max-w-3xl mx-auto bg-slate-50 rounded-2xl p-6">
        <p class="text-sm font-medium text-slate-700 mb-2">Have a promo code?</p>
        <div class="flex gap-2">
          <input id="promo-input" type="text" placeholder="e.g. STUDENT20" class="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-400"/>
          <button onclick="applyPromo()" class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">Apply</button>
        </div>
        <p id="promo-msg" class="text-xs mt-2 text-slate-400"></p>
      </div>
    </section>
    <section class="px-6 pb-16">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-xl font-bold text-slate-900 text-center mb-6">Pricing FAQ</h2>
        <div class="space-y-3">
          ${[
            {q:'Can I switch plans?',                 a:'Yes — upgrade or downgrade anytime. The change takes effect on your next billing date.'},
            {q:'What payment methods are accepted?',  a:'Visa, Mastercard, AMEX and SEPA direct debit for European customers.'},
            {q:'Is there a free trial?',              a:'Yes — 7 days free, no card required. Start from any plan page.'},
            {q:'Do you offer student discounts?',     a:'Use code STUDENT20 for 20% off any monthly plan. Valid with student ID verification.'},
          ].map(f => `
            <details class="bg-white rounded-2xl border border-slate-100 shadow-sm group">
              <summary class="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                <span class="font-medium text-slate-800">${f.q}</span>
                <span class="text-slate-400 group-open:rotate-90 transition-transform text-lg">›</span>
              </summary>
              <p class="px-5 pb-5 text-sm text-slate-600">${f.a}</p>
            </details>
          `).join('')}
        </div>
      </div>
    </section>`;
}

function setPricingToggle(yearly) {
  const mBtn = document.getElementById('price-monthly');
  const yBtn = document.getElementById('price-yearly');
  if (!mBtn || !yBtn) return;
  mBtn.className = `px-5 py-2 rounded-full text-sm font-semibold transition-colors ${!yearly ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`;
  yBtn.className  = `px-5 py-2 rounded-full text-sm font-semibold transition-colors ${yearly  ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`;
  document.querySelectorAll('[data-mo]').forEach(el => {
    el.textContent = '$' + (yearly ? el.dataset.yr : el.dataset.mo);
  });
  document.querySelectorAll('.price-period').forEach(el => el.textContent = yearly ? '/yr' : '/mo');
}

function applyPromo() {
  const code = (document.getElementById('promo-input')?.value || '').trim().toUpperCase();
  const msg = document.getElementById('promo-msg');
  if (!msg) return;
  if (code === 'STUDENT20') { msg.className = 'text-xs mt-2 text-emerald-600 font-medium'; msg.textContent = '✅ 20% student discount applied!'; }
  else if (code) { msg.className = 'text-xs mt-2 text-red-500'; msg.textContent = '❌ Invalid code. Try STUDENT20 for 20% off.'; }
}

function renderPublicPrograms(el) {
  const PROGRAMS = [
    { title:'Fat Loss Accelerator', goal:'Lose Weight',    color:'from-orange-500 to-pink-500',   dur:'8 weeks',  sessions:'4/week', enrolled:1284, outcomes:['Lose 5–10 kg','Drop 2 sizes','More energy'] },
    { title:'Muscle Build 12',      goal:'Build Muscle',   color:'from-indigo-500 to-purple-600', dur:'12 weeks', sessions:'5/week', enrolled:982,  outcomes:['+4–6 kg lean mass','Bigger arms','Stronger lifts'] },
    { title:'Beginner Foundations', goal:'Start Fitness',  color:'from-emerald-500 to-teal-500',  dur:'4 weeks',  sessions:'3/week', enrolled:2104, outcomes:['Gym confidence','Proper form','Build habit'] },
    { title:'10K Ready',            goal:'Endurance',      color:'from-cyan-500 to-blue-600',     dur:'10 weeks', sessions:'4/week', enrolled:412,  outcomes:['Run 10K non-stop','Better VO2max','No knee pain'] },
    { title:'Summer Glutes',        goal:'Body Composition',color:'from-rose-500 to-fuchsia-600', dur:'6 weeks',  sessions:'4/week', enrolled:863,  outcomes:['Stronger glutes','Toned legs','Better posture'] },
    { title:'Athlete Performance',  goal:'Sport',          color:'from-yellow-500 to-orange-500', dur:'8 weeks',  sessions:'5/week', enrolled:319,  outcomes:['Power & speed','Injury prevention','Sport skills'] },
  ];
  el.innerHTML = `
    <section class="pt-20 pb-10 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
      <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Structured programs</h1>
      <p class="text-slate-500 max-w-xl mx-auto">Expert-designed plans with clear outcomes. Pick your goal and start today.</p>
    </section>
    <section class="px-6 pb-16">
      <div class="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${PROGRAMS.map(p => `
          <div class="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div class="h-24 bg-gradient-to-br ${p.color} flex items-center px-5">
              <h3 class="text-white font-bold text-lg">${p.title}</h3>
            </div>
            <div class="p-5">
              <span class="text-xs font-semibold text-indigo-500">${p.goal}</span>
              <div class="flex gap-4 text-xs text-slate-500 mt-2 mb-3">
                <span>🗓 ${p.dur}</span><span>💪 ${p.sessions}</span><span>👥 ${p.enrolled.toLocaleString()} enrolled</span>
              </div>
              <ul class="space-y-1 mb-4">
                ${p.outcomes.map(o => `<li class="text-xs text-slate-600 flex items-center gap-1.5">✅ ${o}</li>`).join('')}
              </ul>
              <button onclick="navigate('public','free-trial')" class="w-full py-2 rounded-xl text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-colors">Start this program</button>
            </div>
          </div>
        `).join('')}
      </div>
    </section>`;
}

function renderPublicTrainers(el) {
  const TRAINERS = [
    { name:'Alex Carter',   title:'Head Strength Coach',    specs:['Strength','Powerlifting','HIIT'], rating:4.9, reviews:412, certs:['NSCA-CSCS','CrossFit L3'], bio:'Olympic-style lifting & functional power. 12 years, 200+ athletes.', avail:'Mon–Fri', color:'bg-indigo-500' },
    { name:'Lena Schmidt',  title:'Yoga & Mobility Lead',   specs:['Yoga','Mobility','Recovery'],     rating:5.0, reviews:289, certs:['RYT-500','FRC Mobility'], bio:'Power vinyasa with a clinical mobility lens. Helps lifters move better.', avail:'Mon, Wed, Sat', color:'bg-purple-500' },
    { name:'Marco Rossi',   title:'CrossFit Coach',         specs:['CrossFit','Conditioning','Olympic Lifts'], rating:4.8, reviews:356, certs:['CrossFit L2','USA Weightlifting'], bio:'Builds engines. Tough but fair. Loves complex barbell work.', avail:'Tue–Sun', color:'bg-blue-500' },
    { name:'Sophie Moreau', title:'Pilates & Dance Coach',  specs:['Pilates','Dance','Cardio'],       rating:4.9, reviews:198, certs:['Stott Pilates','Zumba ZIN'], bio:'Breath, control and joy of movement — from beginners to pros.', avail:'Mon–Sat', color:'bg-rose-500' },
    { name:'Jamal Dia',     title:'Boxing & Conditioning Coach', specs:['Boxing','MMA','Conditioning'], rating:4.8, reviews:231, certs:['AIBA Level 2','NSCA-CPT'], bio:'Former amateur champion. Raw energy, structured method.', avail:'Wed–Sun', color:'bg-orange-500' },
    { name:'Nadia Volkov',  title:'Nutrition & Wellness Coach',  specs:['Nutrition','Wellness','Weight Loss'], rating:4.9, reviews:167, certs:['Precision Nutrition','CISSN'], bio:'Food is performance. Builds practical plans that stick.', avail:'Mon–Fri', color:'bg-emerald-500' },
  ];
  el.innerHTML = `
    <section class="pt-20 pb-10 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
      <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Meet our trainers</h1>
      <p class="text-slate-500 max-w-xl mx-auto">120+ certified coaches. Here are some of our team leads.</p>
    </section>
    <section class="px-6 pb-16">
      <div class="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${TRAINERS.map(t => `
          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 ${t.color} rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">${t.name[0]}</div>
              <div>
                <h3 class="font-bold text-slate-800">${t.name}</h3>
                <p class="text-xs text-slate-500">${t.title}</p>
                <div class="flex items-center gap-1 mt-0.5">
                  <span class="text-yellow-400 text-xs">★</span>
                  <span class="text-xs font-semibold text-slate-700">${t.rating}</span>
                  <span class="text-xs text-slate-400">(${t.reviews} reviews)</span>
                </div>
              </div>
            </div>
            <p class="text-sm text-slate-500 leading-relaxed mb-3">${t.bio}</p>
            <div class="flex flex-wrap gap-1 mb-3">
              ${t.specs.map(s => `<span class="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">${s}</span>`).join('')}
            </div>
            <div class="flex flex-wrap gap-1 mb-4">
              ${t.certs.map(c => `<span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">${c}</span>`).join('')}
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-400">Available: ${t.avail}</span>
              <button onclick="navigate('public','free-trial')" class="text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg transition-colors">Book trial</button>
            </div>
          </div>
        `).join('')}
      </div>
    </section>`;
}

// ==================== TOAST ====================
function showDemoToast(msg) {
  const existing = document.getElementById('demo-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'demo-toast';
  toast.className = 'fixed top-5 right-5 z-50 bg-slate-900 text-white text-sm px-5 py-3 rounded-xl shadow-xl border border-slate-700 max-w-xs';
  toast.innerHTML = `<span class="text-indigo-400 font-bold">Demo:</span> ${msg}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ==================== COLLECT PAYMENT (Receptionist) ====================
function renderCollectPayment(el) {
  el.innerHTML = `
    <div class="space-y-6 max-w-2xl">
      <div><h2 class="text-lg font-semibold text-slate-800">Collect Payment</h2><p class="text-sm text-slate-500">Record a cash, card or bank transfer payment</p></div>
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Member</label>
          <select class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400">
            <option>Oliver Brown — GF-001</option>
            <option>Emma Wilson — GF-002</option>
            <option>Noah Taylor — GF-003</option>
            <option>Liam Anderson — GF-005</option>
            <option>Sophia Thomas — GF-006</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
            <input type="number" value="49" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Method</label>
            <select class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400">
              <option>Cash</option>
              <option>Card</option>
              <option>Bank Transfer</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <input type="text" value="Monthly Premium membership" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"/>
        </div>
        <button onclick="showDemoToast('✅ Payment of $49 recorded for Oliver Brown. Receipt generated.')" class="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-semibold transition-colors">Collect Payment</button>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 class="font-semibold text-slate-800 mb-3">Recent Payments Today</h3>
        <div class="space-y-2">
          ${DEMO_PAYMENTS.slice(0,4).map(p => `
            <div class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div><p class="text-sm font-medium text-slate-800">${p.member}</p><p class="text-xs text-slate-400">${p.plan} · ${p.date}</p></div>
              <span class="text-sm font-semibold text-slate-800">$${p.amount}</span>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

// ==================== VISITORS (Receptionist) ====================
const demoVisitors = [
  { id: 1, name: 'John Walker',    badge: 'V-001', purpose: 'Guest Pass',    host: 'Oliver Brown',   checkedIn: '08:15', checkedOut: '09:30', status: 'OUT' },
  { id: 2, name: 'Sarah Miles',    badge: 'V-002', purpose: 'Trial Session', host: 'Front Desk',     checkedIn: '09:00', checkedOut: null,    status: 'IN' },
  { id: 3, name: 'Tom Fletcher',   badge: 'V-003', purpose: 'Guest Pass',    host: 'Emma Wilson',    checkedIn: '10:05', checkedOut: null,    status: 'IN' },
];

function renderVisitors(el) {
  const inside = demoVisitors.filter(v => v.status === 'IN').length;
  el.innerHTML = `
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Visitor Log</h2><p class="text-sm text-slate-500">Track walk-in visitors and guest passes</p></div>
        <button onclick="showDemoToast('Visitor check-in form would open here.')" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium">+ Check In Visitor</button>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-indigo-600">${inside}</p><p class="text-xs text-slate-500 mt-1">Currently Inside</p></div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-slate-700">${demoVisitors.length}</p><p class="text-xs text-slate-500 mt-1">Total Today</p></div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-green-600">${demoVisitors.filter(v=>v.status==='OUT').length}</p><p class="text-xs text-slate-500 mt-1">Checked Out</p></div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Visitor</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Badge</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Purpose</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Host</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Check In</th>
              <th class="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
              <th class="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            ${demoVisitors.map(v => `
              <tr class="hover:bg-slate-50">
                <td class="px-5 py-3 font-medium text-slate-800">${v.name}</td>
                <td class="px-5 py-3 font-mono text-xs text-slate-600">${v.badge}</td>
                <td class="px-5 py-3 text-slate-600">${v.purpose}</td>
                <td class="px-5 py-3 text-slate-600">${v.host}</td>
                <td class="px-5 py-3 text-slate-600">${v.checkedIn}</td>
                <td class="px-5 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-medium ${v.status==='IN'?'bg-green-100 text-green-700':'bg-slate-100 text-slate-500'}">${v.status==='IN'?'Inside':'Checked Out'}</span></td>
                <td class="px-5 py-3 text-right">${v.status==='IN'?`<button onclick="showDemoToast('${v.name} checked out at '+new Date().toLocaleTimeString())" class="text-xs text-indigo-500 font-medium">Check Out</button>`:'—'}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ==================== DAILY REPORT (Receptionist) ====================
function renderDailyReport(el) {
  el.innerHTML = `
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Daily Report</h2><p class="text-sm text-slate-500">Summary for today — ${new Date().toLocaleDateString('en-GB',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p></div>
        <button onclick="window.print()" class="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-sm font-medium">🖨️ Print</button>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-indigo-600">38</p><p class="text-xs text-slate-500 mt-1">Check-ins Today</p></div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-green-600">$1,240</p><p class="text-xs text-slate-500 mt-1">Revenue Today</p></div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-blue-600">3</p><p class="text-xs text-slate-500 mt-1">New Members</p></div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-orange-500">8</p><p class="text-xs text-slate-500 mt-1">Classes Running</p></div>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 class="font-semibold text-slate-800 mb-4">Hourly Check-ins</h3>
        <div class="flex items-end gap-2 h-28">
          ${[3,8,14,22,18,12,9,15,20,16,8,4].map((v,i) => `
            <div class="flex-1 flex flex-col items-center gap-1">
              <div class="w-full bg-indigo-400 rounded-t" style="height:${Math.round(v/22*100)}%"></div>
              <span class="text-xs text-slate-400">${6+i}h</span>
            </div>`).join('')}
        </div>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 class="font-semibold text-slate-800 mb-3">Today's Payments</h3>
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-100"><th class="text-left py-2 text-slate-500 font-medium">Member</th><th class="text-left py-2 text-slate-500 font-medium">Plan</th><th class="text-left py-2 text-slate-500 font-medium">Method</th><th class="text-right py-2 text-slate-500 font-medium">Amount</th></tr></thead>
          <tbody class="divide-y divide-slate-50">
            ${DEMO_PAYMENTS.slice(0,5).map(p=>`<tr><td class="py-2 text-slate-800">${p.member}</td><td class="py-2 text-slate-500">${p.plan}</td><td class="py-2 text-slate-500">Card</td><td class="py-2 text-right font-semibold text-slate-800">$${p.amount}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ==================== TRAINER CLIENTS ====================
function renderTrainerClients(el) {
  const myClients = DEMO_MEMBERS.filter(m => m.status === 'ACTIVE').slice(0, 5);
  el.innerHTML = `
    <div class="space-y-5">
      <div><h2 class="text-lg font-semibold text-slate-800">My Clients</h2><p class="text-sm text-slate-500">${myClients.length} members assigned to you</p></div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${myClients.map(m => `
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">${m.firstName[0]}${m.lastName[0]}</div>
              <div><p class="font-semibold text-slate-800">${m.firstName} ${m.lastName}</p><p class="text-xs text-slate-400">${m.plan} · ${m.memberNumber}</p></div>
            </div>
            <p class="text-xs text-slate-500 mb-3">Goal: Weight loss & conditioning</p>
            <div class="flex gap-2">
              <button onclick="showDemoToast('Opening assessment for ${m.firstName}')" class="flex-1 text-xs py-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-medium hover:bg-indigo-100">Assess</button>
              <button onclick="showDemoToast('Opening progress for ${m.firstName}')" class="flex-1 text-xs py-1.5 rounded-lg bg-green-50 text-green-600 font-medium hover:bg-green-100">Progress</button>
              <button onclick="showSub('messages')" class="flex-1 text-xs py-1.5 rounded-lg bg-slate-50 text-slate-600 font-medium hover:bg-slate-100">Message</button>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

// ==================== ASSESSMENTS (Trainer) ====================
function renderAssessments(el) {
  el.innerHTML = `
    <div class="space-y-5 max-w-2xl">
      <div><h2 class="text-lg font-semibold text-slate-800">Fitness Assessments</h2><p class="text-sm text-slate-500">Log a new fitness assessment for a client</p></div>
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Client</label>
          <select class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400">
            ${DEMO_MEMBERS.filter(m=>m.status==='ACTIVE').slice(0,5).map(m=>`<option>${m.firstName} ${m.lastName} — ${m.memberNumber}</option>`).join('')}
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Fitness Level</label>
            <select class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400">
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Elite</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
            <input type="number" placeholder="75" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Body Fat %</label>
            <input type="number" placeholder="18" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Resting HR (bpm)</label>
            <input type="number" placeholder="65" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"/>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Goals</label>
          <div class="grid grid-cols-2 gap-2">
            ${['Weight Loss','Muscle Gain','Endurance','Flexibility','Strength','General Fitness','Stress Relief','Sport Performance'].map(g=>`
              <label class="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" class="rounded border-slate-300"/> ${g}
              </label>`).join('')}
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea rows="3" placeholder="Observations, limitations, recommended focus areas..." class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none"></textarea>
        </div>
        <button onclick="showDemoToast('✅ Assessment saved successfully.')" class="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-semibold transition-colors">Save Assessment</button>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 class="font-semibold text-slate-800 mb-3">Recent Assessments</h3>
        <div class="space-y-2">
          ${DEMO_MEMBERS.slice(0,4).map((m,i) => `
            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div><p class="text-sm font-medium text-slate-800">${m.firstName} ${m.lastName}</p><p class="text-xs text-slate-400">2025-05-${28-i} · Fitness: Intermediate</p></div>
              <button onclick="showDemoToast('Viewing assessment for ${m.firstName}')" class="text-xs text-indigo-500 font-medium">View →</button>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

// ==================== MESSAGES (Trainer ↔ Member) ====================
const demoMessages = [
  { from: 'trainer', text: 'Great session today! Remember to stretch tonight.', time: '10:30' },
  { from: 'member',  text: 'Thanks! My legs are on fire 😄', time: '10:45' },
  { from: 'trainer', text: 'That means it worked! See you Thursday for the next session.', time: '10:46' },
  { from: 'member',  text: 'Will do! Should I do any cardio tomorrow?', time: '11:00' },
  { from: 'trainer', text: 'Yes — 20–30 min light cardio or a walk is perfect. Keep it easy.', time: '11:05' },
];

function renderMessages(el) {
  const isTrainer = currentUser.role === 'TRAINER';
  el.innerHTML = `
    <div class="h-full flex flex-col gap-4" style="max-height:75vh">
      <div><h2 class="text-lg font-semibold text-slate-800">Messages</h2><p class="text-sm text-slate-500">${isTrainer ? 'Message your clients' : 'Chat with your trainer'}</p></div>
      <div class="flex gap-4 flex-1 min-h-0">
        ${isTrainer ? `
        <div class="w-48 shrink-0 bg-white rounded-2xl p-3 shadow-sm border border-slate-100 space-y-1 overflow-y-auto">
          ${DEMO_MEMBERS.filter(m=>m.status==='ACTIVE').slice(0,5).map((m,i)=>`
            <button onclick="showDemoToast('Chat with ${m.firstName} ${m.lastName}')" class="w-full flex items-center gap-2 p-2.5 rounded-xl text-left hover:bg-indigo-50 transition-colors ${i===0?'bg-indigo-50':''}">
              <div class="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">${m.firstName[0]}${m.lastName[0]}</div>
              <div class="min-w-0"><p class="text-xs font-medium text-slate-800 truncate">${m.firstName}</p></div>
            </button>`).join('')}
        </div>` : ''}
        <div class="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">${isTrainer?'OB':'JL'}</div>
            <div><p class="text-sm font-semibold text-slate-800">${isTrainer?'Oliver Brown':'Jordan Lee'}</p><p class="text-xs text-green-500">● Online</p></div>
          </div>
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            ${demoMessages.map(msg => {
              const isMe = (isTrainer && msg.from==='trainer') || (!isTrainer && msg.from==='member');
              return `
              <div class="flex ${isMe?'justify-end':'justify-start'}">
                <div class="max-w-xs px-4 py-2.5 rounded-2xl text-sm ${isMe?'bg-indigo-500 text-white rounded-br-sm':'bg-slate-100 text-slate-800 rounded-bl-sm'}">
                  <p>${msg.text}</p>
                  <p class="text-xs mt-1 ${isMe?'text-indigo-200':'text-slate-400'}">${msg.time}</p>
                </div>
              </div>`;
            }).join('')}
          </div>
          <div class="p-3 border-t border-slate-100 flex gap-2">
            <input id="msg-input" type="text" placeholder="Type a message…" class="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>
            <button onclick="showDemoToast('Message sent!')" class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium">Send</button>
          </div>
        </div>
      </div>
    </div>`;
}

// ==================== MEMBER PROFILE ====================
function renderMemberProfile(el) {
  el.innerHTML = `
    <div class="space-y-5 max-w-xl">
      <div><h2 class="text-lg font-semibold text-slate-800">My Profile</h2><p class="text-sm text-slate-500">View and update your personal information</p></div>
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xl font-bold">${currentUser.firstName[0]}${currentUser.lastName[0]}</div>
          <div>
            <h3 class="text-lg font-bold text-slate-800">${currentUser.firstName} ${currentUser.lastName}</h3>
            <p class="text-sm text-slate-500">Member · GF-012</p>
            <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">Premium Plan</span>
          </div>
        </div>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input value="${currentUser.firstName}" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input value="${currentUser.lastName}" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"/>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input value="${currentUser.email}" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"/>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input value="+44 7700 900123" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Gender</label>
              <select class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400">
                <option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
            <input type="date" value="1992-04-15" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"/>
          </div>
        </div>
        <button onclick="showDemoToast('✅ Profile updated successfully.')" class="mt-5 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-semibold transition-colors">Save Changes</button>
      </div>
    </div>`;
}

// ==================== MEMBER PROGRESS ====================
const demoMeasurements = [
  { date: '2025-05-30', weight: 82.0, bodyFat: 18.5, waist: 88 },
  { date: '2025-05-16', weight: 83.5, bodyFat: 19.2, waist: 89.5 },
  { date: '2025-05-01', weight: 85.0, bodyFat: 20.1, waist: 91 },
  { date: '2025-04-15', weight: 86.5, bodyFat: 21.0, waist: 92.5 },
];

function renderMemberProgress(el) {
  const latest = demoMeasurements[0];
  const prev = demoMeasurements[1];
  const wDiff = (latest.weight - prev.weight).toFixed(1);
  const bfDiff = (latest.bodyFat - prev.bodyFat).toFixed(1);
  el.innerHTML = `
    <div class="space-y-5">
      <div><h2 class="text-lg font-semibold text-slate-800">My Progress</h2><p class="text-sm text-slate-500">Track your body measurements over time</p></div>
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
          <p class="text-2xl font-bold text-indigo-600">${latest.weight} kg</p>
          <p class="text-xs text-slate-500 mt-1">Weight</p>
          <p class="text-xs mt-1 ${parseFloat(wDiff)<0?'text-green-500':'text-red-400'} font-medium">${wDiff} vs last</p>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
          <p class="text-2xl font-bold text-orange-500">${latest.bodyFat}%</p>
          <p class="text-xs text-slate-500 mt-1">Body Fat</p>
          <p class="text-xs mt-1 ${parseFloat(bfDiff)<0?'text-green-500':'text-red-400'} font-medium">${bfDiff}% vs last</p>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
          <p class="text-2xl font-bold text-blue-500">${demoMeasurements.length}</p>
          <p class="text-xs text-slate-500 mt-1">Entries Total</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-800">Measurement History</h3>
          <button onclick="showDemoToast('Log measurement form would open here.')" class="text-xs bg-indigo-500 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-600">+ Log</button>
        </div>
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-100"><th class="text-left py-2 text-slate-500 font-medium">Date</th><th class="text-left py-2 text-slate-500 font-medium">Weight</th><th class="text-left py-2 text-slate-500 font-medium">Body Fat</th><th class="text-left py-2 text-slate-500 font-medium">Waist</th></tr></thead>
          <tbody class="divide-y divide-slate-50">
            ${demoMeasurements.map(m=>`<tr><td class="py-2.5 text-slate-600">${m.date}</td><td class="py-2.5 font-medium text-slate-800">${m.weight} kg</td><td class="py-2.5 text-slate-600">${m.bodyFat}%</td><td class="py-2.5 text-slate-600">${m.waist} cm</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ==================== MEMBER FEEDBACK ====================
function renderMemberFeedback(el) {
  const categories = ['General','Classes','Trainer','Facilities','Staff','App / Website','Billing','Suggestion'];
  let selectedCat = 'General';
  let selectedRating = 4;
  function buildFeedback() {
    return `
      <div class="space-y-5 max-w-xl">
        <div><h2 class="text-lg font-semibold text-slate-800">Feedback</h2><p class="text-sm text-slate-500">Share your experience with us</p></div>
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <div class="flex flex-wrap gap-2">
              ${categories.map(c=>`<button class="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${c===selectedCat?'bg-indigo-500 text-white border-indigo-500':'border-slate-200 text-slate-600 hover:border-indigo-400'}">${c}</button>`).join('')}
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Rating</label>
            <div class="flex gap-2">
              ${[1,2,3,4,5].map(r=>`<button class="w-10 h-10 rounded-full text-lg ${r<=selectedRating?'bg-yellow-400':'bg-slate-100'} hover:bg-yellow-300 transition-colors">${r<=selectedRating?'★':'☆'}</button>`).join('')}
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Your feedback</label>
            <textarea rows="4" placeholder="Tell us what you think — what's great, what could be better…" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none"></textarea>
            <p class="text-xs text-slate-400 mt-1">Max 500 characters</p>
          </div>
          <label class="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" class="rounded border-slate-300"/> Submit anonymously
          </label>
          <button onclick="showDemoToast('✅ Thank you for your feedback!')" class="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-semibold transition-colors">Submit Feedback</button>
        </div>
      </div>`;
  }
  el.innerHTML = buildFeedback();
}

// ==================== MEMBER INVOICES ====================
function renderMemberInvoices(el) {
  const myPayments = DEMO_PAYMENTS.filter(p => p.member.includes('Oliver') || p.member.includes('Emma')).concat(DEMO_PAYMENTS.slice(0,3));
  const uniquePayments = DEMO_PAYMENTS.slice(0,5);
  const total = uniquePayments.reduce((s,p)=>s+p.amount,0);
  const statusColor = { PAID:'bg-green-100 text-green-700', PENDING:'bg-yellow-100 text-yellow-700', OVERDUE:'bg-red-100 text-red-700' };
  el.innerHTML = `
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">My Invoices</h2><p class="text-sm text-slate-500">Your payment history</p></div>
        <div class="text-right"><p class="text-xs text-slate-500">Total paid</p><p class="text-lg font-bold text-indigo-600">$${total}</p></div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table class="w-full text-sm">
          <thead><tr class="bg-slate-50 border-b border-slate-100">
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Invoice</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Plan</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Date</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
            <th class="text-right px-5 py-3 text-slate-500 font-medium">Amount</th>
            <th class="px-5 py-3"></th>
          </tr></thead>
          <tbody class="divide-y divide-slate-50">
            ${uniquePayments.map(p=>`
              <tr class="hover:bg-slate-50">
                <td class="px-5 py-3 font-mono text-xs text-slate-600">${p.id}</td>
                <td class="px-5 py-3 text-slate-700">${p.plan}</td>
                <td class="px-5 py-3 text-slate-500">${p.date}</td>
                <td class="px-5 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[p.status]||'bg-slate-100 text-slate-500'}">${p.status}</span></td>
                <td class="px-5 py-3 text-right font-semibold text-slate-800">$${p.amount}</td>
                <td class="px-5 py-3 text-right"><button onclick="showDemoToast('Printing invoice ${p.id}')" class="text-xs text-indigo-500 font-medium">🖨️ Print</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ==================== MY GYMS (Owner) ====================
function renderMyGyms(el) {
  el.innerHTML = `
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">My Gyms</h2><p class="text-sm text-slate-500">Manage your gym organisations</p></div>
        <button onclick="showDemoToast('Add Gym form would open here.')" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium">+ New Gym</button>
      </div>
      <div class="grid sm:grid-cols-2 gap-5">
        ${DEMO_BRANCHES.map(b => `
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div class="flex items-start justify-between mb-3">
              <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">🏋️</div>
              <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
            </div>
            <h3 class="font-semibold text-slate-800">${b.name}</h3>
            <p class="text-xs text-slate-500 mt-0.5">📍 ${b.address}, ${b.city}</p>
            <div class="mt-3 grid grid-cols-3 text-center border-t border-slate-100 pt-3">
              <div><p class="text-lg font-bold text-indigo-600">${b.members}</p><p class="text-xs text-slate-400">Members</p></div>
              <div><p class="text-lg font-bold text-slate-600">${b.capacity}</p><p class="text-xs text-slate-400">Capacity</p></div>
              <div><p class="text-lg font-bold text-green-600">${Math.round(b.members/b.capacity*100)}%</p><p class="text-xs text-slate-400">Used</p></div>
            </div>
            <button onclick="showDemoToast('Managing ${b.name}')" class="mt-3 w-full text-xs font-medium py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors">Manage →</button>
          </div>`).join('')}
      </div>
    </div>`;
}

// ==================== APPROVALS (Owner + Receptionist) ====================
const DEMO_PENDING = [
  { id:1, member:'Charlotte Clark', plan:'Elite',   amount:89, email:'charlotte@demo.com',   joined:'2025-05-28', notes:'Referred by Emma Wilson' },
  { id:2, member:'Ryan Peters',     plan:'Premium', amount:49, email:'ryan@demo.com',        joined:'2025-05-29', notes:'Walk-in registration' },
  { id:3, member:'Aisha Nkosi',     plan:'Basic',   amount:29, email:'aisha@demo.com',       joined:'2025-05-30', notes:'Online sign-up' },
  { id:4, member:'Lucas Ferreira',  plan:'Elite',   amount:89, email:'lucas@demo.com',       joined:'2025-05-30', notes:'Corporate account referral' },
];
function renderApprovals(el) {
  el.innerHTML = `
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Pending Approvals</h2><p class="text-sm text-slate-500">${DEMO_PENDING.length} memberships awaiting approval</p></div>
      </div>
      <div class="space-y-3">
        ${DEMO_PENDING.map(p => `
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">${p.member.split(' ').map(n=>n[0]).join('')}</div>
              <div>
                <p class="font-semibold text-slate-800">${p.member}</p>
                <p class="text-xs text-slate-500">${p.email} · Applied ${p.joined}</p>
                <p class="text-xs text-slate-400 mt-0.5">${p.notes}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <div class="text-right"><p class="font-bold text-indigo-600">$${p.amount}/mo</p><p class="text-xs text-slate-400">${p.plan}</p></div>
              <button onclick="showDemoToast('✅ ${p.member} approved!')" class="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium">Approve</button>
              <button onclick="showDemoToast('❌ ${p.member} rejected.')" class="bg-red-100 hover:bg-red-200 text-red-600 text-xs px-3 py-1.5 rounded-lg font-medium">Reject</button>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

// ==================== STAFF (Owner) ====================
const DEMO_STAFF = [
  { name:'Casey Smith',   role:'RECEPTIONIST', email:'casey@demogym.com',   branch:'Main Branch', salary:2400, status:'ACTIVE',   joined:'2024-01-10' },
  { name:'Jordan Lee',    role:'TRAINER',      email:'jordan@demogym.com',  branch:'Main Branch', salary:3200, status:'ACTIVE',   joined:'2024-02-01' },
  { name:'Maya Patel',    role:'TRAINER',      email:'maya@demogym.com',    branch:'Uptown',      salary:3000, status:'ACTIVE',   joined:'2024-03-15' },
  { name:'Chris Evans',   role:'TRAINER',      email:'chris@demogym.com',   branch:'Downtown',    salary:3100, status:'ACTIVE',   joined:'2024-02-20' },
  { name:'Sofia Ruiz',    role:'TRAINER',      email:'sofia@demogym.com',   branch:'Main Branch', salary:2900, status:'ACTIVE',   joined:'2024-04-01' },
  { name:'Mike Johnson',  role:'RECEPTIONIST', email:'mike@demogym.com',    branch:'Downtown',    salary:2200, status:'ON_LEAVE', joined:'2024-05-01' },
];
function renderStaff(el) {
  const roleColor = { TRAINER:'bg-indigo-100 text-indigo-700', RECEPTIONIST:'bg-blue-100 text-blue-700', BRANCH_MANAGER:'bg-purple-100 text-purple-700' };
  const statusColor = { ACTIVE:'bg-green-100 text-green-700', ON_LEAVE:'bg-yellow-100 text-yellow-700' };
  el.innerHTML = `
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Staff</h2><p class="text-sm text-slate-500">${DEMO_STAFF.length} team members</p></div>
        <button onclick="showDemoToast('Add Staff form would open here.')" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium">+ Add Staff</button>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table class="w-full text-sm">
          <thead><tr class="bg-slate-50 border-b border-slate-100">
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Name</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Role</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Branch</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Salary</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
            <th class="px-5 py-3"></th>
          </tr></thead>
          <tbody class="divide-y divide-slate-50">
            ${DEMO_STAFF.map(s=>`
              <tr class="hover:bg-slate-50">
                <td class="px-5 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-indigo-400 flex items-center justify-center text-white text-xs font-bold">${s.name.split(' ').map(n=>n[0]).join('')}</div>
                    <div><p class="font-medium text-slate-800">${s.name}</p><p class="text-xs text-slate-400">${s.email}</p></div>
                  </div>
                </td>
                <td class="px-5 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[s.role]||'bg-slate-100 text-slate-500'}">${s.role.replace(/_/g,' ')}</span></td>
                <td class="px-5 py-3 text-slate-600">${s.branch}</td>
                <td class="px-5 py-3 font-medium text-slate-800">$${s.salary.toLocaleString()}/mo</td>
                <td class="px-5 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[s.status]||'bg-slate-100 text-slate-500'}">${s.status.replace(/_/g,' ')}</span></td>
                <td class="px-5 py-3 text-right"><button onclick="showDemoToast('Editing ${s.name}')" class="text-xs text-indigo-500 font-medium">Edit →</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ==================== PAYROLL (Owner) ====================
function renderPayroll(el) {
  const total = DEMO_STAFF.reduce((s,m)=>s+m.salary,0);
  el.innerHTML = `
    <div class="space-y-5">
      <div><h2 class="text-lg font-semibold text-slate-800">Payroll</h2><p class="text-sm text-slate-500">Monthly payroll overview — June 2025</p></div>
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-indigo-600">$${total.toLocaleString()}</p><p class="text-xs text-slate-500 mt-1">Total Payroll</p></div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-slate-700">${DEMO_STAFF.length}</p><p class="text-xs text-slate-500 mt-1">Staff Members</p></div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center"><p class="text-2xl font-bold text-green-600">Pending</p><p class="text-xs text-slate-500 mt-1">Payment Status</p></div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table class="w-full text-sm">
          <thead><tr class="bg-slate-50 border-b border-slate-100">
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Staff</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Role</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Base Salary</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Commission</th>
            <th class="text-right px-5 py-3 text-slate-500 font-medium">Total</th>
            <th class="px-5 py-3"></th>
          </tr></thead>
          <tbody class="divide-y divide-slate-50">
            ${DEMO_STAFF.map(s=>{const comm=s.role==='TRAINER'?Math.round(s.salary*0.1):0;return`
              <tr class="hover:bg-slate-50">
                <td class="px-5 py-3 font-medium text-slate-800">${s.name}</td>
                <td class="px-5 py-3 text-slate-500">${s.role.replace(/_/g,' ')}</td>
                <td class="px-5 py-3 text-slate-700">$${s.salary.toLocaleString()}</td>
                <td class="px-5 py-3 text-green-600">+$${comm}</td>
                <td class="px-5 py-3 text-right font-bold text-slate-800">$${(s.salary+comm).toLocaleString()}</td>
                <td class="px-5 py-3 text-right"><button onclick="showDemoToast('Payslip for ${s.name}')" class="text-xs text-indigo-500 font-medium">Payslip</button></td>
              </tr>`;}).join('')}
          </tbody>
          <tfoot><tr class="bg-slate-50 border-t border-slate-200"><td colspan="4" class="px-5 py-3 font-semibold text-slate-700">Total</td><td class="px-5 py-3 text-right font-bold text-slate-900">$${DEMO_STAFF.reduce((s,m)=>s+m.salary+(m.role==='TRAINER'?Math.round(m.salary*0.1):0),0).toLocaleString()}</td><td></td></tr></tfoot>
        </table>
      </div>
      <button onclick="showDemoToast('Payroll run initiated for June 2025.')" class="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">Run Payroll</button>
    </div>`;
}

// ==================== SCHEDULE (Owner) ====================
function renderSchedule(el) {
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  el.innerHTML = `
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Staff Schedule</h2><p class="text-sm text-slate-500">Weekly schedule — w/c 26 May 2025</p></div>
        <button onclick="showDemoToast('Schedule editor would open here.')" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium">Edit Schedule</button>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
        <table class="w-full text-sm min-w-[600px]">
          <thead><tr class="bg-slate-50 border-b border-slate-100">
            <th class="text-left px-4 py-3 text-slate-500 font-medium w-32">Staff</th>
            ${days.map(d=>`<th class="text-center px-2 py-3 text-slate-500 font-medium text-xs">${d.slice(0,3)}</th>`).join('')}
          </tr></thead>
          <tbody class="divide-y divide-slate-50">
            ${DEMO_STAFF.slice(0,5).map(s=>`
              <tr class="hover:bg-slate-50">
                <td class="px-4 py-3 font-medium text-slate-800 text-xs">${s.name.split(' ')[0]}</td>
                ${days.map((_,i)=>{const on=Math.random()>0.25;return`<td class="px-2 py-3 text-center"><span class="${on?'bg-indigo-100 text-indigo-700':'bg-slate-100 text-slate-400'} text-xs px-1.5 py-0.5 rounded font-medium">${on?'09–17':'Off'}</span></td>`;}).join('')}
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ==================== MAINTENANCE (Owner) ====================
const DEMO_MAINTENANCE = [
  { id:'MT-001', equipment:'Treadmill #4',     branch:'Main Branch', issue:'Belt slipping',         priority:'HIGH',   status:'OPEN',       reported:'2025-05-28' },
  { id:'MT-002', equipment:'Spin Bike #12',    branch:'Downtown',    issue:'Resistance not working', priority:'MEDIUM', status:'IN_PROGRESS',reported:'2025-05-27' },
  { id:'MT-003', equipment:'Cable Machine #2', branch:'Main Branch', issue:'Weight stack jammed',    priority:'HIGH',   status:'OPEN',       reported:'2025-05-29' },
  { id:'MT-004', equipment:'Dumbbell Rack',    branch:'Uptown',      issue:'Rubber foot missing',    priority:'LOW',    status:'RESOLVED',   reported:'2025-05-20' },
  { id:'MT-005', equipment:'Rowing Machine #1',branch:'Main Branch', issue:'Display not working',    priority:'MEDIUM', status:'OPEN',       reported:'2025-05-30' },
];
function renderMaintenance(el) {
  const pColor={HIGH:'bg-red-100 text-red-700',MEDIUM:'bg-yellow-100 text-yellow-700',LOW:'bg-slate-100 text-slate-500'};
  const sColor={OPEN:'bg-orange-100 text-orange-700',IN_PROGRESS:'bg-blue-100 text-blue-700',RESOLVED:'bg-green-100 text-green-700'};
  el.innerHTML = `
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Maintenance</h2><p class="text-sm text-slate-500">${DEMO_MAINTENANCE.filter(m=>m.status!=='RESOLVED').length} open tickets</p></div>
        <button onclick="showDemoToast('New maintenance ticket form would open here.')" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium">+ New Ticket</button>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table class="w-full text-sm">
          <thead><tr class="bg-slate-50 border-b border-slate-100">
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Ticket</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Equipment</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Issue</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Priority</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
            <th class="px-5 py-3"></th>
          </tr></thead>
          <tbody class="divide-y divide-slate-50">
            ${DEMO_MAINTENANCE.map(m=>`
              <tr class="hover:bg-slate-50">
                <td class="px-5 py-3 font-mono text-xs text-slate-500">${m.id}</td>
                <td class="px-5 py-3"><p class="font-medium text-slate-800">${m.equipment}</p><p class="text-xs text-slate-400">${m.branch}</p></td>
                <td class="px-5 py-3 text-slate-600">${m.issue}</td>
                <td class="px-5 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-medium ${pColor[m.priority]}">${m.priority}</span></td>
                <td class="px-5 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-medium ${sColor[m.status]}">${m.status.replace(/_/g,' ')}</span></td>
                <td class="px-5 py-3 text-right"><button onclick="showDemoToast('Updating ticket ${m.id}')" class="text-xs text-indigo-500 font-medium">Update →</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ==================== COMPLAINTS (Owner + Receptionist) ====================
const DEMO_COMPLAINTS = [
  { id:'TK-001', member:'Oliver Brown',   category:'Facilities', subject:'Shower not working in locker room',  status:'OPEN',     date:'2025-05-28', priority:'HIGH' },
  { id:'TK-002', member:'Emma Wilson',    category:'Staff',      subject:'Trainer was late for PT session',    status:'RESOLVED', date:'2025-05-25', priority:'MEDIUM' },
  { id:'TK-003', member:'Noah Taylor',    category:'Classes',    subject:'Class was cancelled with no notice', status:'OPEN',     date:'2025-05-29', priority:'HIGH' },
  { id:'TK-004', member:'Liam Anderson',  category:'Billing',    subject:'Charged twice for monthly plan',     status:'IN_REVIEW',date:'2025-05-27', priority:'HIGH' },
  { id:'TK-005', member:'Sophia Thomas',  category:'General',    subject:'Music too loud in the gym',          status:'RESOLVED', date:'2025-05-20', priority:'LOW' },
];
function renderComplaints(el) {
  const sColor={OPEN:'bg-red-100 text-red-700',RESOLVED:'bg-green-100 text-green-700',IN_REVIEW:'bg-yellow-100 text-yellow-700'};
  const pColor={HIGH:'bg-red-100 text-red-700',MEDIUM:'bg-yellow-100 text-yellow-700',LOW:'bg-slate-100 text-slate-500'};
  el.innerHTML = `
    <div class="space-y-5">
      <div><h2 class="text-lg font-semibold text-slate-800">Complaints</h2><p class="text-sm text-slate-500">${DEMO_COMPLAINTS.filter(c=>c.status!=='RESOLVED').length} open · ${DEMO_COMPLAINTS.length} total</p></div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table class="w-full text-sm">
          <thead><tr class="bg-slate-50 border-b border-slate-100">
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Ticket</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Member</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Subject</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Category</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Priority</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
            <th class="px-5 py-3"></th>
          </tr></thead>
          <tbody class="divide-y divide-slate-50">
            ${DEMO_COMPLAINTS.map(c=>`
              <tr class="hover:bg-slate-50">
                <td class="px-5 py-3 font-mono text-xs text-slate-500">${c.id}</td>
                <td class="px-5 py-3 font-medium text-slate-800">${c.member}</td>
                <td class="px-5 py-3 text-slate-600 max-w-xs">${c.subject}</td>
                <td class="px-5 py-3 text-slate-500">${c.category}</td>
                <td class="px-5 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-medium ${pColor[c.priority]}">${c.priority}</span></td>
                <td class="px-5 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-medium ${sColor[c.status]}">${c.status.replace(/_/g,' ')}</span></td>
                <td class="px-5 py-3 text-right">${c.status!=='RESOLVED'?`<button onclick="showDemoToast('Resolving ${c.id}')" class="text-xs text-green-600 font-medium">Resolve →</button>`:'—'}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ==================== LEADS (Owner) ====================
const DEMO_LEADS = [
  { name:'Alex Turner',   email:'alex.t@email.com',   phone:'+44 7900 111222', source:'Website',   interest:'Premium', status:'NEW',         date:'2025-05-30' },
  { name:'Priya Sharma',  email:'priya.s@email.com',  phone:'+44 7900 333444', source:'Referral',  interest:'Elite',   status:'CONTACTED',   date:'2025-05-29' },
  { name:'Ben Walsh',     email:'ben.w@email.com',    phone:'+44 7900 555666', source:'Instagram', interest:'Basic',   status:'TRIAL',       date:'2025-05-27' },
  { name:'Chloe Dupont',  email:'chloe.d@email.com',  phone:'+44 7900 777888', source:'Walk-in',   interest:'Premium', status:'CONVERTED',   date:'2025-05-24' },
  { name:'Marcus Reid',   email:'marcus.r@email.com', phone:'+44 7900 999000', source:'Google',    interest:'Elite',   status:'NEW',         date:'2025-05-30' },
];
function renderLeads(el) {
  const sColor={NEW:'bg-blue-100 text-blue-700',CONTACTED:'bg-yellow-100 text-yellow-700',TRIAL:'bg-purple-100 text-purple-700',CONVERTED:'bg-green-100 text-green-700',LOST:'bg-red-100 text-red-700'};
  el.innerHTML = `
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Leads</h2><p class="text-sm text-slate-500">${DEMO_LEADS.length} prospects in pipeline</p></div>
        <button onclick="showDemoToast('Add Lead form would open here.')" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium">+ Add Lead</button>
      </div>
      <div class="grid grid-cols-4 gap-3 mb-2">
        ${['NEW','CONTACTED','TRIAL','CONVERTED'].map(s=>`
          <div class="bg-white rounded-xl p-3 border border-slate-100 text-center shadow-sm">
            <p class="text-lg font-bold text-slate-800">${DEMO_LEADS.filter(l=>l.status===s).length}</p>
            <p class="text-xs text-slate-500">${s.charAt(0)+s.slice(1).toLowerCase()}</p>
          </div>`).join('')}
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table class="w-full text-sm">
          <thead><tr class="bg-slate-50 border-b border-slate-100">
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Name</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Contact</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Source</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Interest</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
            <th class="px-5 py-3"></th>
          </tr></thead>
          <tbody class="divide-y divide-slate-50">
            ${DEMO_LEADS.map(l=>`
              <tr class="hover:bg-slate-50">
                <td class="px-5 py-3 font-medium text-slate-800">${l.name}</td>
                <td class="px-5 py-3"><p class="text-slate-600 text-xs">${l.email}</p><p class="text-slate-400 text-xs">${l.phone}</p></td>
                <td class="px-5 py-3 text-slate-500">${l.source}</td>
                <td class="px-5 py-3 text-slate-600">${l.interest}</td>
                <td class="px-5 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-medium ${sColor[l.status]}">${l.status}</span></td>
                <td class="px-5 py-3 text-right"><button onclick="showDemoToast('Following up on ${l.name}')" class="text-xs text-indigo-500 font-medium">Follow Up →</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ==================== POLICIES (Owner) ====================
function renderPolicies(el) {
  const policies = [
    { title:'Membership Cancellation Policy', updated:'2025-04-01', content:'Members may cancel with 30 days written notice. No refunds for unused days within the notice period.' },
    { title:'Freeze Policy',                  updated:'2025-03-15', content:'Members on Premium or Elite may freeze for up to 3 months per year. Basic plan not eligible.' },
    { title:'Guest Policy',                   updated:'2025-02-01', content:'Premium members get 2 guest passes per month. Elite members have unlimited guest access.' },
    { title:'Code of Conduct',                updated:'2025-01-10', content:'All members must re-rack weights, wipe equipment after use, and wear appropriate gym attire.' },
    { title:'Refund Policy',                  updated:'2025-04-15', content:'Refunds issued within 7 days of purchase if no classes attended. Class bookings non-refundable after 24h.' },
  ];
  el.innerHTML = `
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Policies</h2><p class="text-sm text-slate-500">Gym rules and member terms</p></div>
        <button onclick="showDemoToast('Policy editor would open here.')" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium">+ New Policy</button>
      </div>
      <div class="space-y-3">
        ${policies.map(p=>`
          <details class="bg-white rounded-2xl border border-slate-100 shadow-sm group">
            <summary class="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
              <div><p class="font-semibold text-slate-800">${p.title}</p><p class="text-xs text-slate-400">Last updated: ${p.updated}</p></div>
              <span class="text-slate-400 group-open:rotate-90 transition-transform text-lg">›</span>
            </summary>
            <div class="px-5 pb-5">
              <p class="text-sm text-slate-600">${p.content}</p>
              <button onclick="showDemoToast('Editing policy: ${p.title}')" class="mt-3 text-xs text-indigo-500 font-medium">Edit Policy →</button>
            </div>
          </details>`).join('')}
      </div>
    </div>`;
}

// ==================== REGISTER MEMBER (Receptionist) ====================
function renderRegisterMember(el) {
  el.innerHTML = `
    <div class="space-y-5 max-w-2xl">
      <div><h2 class="text-lg font-semibold text-slate-800">Register Member</h2><p class="text-sm text-slate-500">Add a new member to the gym</p></div>
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium text-slate-700 mb-1">First Name</label><input placeholder="John" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"/></div>
          <div><label class="block text-sm font-medium text-slate-700 mb-1">Last Name</label><input placeholder="Smith" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"/></div>
        </div>
        <div><label class="block text-sm font-medium text-slate-700 mb-1">Email</label><input type="email" placeholder="john@email.com" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"/></div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium text-slate-700 mb-1">Phone</label><input placeholder="+44 7700 000000" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"/></div>
          <div><label class="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label><input type="date" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"/></div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium text-slate-700 mb-1">Gender</label>
            <select class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"><option>Male</option><option>Female</option><option>Other</option></select></div>
          <div><label class="block text-sm font-medium text-slate-700 mb-1">Membership Plan</label>
            <select class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400">
              ${DEMO_MEMBERSHIP_PLANS.map(p=>`<option>$${p.price}/mo — ${p.name}</option>`).join('')}
            </select></div>
        </div>
        <div><label class="block text-sm font-medium text-slate-700 mb-1">Emergency Contact</label><input placeholder="Name and phone number" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400"/></div>
        <button onclick="showDemoToast('✅ Member registered successfully! Member card and welcome email sent.')" class="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-semibold transition-colors">Register Member</button>
      </div>
    </div>`;
}

// ==================== INVOICES (Receptionist) ====================
function renderReceptionInvoices(el) {
  const sColor={PAID:'bg-green-100 text-green-700',PENDING:'bg-yellow-100 text-yellow-700',OVERDUE:'bg-red-100 text-red-700'};
  el.innerHTML = `
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <div><h2 class="text-lg font-semibold text-slate-800">Invoices</h2><p class="text-sm text-slate-500">All payment receipts</p></div>
        <div class="flex gap-2">
          <select class="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
            <option>All Status</option><option>Paid</option><option>Pending</option><option>Overdue</option>
          </select>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table class="w-full text-sm">
          <thead><tr class="bg-slate-50 border-b border-slate-100">
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Invoice</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Member</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Plan</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Date</th>
            <th class="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
            <th class="text-right px-5 py-3 text-slate-500 font-medium">Amount</th>
            <th class="px-5 py-3"></th>
          </tr></thead>
          <tbody class="divide-y divide-slate-50">
            ${DEMO_PAYMENTS.map(p=>`
              <tr class="hover:bg-slate-50">
                <td class="px-5 py-3 font-mono text-xs text-slate-600">${p.id}</td>
                <td class="px-5 py-3 font-medium text-slate-800">${p.member}</td>
                <td class="px-5 py-3 text-slate-500">${p.plan}</td>
                <td class="px-5 py-3 text-slate-500">${p.date}</td>
                <td class="px-5 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-medium ${sColor[p.status]||'bg-slate-100 text-slate-500'}">${p.status}</span></td>
                <td class="px-5 py-3 text-right font-semibold text-slate-800">$${p.amount}</td>
                <td class="px-5 py-3 text-right"><button onclick="showDemoToast('Printing invoice ${p.id}')" class="text-xs text-indigo-500 font-medium">🖨️ Print</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ==================== TRAINER PROGRESS ====================
function renderTrainerProgress(el) {
  el.innerHTML = `
    <div class="space-y-5">
      <div><h2 class="text-lg font-semibold text-slate-800">Client Progress</h2><p class="text-sm text-slate-500">Track body measurements for your clients</p></div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <label class="block text-sm font-medium text-slate-700 mb-2">Select Client</label>
          <select class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400">
            ${DEMO_MEMBERS.filter(m=>m.status==='ACTIVE').slice(0,5).map(m=>`<option>${m.firstName} ${m.lastName} — ${m.memberNumber}</option>`).join('')}
          </select>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p class="text-sm font-medium text-slate-700 mb-3">Log Measurement</p>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="block text-xs text-slate-500 mb-1">Weight (kg)</label><input type="number" placeholder="75" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div>
            <div><label class="block text-xs text-slate-500 mb-1">Body Fat %</label><input type="number" placeholder="18" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div>
            <div><label class="block text-xs text-slate-500 mb-1">Waist (cm)</label><input type="number" placeholder="88" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div>
            <div><label class="block text-xs text-slate-500 mb-1">Chest (cm)</label><input type="number" placeholder="102" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div>
          </div>
          <button onclick="showDemoToast('✅ Measurement logged for Oliver Brown.')" class="mt-3 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-xl text-sm font-semibold transition-colors">Log Measurement</button>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 class="font-semibold text-slate-800 mb-3">Oliver Brown — Progress History</h3>
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-100"><th class="text-left py-2 text-slate-500 font-medium">Date</th><th class="text-left py-2 text-slate-500 font-medium">Weight</th><th class="text-left py-2 text-slate-500 font-medium">Body Fat</th><th class="text-left py-2 text-slate-500 font-medium">Waist</th><th class="text-left py-2 text-slate-500 font-medium">Change</th></tr></thead>
          <tbody class="divide-y divide-slate-50">
            ${demoMeasurements.map((m,i)=>`<tr><td class="py-2.5 text-slate-600">${m.date}</td><td class="py-2.5 font-medium text-slate-800">${m.weight} kg</td><td class="py-2.5 text-slate-600">${m.bodyFat}%</td><td class="py-2.5 text-slate-600">${m.waist} cm</td><td class="py-2.5 text-xs ${i<demoMeasurements.length-1?'text-green-600':''}">${i<demoMeasurements.length-1?'▲ Improving':'—'}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ==================== SUPER ADMIN ====================
const SA_ALL_USERS = [
  { name:'Chris Admin',    email:'superadmin@gymflow.com', role:'SUPER_ADMIN',    gym:'GymFlow HQ',     verified:true,  joined:'2023-01-01' },
  { name:'Alex Morgan',    email:'owner@demogym.com',      role:'GYM_OWNER',      gym:'Iron Paradise',  verified:true,  joined:'2024-01-10' },
  { name:'Jordan Lee',     email:'trainer@demogym.com',    role:'TRAINER',        gym:'Iron Paradise',  verified:true,  joined:'2024-02-15' },
  { name:'Casey Smith',    email:'reception@demogym.com',  role:'RECEPTIONIST',   gym:'Iron Paradise',  verified:true,  joined:'2024-03-01' },
  { name:'Sam Davis',      email:'member@demogym.com',     role:'MEMBER',         gym:'Iron Paradise',  verified:true,  joined:'2024-05-01' },
  { name:'Oliver Brown',   email:'oliver@demo.com',        role:'MEMBER',         gym:'Iron Paradise',  verified:true,  joined:'2024-01-15' },
  { name:'Emma Wilson',    email:'emma@demo.com',          role:'MEMBER',         gym:'Zen Wellness',   verified:true,  joined:'2024-02-03' },
  { name:'Noah Taylor',    email:'noah@demo.com',          role:'MEMBER',         gym:'CrossFit Central', verified:false, joined:'2024-03-20' },
  { name:'Ava Martinez',   email:'ava@demo.com',           role:'MEMBER',         gym:'Iron Paradise',  verified:true,  joined:'2023-11-10' },
  { name:'Liam Anderson',  email:'liam@demo.com',          role:'MEMBER',         gym:'Zen Wellness',   verified:false, joined:'2024-04-05' },
  { name:'Maya Patel',     email:'maya@demo.com',          role:'TRAINER',        gym:'Zen Wellness',   verified:true,  joined:'2024-01-20' },
  { name:'Derek Kim',      email:'derek@demo.com',         role:'GYM_OWNER',      gym:'CrossFit Central', verified:true, joined:'2023-12-01' },
];

const ROLE_BADGE = {
  SUPER_ADMIN:    'bg-red-100 text-red-700',
  GYM_OWNER:      'bg-indigo-100 text-indigo-700',
  BRANCH_MANAGER: 'bg-purple-100 text-purple-700',
  RECEPTIONIST:   'bg-sky-100 text-sky-700',
  TRAINER:        'bg-amber-100 text-amber-700',
  MEMBER:         'bg-green-100 text-green-700',
};

let saRoleFilter = 'ALL';
let saSearch = '';

function renderSuperAdminUsers(el) {
  const ROLES = ['ALL','SUPER_ADMIN','GYM_OWNER','BRANCH_MANAGER','RECEPTIONIST','TRAINER','MEMBER'];
  const filtered = SA_ALL_USERS.filter(u =>
    (saRoleFilter === 'ALL' || u.role === saRoleFilter) &&
    (saSearch === '' || u.name.toLowerCase().includes(saSearch.toLowerCase()) || u.email.toLowerCase().includes(saSearch.toLowerCase()))
  );
  el.innerHTML = `
    <div class="space-y-5">
      <!-- Header -->
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">👤 All Users</h2>
          <p class="text-sm text-slate-500 mt-0.5">Manage every user across all gym tenants</p>
        </div>
        <span class="bg-slate-100 text-slate-600 text-sm font-semibold px-3 py-1 rounded-full">${SA_ALL_USERS.length} total</span>
      </div>
      <!-- Search -->
      <div class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 focus-within:border-indigo-400 transition-colors">
        <span class="text-slate-400">🔍</span>
        <input id="sa-search" placeholder="Search by name or email…" value="${saSearch}"
          oninput="saSearch=this.value; renderSubPage('sa-users')"
          class="flex-1 text-sm text-slate-700 outline-none placeholder:text-slate-400 bg-transparent"/>
      </div>
      <!-- Role filter tabs -->
      <div class="flex flex-wrap gap-2">
        ${ROLES.map(r => `
          <button onclick="saRoleFilter='${r}'; renderSubPage('sa-users')"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${saRoleFilter===r ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}">
            ${r.replace(/_/g,' ')}
          </button>
        `).join('')}
      </div>
      <!-- Users table -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="text-left px-5 py-3 font-semibold text-slate-600">User</th>
              <th class="text-left px-5 py-3 font-semibold text-slate-600">Role</th>
              <th class="text-left px-5 py-3 font-semibold text-slate-600 hidden sm:table-cell">Gym</th>
              <th class="text-left px-5 py-3 font-semibold text-slate-600 hidden md:table-cell">Verified</th>
              <th class="text-left px-5 py-3 font-semibold text-slate-600 hidden md:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            ${filtered.length ? filtered.map(u => `
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-5 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                      ${u.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <p class="font-medium text-slate-800">${u.name}</p>
                      <p class="text-xs text-slate-400">${u.email}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-3">
                  <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_BADGE[u.role] || 'bg-slate-100 text-slate-600'}">${u.role.replace(/_/g,' ')}</span>
                </td>
                <td class="px-5 py-3 text-slate-600 hidden sm:table-cell">${u.gym}</td>
                <td class="px-5 py-3 hidden md:table-cell">
                  <span class="${u.verified ? 'text-green-600' : 'text-slate-400'} font-medium text-xs">${u.verified ? '✅ Yes' : '⏳ No'}</span>
                </td>
                <td class="px-5 py-3 text-slate-500 text-xs hidden md:table-cell">${u.joined}</td>
              </tr>
            `).join('') : `
              <tr><td colspan="5" class="px-5 py-10 text-center text-slate-400">No users match your search.</td></tr>
            `}
          </tbody>
        </table>
      </div>
    </div>`;
}

function renderSuperAdminGyms(el) {
  const GYMS = [
    { name:'Iron Paradise',   owner:'Alex Morgan',  members:247, branches:3, plan:'Enterprise', status:'ACTIVE',   joined:'2024-01-10' },
    { name:'Zen Wellness',    owner:'Maria Costa',  members:183, branches:2, plan:'Pro',         status:'ACTIVE',   joined:'2024-03-15' },
    { name:'CrossFit Central',owner:'Derek Kim',    members:312, branches:4, plan:'Enterprise', status:'ACTIVE',   joined:'2023-12-01' },
    { name:'FitLife Studio',  owner:'Priya Nair',   members: 98, branches:1, plan:'Starter',    status:'TRIAL',    joined:'2025-05-01' },
    { name:'Peak Performance',owner:'Tom Walsh',    members:  0, branches:1, plan:'Pro',         status:'SUSPENDED',joined:'2024-11-20' },
  ];
  el.innerHTML = `
    <div class="space-y-5">
      <div><h2 class="text-xl font-bold text-slate-800">🏢 All Gyms</h2><p class="text-sm text-slate-500 mt-0.5">All gym tenants on the GymFlow platform</p></div>
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="text-left px-5 py-3 font-semibold text-slate-600">Gym</th>
              <th class="text-left px-5 py-3 font-semibold text-slate-600 hidden sm:table-cell">Owner</th>
              <th class="text-left px-5 py-3 font-semibold text-slate-600">Members</th>
              <th class="text-left px-5 py-3 font-semibold text-slate-600 hidden md:table-cell">Plan</th>
              <th class="text-left px-5 py-3 font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            ${GYMS.map(g=>`
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-5 py-3 font-medium text-slate-800">${g.name}</td>
                <td class="px-5 py-3 text-slate-600 hidden sm:table-cell">${g.owner}</td>
                <td class="px-5 py-3 text-slate-700 font-semibold">${g.members}</td>
                <td class="px-5 py-3 hidden md:table-cell"><span class="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">${g.plan}</span></td>
                <td class="px-5 py-3"><span class="text-xs font-semibold px-2.5 py-1 rounded-full ${g.status==='ACTIVE'?'bg-green-100 text-green-700':g.status==='TRIAL'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'}">${g.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function renderSuperAdminSubs(el) {
  el.innerHTML = `
    <div class="space-y-5">
      <div><h2 class="text-xl font-bold text-slate-800">💎 Subscriptions</h2><p class="text-sm text-slate-500 mt-0.5">Platform subscription plans and MRR overview</p></div>
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
          <p class="text-3xl font-extrabold text-indigo-600">$18,450</p>
          <p class="text-xs text-slate-500 mt-1">Monthly Recurring Revenue</p>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
          <p class="text-3xl font-extrabold text-green-600">42</p>
          <p class="text-xs text-slate-500 mt-1">Active Subscriptions</p>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
          <p class="text-3xl font-extrabold text-amber-600">3</p>
          <p class="text-xs text-slate-500 mt-1">Trials Active</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100"><h3 class="font-semibold text-slate-800">Plan Breakdown</h3></div>
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-100"><tr>
            <th class="text-left px-5 py-3 font-semibold text-slate-600">Plan</th>
            <th class="text-left px-5 py-3 font-semibold text-slate-600">Price/mo</th>
            <th class="text-left px-5 py-3 font-semibold text-slate-600">Gyms</th>
            <th class="text-left px-5 py-3 font-semibold text-slate-600">MRR</th>
          </tr></thead>
          <tbody class="divide-y divide-slate-50">
            ${[
              {plan:'Starter',    price:'$49',  gyms:12, mrr:'$588'},
              {plan:'Pro',        price:'$149', gyms:18, mrr:'$2,682'},
              {plan:'Enterprise', price:'$399', gyms:9,  mrr:'$3,591'},
            ].map(r=>`<tr class="hover:bg-slate-50"><td class="px-5 py-3 font-medium text-slate-800">${r.plan}</td><td class="px-5 py-3 text-slate-600">${r.price}</td><td class="px-5 py-3 text-slate-700 font-semibold">${r.gyms}</td><td class="px-5 py-3 text-green-600 font-semibold">${r.mrr}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ==================== INIT ====================
navigate('landing');

