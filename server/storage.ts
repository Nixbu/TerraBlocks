import { users, terraformProjects, type User, type InsertUser, type TerraformProject, type InsertTerraformProject } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getTerraformProject(id: number): Promise<TerraformProject | undefined>;
  getTerraformProjects(): Promise<TerraformProject[]>;
  createTerraformProject(project: InsertTerraformProject): Promise<TerraformProject>;
  updateTerraformProject(id: number, project: Partial<InsertTerraformProject>): Promise<TerraformProject | undefined>;
  deleteTerraformProject(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private terraformProjects: Map<number, TerraformProject>;
  private currentUserId: number;
  private currentProjectId: number;

  constructor() {
    this.users = new Map();
    this.terraformProjects = new Map();
    this.currentUserId = 1;
    this.currentProjectId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTerraformProject(id: number): Promise<TerraformProject | undefined> {
    return this.terraformProjects.get(id);
  }

  async getTerraformProjects(): Promise<TerraformProject[]> {
    return Array.from(this.terraformProjects.values());
  }

  async createTerraformProject(insertProject: InsertTerraformProject): Promise<TerraformProject> {
    const id = this.currentProjectId++;
    const now = new Date().toISOString();
    const project: TerraformProject = {
      ...insertProject,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.terraformProjects.set(id, project);
    return project;
  }

  async updateTerraformProject(id: number, updateProject: Partial<InsertTerraformProject>): Promise<TerraformProject | undefined> {
    const existing = this.terraformProjects.get(id);
    if (!existing) return undefined;

    const updated: TerraformProject = {
      ...existing,
      ...updateProject,
      updatedAt: new Date().toISOString(),
    };
    this.terraformProjects.set(id, updated);
    return updated;
  }

  async deleteTerraformProject(id: number): Promise<boolean> {
    return this.terraformProjects.delete(id);
  }
}

export const storage = new MemStorage();
