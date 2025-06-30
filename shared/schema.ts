import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const terraformProjects = pgTable("terraform_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  workspaceData: json("workspace_data"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTerraformProjectSchema = createInsertSchema(terraformProjects).pick({
  name: true,
  description: true,
  workspaceData: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTerraformProject = z.infer<typeof insertTerraformProjectSchema>;
export type TerraformProject = typeof terraformProjects.$inferSelect;
