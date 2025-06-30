import { useEffect, useRef, useState } from 'react';
import { initializeBlockly } from '@/lib/blockly/blocks';

interface BlocklyWorkspaceProps {
  workspaceData: any;
  onWorkspaceChange: (data: any) => void;
  onHclGenerated: (hcl: string, isValid: boolean) => void;
}

export default function BlocklyWorkspace({ workspaceData, onWorkspaceChange, onHclGenerated }: BlocklyWorkspaceProps) {
  const blocklyDivRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<any>(null);
  const generateCodeRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initBlockly = () => {
      if (!blocklyDivRef.current || !window.Blockly) {
        console.log('Waiting for Blockly to load...');
        return;
      }

      try {
        console.log('Initializing Blockly workspace...');
        const result = initializeBlockly(blocklyDivRef.current);
        
        if (result) {
          workspaceRef.current = result.workspace;
          generateCodeRef.current = result.generateTerraformCode;
          
          // Add change listener
          workspaceRef.current.addChangeListener(() => {
            updateCodePreview();
            
            // Save workspace state
            const state = window.Blockly.serialization.workspaces.save(workspaceRef.current);
            onWorkspaceChange(state);
          });

          setIsReady(true);
          console.log('Blockly workspace initialized successfully');
          
          // Initial code generation
          updateCodePreview();
        }
      } catch (error) {
        console.error('Error initializing Blockly:', error);
      }
    };

    const updateCodePreview = () => {
      if (workspaceRef.current && generateCodeRef.current) {
        const code = generateCodeRef.current(workspaceRef.current);
        const isValid = code && code.trim() !== '' && !code.includes('# No blocks in workspace');
        onHclGenerated(code, isValid);
      }
    };

    // Check if Blockly is loaded
    if (window.Blockly) {
      initBlockly();
    } else {
      // Wait for Blockly to load
      const checkBlockly = setInterval(() => {
        if (window.Blockly) {
          clearInterval(checkBlockly);
          initBlockly();
        }
      }, 100);

      return () => clearInterval(checkBlockly);
    }
  }, [onWorkspaceChange, onHclGenerated]);

  // Load workspace data when it changes
  useEffect(() => {
    if (workspaceRef.current && workspaceData && isReady) {
      try {
        workspaceRef.current.clear();
        window.Blockly.serialization.workspaces.load(workspaceData, workspaceRef.current);
      } catch (error) {
        console.error('Error loading workspace data:', error);
      }
    }
  }, [workspaceData, isReady]);

  const clearWorkspace = () => {
    if (workspaceRef.current) {
      workspaceRef.current.clear();
    }
  };

  const loadExample = () => {
    if (!workspaceRef.current) return;
    
    workspaceRef.current.clear();
    
    // Create example infrastructure using XML
    const providerXml = '<block type="terraform_provider" x="20" y="20"><field name="PROVIDER">aws</field><field name="REGION">us-west-2</field></block>';
    
    const vpcXml = `<block type="terraform_vpc" x="20" y="120">
        <field name="NAME">main_vpc</field>
        <field name="CIDR">10.0.0.0/16</field>
        <field name="DNS_HOSTNAMES">TRUE</field>
        <field name="TAGS">Production VPC</field>
        <statement name="SUBNETS">
            <block type="terraform_subnet">
                <field name="NAME">web_subnet</field>
                <field name="CIDR">10.0.1.0/24</field>
                <field name="AZ">us-west-2a</field>
                <field name="MAP_PUBLIC_IP">TRUE</field>
                <field name="TAGS">Web Subnet</field>
                <statement name="INSTANCES">
                    <block type="terraform_instance">
                        <field name="NAME">web_server</field>
                        <field name="AMI">ami-0c94855ba95b798c7</field>
                        <field name="INSTANCE_TYPE">t2.micro</field>
                        <field name="KEY_NAME">my-key-pair</field>
                        <field name="TAGS">Web Server</field>
                        <statement name="IAM_ROLES">
                            <block type="terraform_iam_role">
                                <field name="NAME">web_role</field>
                                <field name="ROLE_NAME">WebServerRole</field>
                                <field name="SERVICE">ec2.amazonaws.com</field>
                            </block>
                        </statement>
                    </block>
                </statement>
                <next>
                    <block type="terraform_security_group">
                        <field name="NAME">web_sg</field>
                        <field name="NAME_PREFIX">web-security-group</field>
                        <field name="DESCRIPTION">Security group for web servers</field>
                    </block>
                </next>
            </block>
        </statement>
    </block>`;
    
    try {
      // Load the blocks
      const providerBlock = window.Blockly.Xml.textToDom(providerXml);
      const vpcBlock = window.Blockly.Xml.textToDom(vpcXml);
      
      window.Blockly.Xml.domToBlock(providerBlock.firstChild, workspaceRef.current);
      window.Blockly.Xml.domToBlock(vpcBlock.firstChild, workspaceRef.current);
    } catch (error) {
      console.error('Error loading example:', error);
    }
  };

  return (
    <div className="workspace-panel">
      <div className="toolbar">
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn" onClick={clearWorkspace}>Clear All</button>
          <button className="btn" onClick={loadExample}>Load Example</button>
        </div>
        <div className={`status-indicator ${isReady ? 'status-valid' : 'status-invalid'}`}>
          {isReady ? 'Ready' : 'Loading...'}
        </div>
      </div>
      <div ref={blocklyDivRef} style={{ width: '100%', height: 'calc(100% - 60px)' }} />
    </div>
  );
}