import { pgTable, text, serial, integer, boolean, jsonb, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for simple email/password auth
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Saved roadmaps for users
export const savedRoadmaps = pgTable("saved_roadmaps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  currentCourse: varchar("current_course", { length: 255 }).notNull(),
  targetRole: varchar("target_role", { length: 255 }).notNull(),
  phases: jsonb("phases").notNull().$type<RoadmapPhase[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const waitlistEntries = pgTable("waitlist_entries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  college: text("college").notNull(),
  confusion: text("confusion"),
});

export const roadmapTemplates = pgTable("roadmap_templates", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  title: text("title").notNull(),
  currentCourse: text("current_course").notNull(),
  targetRole: text("target_role").notNull(),
  phases: jsonb("phases").notNull(),
});

export const customRoadmaps = pgTable("custom_roadmaps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  originalTemplateId: integer("original_template_id").references(() => roadmapTemplates.id),
  title: text("title").notNull(),
  phases: jsonb("phases").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
});

export const insertSavedRoadmapSchema = createInsertSchema(savedRoadmaps).pick({
  userId: true,
  title: true,
  currentCourse: true,
  targetRole: true,
  phases: true,
});

export const insertWaitlistEntrySchema = createInsertSchema(waitlistEntries).pick({
  name: true,
  email: true,
  college: true,
  confusion: true,
});

export const insertRoadmapTemplateSchema = createInsertSchema(roadmapTemplates).pick({
  key: true,
  title: true,
  currentCourse: true,
  targetRole: true,
  phases: true,
});

export const insertCustomRoadmapSchema = createInsertSchema(customRoadmaps).pick({
  userId: true,
  originalTemplateId: true,
  title: true,
  phases: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSavedRoadmap = z.infer<typeof insertSavedRoadmapSchema>;
export type SavedRoadmap = typeof savedRoadmaps.$inferSelect;
export type InsertWaitlistEntry = z.infer<typeof insertWaitlistEntrySchema>;
export type WaitlistEntry = typeof waitlistEntries.$inferSelect;
export type InsertRoadmapTemplate = z.infer<typeof insertRoadmapTemplateSchema>;
export type RoadmapTemplate = typeof roadmapTemplates.$inferSelect;
export type InsertCustomRoadmap = z.infer<typeof insertCustomRoadmapSchema>;
export type CustomRoadmap = typeof customRoadmaps.$inferSelect;

export interface RoadmapPhase {
  title: string;
  duration_weeks: number;
  items: RoadmapItem[];
}

export interface RoadmapItem {
  type: "resource" | "tool" | "task" | "community";
  label: string;
  link?: string;
  description?: string;
}

// Email schemas
export const emailRequestSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  roadmapId: z.number(),
  roadmapTitle: z.string(),
});

export type EmailRequest = z.infer<typeof emailRequestSchema>;
