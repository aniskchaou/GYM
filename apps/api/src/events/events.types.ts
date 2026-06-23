/**
 * System-wide event types.
 * All emitters and listeners reference these constants so the bus stays type-safe.
 */
export const APP_EVENTS = {
  // Access & attendance
  MEMBER_CHECKED_IN: 'member.checked_in',
  MEMBER_CHECKED_OUT: 'member.checked_out',
  ACCESS_DENIED: 'access.denied',

  // Lockers
  LOCKER_ASSIGNED: 'locker.assigned',
  LOCKER_RELEASED: 'locker.released',

  // Equipment
  EQUIPMENT_BOOKED: 'equipment.booked',
  EQUIPMENT_RELEASED: 'equipment.released',

  // Classes & PT
  CLASS_JOINED: 'class.joined',
  CLASS_CANCELLED: 'class.cancelled',
  PT_SESSION_COMPLETED: 'pt.session_completed',

  // Programs & activities
  PROGRAM_ENROLLED: 'program.enrolled',
  PROGRAM_COMPLETED: 'program.completed',
  ACTIVITY_JOINED: 'activity.joined',
  ACTIVITY_COMPLETED: 'activity.completed',

  // Events
  EVENT_REGISTERED: 'event.registered',
  EVENT_ATTENDED: 'event.attended',

  // Commerce
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
  PRODUCT_PURCHASED: 'product.purchased',
  LOW_STOCK: 'inventory.low_stock',
  LOW_STOCK_ALERT: 'inventory.low_stock_alert',
  GIFT_CARD_ISSUED: 'gift_card.issued',
  GIFT_CARD_REDEEMED: 'gift_card.redeemed',

  // Loyalty
  POINTS_AWARDED: 'loyalty.points_awarded',
  REWARD_REDEEMED: 'loyalty.reward_redeemed',
  TIER_UPGRADED: 'loyalty.tier_upgraded',

  // Marketing
  CAMPAIGN_SENT: 'marketing.campaign_sent',
  USER_SEGMENTED: 'marketing.user_segmented',

  // Membership lifecycle
  MEMBERSHIP_EXPIRING: 'membership.expiring',
  MEMBERSHIP_FROZEN: 'membership.frozen',
  MEMBERSHIP_CANCELLED: 'membership.cancelled',
} as const;

export type AppEventName = (typeof APP_EVENTS)[keyof typeof APP_EVENTS];

export interface BaseEventPayload {
  gymId?: string | null;
  userId?: string | null;
  at?: Date;
  meta?: Record<string, any>;
}
