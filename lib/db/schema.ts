import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const prospects = sqliteTable("prospects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull().default("NEW"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  mapsUrl: text("maps_url"),
  websiteUrl: text("website_url"),
  websiteStatus: text("website_status").notNull().default("UNKNOWN"),
  rating: real("rating"),
  reviewsCount: integer("reviews_count"),
  pitchAngle: text("pitch_angle"),
  demoPageUrl: text("demo_page_url"),
  notes: text("notes"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const emails = sqliteTable("emails", {
  id: text("id").primaryKey(),
  prospectId: text("prospect_id")
    .notNull()
    .references(() => prospects.id, { onDelete: "cascade" }),
  direction: text("direction").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  sentAt: integer("sent_at").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const activities = sqliteTable("activities", {
  id: text("id").primaryKey(),
  prospectId: text("prospect_id")
    .notNull()
    .references(() => prospects.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  message: text("message").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const loginAttempts = sqliteTable("login_attempts", {
  id: text("id").primaryKey(),
  ip: text("ip").notNull(),
  attemptedAt: integer("attempted_at").notNull(),
});

export type ProspectRow = typeof prospects.$inferSelect;
export type EmailRow = typeof emails.$inferSelect;
export type ActivityRow = typeof activities.$inferSelect;

export const campaignState = sqliteTable("campaign_state", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export type CampaignStateRow = typeof campaignState.$inferSelect;
