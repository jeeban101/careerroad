import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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
  originalTemplateId: integer("original_template_id").references(() => roadmapTemplates.id),
  title: text("title").notNull(),
  phases: jsonb("phases").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
  originalTemplateId: true,
  title: true,
  phases: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
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
