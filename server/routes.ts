import type { Express } from "express";
import { createServer, type Server } from "http";
import { createWaitlistEntry, getWaitlistEntries } from "./database";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertWaitlistEntrySchema, insertCustomRoadmapSchema, insertSavedRoadmapSchema, emailRequestSchema, insertUserRoadmapHistorySchema } from "@shared/schema";
import { generateRoadmap } from "./gemini";

function isAuthenticated(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // User info route
  app.get('/api/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Get all roadmap templates
  app.get("/api/roadmap-templates", async (req, res) => {
    try {
      const templates = await storage.getAllRoadmapTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch roadmap templates" });
    }
  });

  // Get specific roadmap template
  app.get("/api/roadmap-templates/:key", async (req, res) => {
    try {
      const template = await storage.getRoadmapTemplate(req.params.key);
      if (!template) {
        return res.status(404).json({ message: "Roadmap template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch roadmap template" });
    }
  });

  // Create waitlist entry
  app.post("/api/waitlist", async (req, res) => {
    try {
      const validation = insertWaitlistEntrySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid waitlist entry data" });
      }
      
      const entry = await storage.createWaitlistEntry(validation.data);
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to create waitlist entry" });
    }
  });

  // Get waitlist entries
  app.get("/api/waitlist", async (req, res) => {
    try {
      const entries = await storage.getWaitlistEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch waitlist entries" });
    }
  });

  // Create custom roadmap
  app.post("/api/custom-roadmaps", async (req, res) => {
    try {
      const validation = insertCustomRoadmapSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid custom roadmap data" });
      }
      
      const roadmap = await storage.createCustomRoadmap(validation.data);
      res.json(roadmap);
    } catch (error) {
      res.status(500).json({ message: "Failed to create custom roadmap" });
    }
  });

  // Get custom roadmap
  app.get("/api/custom-roadmaps/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const roadmap = await storage.getCustomRoadmap(id);
      if (!roadmap) {
        return res.status(404).json({ message: "Custom roadmap not found" });
      }
      res.json(roadmap);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch custom roadmap" });
    }
  });

  // Generate AI-powered roadmap
  app.post("/api/generate-roadmap", async (req, res) => {
    try {
      const { currentCourse, targetRole } = req.body;
      
      if (!currentCourse || !targetRole) {
        return res.status(400).json({ message: "Current course and target role are required" });
      }

      const phases = await generateRoadmap(currentCourse, targetRole);
      
      // Create a temporary roadmap template
      const roadmapTemplate = {
        id: Date.now(), // Temporary ID
        key: `ai_${currentCourse}_${targetRole}_${Date.now()}`,
        title: `${currentCourse} → ${targetRole} (AI Generated)`,
        currentCourse,
        targetRole,
        phases
      };

      res.json(roadmapTemplate);
    } catch (error) {
      console.error("Failed to generate roadmap:", error);
      res.status(500).json({ message: "Failed to generate roadmap" });
    }
  });

  // Save roadmap for authenticated user
  app.post("/api/saved-roadmaps", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const validation = insertSavedRoadmapSchema.safeParse({
        ...req.body,
        userId: user.id
      });
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid saved roadmap data" });
      }
      
      const savedRoadmap = await storage.createSavedRoadmap(validation.data);
      res.json(savedRoadmap);
    } catch (error) {
      console.error("Failed to save roadmap:", error);
      res.status(500).json({ message: "Failed to save roadmap" });
    }
  });

  // Get user's saved roadmaps
  app.get("/api/saved-roadmaps", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const savedRoadmaps = await storage.getSavedRoadmapsByUser(user.id);
      res.json(savedRoadmaps);
    } catch (error) {
      console.error("Failed to fetch saved roadmaps:", error);
      res.status(500).json({ message: "Failed to fetch saved roadmaps" });
    }
  });

  // Delete saved roadmap
  app.delete("/api/saved-roadmaps/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const roadmapId = parseInt(req.params.id);
      
      await storage.deleteSavedRoadmap(roadmapId, user.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete saved roadmap:", error);
      res.status(500).json({ message: "Failed to delete saved roadmap" });
    }
  });

  // User roadmap history routes
  app.get("/api/user-roadmap-history", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const history = await storage.getUserRoadmapHistory(user.id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching user roadmap history:", error);
      res.status(500).json({ error: "Failed to fetch roadmap history" });
    }
  });

  app.post("/api/user-roadmap-history", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const validation = insertUserRoadmapHistorySchema.safeParse({
        ...req.body,
        userId: user.id
      });
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid roadmap history data" });
      }
      
      const history = await storage.createUserRoadmapHistory(validation.data);
      res.status(201).json(history);
    } catch (error) {
      console.error("Error creating user roadmap history:", error);
      res.status(500).json({ error: "Failed to create roadmap history" });
    }
  });

  // Delete user roadmap history
  app.delete("/api/user-roadmap-history/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const roadmapId = parseInt(req.params.id);
      await storage.deleteUserRoadmapHistory(roadmapId, user.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user roadmap history:", error);
      res.status(500).json({ error: "Failed to delete roadmap history" });
    }
  });

  // Task progress routes
  app.get("/api/roadmap-progress/:roadmapId", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const roadmapId = parseInt(req.params.roadmapId);
      const phaseIndex = req.query.phaseIndex;
      const taskIndex = req.query.taskIndex;
      
      // If specific task requested, get individual task progress
      if (phaseIndex !== undefined && taskIndex !== undefined) {
        const progress = await storage.getTaskProgress(
          user.id, 
          roadmapId, 
          parseInt(phaseIndex as string), 
          parseInt(taskIndex as string)
        );
        res.json(progress);
      } else {
        // Get all progress for the roadmap
        const progress = await storage.getUserRoadmapProgress(user.id, roadmapId);
        res.json(progress);
      }
    } catch (error) {
      console.error("Error fetching roadmap progress:", error);
      res.status(500).json({ error: "Failed to fetch roadmap progress" });
    }
  });

  app.post("/api/update-task-progress", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { roadmapId, phaseIndex, taskIndex, completed, notes } = req.body;
      
      await storage.updateTaskProgress(
        user.id,
        roadmapId,
        phaseIndex,
        taskIndex,
        completed,
        notes
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating task progress:", error);
      res.status(500).json({ error: "Failed to update task progress" });
    }
  });

  // Send roadmap to email
  app.post("/api/send-roadmap-email", async (req, res) => {
    try {
      const validation = emailRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid email request data" });
      }
      
      const { email, name, roadmapId, roadmapTitle } = validation.data;
      
      // For now, just store the email in waitlist (you can enhance this later with actual email sending)
      await storage.createWaitlistEntry({
        name: name || "Anonymous",
        email,
        college: "Email subscriber",
        confusion: `Requested roadmap: ${roadmapTitle}`
      });
      
      // In production, you would send the actual email here using SendGrid
      console.log(`Email request: ${email} wants roadmap: ${roadmapTitle}`);
      
      res.json({ 
        success: true, 
        message: "Email request received! We'll send your roadmap shortly." 
      });
    } catch (error) {
      console.error("Failed to process email request:", error);
      res.status(500).json({ message: "Failed to process email request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
