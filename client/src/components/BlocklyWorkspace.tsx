import { useEffect, useRef } from "react";
import { initializeBlockly } from "@/lib/blockly/blocks";
import { generateTerraformHCL } from "@/lib/blockly/generator";

interface BlocklyWorkspaceProps {
  workspaceData: any;
  onWorkspaceChange: (data: any) => void;
  onHclGenerated: (hcl: string, isValid: boolean) => void;
}

export default function BlocklyWorkspace({ workspaceData, onWorkspaceChange, onHclGenerated }: BlocklyWorkspaceProps) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<any>(null);

  useEffect(() => {
    if (blocklyDiv.current && !workspaceRef.current) {
      workspaceRef.current = initializeBlockly(blocklyDiv.current);

      // Listen for workspace changes
      workspaceRef.current.addChangeListener((event: any) => {
        // Skip events during programmatic changes
        if (event.type === "finished_loading") return;

        try {
          // Generate HCL code
          const hcl = generateTerraformHCL(workspaceRef.current);
          onHclGenerated(hcl, true);

          // Save workspace data
          const state = (window as any).Blockly.serialization.workspaces.save(workspaceRef.current);
          onWorkspaceChange({ state });
        } catch (error) {
          console.error("Error generating HCL:", error);
          onHclGenerated("", false);
        }
      });

      // Blockly handles its own drag and drop from the toolbox
    }

    // Load workspace data if provided
    if (workspaceData && workspaceRef.current) {
      try {
        if (workspaceData.state) {
          (window as any).Blockly.serialization.workspaces.load(workspaceData.state, workspaceRef.current);
        } else if (workspaceData.xml) {
          // Legacy XML format support
          const xmlDom = (window as any).Blockly.utils.xml.textToDom(workspaceData.xml);
          (window as any).Blockly.Xml.domToWorkspace(xmlDom, workspaceRef.current);
        }
      } catch (error) {
        console.error("Error loading workspace data:", error);
      }
    }

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (workspaceData && workspaceRef.current) {
      try {
        workspaceRef.current.clear();
        if (workspaceData.state) {
          (window as any).Blockly.serialization.workspaces.load(workspaceData.state, workspaceRef.current);
        } else if (workspaceData.xml) {
          // Legacy XML format support
          const xmlDom = (window as any).Blockly.utils.xml.textToDom(workspaceData.xml);
          (window as any).Blockly.Xml.domToWorkspace(xmlDom, workspaceRef.current);
        }
      } catch (error) {
        console.error("Error loading workspace data:", error);
      }
    }
  }, [workspaceData]);

  return (
    <div className="flex-1 relative">
      <div
        ref={blocklyDiv}
        className="w-full h-full workspace-grid"
        style={{ minHeight: "400px" }}
      />
    </div>
  );
}
