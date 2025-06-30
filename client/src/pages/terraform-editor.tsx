import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import BlocklyWorkspace from "@/components/BlocklyWorkspace";
import BlockPalette from "@/components/BlockPalette";
import CodePreview from "@/components/CodePreview";
import { Download, Copy, Save, FolderOpen, Plus, CheckCircle } from "lucide-react";
import type { TerraformProject } from "@shared/schema";

export default function TerraformEditor() {
  const { toast } = useToast();
  const [currentProject, setCurrentProject] = useState<TerraformProject | null>(null);
  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const [generatedHcl, setGeneratedHcl] = useState("");
  const [isValidConfig, setIsValidConfig] = useState(true);

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; workspaceData?: any }) => {
      const response = await apiRequest("POST", "/api/projects", data);
      return response.json();
    },
    onSuccess: (newProject) => {
      setCurrentProject(newProject);
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project created",
        description: `Project "${newProject.name}" has been created successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project.",
        variant: "destructive",
      });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (data: { id: number; workspaceData: any }) => {
      const response = await apiRequest("PUT", `/api/projects/${data.id}`, {
        workspaceData: data.workspaceData,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project saved",
        description: "Your workspace has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save project.",
        variant: "destructive",
      });
    },
  });

  const handleNewProject = () => {
    const projectName = prompt("Enter project name:");
    if (projectName && projectName.trim()) {
      createProjectMutation.mutate({
        name: projectName.trim(),
        description: "Visual Terraform project",
        workspaceData: null,
      });
    }
  };

  const handleSaveProject = () => {
    if (currentProject && workspaceData) {
      updateProjectMutation.mutate({
        id: currentProject.id,
        workspaceData,
      });
    } else {
      toast({
        title: "No project selected",
        description: "Please create or load a project first.",
        variant: "destructive",
      });
    }
  };

  const handleLoadProject = (project: TerraformProject) => {
    setCurrentProject(project);
    setWorkspaceData(project.workspaceData);
    toast({
      title: "Project loaded",
      description: `Loaded project "${project.name}".`,
    });
  };

  const handleWorkspaceChange = (data: any) => {
    setWorkspaceData(data);
  };

  const handleHclGenerated = (hcl: string, isValid: boolean) => {
    setGeneratedHcl(hcl);
    setIsValidConfig(isValid);
  };

  const handleCopyHcl = async () => {
    try {
      await navigator.clipboard.writeText(generatedHcl);
      toast({
        title: "Copied to clipboard",
        description: "Terraform HCL code has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadHcl = () => {
    const blob = new Blob([generatedHcl], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentProject?.name || "terraform"}.tf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Terraform HCL file is being downloaded.",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Toolbar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TF</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Visual Terraform Editor</h1>
          </div>

          <div className="flex items-center space-x-2 ml-8">
            <Button
              onClick={handleNewProject}
              className="px-3 py-1.5 bg-blue-500 text-white text-sm font-medium hover:bg-blue-600"
              disabled={createProjectMutation.isPending}
            >
              <Plus className="w-4 h-4 mr-1" />
              New Project
            </Button>

            <div className="relative">
              <select
                className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 rounded-md bg-white"
                value={currentProject?.id || ""}
                onChange={(e) => {
                  const projectId = parseInt(e.target.value);
                  const project = projects.find((p: TerraformProject) => p.id === projectId);
                  if (project) handleLoadProject(project);
                }}
              >
                <option value="">Select Project</option>
                {projects.map((project: TerraformProject) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleSaveProject}
              variant="outline"
              className="px-3 py-1.5 text-sm font-medium"
              disabled={updateProjectMutation.isPending || !currentProject}
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className={`w-2 h-2 rounded-full ${isValidConfig ? "bg-green-500" : "bg-red-500"}`}></div>
            <span>{isValidConfig ? "Valid Configuration" : "Configuration Error"}</span>
          </div>

          <Button
            onClick={handleDownloadHcl}
            className="px-4 py-1.5 bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
            disabled={!generatedHcl}
          >
            <Download className="w-4 h-4 mr-1" />
            Export HCL
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Block Palette */}
        <BlockPalette />

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col bg-gray-50">
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-sm font-semibold text-gray-900">Infrastructure Workspace</h2>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>Project:</span>
                  <span className="font-medium">{currentProject?.name || "No project selected"}</span>
                </div>
              </div>
            </div>
          </div>

          <BlocklyWorkspace
            workspaceData={workspaceData}
            onWorkspaceChange={handleWorkspaceChange}
            onHclGenerated={handleHclGenerated}
          />
        </div>

        {/* Right Panel - Code Preview */}
        <CodePreview
          hclCode={generatedHcl}
          isValid={isValidConfig}
          onCopy={handleCopyHcl}
          onDownload={handleDownloadHcl}
        />
      </div>
    </div>
  );
}
