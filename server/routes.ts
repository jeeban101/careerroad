import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWaitlistEntrySchema, insertCustomRoadmapSchema } from "@shared/schema";
import { generateRoadmap } from "./gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  
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

  const httpServer = createServer(app);
  return httpServer;
}
