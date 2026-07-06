import {
  pgTable, pgEnum, uuid, text,
  integer, boolean, timestamp, real, index, jsonb
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── BETTER AUTH ──────────────────────────────────────────────
export const user = pgTable("user", {
  id:            text("id").primaryKey(),
  name:          text("name").notNull(),
  email:         text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image:         text("image"),
  role:          text("role").default("guest").notNull(),
  phone:         text("phone"),
  nationality:   text("nationality"),
  banned:        boolean("banned").default(false),
  banReason:     text("ban_reason"),
  banExpires:    timestamp("ban_expires"),
  createdAt:     timestamp("created_at").defaultNow().notNull(),
  updatedAt:     timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
})

export const session = pgTable("session", {
  id:             text("id").primaryKey(),
  expiresAt:      timestamp("expires_at").notNull(),
  token:          text("token").notNull().unique(),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
  updatedAt:      timestamp("updated_at").$onUpdate(() => new Date()).notNull(),
  ipAddress:      text("ip_address"),
  userAgent:      text("user_agent"),
  userId:         text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
}, (t) => [index("session_userId_idx").on(t.userId)])

export const account = pgTable("account", {
  id:                    text("id").primaryKey(),
  accountId:             text("account_id").notNull(),
  providerId:            text("provider_id").notNull(),
  userId:                text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken:           text("access_token"),
  refreshToken:          text("refresh_token"),
  idToken:               text("id_token"),
  accessTokenExpiresAt:  timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope:                 text("scope"),
  password:              text("password"),
  createdAt:             timestamp("created_at").defaultNow().notNull(),
  updatedAt:             timestamp("updated_at").$onUpdate(() => new Date()).notNull(),
}, (t) => [index("account_userId_idx").on(t.userId)])

export const verification = pgTable("verification", {
  id:         text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value:      text("value").notNull(),
  expiresAt:  timestamp("expires_at").notNull(),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
  updatedAt:  timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (t) => [index("verification_identifier_idx").on(t.identifier)])

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  bookings: many(bookings),
}))
export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}))
export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}))

// ─── ENUMS ────────────────────────────────────────────────────
export const roomStatusEnum = pgEnum('room_status', [
  'AVAILABLE', 'OCCUPIED', 'MAINTENANCE'
])
export const bookingStatusEnum = pgEnum('booking_status', [
  'PENDING', 'CONFIRMED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW'
])
export const bookingSourceEnum = pgEnum('booking_source', [
  'WEBSITE', 'WHATSAPP', 'PHONE', 'WALKIN'
])
export const galleryCategoryEnum = pgEnum('gallery_category', [
  'ROOMS', 'POOL', 'RESTAURANT', 'GROUNDS', 'EXTERIOR', 'EVENTS'
])

// ─── PHOTO TYPE (shared) ──────────────────────────────────────
export type RoomPhoto = {
  url:       string
  alt:       string | null
  isPrimary: boolean
  order:     number
}

// ─── ROOMS ────────────────────────────────────────────────────
// One table per room — photos stored as JSONB array (ImageKit URLs)
// No separate roomTypes or roomPhotos tables
export const rooms = pgTable('rooms', {
  id:            uuid('id').primaryKey().defaultRandom(),
  name:          text('name').notNull(),           // "Royal Canopy Villa"
  slug:          text('slug').notNull().unique(),  // "royal-canopy-villa"
  description:   text('description').notNull(),
  number:        text('number'),                   // "101" — optional for named rooms
  floor:         integer('floor'),
  pricePerNight: real('price_per_night').notNull(),
  weekendPrice:  real('weekend_price'),
  sizeM2:        integer('size_m2'),
  bedrooms:      integer('bedrooms').default(1).notNull(),
  beds:          text('beds'),                     // "1 King Bed"
  maxGuests:     integer('max_guests').notNull(),
  view:          text('view'),                     // "Hill view", "Pool view"
  status:        roomStatusEnum('status').default('AVAILABLE').notNull(),

  // Photos stored inline — no separate table needed for a boutique hotel
  photos: jsonb('photos').$type<RoomPhoto[]>().default([]).notNull(),

  // Amenities as booleans
  hasWifi:       boolean('has_wifi').default(true).notNull(),
  hasBreakfast:  boolean('has_breakfast').default(false).notNull(),
  hasAC:         boolean('has_ac').default(true).notNull(),
  hasTv:         boolean('has_tv').default(true).notNull(),
  hasBalcony:    boolean('has_balcony').default(false).notNull(),
  hasPoolAccess: boolean('has_pool_access').default(false).notNull(),
  hasMinibar:    boolean('has_minibar').default(false).notNull(),
  hasHotWater:   boolean('has_hot_water').default(true).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
})

// ─── BOOKINGS ─────────────────────────────────────────────────
export const bookings = pgTable('bookings', {
  id:              uuid('id').primaryKey().defaultRandom(),
  userId:          text('user_id').notNull().references(() => user.id),
  roomId:          uuid('room_id').notNull().references(() => rooms.id),
  checkIn:         timestamp('check_in').notNull(),
  checkOut:        timestamp('check_out').notNull(),
  adults:          integer('adults').default(1).notNull(),
  children:        integer('children').default(0).notNull(),
  totalNights:     integer('total_nights').notNull(),
  totalAmount:     real('total_amount').notNull(),
  status:          bookingStatusEnum('status').default('PENDING').notNull(),
  specialRequests: text('special_requests'),
  notes:           text('notes'),
  source:          bookingSourceEnum('source').default('WEBSITE').notNull(),
  createdAt:       timestamp('created_at').defaultNow().notNull(),
  updatedAt:       timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
})

// ─── GALLERY ──────────────────────────────────────────────────
export const gallery = pgTable('gallery', {
  id:       uuid('id').primaryKey().defaultRandom(),
  url:      text('url').notNull(),
  alt:      text('alt'),
  category: galleryCategoryEnum('category').notNull(),
  order:    integer('order').default(0).notNull(),
})

// ─── RELATIONS ────────────────────────────────────────────────
export const roomsRelations = relations(rooms, ({ many }) => ({
  bookings: many(bookings),
}))

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(user, { fields: [bookings.userId], references: [user.id] }),
  room: one(rooms, { fields: [bookings.roomId], references: [rooms.id] }),
}))