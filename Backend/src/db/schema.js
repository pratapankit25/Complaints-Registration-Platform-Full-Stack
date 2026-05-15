import { pgTable, serial, text, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password'), // plain text as requested
  role: varchar('role', { length: 50 }).default('user').notNull(),
  otp: varchar('otp', { length: 10 }),
  otp_expiry: timestamp('otp_expiry'),
  is_verified: boolean('is_verified').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const complaints = pgTable('complaints', {
  id: serial('id').primaryKey(),
  user_id: serial('user_id').references(() => users.id).notNull(),
  complaint_text: text('complaint_text').notNull(),
  ai_question: text('ai_question'),
  user_answer: text('user_answer'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});
