import { pgTable, uuid, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const giftOrders = pgTable("gift_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderCode: text("order_code").notNull().unique(),
  design: text("design").notNull().default("blush"),
  amountCents: integer("amount_cents").notNull(),
  quantity: integer("quantity").notNull().default(1),
  totalCents: integer("total_cents").notNull(),
  purchaserName: text("purchaser_name").notNull(),
  purchaserEmail: text("purchaser_email").notNull(),
  purchaserPhone: text("purchaser_phone"),
  recipientName: text("recipient_name").notNull(),
  recipientEmail: text("recipient_email"),
  recipientPhone: text("recipient_phone"),
  message: text("message"),
  deliveryMethod: text("delivery_method").notNull().default("private_link"),
  scheduledDate: text("scheduled_date"),
  paymentMethod: text("payment_method").notNull().default("card"),
  paymentRef: text("payment_ref"),
  paymentStatus: text("payment_status").notNull().default("paid"),
  giftStatus: text("gift_status").notNull().default("active"),
  isPrivate: boolean("is_private").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  viewedAt: timestamp("viewed_at"),
  redeemedAt: timestamp("redeemed_at"),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingCode: text("booking_code").notNull().unique(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone"),
  service: text("service").notNull(),
  preferredDate: text("preferred_date").notNull(),
  preferredTime: text("preferred_time").notNull(),
  duration: text("duration"),
  notes: text("notes"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type GiftOrder = typeof giftOrders.$inferSelect;
export type NewGiftOrder = typeof giftOrders.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
