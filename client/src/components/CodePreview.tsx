import { Copy, Download, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodePreviewProps {
  hclCode: string;
  isValid: boolean;
  onCopy: () => void;
  onDownload: () => void;
}

export default function CodePreview({ hclCode, isValid, onCopy, onDownload }: CodePreviewProps) {
  const resourceCount = (hclCode.match(/resource\s+"/g) || []).length;
  const outputCount = (hclCode.match(/output\s+"/g) || []).length;
  
  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Generated Terraform</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-1.5 text-gray-400 hover:text-gray-600"
              title="Copy to clipboard"
              onClick={onCopy}
              disabled={!hclCode}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-1.5 text-gray-400 hover:text-gray-600"
              title="Download HCL"
              onClick={onDownload}
              disabled={!hclCode}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1 text-green-600">
            {isValid ? (
              <>
                <CheckCircle className="w-3 h-3" />
                <span>Valid Syntax</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 text-red-600" />
                <span className="text-red-600">Invalid Syntax</span>
              </>
            )}
          </div>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500">Auto-updating</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {hclCode ? (
          <pre className="code-preview text-gray-800 text-xs leading-relaxed whitespace-pre-wrap font-mono">
            <code>{hclCode}</code>
          </pre>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">🔧</div>
              <p className="text-sm">Start building infrastructure</p>
              <p className="text-xs text-gray-400 mt-1">
                Drag blocks from the palette to generate Terraform code
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Validation Status Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Resources:</span>
            <span className="font-medium">{resourceCount} blocks</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Outputs:</span>
            <span className="font-medium">{outputCount} values</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Last updated:</span>
            <span className="font-medium">Just now</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            {isValid ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">Configuration valid</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-600 font-medium">Configuration invalid</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
