import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  FolderPlus, 
  Copy, 
  Trash2, 
  GitBranch, 
  Upload, 
  Download, 
  GitCommit, 
  ArrowUp, 
  ArrowDown,
  FileText,
  Settings
} from 'lucide-react';

interface ProjectSidebarProps {
  currentProject: string;
  projects: string[];
  onProjectChange: (project: string) => void;
  onNewProject: (name: string, description: string, template: string) => void;
  onCloneProject: (projectName: string) => void;
  onDeleteProject: (projectName: string) => void;
  onGitConnect: (url: string) => void;
  onGitCommit: (message: string) => void;
  onGitPush: () => void;
  onGitPull: () => void;
  gitConnected: boolean;
  onLoadTemplate: (template: string) => void;
}

export default function ProjectSidebar({
  currentProject,
  projects,
  onProjectChange,
  onNewProject,
  onCloneProject,
  onDeleteProject,
  onGitConnect,
  onGitCommit,
  onGitPush,
  onGitPull,
  gitConnected,
  onLoadTemplate
}: ProjectSidebarProps) {
  const [newProjectDialog, setNewProjectDialog] = useState(false);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [gitDialog, setGitDialog] = useState(false);
  const [commitDialog, setCommitDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectTemplate, setNewProjectTemplate] = useState('blank');
  const [gitUrl, setGitUrl] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const { toast } = useToast();

  const templates = [
    {
      id: 'blank',
      name: 'Blank Project',
      description: 'Start with an empty workspace',
      icon: '📄'
    },
    {
      id: 'webapp',
      name: 'Web Application',
      description: 'VPC, ALB, ECS with auto-scaling',
      icon: '🌐'
    },
    {
      id: 'microservices',
      name: 'Microservices',
      description: 'EKS cluster with service mesh',
      icon: '🔧'
    },
    {
      id: 'dataplatform',
      name: 'Data Platform',
      description: 'S3, Glue, Redshift, and analytics',
      icon: '📊'
    },
    {
      id: 'ml',
      name: 'ML Infrastructure',
      description: 'SageMaker, Bedrock, and ML pipelines',
      icon: '🤖'
    },
    {
      id: 'serverless',
      name: 'Serverless App',
      description: 'Lambda, API Gateway, DynamoDB',
      icon: '⚡'
    }
  ];

  const handleNewProject = () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    onNewProject(newProjectName, newProjectDescription, newProjectTemplate);
    setNewProjectDialog(false);
    setNewProjectName('');
    setNewProjectDescription('');
    setNewProjectTemplate('blank');
    
    toast({
      title: "Project created",
      description: `${newProjectName} has been created successfully`,
    });
  };

  const handleCloneProject = () => {
    onCloneProject(`${currentProject}_copy`);
    toast({
      title: "Project cloned",
      description: "Project has been cloned successfully",
    });
  };

  const handleDeleteProject = () => {
    if (projects.length <= 1) {
      toast({
        title: "Cannot delete",
        description: "You must have at least one project",
        variant: "destructive",
      });
      return;
    }

    onDeleteProject(currentProject);
    toast({
      title: "Project deleted",
      description: "Project has been deleted successfully",
    });
  };

  const handleGitConnect = () => {
    if (!gitUrl.trim()) {
      toast({
        title: "Error",
        description: "Git URL is required",
        variant: "destructive",
      });
      return;
    }

    onGitConnect(gitUrl);
    setGitDialog(false);
    setGitUrl('');
    
    toast({
      title: "Git connected",
      description: "Repository has been connected successfully",
    });
  };

  const handleGitCommit = () => {
    if (!commitMessage.trim()) {
      toast({
        title: "Error",
        description: "Commit message is required",
        variant: "destructive",
      });
      return;
    }

    onGitCommit(commitMessage);
    setCommitDialog(false);
    setCommitMessage('');
    
    toast({
      title: "Changes committed",
      description: "Your changes have been committed",
    });
  };

  const handleLoadTemplate = (templateId: string) => {
    onLoadTemplate(templateId);
    setTemplateDialog(false);
    
    const template = templates.find(t => t.id === templateId);
    toast({
      title: "Template loaded",
      description: `${template?.name} template has been loaded`,
    });
  };

  return (
    <div className="w-80 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center">
        <h1 className="text-xl font-bold mb-2">🏗️ Terraform Studio</h1>
        <p className="text-blue-100 text-sm">Visual Infrastructure as Code</p>
      </div>

      {/* Project Section */}
      <div className="p-6 border-b border-slate-700">
        <div className="mb-4">
          <Label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Current Project
          </Label>
          <Select value={currentProject} onValueChange={onProjectChange}>
            <SelectTrigger className="mt-2 bg-slate-800 border-slate-600 text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {projects.map((project) => (
                <SelectItem key={project} value={project} className="text-slate-100">
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Dialog open={newProjectDialog} onOpenChange={setNewProjectDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <FolderPlus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-600 text-slate-100">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Project Name</Label>
                  <Input
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="My AWS Infrastructure"
                    className="bg-slate-700 border-slate-600 text-slate-100"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Describe your infrastructure project..."
                    className="bg-slate-700 border-slate-600 text-slate-100"
                  />
                </div>
                <div>
                  <Label>Template</Label>
                  <Select value={newProjectTemplate} onValueChange={setNewProjectTemplate}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id} className="text-slate-100">
                          {template.icon} {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setNewProjectDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleNewProject}>Create Project</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleCloneProject}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Copy className="w-4 h-4" />
          </Button>

          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleDeleteProject}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Git Section */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${gitConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Git Repository
          </span>
        </div>

        {!gitConnected ? (
          <Dialog open={gitDialog} onOpenChange={setGitDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                <GitBranch className="w-4 h-4 mr-2" />
                Connect Git
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-600 text-slate-100">
              <DialogHeader>
                <DialogTitle>Connect Git Repository</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Repository URL</Label>
                  <Input
                    value={gitUrl}
                    onChange={(e) => setGitUrl(e.target.value)}
                    placeholder="https://github.com/user/repo.git"
                    className="bg-slate-700 border-slate-600 text-slate-100"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setGitDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleGitConnect}>Connect</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Dialog open={commitDialog} onOpenChange={setCommitDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <GitCommit className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-600 text-slate-100">
                <DialogHeader>
                  <DialogTitle>Commit Changes</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Commit Message</Label>
                    <Textarea
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      placeholder="Describe your changes..."
                      className="bg-slate-700 border-slate-600 text-slate-100"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setCommitDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleGitCommit}>Commit</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              size="sm" 
              variant="outline" 
              onClick={onGitPush}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>

            <Button 
              size="sm" 
              variant="outline" 
              onClick={onGitPull}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 col-span-2"
            >
              <ArrowDown className="w-4 h-4 mr-2" />
              Pull Changes
            </Button>
          </div>
        )}
      </div>

      {/* Templates Section */}
      <div className="p-6">
        <div className="mb-4">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Templates
          </span>
        </div>

        <Dialog open={templateDialog} onOpenChange={setTemplateDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
              <FileText className="w-4 h-4 mr-2" />
              Load Template
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-600 text-slate-100 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Infrastructure Templates</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleLoadTemplate(template.id)}
                  className="p-4 border border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                >
                  <div className="text-2xl mb-2">{template.icon}</div>
                  <h3 className="font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm text-slate-400">{template.description}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}