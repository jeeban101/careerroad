import { 
  users, 
  waitlistEntries, 
  roadmapTemplates, 
  customRoadmaps,
  savedRoadmaps,
  sessions,
  userRoadmapHistory,
  userRoadmapProgress,
  kanbanBoards,
  kanbanTasks,
  type User, 
  type InsertUser,
  type WaitlistEntry,
  type InsertWaitlistEntry,
  type RoadmapTemplate,
  type InsertRoadmapTemplate,
  type CustomRoadmap,
  type InsertCustomRoadmap,
  type SavedRoadmap,
  type InsertSavedRoadmap,
  type UserRoadmapHistory,
  type InsertUserRoadmapHistory,
  type UserRoadmapProgress,
  type InsertUserRoadmapProgress,
  type KanbanBoard,
  type InsertKanbanBoard,
  type KanbanTask,
  type InsertKanbanTask
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserStats(userId: number): Promise<{ totalXp: number; currentStreak: number; longestStreak: number; completedTasks: number }>;
  
  createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistEntry>;
  getWaitlistEntries(): Promise<WaitlistEntry[]>;
  
  getRoadmapTemplate(key: string): Promise<RoadmapTemplate | undefined>;
  getAllRoadmapTemplates(): Promise<RoadmapTemplate[]>;
  createRoadmapTemplate(template: InsertRoadmapTemplate): Promise<RoadmapTemplate>;
  
  createCustomRoadmap(roadmap: InsertCustomRoadmap): Promise<CustomRoadmap>;
  getCustomRoadmap(id: number): Promise<CustomRoadmap | undefined>;
  getCustomRoadmapsByUser(userId: number): Promise<CustomRoadmap[]>;
  
  createSavedRoadmap(roadmap: InsertSavedRoadmap): Promise<SavedRoadmap>;
  getSavedRoadmapsByUser(userId: number): Promise<SavedRoadmap[]>;
  deleteSavedRoadmap(id: number, userId: number): Promise<void>;
  
  // New methods for roadmap history and progress
  createUserRoadmapHistory(history: InsertUserRoadmapHistory): Promise<UserRoadmapHistory>;
  getUserRoadmapHistory(userId: number): Promise<UserRoadmapHistory[]>;
  deleteUserRoadmapHistory(roadmapId: number, userId: number): Promise<void>;
  updateRoadmapAccessCount(roadmapId: number): Promise<void>;
  
  createUserRoadmapProgress(progress: InsertUserRoadmapProgress): Promise<UserRoadmapProgress>;
  getUserRoadmapProgress(userId: number, roadmapId: number): Promise<UserRoadmapProgress[]>;
  updateTaskProgress(userId: number, roadmapId: number, phaseIndex: number, taskIndex: number, completed: boolean, notes?: string): Promise<void>;
  getTaskProgress(userId: number, roadmapId: number, phaseIndex: number, taskIndex: number): Promise<UserRoadmapProgress | undefined>;
  
  // Kanban Board methods
  createKanbanBoard(board: InsertKanbanBoard): Promise<KanbanBoard>;
  getKanbanBoardsByUser(userId: number): Promise<KanbanBoard[]>;
  getKanbanBoard(boardId: number, userId: number): Promise<KanbanBoard | undefined>;
  deleteKanbanBoard(boardId: number, userId: number): Promise<void>;
  generateKanbanBoardWithTasks(board: InsertKanbanBoard, tasks: Omit<InsertKanbanTask, 'boardId'>[]): Promise<{ board: KanbanBoard; tasks: KanbanTask[] }>;
  
  // Kanban Task methods
  createKanbanTask(task: InsertKanbanTask): Promise<KanbanTask>;
  getKanbanTasksByBoard(boardId: number, userId: number): Promise<KanbanTask[]>;
  updateKanbanTask(taskId: number, userId: number, updates: Partial<InsertKanbanTask>): Promise<KanbanTask>;
  updateKanbanTaskStatus(taskId: number, userId: number, status: string, position: number): Promise<KanbanTask>;
  deleteKanbanTask(taskId: number, userId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private waitlistEntries: Map<number, WaitlistEntry>;
  private roadmapTemplates: Map<string, RoadmapTemplate>;
  private customRoadmaps: Map<number, CustomRoadmap>;
  private savedRoadmaps: Map<number, SavedRoadmap>;
  private userRoadmapHistories: Map<number, UserRoadmapHistory>;
  private userRoadmapProgresses: Map<number, UserRoadmapProgress>;
  private currentUserId: number;
  private currentWaitlistId: number;
  private currentTemplateId: number;
  private currentCustomRoadmapId: number;
  private currentSavedRoadmapId: number;
  private currentHistoryId: number;
  private currentProgressId: number;

  constructor() {
    this.users = new Map();
    this.waitlistEntries = new Map();
    this.roadmapTemplates = new Map();
    this.customRoadmaps = new Map();
    this.savedRoadmaps = new Map();
    this.userRoadmapHistories = new Map();
    this.userRoadmapProgresses = new Map();
    this.currentUserId = 1;
    this.currentWaitlistId = 1;
    this.currentTemplateId = 1;
    this.currentCustomRoadmapId = 1;
    this.currentSavedRoadmapId = 1;
    this.currentHistoryId = 1;
    this.currentProgressId = 1;
    
    // Initialize with sample roadmap templates
    this.initializeRoadmapTemplates();
  }

  private initializeRoadmapTemplates() {
    const templates: InsertRoadmapTemplate[] = [
      {
        key: "bcom_product-manager",
        title: "B.Com → Product Manager",
        currentCourse: "bcom",
        targetRole: "product-manager",
        phases: [
          {
            title: "Learn Product Thinking",
            duration_weeks: 3,
            items: [
              {
                type: "resource",
                label: "Read 'Inspired' by Marty Cagan",
                link: "https://www.amazon.com/Inspired-Create-Tech-Products-Customers/dp/1119387507",
                description: "Essential reading for understanding product management"
              },
              {
                type: "tool",
                label: "Learn Notion for writing PRDs",
                description: "Master product requirements documents"
              }
            ]
          },
          {
            title: "Build Projects",
            duration_weeks: 4,
            items: [
              {
                type: "task",
                label: "Write a mock PRD for Swiggy feature",
                description: "Create a detailed product requirements document"
              },
              {
                type: "community",
                label: "Join Product Case Study Telegram group",
                link: "https://t.me/productcasestudies",
                description: "Connect with other aspiring PMs"
              }
            ]
          },
          {
            title: "Apply & Network",
            duration_weeks: 6,
            items: [
              {
                type: "task",
                label: "Apply for PM internships at top companies",
                description: "Target: Zomato, Swiggy, Flipkart, etc."
              },
              {
                type: "community",
                label: "Connect with 10 PMs on LinkedIn",
                description: "Send personalized connection requests"
              }
            ]
          }
        ]
      },
      {
        key: "btech_software-engineer",
        title: "B.Tech → Software Engineer",
        currentCourse: "btech",
        targetRole: "software-engineer",
        phases: [
          {
            title: "Master Programming Fundamentals",
            duration_weeks: 4,
            items: [
              {
                type: "resource",
                label: "Complete Data Structures & Algorithms course",
                link: "https://www.coursera.org/specializations/algorithms",
                description: "Build strong programming foundations"
              },
              {
                type: "tool",
                label: "Learn Git and GitHub",
                description: "Essential version control skills"
              }
            ]
          },
          {
            title: "Build Real Projects",
            duration_weeks: 6,
            items: [
              {
                type: "task",
                label: "Build a full-stack web application",
                description: "Create something you can showcase"
              },
              {
                type: "task",
                label: "Contribute to open source projects",
                description: "Start with good first issues"
              }
            ]
          },
          {
            title: "Interview Preparation",
            duration_weeks: 4,
            items: [
              {
                type: "resource",
                label: "Practice coding interviews on LeetCode",
                link: "https://leetcode.com",
                description: "Solve 100+ problems"
              },
              {
                type: "task",
                label: "Apply to tech companies",
                description: "Target: Google, Microsoft, Amazon, etc."
              }
            ]
          }
        ]
      }
    ];

    templates.forEach(template => {
      this.createRoadmapTemplate(template);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      totalXp: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastLoginDate: null,
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async getUserStats(userId: number): Promise<{ totalXp: number; currentStreak: number; longestStreak: number; completedTasks: number }> {
    const user = this.users.get(userId);
    const completedTasks = Array.from(this.userRoadmapProgresses.values()).filter(
      p => p.userId === userId && p.completed
    ).length;
    
    return {
      totalXp: user?.totalXp || 0,
      currentStreak: user?.currentStreak || 0,
      longestStreak: user?.longestStreak || 0,
      completedTasks
    };
  }

  async createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistEntry> {
    const id = this.currentWaitlistId++;
    const waitlistEntry: WaitlistEntry = { ...entry, id, confusion: entry.confusion || null };
    this.waitlistEntries.set(id, waitlistEntry);
    return waitlistEntry;
  }

  async getWaitlistEntries(): Promise<WaitlistEntry[]> {
    return Array.from(this.waitlistEntries.values());
  }

  async getRoadmapTemplate(key: string): Promise<RoadmapTemplate | undefined> {
    return this.roadmapTemplates.get(key);
  }

  async getAllRoadmapTemplates(): Promise<RoadmapTemplate[]> {
    return Array.from(this.roadmapTemplates.values());
  }

  async createRoadmapTemplate(template: InsertRoadmapTemplate): Promise<RoadmapTemplate> {
    const id = this.currentTemplateId++;
    const roadmapTemplate: RoadmapTemplate = { ...template, id };
    this.roadmapTemplates.set(template.key, roadmapTemplate);
    return roadmapTemplate;
  }

  async createCustomRoadmap(roadmap: InsertCustomRoadmap): Promise<CustomRoadmap> {
    const id = this.currentCustomRoadmapId++;
    const customRoadmap: CustomRoadmap = { 
      ...roadmap, 
      id,
      originalTemplateId: roadmap.originalTemplateId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.customRoadmaps.set(id, customRoadmap);
    return customRoadmap;
  }

  async getCustomRoadmap(id: number): Promise<CustomRoadmap | undefined> {
    return this.customRoadmaps.get(id);
  }

  async getCustomRoadmapsByUser(userId: number): Promise<CustomRoadmap[]> {
    return Array.from(this.customRoadmaps.values()).filter(
      roadmap => roadmap.userId === userId
    );
  }

  async createSavedRoadmap(roadmap: InsertSavedRoadmap): Promise<SavedRoadmap> {
    const id = this.currentSavedRoadmapId++;
    const savedRoadmap: SavedRoadmap = { 
      ...roadmap, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.savedRoadmaps.set(id, savedRoadmap);
    return savedRoadmap;
  }

  async getSavedRoadmapsByUser(userId: number): Promise<SavedRoadmap[]> {
    return Array.from(this.savedRoadmaps.values()).filter(
      roadmap => roadmap.userId === userId
    );
  }

  async deleteSavedRoadmap(id: number, userId: number): Promise<void> {
    const roadmap = this.savedRoadmaps.get(id);
    if (roadmap && roadmap.userId === userId) {
      this.savedRoadmaps.delete(id);
    }
  }

  // New history and progress tracking methods
  async createUserRoadmapHistory(history: InsertUserRoadmapHistory): Promise<UserRoadmapHistory> {
    const id = this.currentHistoryId++;
    const userHistory: UserRoadmapHistory = {
      ...history,
      id,
      accessCount: 1,
      lastAccessed: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.userRoadmapHistories.set(id, userHistory);
    return userHistory;
  }

  async getUserRoadmapHistory(userId: number): Promise<UserRoadmapHistory[]> {
    return Array.from(this.userRoadmapHistories.values()).filter(
      history => history.userId === userId
    ).sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime());
  }

  async deleteUserRoadmapHistory(roadmapId: number, userId: number): Promise<void> {
    const history = this.userRoadmapHistories.get(roadmapId);
    if (history && history.userId === userId) {
      this.userRoadmapHistories.delete(roadmapId);
    }
  }

  async updateRoadmapAccessCount(roadmapId: number): Promise<void> {
    const history = this.userRoadmapHistories.get(roadmapId);
    if (history) {
      history.accessCount = (history.accessCount || 1) + 1;
      history.lastAccessed = new Date();
      history.updatedAt = new Date();
    }
  }

  async createUserRoadmapProgress(progress: InsertUserRoadmapProgress): Promise<UserRoadmapProgress> {
    const id = this.currentProgressId++;
    const userProgress: UserRoadmapProgress = {
      ...progress,
      id,
      completed: progress.completed || false,
      completedAt: progress.completed ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.userRoadmapProgresses.set(id, userProgress);
    return userProgress;
  }

  async getUserRoadmapProgress(userId: number, roadmapId: number): Promise<UserRoadmapProgress[]> {
    return Array.from(this.userRoadmapProgresses.values()).filter(
      progress => progress.userId === userId && progress.roadmapId === roadmapId
    );
  }

  async updateTaskProgress(
    userId: number, 
    roadmapId: number, 
    phaseIndex: number, 
    taskIndex: number, 
    completed: boolean, 
    notes?: string
  ): Promise<void> {
    const existing = Array.from(this.userRoadmapProgresses.values()).find(
      progress => progress.userId === userId && 
                 progress.roadmapId === roadmapId &&
                 progress.phaseIndex === phaseIndex &&
                 progress.taskIndex === taskIndex
    );

    if (existing) {
      existing.completed = completed;
      existing.notes = notes || existing.notes;
      existing.completedAt = completed ? new Date() : null;
      existing.updatedAt = new Date();
    } else {
      await this.createUserRoadmapProgress({
        userId,
        roadmapId,
        phaseIndex,
        taskIndex,
        completed,
        notes
      });
    }
  }

  async getTaskProgress(
    userId: number, 
    roadmapId: number, 
    phaseIndex: number, 
    taskIndex: number
  ): Promise<UserRoadmapProgress | undefined> {
    return Array.from(this.userRoadmapProgresses.values()).find(
      progress => progress.userId === userId && 
                 progress.roadmapId === roadmapId &&
                 progress.phaseIndex === phaseIndex &&
                 progress.taskIndex === taskIndex
    );
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async getUserStats(userId: number): Promise<{ totalXp: number; currentStreak: number; longestStreak: number; completedTasks: number }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const completedTasksCount = await db.select().from(userRoadmapProgress).where(and(eq(userRoadmapProgress.userId, userId), eq(userRoadmapProgress.completed, true)));
    
    return {
      totalXp: user?.totalXp || 0,
      currentStreak: user?.currentStreak || 0,
      longestStreak: user?.longestStreak || 0,
      completedTasks: completedTasksCount.length || 0
    };
  }

  async createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistEntry> {
    const [waitlistEntry] = await db
      .insert(waitlistEntries)
      .values(entry)
      .returning();
    return waitlistEntry;
  }

  async getWaitlistEntries(): Promise<WaitlistEntry[]> {
    return await db.select().from(waitlistEntries);
  }

  async getRoadmapTemplate(key: string): Promise<RoadmapTemplate | undefined> {
    const [template] = await db
      .select()
      .from(roadmapTemplates)
      .where(eq(roadmapTemplates.key, key));
    return template;
  }

  async getAllRoadmapTemplates(): Promise<RoadmapTemplate[]> {
    return await db.select().from(roadmapTemplates);
  }

  async createRoadmapTemplate(template: InsertRoadmapTemplate): Promise<RoadmapTemplate> {
    const [roadmapTemplate] = await db
      .insert(roadmapTemplates)
      .values(template)
      .returning();
    return roadmapTemplate;
  }

  async createCustomRoadmap(roadmap: InsertCustomRoadmap): Promise<CustomRoadmap> {
    const [customRoadmap] = await db
      .insert(customRoadmaps)
      .values(roadmap)
      .returning();
    return customRoadmap;
  }

  async getCustomRoadmap(id: number): Promise<CustomRoadmap | undefined> {
    const [roadmap] = await db
      .select()
      .from(customRoadmaps)
      .where(eq(customRoadmaps.id, id));
    return roadmap;
  }

  async getCustomRoadmapsByUser(userId: number): Promise<CustomRoadmap[]> {
    return await db
      .select()
      .from(customRoadmaps)
      .where(eq(customRoadmaps.userId, userId));
  }

  async createSavedRoadmap(roadmap: InsertSavedRoadmap): Promise<SavedRoadmap> {
    const [savedRoadmap] = await db
      .insert(savedRoadmaps)
      .values(roadmap)
      .returning();
    return savedRoadmap;
  }

  async getSavedRoadmapsByUser(userId: number): Promise<SavedRoadmap[]> {
    return await db
      .select()
      .from(savedRoadmaps)
      .where(eq(savedRoadmaps.userId, userId));
  }

  async deleteSavedRoadmap(id: number, userId: number): Promise<void> {
    await db
      .delete(savedRoadmaps)
      .where(and(eq(savedRoadmaps.id, id), eq(savedRoadmaps.userId, userId)));
  }

  // New history and progress tracking methods
  async createUserRoadmapHistory(history: InsertUserRoadmapHistory): Promise<UserRoadmapHistory> {
    const [userHistory] = await db
      .insert(userRoadmapHistory)
      .values(history)
      .returning();
    return userHistory;
  }

  async getUserRoadmapHistory(userId: number): Promise<UserRoadmapHistory[]> {
    return await db
      .select()
      .from(userRoadmapHistory)
      .where(eq(userRoadmapHistory.userId, userId))
      .orderBy(userRoadmapHistory.lastAccessed);
  }

  async deleteUserRoadmapHistory(roadmapId: number, userId: number): Promise<void> {
    await db
      .delete(userRoadmapHistory)
      .where(and(eq(userRoadmapHistory.id, roadmapId), eq(userRoadmapHistory.userId, userId)));
  }

  async updateRoadmapAccessCount(roadmapId: number): Promise<void> {
    await db
      .update(userRoadmapHistory)
      .set({ 
        accessCount: userRoadmapHistory.accessCount + 1,
        lastAccessed: new Date(),
        updatedAt: new Date()
      })
      .where(eq(userRoadmapHistory.id, roadmapId));
  }

  async createUserRoadmapProgress(progress: InsertUserRoadmapProgress): Promise<UserRoadmapProgress> {
    const [userProgress] = await db
      .insert(userRoadmapProgress)
      .values(progress)
      .returning();
    return userProgress;
  }

  async getUserRoadmapProgress(userId: number, roadmapId: number): Promise<UserRoadmapProgress[]> {
    return await db
      .select()
      .from(userRoadmapProgress)
      .where(and(
        eq(userRoadmapProgress.userId, userId),
        eq(userRoadmapProgress.roadmapId, roadmapId)
      ));
  }

  async updateTaskProgress(
    userId: number, 
    roadmapId: number, 
    phaseIndex: number, 
    taskIndex: number, 
    completed: boolean, 
    notes?: string
  ): Promise<void> {
    // Use upsert to handle duplicates properly
    await db
      .insert(userRoadmapProgress)
      .values({
        userId,
        roadmapId,
        phaseIndex,
        taskIndex,
        completed,
        notes: notes || null,
        completedAt: completed ? new Date() : null
      })
      .onConflictDoUpdate({
        target: [
          userRoadmapProgress.userId,
          userRoadmapProgress.roadmapId,
          userRoadmapProgress.phaseIndex,
          userRoadmapProgress.taskIndex
        ],
        set: {
          completed,
          notes: notes || null,
          completedAt: completed ? new Date() : null,
          updatedAt: new Date()
        }
      });
  }

  async getTaskProgress(
    userId: number, 
    roadmapId: number, 
    phaseIndex: number, 
    taskIndex: number
  ): Promise<UserRoadmapProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userRoadmapProgress)
      .where(and(
        eq(userRoadmapProgress.userId, userId),
        eq(userRoadmapProgress.roadmapId, roadmapId),
        eq(userRoadmapProgress.phaseIndex, phaseIndex),
        eq(userRoadmapProgress.taskIndex, taskIndex)
      ));
    return progress;
  }

  // Kanban Board methods
  async createKanbanBoard(board: InsertKanbanBoard): Promise<KanbanBoard> {
    const [kanbanBoard] = await db
      .insert(kanbanBoards)
      .values(board)
      .returning();
    return kanbanBoard;
  }

  async getKanbanBoardsByUser(userId: number): Promise<KanbanBoard[]> {
    return await db
      .select()
      .from(kanbanBoards)
      .where(eq(kanbanBoards.userId, userId))
      .orderBy(desc(kanbanBoards.createdAt));
  }

  async getKanbanBoard(boardId: number, userId: number): Promise<KanbanBoard | undefined> {
    const [board] = await db
      .select()
      .from(kanbanBoards)
      .where(and(
        eq(kanbanBoards.id, boardId),
        eq(kanbanBoards.userId, userId)
      ));
    return board;
  }

  async deleteKanbanBoard(boardId: number, userId: number): Promise<void> {
    const result = await db
      .delete(kanbanBoards)
      .where(and(
        eq(kanbanBoards.id, boardId),
        eq(kanbanBoards.userId, userId)
      ))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Board not found or access denied');
    }
  }

  async generateKanbanBoardWithTasks(
    board: InsertKanbanBoard, 
    tasks: Omit<InsertKanbanTask, 'boardId'>[]
  ): Promise<{ board: KanbanBoard; tasks: KanbanTask[] }> {
    return await db.transaction(async (tx) => {
      const [newBoard] = await tx
        .insert(kanbanBoards)
        .values(board)
        .returning();

      const tasksWithBoardId = tasks.map(task => ({
        ...task,
        boardId: newBoard.id
      }));

      const newTasks = await tx
        .insert(kanbanTasks)
        .values(tasksWithBoardId)
        .returning();

      return { board: newBoard, tasks: newTasks };
    });
  }

  // Kanban Task methods
  async createKanbanTask(task: InsertKanbanTask): Promise<KanbanTask> {
    const [kanbanTask] = await db
      .insert(kanbanTasks)
      .values(task)
      .returning();
    return kanbanTask;
  }

  async getKanbanTasksByBoard(boardId: number, userId: number): Promise<KanbanTask[]> {
    const board = await this.getKanbanBoard(boardId, userId);
    if (!board) {
      throw new Error('Board not found or access denied');
    }
    
    return await db
      .select()
      .from(kanbanTasks)
      .where(eq(kanbanTasks.boardId, boardId))
      .orderBy(kanbanTasks.position);
  }

  async updateKanbanTask(taskId: number, userId: number, updates: Partial<InsertKanbanTask>): Promise<KanbanTask> {
    const [task] = await db
      .select({ boardId: kanbanTasks.boardId })
      .from(kanbanTasks)
      .where(eq(kanbanTasks.id, taskId));
    
    if (!task) {
      throw new Error('Task not found');
    }

    const board = await this.getKanbanBoard(task.boardId, userId);
    if (!board) {
      throw new Error('Access denied');
    }

    const [updatedTask] = await db
      .update(kanbanTasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(kanbanTasks.id, taskId))
      .returning();
    
    return updatedTask;
  }

  async updateKanbanTaskStatus(taskId: number, userId: number, status: string, position: number): Promise<KanbanTask> {
    const [task] = await db
      .select({ boardId: kanbanTasks.boardId })
      .from(kanbanTasks)
      .where(eq(kanbanTasks.id, taskId));
    
    if (!task) {
      throw new Error('Task not found');
    }

    const board = await this.getKanbanBoard(task.boardId, userId);
    if (!board) {
      throw new Error('Access denied');
    }

    const [updatedTask] = await db
      .update(kanbanTasks)
      .set({ status, position, updatedAt: new Date() })
      .where(eq(kanbanTasks.id, taskId))
      .returning();
    
    return updatedTask;
  }

  async deleteKanbanTask(taskId: number, userId: number): Promise<void> {
    const [task] = await db
      .select({ boardId: kanbanTasks.boardId })
      .from(kanbanTasks)
      .where(eq(kanbanTasks.id, taskId));
    
    if (!task) {
      throw new Error('Task not found');
    }

    const board = await this.getKanbanBoard(task.boardId, userId);
    if (!board) {
      throw new Error('Access denied');
    }

    const result = await db
      .delete(kanbanTasks)
      .where(eq(kanbanTasks.id, taskId))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Task deletion failed');
    }
  }
}

export const storage = new DatabaseStorage();
