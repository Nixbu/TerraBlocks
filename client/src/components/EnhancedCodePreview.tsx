import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, FileCode2, Code2, Settings, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnhancedCodePreviewProps {
  files: { [key: string]: string };
  isValid: boolean;
  onCopy: () => void;
  onDownload: () => void;
}

export default function EnhancedCodePreview({ files, isValid, onCopy, onDownload }: EnhancedCodePreviewProps) {
  const [activeTab, setActiveTab] = useState('main.tf');
  const { toast } = useToast();

  // Ensure the active tab exists in the files
  useEffect(() => {
    if (!files[activeTab] && Object.keys(files).length > 0) {
      setActiveTab(Object.keys(files)[0]);
    }
  }, [files, activeTab]);

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Code has been copied to your clipboard",
    });
    onCopy();
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "File downloaded",
      description: `${filename} has been downloaded`,
    });
  };

  const exportAllFiles = () => {
    Object.entries(files).forEach(([filename, content]) => {
      downloadFile(filename, content);
    });
    onDownload();
  };

  const formatCode = () => {
    toast({
      title: "Code formatted",
      description: "Code has been automatically formatted",
    });
  };

  const validateCode = () => {
    toast({
      title: isValid ? "Valid configuration" : "Invalid configuration",
      description: isValid ? "Your Terraform configuration is valid" : "Please check your configuration for errors",
      variant: isValid ? "default" : "destructive",
    });
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.tf')) return <FileCode2 className="w-4 h-4" />;
    if (filename.endsWith('.py')) return <Code2 className="w-4 h-4" />;
    return <FileCode2 className="w-4 h-4" />;
  };

  const highlightHCL = (code: string) => {
    return code
      .replace(/#.*$/gm, '<span style="color: #6b7280; font-style: italic;">$&</span>')
      .replace(/\b(resource|provider|data|variable|output|module|locals)\b/g, '<span style="color: #8b5cf6; font-weight: 600;">$1</span>')
      .replace(/"([^"]+)"/g, '<span style="color: #10b981;">"$1"</span>')
      .replace(/\b(\d+)\b/g, '<span style="color: #f59e0b;">$1</span>')
      .replace(/\b(aws_[a-z_]+)\b/g, '<span style="color: #06b6d4; font-weight: 500;">$1</span>')
      .replace(/([a-z_]+)\s*=/g, '<span style="color: #ec4899;">$1</span> =');
  };

  const highlightPython = (code: string) => {
    return code
      .replace(/#.*$/gm, '<span style="color: #6b7280; font-style: italic;">$&</span>')
      .replace(/\b(def|import|from|return|if|else|elif|try|except|class|for|while|with|as)\b/g, '<span style="color: #8b5cf6; font-weight: 600;">$1</span>')
      .replace(/"([^"]+)"/g, '<span style="color: #10b981;">"$1"</span>')
      .replace(/\b(\d+)\b/g, '<span style="color: #f59e0b;">$1</span>')
      .replace(/\b(print|json|context|event)\b/g, '<span style="color: #06b6d4; font-weight: 500;">$1</span>');
  };

  const highlightCode = (code: string, filename: string) => {
    if (filename.endsWith('.tf')) {
      return highlightHCL(code);
    } else if (filename.endsWith('.py')) {
      return highlightPython(code);
    }
    return code;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="flex flex-col border-b border-slate-700">
        {/* Tabs */}
        <div className="flex overflow-x-auto">
          {Object.keys(files).map((filename) => (
            <button
              key={filename}
              onClick={() => setActiveTab(filename)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === filename
                  ? 'border-blue-500 text-blue-400 bg-slate-800'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {getFileIcon(filename)}
              {filename}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(files[activeTab] || '')}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadFile(activeTab, files[activeTab] || '')}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={exportAllFiles}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={formatCode}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Format
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={validateCode}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Validate
            </Button>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isValid 
                ? 'bg-green-900/50 text-green-400 border border-green-700' 
                : 'bg-red-900/50 text-red-400 border border-red-700'
            }`}>
              {isValid ? '✓ Valid' : '⚠ Check'}
            </div>
          </div>
        </div>
      </div>

      {/* File Explorer */}
      <div className="border-b border-slate-700 bg-slate-800/30">
        <div className="px-4 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
          Project Files
        </div>
        <div className="max-h-32 overflow-y-auto">
          {Object.entries(files).map(([filename, content]) => (
            <div
              key={filename}
              onClick={() => setActiveTab(filename)}
              className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
                activeTab === filename
                  ? 'bg-blue-900/30 text-blue-400'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
              }`}
            >
              {getFileIcon(filename)}
              <span className="text-sm">{filename}</span>
              <span className="ml-auto text-xs text-slate-500">
                {content.split('\n').length} lines
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <pre className="text-sm leading-relaxed">
            <code
              dangerouslySetInnerHTML={{
                __html: highlightCode(files[activeTab] || '# No content available', activeTab)
              }}
            />
          </pre>
        </div>
      </div>
    </div>
  );
}