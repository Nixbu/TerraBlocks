import { useEffect, useRef } from 'react';

interface EnhancedBlocklyWorkspaceProps {
  workspaceData: any;
  onWorkspaceChange: (data: any) => void;
  onHclGenerated: (hcl: string, isValid: boolean) => void;
  onFilesGenerated?: (files: { [key: string]: string }) => void;
}

declare global {
  interface Window {
    Blockly: any;
  }
}

export default function EnhancedBlocklyWorkspace({ 
  workspaceData, 
  onWorkspaceChange, 
  onHclGenerated, 
  onFilesGenerated 
}: EnhancedBlocklyWorkspaceProps) {
  const blocklyDivRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<any>(null);

  useEffect(() => {
    const initializeBlockly = async () => {
      if (!blocklyDivRef.current) return;

      // Load Blockly if not already loaded
      if (!window.Blockly) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/blockly/9.3.3/blockly.min.js';
        document.head.appendChild(script);
        
        await new Promise(resolve => {
          script.onload = resolve;
        });

        // Load blocks and generators
        const blocksScript = document.createElement('script');
        blocksScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/blockly/9.3.3/blocks.min.js';
        document.head.appendChild(blocksScript);

        await new Promise(resolve => {
          blocksScript.onload = resolve;
        });
      }

      console.log("Initializing Blockly workspace...");

      // Define all blocks
      defineAllBlocks();

      // Create enhanced toolbox with all categories
      const toolbox = {
        kind: "categoryToolbox",
        contents: [
          {
            kind: "category",
            name: "🌐 Core",
            colour: "#3b82f6",
            contents: [
              { kind: "block", type: "terraform_provider" },
              { kind: "block", type: "terraform_vpc" }
            ]
          },
          {
            kind: "category", 
            name: "🔗 Network",
            colour: "#10b981",
            contents: [
              { kind: "block", type: "terraform_subnet" },
              { kind: "block", type: "terraform_security_group" }
            ]
          },
          {
            kind: "category",
            name: "💻 Compute", 
            colour: "#f59e0b",
            contents: [
              { kind: "block", type: "terraform_instance" },
              { kind: "block", type: "terraform_lambda" }
            ]
          },
          {
            kind: "category",
            name: "🗃️ Storage & DB",
            colour: "#ec4899", 
            contents: [
              { kind: "block", type: "terraform_s3" },
              { kind: "block", type: "terraform_rds" }
            ]
          },
          {
            kind: "category",
            name: "👤 Security",
            colour: "#ef4444",
            contents: [
              { kind: "block", type: "terraform_iam_role" }
            ]
          },
          {
            kind: "category",
            name: "🤖 AI & ML",
            colour: "#9333ea",
            contents: [
              { kind: "block", type: "terraform_bedrock_model" },
              { kind: "block", type: "terraform_glue_job" },
              { kind: "block", type: "terraform_transcribe_job" }
            ]
          }
        ]
      };

      // Initialize workspace with enhanced configuration
      workspaceRef.current = window.Blockly.inject(blocklyDivRef.current, {
        toolbox: toolbox,
        grid: { spacing: 25, length: 3, colour: '#ddd', snap: true },
        zoom: { controls: true, wheel: true, startScale: 0.9, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 },
        trashcan: true,
      });

      // Set up change listener
      workspaceRef.current.addChangeListener(() => {
        const result = generateCode();
        const hcl = result.hcl;
        const files = result.files;
        const isValid = hcl.trim() !== '' && !hcl.includes('Error:');
        
        onHclGenerated(hcl, isValid);
        if (onFilesGenerated) {
          onFilesGenerated(files);
        }
        
        const workspaceState = window.Blockly.Xml.workspaceToDom(workspaceRef.current);
        onWorkspaceChange(workspaceState);
      });

      // Load workspace data if provided
      if (workspaceData) {
        window.Blockly.Xml.domToWorkspace(workspaceData, workspaceRef.current);
      }

      console.log("Blockly workspace initialized successfully");
    };

    const generateCode = () => {
      if (!workspaceRef.current) return { hcl: '', files: {} };
      
      const topBlocks = workspaceRef.current.getTopBlocks(true);
      let hcl = '';
      const files: { [key: string]: string } = {};
      
      topBlocks.forEach((block: any) => {
        const tfObject = blockToTerraformObject(block);
        if (tfObject) {
          hcl += tfObject.generateHCL();
          
          // Generate additional files for Lambda functions
          if (tfObject.type === 'lambda') {
            files['lambda.py'] = generateLambdaCode(tfObject);
          }
        }
      });
      
      // Generate standard Terraform files
      files['main.tf'] = hcl || "# Drag blocks to start building your infrastructure.";
      files['variables.tf'] = generateVariablesFile();
      files['outputs.tf'] = generateOutputsFile();
      
      return { hcl: hcl || "# Drag blocks to start building your infrastructure.", files };
    };

    initializeBlockly();
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={blocklyDivRef} className="w-full h-full" />
    </div>
  );
}

function defineAllBlocks() {
  if (!window.Blockly) return;

  // Provider Block
  window.Blockly.Blocks['terraform_provider'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("🌐 Provider AWS")
        .appendField(new window.Blockly.FieldTextInput("us-west-2"), "REGION");
      this.setNextStatement(true, ["terraform_vpc", "terraform_s3", "terraform_iam_role"]);
      this.setColour(230);
    }
  };

  // VPC Block
  window.Blockly.Blocks['terraform_vpc'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("🏗️ VPC")
        .appendField(new window.Blockly.FieldTextInput("main_vpc"), "NAME");
      this.appendDummyInput()
        .appendField("CIDR")
        .appendField(new window.Blockly.FieldTextInput("10.0.0.0/16"), "CIDR");
      this.appendStatementInput("CHILDREN")
        .setCheck(["terraform_subnet", "terraform_security_group"])
        .appendField("Contains:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
    }
  };

  // Subnet Block
  window.Blockly.Blocks['terraform_subnet'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("🔗 Subnet")
        .appendField(new window.Blockly.FieldTextInput("main_subnet"), "NAME");
      this.appendDummyInput()
        .appendField("CIDR")
        .appendField(new window.Blockly.FieldTextInput("10.0.1.0/24"), "CIDR");
      this.appendStatementInput("CHILDREN")
        .setCheck(["terraform_instance", "terraform_lambda", "terraform_rds"])
        .appendField("Contains:");
      this.setPreviousStatement(true, ["terraform_subnet", "terraform_security_group"]);
      this.setNextStatement(true, ["terraform_subnet", "terraform_security_group"]);
      this.setColour(200);
    }
  };

  // EC2 Instance Block
  window.Blockly.Blocks['terraform_instance'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("💻 EC2 Instance")
        .appendField(new window.Blockly.FieldTextInput("web_server"), "NAME");
      this.appendDummyInput()
        .appendField("Type")
        .appendField(new window.Blockly.FieldTextInput("t2.micro"), "INSTANCE_TYPE");
      this.appendStatementInput("IAM_ROLE")
        .setCheck("terraform_iam_role")
        .appendField("Role:");
      this.setPreviousStatement(true, ["terraform_instance", "terraform_lambda", "terraform_rds"]);
      this.setNextStatement(true, ["terraform_instance", "terraform_lambda", "terraform_rds"]);
      this.setColour(120);
    }
  };

  // Lambda Function Block
  window.Blockly.Blocks['terraform_lambda'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("⚡ Lambda")
        .appendField(new window.Blockly.FieldTextInput("my_function"), "NAME");
      this.appendDummyInput()
        .appendField("Runtime")
        .appendField(new window.Blockly.FieldTextInput("python3.9"), "RUNTIME");
      this.appendStatementInput("IAM_ROLE")
        .setCheck("terraform_iam_role")
        .appendField("Role:");
      this.setPreviousStatement(true, ["terraform_instance", "terraform_lambda", "terraform_rds"]);
      this.setNextStatement(true, ["terraform_instance", "terraform_lambda", "terraform_rds"]);
      this.setColour(120);
    }
  };

  // IAM Role Block
  window.Blockly.Blocks['terraform_iam_role'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("👤 IAM Role")
        .appendField(new window.Blockly.FieldTextInput("default_role"), "NAME");
      this.appendDummyInput()
        .appendField("Service")
        .appendField(new window.Blockly.FieldTextInput("ec2.amazonaws.com"), "SERVICE");
      this.setPreviousStatement(true, "terraform_iam_role");
      this.setNextStatement(true, "terraform_iam_role");
      this.setColour(65);
    }
  };

  // S3 Bucket Block
  window.Blockly.Blocks['terraform_s3'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("📦 S3 Bucket")
        .appendField(new window.Blockly.FieldTextInput("my_bucket"), "NAME");
      this.appendDummyInput()
        .appendField("Bucket Name")
        .appendField(new window.Blockly.FieldTextInput("my-unique-bucket-name"), "BUCKET_NAME");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(30);
    }
  };

  // RDS Instance Block
  window.Blockly.Blocks['terraform_rds'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("🗃️ RDS Instance")
        .appendField(new window.Blockly.FieldTextInput("main_db"), "NAME");
      this.setPreviousStatement(true, ["terraform_instance", "terraform_lambda", "terraform_rds"]);
      this.setNextStatement(true, ["terraform_instance", "terraform_lambda", "terraform_rds"]);
      this.setColour(30);
    }
  };

  // Security Group Block
  window.Blockly.Blocks['terraform_security_group'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("🔒 Security Group")
        .appendField(new window.Blockly.FieldTextInput("web_sg"), "NAME");
      this.setPreviousStatement(true, ["terraform_subnet", "terraform_security_group"]);
      this.setNextStatement(true, ["terraform_subnet", "terraform_security_group"]);
      this.setColour(290);
    }
  };

  // AI & ML Blocks
  window.Blockly.Blocks['terraform_bedrock_model'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("🤖 Bedrock Model")
        .appendField(new window.Blockly.FieldTextInput("claude_model"), "NAME");
      this.appendDummyInput()
        .appendField("Model ID")
        .appendField(new window.Blockly.FieldTextInput("anthropic.claude-v2"), "MODEL_ID");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(260);
    }
  };

  window.Blockly.Blocks['terraform_glue_job'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("✨ Glue Job")
        .appendField(new window.Blockly.FieldTextInput("my_glue_job"), "NAME");
      this.appendStatementInput("IAM_ROLE")
        .setCheck("terraform_iam_role")
        .appendField("Role:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(260);
    }
  };

  window.Blockly.Blocks['terraform_transcribe_job'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("🗣️ Transcribe Job")
        .appendField(new window.Blockly.FieldTextInput("my_transcribe_job"), "NAME");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(260);
    }
  };
}

function blockToTerraformObject(block: any) {
  if (!block) return null;

  const type = block.type.replace('terraform_', '');
  const properties: any = {};
  
  block.inputList.forEach((input: any) => {
    input.fieldRow.forEach((field: any) => {
      if (field.name) {
        properties[field.name.toLowerCase()] = field.getValue();
      }
    });
  });

  const terraformObj = new TerraformBlock(type, properties.name, ['*'], properties);

  // Process children in statement inputs
  block.inputList.forEach((input: any) => {
    if (input.type === window.Blockly.NEXT_STATEMENT || input.connection?.type === window.Blockly.NEXT_STATEMENT) {
      let childBlock = input.connection?.targetBlock();
      while (childBlock) {
        const childObj = blockToTerraformObject(childBlock);
        if (childObj) {
          terraformObj.addChild(childObj);
        }
        childBlock = childBlock.nextConnection?.targetBlock();
      }
    }
  });

  return terraformObj;
}

function generateLambdaCode(lambdaBlock: TerraformBlock): string {
  return `import json

def handler(event, context):
    """
    Lambda function for ${lambdaBlock.properties.name}
    Runtime: ${lambdaBlock.properties.runtime || 'python3.9'}
    """
    
    print(f"Received event: {json.dumps(event)}")
    
    # Your business logic here
    response = {
        'statusCode': 200,
        'body': json.dumps({
            'message': 'Hello from ${lambdaBlock.properties.name}!',
            'requestId': context.aws_request_id
        })
    }
    
    return response
`;
}

function generateVariablesFile(): string {
  return `# Variables for Terraform configuration

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "terraform-visual-editor"
}
`;
}

function generateOutputsFile(): string {
  return `# Outputs for Terraform configuration

output "vpc_id" {
  description = "ID of the VPC"
  value       = try(aws_vpc.main_vpc.id, null)
}

output "subnet_ids" {
  description = "IDs of the subnets"
  value       = [for subnet in aws_subnet.* : subnet.id]
}

output "instance_ids" {
  description = "IDs of the EC2 instances"
  value       = [for instance in aws_instance.* : instance.id]
}
`;
}

class TerraformBlock {
  type: string;
  name: string;
  allowedChildren: string[];
  properties: any;
  children: TerraformBlock[] = [];
  parent: TerraformBlock | null = null;
  connections: any[] = [];
  codeFiles: { [key: string]: string } = {};

  constructor(type: string, name: string, allowedChildren: string[] = [], properties: any = {}, connections: any[] = []) {
    this.type = type;
    this.name = name;
    this.allowedChildren = allowedChildren;
    this.properties = properties;
    this.connections = connections;
  }

  canAcceptChild(childType: string): boolean {
    return this.allowedChildren.includes(childType) || this.allowedChildren.includes('*');
  }

  addChild(child: TerraformBlock): boolean {
    if (this.canAcceptChild(child.type)) {
      this.children.push(child);
      child.parent = this;
      return true;
    }
    return false;
  }

  addConnection(targetBlock: TerraformBlock, connectionType: string) {
    this.connections.push({ target: targetBlock, type: connectionType });
    if (connectionType === 'peering') {
      targetBlock.connections.push({ target: this, type: 'peering' });
    }
  }

  generateHCL(indent = 0): string {
    const spaces = '  '.repeat(indent);
    let hcl = '';
    
    switch (this.type) {
      case 'provider':
        hcl += this.generateProviderHCL(spaces);
        break;
      case 'vpc':
        hcl += this.generateVpcHCL(spaces);
        break;
      case 'subnet':
        hcl += this.generateSubnetHCL(spaces);
        break;
      case 'instance':
        hcl += this.generateInstanceHCL(spaces);
        break;
      case 'lambda':
        hcl += this.generateLambdaHCL(spaces);
        break;
      case 'rds':
        hcl += this.generateRdsHCL(spaces);
        break;
      case 's3':
        hcl += this.generateS3HCL(spaces);
        break;
      case 'security_group':
        hcl += this.generateSecurityGroupHCL(spaces);
        break;
      case 'iam_role':
        hcl += this.generateIamRoleHCL(spaces);
        break;
      case 'glue_job':
        hcl += this.generateGlueJobHCL(spaces);
        break;
      case 'bedrock_model':
        hcl += this.generateBedrockModelHCL(spaces);
        break;
      case 'transcribe_job':
        hcl += this.generateTranscribeJobHCL(spaces);
        break;
    }

    // Generate HCL for children, except for IAM roles which are handled within their parent resource
    this.children.filter(c => c.type !== 'iam_role').forEach(child => {
      hcl += child.generateHCL(indent);
    });

    return hcl;
  }

  generateProviderHCL(spaces: string): string {
    return `${spaces}provider "aws" {\n${spaces}  region = "${this.properties.region || 'us-west-2'}"\n${spaces}}\n\n`;
  }

  generateVpcHCL(spaces: string): string {
    let hcl = `${spaces}resource "aws_vpc" "${this.properties.name || 'main_vpc'}" {\n`;
    hcl += `${spaces}  cidr_block = "${this.properties.cidr || '10.0.0.0/16'}"\n`;
    hcl += `${spaces}  enable_dns_hostnames = true\n`;
    hcl += `${spaces}  tags = {\n${spaces}    Name = "${this.properties.tags || this.properties.name}"\n${spaces}  }\n`;
    hcl += `${spaces}}\n\n`;
    return hcl;
  }

  generateSubnetHCL(spaces: string): string {
    let hcl = `${spaces}resource "aws_subnet" "${this.properties.name || 'main_subnet'}" {\n`;
    hcl += `${spaces}  vpc_id     = aws_vpc.${this.parent?.properties?.name || 'main_vpc'}.id\n`;
    hcl += `${spaces}  cidr_block = "${this.properties.cidr || '10.0.1.0/24'}"\n`;
    hcl += `${spaces}  tags = {\n${spaces}    Name = "${this.properties.tags || this.properties.name}"\n${spaces}  }\n`;
    hcl += `${spaces}}\n\n`;
    return hcl;
  }

  generateInstanceHCL(spaces: string): string {
    const iamRole = this.children.find(c => c.type === 'iam_role');
    let hcl = `${spaces}resource "aws_instance" "${this.properties.name || 'main_instance'}" {\n`;
    hcl += `${spaces}  ami           = "${this.properties.ami || 'ami-0c94855ba95b798c7'}"\n`;
    hcl += `${spaces}  instance_type = "${this.properties.instance_type || 't2.micro'}"\n`;
    if (this.parent?.type === 'subnet') {
      hcl += `${spaces}  subnet_id     = aws_subnet.${this.parent.properties.name || 'main_subnet'}.id\n`;
    }
    if (iamRole) {
      hcl += `${spaces}  iam_instance_profile = aws_iam_instance_profile.${iamRole.properties.name}_profile.name\n`;
    }
    hcl += `${spaces}  tags = {\n${spaces}    Name = "${this.properties.tags || this.properties.name}"\n${spaces}  }\n`;
    hcl += `${spaces}}\n\n`;

    if (iamRole) {
      hcl += iamRole.generateHCL(0);
      hcl += `${spaces}resource "aws_iam_instance_profile" "${iamRole.properties.name}_profile" {\n`;
      hcl += `${spaces}  name = "${iamRole.properties.name}_profile"\n`;
      hcl += `${spaces}  role = aws_iam_role.${iamRole.properties.name}.name\n`;
      hcl += `${spaces}}\n\n`;
    }
    return hcl;
  }

  generateLambdaHCL(spaces: string): string {
    const iamRole = this.children.find(c => c.type === 'iam_role');
    let hcl = `${spaces}resource "aws_lambda_function" "${this.properties.name || 'main_lambda'}" {\n`;
    hcl += `${spaces}  function_name = "${this.properties.name}"\n`;
    if (iamRole) {
      hcl += `${spaces}  role          = aws_iam_role.${iamRole.properties.name}.arn\n`;
    }
    hcl += `${spaces}  handler       = "${this.properties.handler || 'index.handler'}"\n`;
    hcl += `${spaces}  runtime       = "${this.properties.runtime || 'python3.9'}"\n`;
    hcl += `${spaces}  filename      = "lambda.zip"\n`;
    hcl += `${spaces}  tags = {\n${spaces}    Name = "${this.properties.tags || this.properties.name}"\n${spaces}  }\n`;
    hcl += `${spaces}}\n\n`;

    if (iamRole) {
      hcl += iamRole.generateHCL(0);
    }
    return hcl;
  }

  generateRdsHCL(spaces: string): string {
    let hcl = `${spaces}resource "aws_db_instance" "${this.properties.name || 'main_db'}" {\n`;
    hcl += `${spaces}  identifier           = "${this.properties.identifier || 'mydb'}"\n`;
    hcl += `${spaces}  engine               = "${this.properties.engine || 'mysql'}"\n`;
    hcl += `${spaces}  instance_class       = "${this.properties.instance_class || 'db.t3.micro'}"\n`;
    hcl += `${spaces}  allocated_storage    = 20\n`;
    hcl += `${spaces}  username             = "admin"\n`;
    hcl += `${spaces}  password             = "yourpassword"\n`;
    hcl += `${spaces}  skip_final_snapshot  = true\n`;
    hcl += `${spaces}  tags = {\n${spaces}    Name = "${this.properties.tags || this.properties.name}"\n${spaces}  }\n`;
    hcl += `${spaces}}\n\n`;
    return hcl;
  }

  generateS3HCL(spaces: string): string {
    let hcl = `${spaces}resource "aws_s3_bucket" "${this.properties.name || 'main_bucket'}" {\n`;
    hcl += `${spaces}  bucket = "${this.properties.bucket_name || 'my-unique-bucket-name'}"\n`;
    hcl += `${spaces}  tags = {\n${spaces}    Name = "${this.properties.tags || this.properties.name}"\n${spaces}  }\n`;
    hcl += `${spaces}}\n\n`;
    return hcl;
  }

  generateSecurityGroupHCL(spaces: string): string {
    let hcl = `${spaces}resource "aws_security_group" "${this.properties.name || 'main_sg'}" {\n`;
    hcl += `${spaces}  name_prefix = "${this.properties.name}-"\n`;
    if (this.parent?.type === 'vpc') {
      hcl += `${spaces}  vpc_id      = aws_vpc.${this.parent.properties.name || 'main_vpc'}.id\n`;
    }
    hcl += `${spaces}  description = "${this.properties.description || 'Managed by Visual Editor'}"\n`;
    hcl += `${spaces}  tags = {\n${spaces}    Name = "${this.properties.tags || this.properties.name}"\n${spaces}  }\n`;
    hcl += `${spaces}}\n\n`;
    return hcl;
  }

  generateIamRoleHCL(spaces: string): string {
    let hcl = `${spaces}resource "aws_iam_role" "${this.properties.name || 'main_role'}" {\n`;
    hcl += `${spaces}  name = "${this.properties.name}"\n`;
    hcl += `${spaces}  assume_role_policy = jsonencode({\n`;
    hcl += `${spaces}    Version = "2012-10-17",\n`;
    hcl += `${spaces}    Statement = [\n`;
    hcl += `${spaces}      {\n`;
    hcl += `${spaces}        Action = "sts:AssumeRole",\n`;
    hcl += `${spaces}        Effect = "Allow",\n`;
    hcl += `${spaces}        Principal = {\n`;
    hcl += `${spaces}          Service = "${this.properties.service || 'ec2.amazonaws.com'}"\n`;
    hcl += `${spaces}        }\n`;
    hcl += `${spaces}      }\n`;
    hcl += `${spaces}    ]\n`;
    hcl += `${spaces}  })\n`;
    hcl += `${spaces}  tags = {\n${spaces}    Name = "${this.properties.tags || this.properties.name}"\n${spaces}  }\n`;
    hcl += `${spaces}}\n\n`;
    return hcl;
  }

  generateGlueJobHCL(spaces: string): string {
    const iamRole = this.children.find(c => c.type === 'iam_role');
    let hcl = `${spaces}resource "aws_glue_job" "${this.properties.name}" {\n`;
    hcl += `${spaces}  name     = "${this.properties.name}"\n`;
    if (iamRole) {
      hcl += `${spaces}  role_arn = aws_iam_role.${iamRole.properties.name}.arn\n`;
    }
    hcl += `${spaces}  command {\n`;
    hcl += `${spaces}    script_location = "s3://aws-glue-scripts/your-script.py"\n`;
    hcl += `${spaces}    python_version  = "3"\n`;
    hcl += `${spaces}  }\n`;
    hcl += `${spaces}  tags = {\n${spaces}    Name = "${this.properties.tags || this.properties.name}"\n${spaces}  }\n`;
    hcl += `${spaces}}\n\n`;

    if (iamRole) {
      hcl += iamRole.generateHCL(0);
    }
    return hcl;
  }

  generateBedrockModelHCL(spaces: string): string {
    return `${spaces}# Terraform does not directly manage Bedrock models via a resource.\n` +
           `${spaces}# Instead, you would use data sources to reference them and grant permissions via IAM.\n` +
           `${spaces}data "aws_bedrock_foundation_model" "${this.properties.name}" {\n` +
           `${spaces}  model_id = "${this.properties.model_id || 'anthropic.claude-v2'}"\n` +
           `${spaces}}\n\n`;
  }

  generateTranscribeJobHCL(spaces: string): string {
    return `${spaces}# aws_transcribe_medical_transcription_job or aws_transcribe_transcription_job\n` +
           `${spaces}# This is a complex resource, showing a simplified placeholder.\n` +
           `${spaces}resource "aws_transcribe_transcription_job" "${this.properties.name}" {\n` +
           `${spaces}  transcription_job_name = "${this.properties.name}"\n` +
           `${spaces}  language_code          = "en-US"\n` +
           `${spaces}  media_format           = "mp3"\n` +
           `${spaces}  media = {\n` +
           `${spaces}    media_file_uri = "s3://your-bucket/your-audio.mp3"\n` +
           `${spaces}  }\n` +
           `${spaces}}\n\n`;
  }
}