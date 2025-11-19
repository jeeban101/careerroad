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
  resetToken: varchar("reset_token", { length: 255 }),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  totalXp: integer("total_xp").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastLoginDate: timestamp("last_login_date"),
  weeklyTimeSpent: integer("weekly_time_spent").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User activity log for heatmap visualization
export const userActivityLog = pgTable("user_activity_log", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  activityDate: timestamp("activity_date").notNull(),
  xpEarned: integer("xp_earned").default(0),
  tasksCompleted: integer("tasks_completed").default(0),
  timeSpent: integer("time_spent").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Achievements/Badges system
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  requirement: integer("requirement").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User earned achievements
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id, { onDelete: "cascade" }).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

// Saved roadmaps for users
export const savedRoadmaps = pgTable("saved_roadmaps", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id).notNull(),
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
  userId: serial("user_id").references(() => users.id).notNull(),
  originalTemplateId: integer("original_template_id").references(() => roadmapTemplates.id),
  title: text("title").notNull(),
  phases: jsonb("phases").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userRoadmapHistory = pgTable("user_roadmap_history", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id, { onDelete: "cascade" }),
  roadmapType: varchar("roadmap_type", { length: 50 }).notNull().default("career"),
  currentCourse: varchar("current_course", { length: 255 }),
  targetRole: varchar("target_role", { length: 255 }),
  skill: varchar("skill", { length: 255 }),
  proficiencyLevel: varchar("proficiency_level", { length: 255 }),
  timeFrame: varchar("time_frame", { length: 50 }),
  title: varchar("title", { length: 255 }).notNull(),
  phases: jsonb("phases").$type<RoadmapPhase[]>(),
  skillContent: jsonb("skill_content").$type<SkillRoadmapContent>(),
  accessCount: integer("access_count").default(1),
  lastAccessed: timestamp("last_accessed").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userRoadmapProgress = pgTable("user_roadmap_progress", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id, { onDelete: "cascade" }),
  roadmapId: integer("roadmap_id").references(() => userRoadmapHistory.id, { onDelete: "cascade" }),
  phaseIndex: integer("phase_index"),
  taskIndex: integer("task_index"),
  stepIndex: integer("step_index"),
  itemIndex: integer("item_index"),
  completed: boolean("completed").default(false),
  notes: text("notes"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Kanban Boards
export const kanbanBoards = pgTable("kanban_boards", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  roadmapId: integer("roadmap_id").references(() => userRoadmapHistory.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  roadmapType: varchar("roadmap_type", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Kanban Tasks
export const kanbanTasks = pgTable("kanban_tasks", {
  id: serial("id").primaryKey(),
  boardId: integer("board_id").references(() => kanbanBoards.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  resources: jsonb("resources").$type<string[]>(),
  estimatedTime: varchar("estimated_time", { length: 100 }),
  category: varchar("category", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("todo"),
  position: integer("position").notNull().default(0),
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

export const insertUserRoadmapHistorySchema = createInsertSchema(userRoadmapHistory).pick({
  userId: true,
  roadmapType: true,
  currentCourse: true,
  targetRole: true,
  skill: true,
  proficiencyLevel: true,
  timeFrame: true,
  title: true,
  phases: true,
  skillContent: true,
});

export const insertUserRoadmapProgressSchema = createInsertSchema(userRoadmapProgress).pick({
  userId: true,
  roadmapId: true,
  phaseIndex: true,
  taskIndex: true,
  stepIndex: true,
  itemIndex: true,
  completed: true,
  notes: true,
});

export const insertKanbanBoardSchema = createInsertSchema(kanbanBoards).pick({
  userId: true,
  roadmapId: true,
  name: true,
  description: true,
  roadmapType: true,
});

export const insertKanbanTaskSchema = createInsertSchema(kanbanTasks).pick({
  boardId: true,
  title: true,
  description: true,
  resources: true,
  estimatedTime: true,
  category: true,
  status: true,
  position: true,
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
export type InsertUserRoadmapHistory = z.infer<typeof insertUserRoadmapHistorySchema>;
export type UserRoadmapHistory = typeof userRoadmapHistory.$inferSelect;
export type InsertUserRoadmapProgress = z.infer<typeof insertUserRoadmapProgressSchema>;
export type UserRoadmapProgress = typeof userRoadmapProgress.$inferSelect;
export type InsertKanbanBoard = z.infer<typeof insertKanbanBoardSchema>;
export type KanbanBoard = typeof kanbanBoards.$inferSelect;
export type InsertKanbanTask = z.infer<typeof insertKanbanTaskSchema>;
export type KanbanTask = typeof kanbanTasks.$inferSelect;

// Kanban generation from roadmap
export const kanbanTaskGenerationSchema = z.object({
  tasks: z.array(z.object({
    title: z.string().max(500),
    description: z.string().optional(),
    status: z.enum(["todo", "in_progress", "done"]),
    position: z.number(),
    resources: z.array(z.string()).optional(),
    estimatedTime: z.string().max(100).optional(),
    category: z.string().max(100).optional(),
  })),
  boardSummary: z.string().max(500).optional(),
});

export type KanbanTaskGeneration = z.infer<typeof kanbanTaskGenerationSchema>;

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

// Skill roadmap types
export interface SkillRoadmapStage {
  stage: string;
  duration: string;
  tasks: string[];
  resources: string[];
}

export interface SkillRoadmapContent {
  skill: string;
  proficiencyLevel: string;
  timeFrame: string;
  overview: string;
  stages: SkillRoadmapStage[];
  milestones: string[];
  expectedOutcome: string;
}

// Roadmap type enum
export const roadmapTypeEnum = z.enum(["career", "skill"]);
export type RoadmapType = z.infer<typeof roadmapTypeEnum>;

// Skill roadmap generation schemas
export const generateSkillRoadmapSchema = z.object({
  skill: z.string().min(1, "Skill is required"),
  proficiencyLevel: z.enum([
    "I don't know anything about it",
    "I have heard and know the gist of it",
    "I used to know it but not done it lately",
    "I am an expert and want to learn more"
  ]),
  timeFrame: z.enum([
    "24 hr",
    "48 hr",
    "3 days",
    "1 week",
    "2 weeks",
    "4 weeks",
    "3 months",
    "6 months"
  ]),
  currentCourse: z.string().optional(),
  desiredRole: z.string().optional(),
});

export type GenerateSkillRoadmap = z.infer<typeof generateSkillRoadmapSchema>;

// Email schemas
export const emailRequestSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  roadmapId: z.number(),
  roadmapTitle: z.string(),
});

// Password reset schemas
export const resetPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export type EmailRequest = z.infer<typeof emailRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;

// Activity and Achievement types
export type UserActivityLog = typeof userActivityLog.$inferSelect;
export type InsertUserActivityLog = typeof userActivityLog.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;
