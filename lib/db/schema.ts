import {
  pgTable, pgEnum, uuid, text,
  integer, boolean, timestamp, real, index
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));


// ─── ENUMS ───────────────────────────────────────────────────
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


// ─── ROOM TYPES ──────────────────────────────────────────────
// amenities live directly as booleans — no junction table needed
export const roomTypes = pgTable('room_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),           // "Deluxe Pool View"
  slug: text('slug').notNull().unique(),  // "deluxe-pool-view"
  description: text('description').notNull(),
  pricePerNight: real('price_per_night').notNull(),
  weekendPrice: real('weekend_price'),

  // sizing & layout
  sizeM2: integer('size_m2'),
  bedrooms: integer('bedrooms').default(1).notNull(),
  beds: text('beds'),                     // "1 King" or "2 Singles"
  maxGuests: integer('max_guests').notNull(),

  // amenities as direct booleans — fastest to query, easiest to display
  hasWifi: boolean('has_wifi').default(true).notNull(),
  hasBreakfast: boolean('has_breakfast').default(false).notNull(),
  hasAC: boolean('has_ac').default(true).notNull(),
  hasTv: boolean('has_tv').default(true).notNull(),
  hasBalcony: boolean('has_balcony').default(false).notNull(),
  hasPoolAccess: boolean('has_pool_access').default(false).notNull(),
  hasMinibar: boolean('has_minibar').default(false).notNull(),
  hasHotWater: boolean('has_hot_water').default(true).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// physical room instances — for tracking which room is occupied
export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomTypeId: uuid('room_type_id').notNull().references(() => roomTypes.id, { onDelete: 'cascade' }),
  number: text('number').notNull(),  // "101", "202"
  floor: integer('floor').notNull(),
  status: roomStatusEnum('status').default('AVAILABLE').notNull(),
})

// photos stored on ImageKit — we only save the URL
export const roomPhotos = pgTable('room_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomTypeId: uuid('room_type_id').notNull().references(() => roomTypes.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  alt: text('alt'),
  order: integer('order').default(0).notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
})

// ─── BOOKINGS ────────────────────────────────────────────────
export const guests = pgTable('guests', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  nationality: text('nationality'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  guestId: uuid('guest_id').notNull().references(() => guests.id),
  roomTypeId: uuid('room_type_id').notNull().references(() => roomTypes.id),
  roomId: uuid('room_id').references(() => rooms.id), // assigned on confirm
  checkIn: timestamp('check_in').notNull(),
  checkOut: timestamp('check_out').notNull(),
  adults: integer('adults').default(1).notNull(),
  children: integer('children').default(0).notNull(),
  totalNights: integer('total_nights').notNull(),
  totalAmount: real('total_amount').notNull(),
  status: bookingStatusEnum('status').default('PENDING').notNull(),
  specialRequests: text('special_requests'),
  notes: text('notes'),
  source: bookingSourceEnum('source').default('WEBSITE').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ─── GALLERY ─────────────────────────────────────────────────
// hotel photos — all stored on ImageKit, we just track the URL + category
export const gallery = pgTable('gallery', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: text('url').notNull(),      // ImageKit URL
  alt: text('alt'),
  category: galleryCategoryEnum('category').notNull(),
  order: integer('order').default(0).notNull(),
})

// ─── RELATIONS ───────────────────────────────────────────────
export const roomTypesRelations = relations(roomTypes, ({ many }) => ({
  rooms: many(rooms),
  photos: many(roomPhotos),
  bookings: many(bookings),
}))

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  roomType: one(roomTypes, { fields: [rooms.roomTypeId], references: [roomTypes.id] }),
  bookings: many(bookings),
}))

export const roomPhotosRelations = relations(roomPhotos, ({ one }) => ({
  roomType: one(roomTypes, { fields: [roomPhotos.roomTypeId], references: [roomTypes.id] }),
}))

export const guestsRelations = relations(guests, ({ many }) => ({
  bookings: many(bookings),
}))

export const bookingsRelations = relations(bookings, ({ one }) => ({
  guest: one(guests, { fields: [bookings.guestId], references: [guests.id] }),
  roomType: one(roomTypes, { fields: [bookings.roomTypeId], references: [roomTypes.id] }),
  room: one(rooms, { fields: [bookings.roomId], references: [rooms.id] }),
}))