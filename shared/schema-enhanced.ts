import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  serial,
  boolean,
  index,
  integer,
  uuid
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for authentication)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enhanced user table with SaaS features
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // Using string ID for auth compatibility
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  subscriptionTier: varchar("subscription_tier").default("free"), // free, pro, enterprise
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status").default("inactive"), // active, inactive, past_due, canceled
  subscriptionEndDate: timestamp("subscription_end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced projects table with user association and team features
export const terraformProjects = pgTable("terraform_projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  workspaceData: jsonb("workspace_data"),
  hclCode: text("hcl_code"),
  files: jsonb("files").default({}), // Store multiple files
  template: varchar("template").default("blank"), // blank, webapp, microservices, etc.
  isPublic: boolean("is_public").default(false),
  isShared: boolean("is_shared").default(false),
  tags: jsonb("tags").default([]), // Array of tags
  lastDeployment: timestamp("last_deployment"),
  deploymentStatus: varchar("deployment_status").default("never"), // never, success, failed, in_progress
  gitRepository: varchar("git_repository"),
  gitBranch: varchar("git_branch").default("main"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project collaborators table for team features
export const projectCollaborators = pgTable("project_collaborators", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => terraformProjects.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role").default("viewer"), // owner, editor, viewer
  invitedAt: timestamp("invited_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
});

// Project templates table
export const projectTemplates = pgTable("project_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // webapp, microservices, dataplatform, ml, serverless
  workspaceData: jsonb("workspace_data").notNull(),
  files: jsonb("files").notNull(),
  tags: jsonb("tags").default([]),
  isOfficial: boolean("is_official").default(false),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Deployment history table
export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => terraformProjects.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status").notNull(), // queued, running, success, failed
  terraformPlan: text("terraform_plan"),
  terraformOutput: text("terraform_output"),
  errorMessage: text("error_message"),
  resourcesCreated: integer("resources_created").default(0),
  resourcesModified: integer("resources_modified").default(0),
  resourcesDestroyed: integer("resources_destroyed").default(0),
  estimatedCost: varchar("estimated_cost"),
  deploymentTime: integer("deployment_time"), // in seconds
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// API usage tracking for billing
export const apiUsage = pgTable("api_usage", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: varchar("action").notNull(), // save_project, deploy, validate, export
  projectId: integer("project_id").references(() => terraformProjects.id),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata").default({}),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertTerraformProjectSchema = createInsertSchema(terraformProjects).pick({
  userId: true,
  name: true,
  description: true,
  workspaceData: true,
  hclCode: true,
  files: true,
  template: true,
  isPublic: true,
  isShared: true,
  tags: true,
  gitRepository: true,
  gitBranch: true,
});

export const insertProjectTemplateSchema = createInsertSchema(projectTemplates).pick({
  name: true,
  description: true,
  category: true,
  workspaceData: true,
  files: true,
  tags: true,
  createdBy: true,
});

export const insertDeploymentSchema = createInsertSchema(deployments).pick({
  projectId: true,
  userId: true,
  status: true,
  terraformPlan: true,
  terraformOutput: true,
  errorMessage: true,
  resourcesCreated: true,
  resourcesModified: true,
  resourcesDestroyed: true,
  estimatedCost: true,
  deploymentTime: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTerraformProject = z.infer<typeof insertTerraformProjectSchema>;
export type TerraformProject = typeof terraformProjects.$inferSelect;

export type InsertProjectTemplate = z.infer<typeof insertProjectTemplateSchema>;
export type ProjectTemplate = typeof projectTemplates.$inferSelect;

export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type Deployment = typeof deployments.$inferSelect;

export type ProjectCollaborator = typeof projectCollaborators.$inferSelect;
export type ApiUsage = typeof apiUsage.$inferSelect;