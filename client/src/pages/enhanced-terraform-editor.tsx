import { useState, useCallback } from 'react';
import ProjectSidebar from '@/components/ProjectSidebar';
import EnhancedBlocklyWorkspace from '@/components/EnhancedBlocklyWorkspace';
import EnhancedCodePreview from '@/components/EnhancedCodePreview';
import EnhancedToolbar from '@/components/EnhancedToolbar';
import { useToast } from '@/hooks/use-toast';

export default function EnhancedTerraformEditor() {
  const [workspaceData, setWorkspaceData] = useState(null);
  const [hclCode, setHclCode] = useState('');
  const [files, setFiles] = useState<{ [key: string]: string }>({
    'main.tf': '# Drag blocks to start building your infrastructure.'
  });
  const [isValid, setIsValid] = useState(true);
  const [currentProject, setCurrentProject] = useState('My Infrastructure');
  const [projects, setProjects] = useState(['My Infrastructure', 'Web App Setup', 'Data Pipeline']);
  const [gitConnected, setGitConnected] = useState(false);
  const { toast } = useToast();

  const handleWorkspaceChange = useCallback((data: any) => {
    setWorkspaceData(data);
  }, []);

  const handleHclGenerated = useCallback((hcl: string, valid: boolean) => {
    setHclCode(hcl);
    setIsValid(valid);
  }, []);

  const handleFilesGenerated = useCallback((generatedFiles: { [key: string]: string }) => {
    setFiles(generatedFiles);
  }, []);

  // Toolbar handlers
  const handleClearWorkspace = () => {
    setWorkspaceData(null);
    setHclCode('# Drag blocks to start building your infrastructure.');
    setFiles({ 'main.tf': '# Drag blocks to start building your infrastructure.' });
    setIsValid(true);
  };

  const handleSaveProject = () => {
    // Save project logic would go here
    console.log('Saving project:', currentProject);
  };

  const handleLoadProject = () => {
    // Load project logic would go here
    console.log('Loading project');
  };

  const handleValidateAll = () => {
    // Validation logic would go here
    console.log('Validating all resources');
  };

  const handleLoadExample = () => {
    // Load example infrastructure
    toast({
      title: "Example loaded",
      description: "A complete web application infrastructure has been loaded",
    });
  };

  const handleShowTemplates = () => {
    // Show templates modal
    console.log('Showing templates');
  };

  const handleExportProject = () => {
    // Export all files
    Object.entries(files).forEach(([filename, content]) => {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const handleImportProject = () => {
    // Import project logic
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.tf,.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          console.log('Imported file content:', content);
          toast({
            title: "File imported",
            description: `${file.name} has been imported successfully`,
          });
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleDeployInfrastructure = () => {
    if (!isValid) {
      toast({
        title: "Cannot deploy",
        description: "Please fix validation errors before deploying",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Deployment started",
      description: "Your infrastructure is being deployed to AWS",
    });
  };

  // Sidebar handlers
  const handleNewProject = (name: string, description: string, template: string) => {
    setProjects([...projects, name]);
    setCurrentProject(name);
    console.log('Created new project:', { name, description, template });
  };

  const handleCloneProject = (projectName: string) => {
    setProjects([...projects, projectName]);
    setCurrentProject(projectName);
  };

  const handleDeleteProject = (projectName: string) => {
    const filtered = projects.filter(p => p !== projectName);
    setProjects(filtered);
    if (projectName === currentProject && filtered.length > 0) {
      setCurrentProject(filtered[0]);
    }
  };

  const handleGitConnect = (url: string) => {
    setGitConnected(true);
    console.log('Connected to Git repository:', url);
  };

  const handleGitCommit = (message: string) => {
    console.log('Committing changes:', message);
  };

  const handleGitPush = () => {
    console.log('Pushing changes to remote repository');
    toast({
      title: "Changes pushed",
      description: "Your changes have been pushed to the remote repository",
    });
  };

  const handleGitPull = () => {
    console.log('Pulling changes from remote repository');
    toast({
      title: "Changes pulled",
      description: "Latest changes have been pulled from the repository",
    });
  };

  const handleLoadTemplate = (template: string) => {
    console.log('Loading template:', template);
    // Template loading logic would go here
  };

  const handleCopy = () => {
    console.log('Code copied to clipboard');
  };

  const handleDownload = () => {
    console.log('Files downloaded');
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl m-2 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Project Sidebar */}
        <ProjectSidebar
          currentProject={currentProject}
          projects={projects}
          onProjectChange={setCurrentProject}
          onNewProject={handleNewProject}
          onCloneProject={handleCloneProject}
          onDeleteProject={handleDeleteProject}
          onGitConnect={handleGitConnect}
          onGitCommit={handleGitCommit}
          onGitPush={handleGitPush}
          onGitPull={handleGitPull}
          gitConnected={gitConnected}
          onLoadTemplate={handleLoadTemplate}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          
          {/* Enhanced Toolbar */}
          <EnhancedToolbar
            onClearWorkspace={handleClearWorkspace}
            onSaveProject={handleSaveProject}
            onLoadProject={handleLoadProject}
            onValidateAll={handleValidateAll}
            onLoadExample={handleLoadExample}
            onShowTemplates={handleShowTemplates}
            onExportProject={handleExportProject}
            onImportProject={handleImportProject}
            onDeployInfrastructure={handleDeployInfrastructure}
            isValid={isValid}
            projectName={currentProject}
          />

          {/* Workspace and Code Panel */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Blockly Workspace */}
            <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-bl-3xl">
              <EnhancedBlocklyWorkspace
                workspaceData={workspaceData}
                onWorkspaceChange={handleWorkspaceChange}
                onHclGenerated={handleHclGenerated}
                onFilesGenerated={handleFilesGenerated}
              />
            </div>

            {/* Enhanced Code Preview */}
            <div className="w-[450px] bg-slate-900 rounded-br-3xl">
              <EnhancedCodePreview
                files={files}
                isValid={isValid}
                onCopy={handleCopy}
                onDownload={handleDownload}
              />
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}