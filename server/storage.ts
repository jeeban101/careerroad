import { 
  users, 
  waitlistEntries, 
  roadmapTemplates, 
  customRoadmaps,
  sessions,
  type User, 
  type InsertUser,
  type UpsertUser,
  type WaitlistEntry,
  type InsertWaitlistEntry,
  type RoadmapTemplate,
  type InsertRoadmapTemplate,
  type CustomRoadmap,
  type InsertCustomRoadmap
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistEntry>;
  getWaitlistEntries(): Promise<WaitlistEntry[]>;
  
  getRoadmapTemplate(key: string): Promise<RoadmapTemplate | undefined>;
  getAllRoadmapTemplates(): Promise<RoadmapTemplate[]>;
  createRoadmapTemplate(template: InsertRoadmapTemplate): Promise<RoadmapTemplate>;
  
  createCustomRoadmap(roadmap: InsertCustomRoadmap): Promise<CustomRoadmap>;
  getCustomRoadmap(id: number): Promise<CustomRoadmap | undefined>;
  getCustomRoadmapsByUser(userId: string): Promise<CustomRoadmap[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private waitlistEntries: Map<number, WaitlistEntry>;
  private roadmapTemplates: Map<string, RoadmapTemplate>;
  private customRoadmaps: Map<number, CustomRoadmap>;
  private currentWaitlistId: number;
  private currentTemplateId: number;
  private currentCustomRoadmapId: number;

  constructor() {
    this.users = new Map();
    this.waitlistEntries = new Map();
    this.roadmapTemplates = new Map();
    this.customRoadmaps = new Map();
    this.currentWaitlistId = 1;
    this.currentTemplateId = 1;
    this.currentCustomRoadmapId = 1;
    
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

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { 
      ...insertUser, 
      email: insertUser.email || null,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      profileImageUrl: insertUser.profileImageUrl || null,
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.users.set(insertUser.id, user);
    return user;
  }

  async upsertUser(insertUser: UpsertUser): Promise<User> {
    const existingUser = this.users.get(insertUser.id);
    const user: User = { 
      ...existingUser,
      ...insertUser,
      email: insertUser.email || null,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      profileImageUrl: insertUser.profileImageUrl || null,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date() 
    };
    this.users.set(insertUser.id, user);
    return user;
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

  async getCustomRoadmapsByUser(userId: string): Promise<CustomRoadmap[]> {
    return Array.from(this.customRoadmaps.values()).filter(
      roadmap => roadmap.userId === userId
    );
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
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

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
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

  async getCustomRoadmapsByUser(userId: string): Promise<CustomRoadmap[]> {
    return await db
      .select()
      .from(customRoadmaps)
      .where(eq(customRoadmaps.userId, userId));
  }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
