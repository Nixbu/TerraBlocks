import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Trash2, 
  Save, 
  FolderOpen, 
  CheckCircle, 
  Target, 
  FileText,
  Play,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';

interface EnhancedToolbarProps {
  onClearWorkspace: () => void;
  onSaveProject: () => void;
  onLoadProject: () => void;
  onValidateAll: () => void;
  onLoadExample: () => void;
  onShowTemplates: () => void;
  onExportProject: () => void;
  onImportProject: () => void;
  onDeployInfrastructure: () => void;
  isValid: boolean;
  projectName: string;
}

export default function EnhancedToolbar({
  onClearWorkspace,
  onSaveProject,
  onLoadProject,
  onValidateAll,
  onLoadExample,
  onShowTemplates,
  onExportProject,
  onImportProject,
  onDeployInfrastructure,
  isValid,
  projectName
}: EnhancedToolbarProps) {
  const { toast } = useToast();

  const handleClearWorkspace = () => {
    onClearWorkspace();
    toast({
      title: "Workspace cleared",
      description: "All blocks have been removed from the workspace",
    });
  };

  const handleSaveProject = () => {
    onSaveProject();
    toast({
      title: "Project saved",
      description: `${projectName} has been saved successfully`,
    });
  };

  const handleLoadProject = () => {
    onLoadProject();
    toast({
      title: "Project loaded",
      description: "Project has been loaded successfully",
    });
  };

  const handleValidateAll = () => {
    onValidateAll();
    toast({
      title: isValid ? "Validation passed" : "Validation failed",
      description: isValid 
        ? "Your infrastructure configuration is valid" 
        : "Please check your configuration for errors",
      variant: isValid ? "default" : "destructive",
    });
  };

  const handleLoadExample = () => {
    onLoadExample();
    toast({
      title: "Example loaded",
      description: "A sample infrastructure has been loaded",
    });
  };

  const handleShowTemplates = () => {
    onShowTemplates();
    toast({
      title: "Templates opened",
      description: "Choose from available infrastructure templates",
    });
  };

  const handleExportProject = () => {
    onExportProject();
    toast({
      title: "Project exported",
      description: "Project files have been downloaded",
    });
  };

  const handleImportProject = () => {
    onImportProject();
    toast({
      title: "Import ready",
      description: "Select a project file to import",
    });
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

    onDeployInfrastructure();
    toast({
      title: "Deployment started",
      description: "Your infrastructure is being deployed to AWS",
    });
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border-b border-blue-200 dark:border-slate-600">
      {/* Left Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleClearWorkspace}
          variant="outline"
          size="sm"
          className="border-slate-300 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear
        </Button>

        <Button
          onClick={handleSaveProject}
          variant="default"
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>

        <Button
          onClick={handleLoadProject}
          variant="outline"
          size="sm"
          className="border-slate-300 dark:border-slate-600"
        >
          <FolderOpen className="w-4 h-4 mr-2" />
          Load
        </Button>

        <Button
          onClick={handleValidateAll}
          variant="outline"
          size="sm"
          className={`border-slate-300 dark:border-slate-600 ${
            isValid 
              ? 'hover:bg-green-50 dark:hover:bg-green-900/20' 
              : 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
          }`}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Validate
        </Button>

        <Button
          onClick={handleLoadExample}
          variant="outline"
          size="sm"
          className="border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <Target className="w-4 h-4 mr-2" />
          Example
        </Button>

        <Button
          onClick={handleShowTemplates}
          variant="outline"
          size="sm"
          className="border-slate-300 dark:border-slate-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          <FileText className="w-4 h-4 mr-2" />
          Templates
        </Button>
      </div>

      {/* Center - Project Info */}
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {projectName}
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
          isValid 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isValid ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
          {isValid ? 'Ready' : 'Check Required'}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleImportProject}
          variant="outline"
          size="sm"
          className="border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <Upload className="w-4 h-4 mr-2" />
          Import
        </Button>

        <Button
          onClick={handleExportProject}
          variant="outline"
          size="sm"
          className="border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>

        <Button
          onClick={handleDeployInfrastructure}
          variant="default"
          size="sm"
          className={`${
            isValid 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-400 cursor-not-allowed text-gray-200'
          }`}
          disabled={!isValid}
        >
          <Play className="w-4 h-4 mr-2" />
          Deploy
        </Button>
      </div>
    </div>
  );
}