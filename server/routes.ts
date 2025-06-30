import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTerraformProjectSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all terraform projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getTerraformProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // Get specific terraform project
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      const project = await storage.getTerraformProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  // Create new terraform project
  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertTerraformProjectSchema.parse(req.body);
      const project = await storage.createTerraformProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid project data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Update terraform project
  app.put("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      const validatedData = insertTerraformProjectSchema.partial().parse(req.body);
      const project = await storage.updateTerraformProject(id, validatedData);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid project data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // Delete terraform project
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      const deleted = await storage.deleteTerraformProject(id);
      if (!deleted) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
