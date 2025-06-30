declare global {
  interface Window {
    Blockly: any;
  }
}

// Block Type Definitions - OOP Class Hierarchy  
class TerraformBlock {
  constructor(
    public type: string, 
    public name: string, 
    public allowedChildren: string[] = [], 
    public properties: any = {}
  ) {
    this.children = [];
    this.parent = null;
  }

  children: TerraformBlock[] = [];
  parent: TerraformBlock | null = null;

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

  generateHCL(indent = 0): string {
    const spaces = '  '.repeat(indent);
    let hcl = '';
    
    if (this.type === 'provider') {
      hcl += `${spaces}provider "${this.properties.provider || 'aws'}" {\n`;
      if (this.properties.region) {
        hcl += `${spaces}  region = "${this.properties.region}"\n`;
      }
      hcl += `${spaces}}\n\n`;
    } else if (this.type === 'vpc') {
      hcl += `${spaces}resource "aws_vpc" "${this.properties.name || 'main_vpc'}" {\n`;
      hcl += `${spaces}  cidr_block = "${this.properties.cidr || '10.0.0.0/16'}"\n`;
      if (this.properties.enable_dns_hostnames) {
        hcl += `${spaces}  enable_dns_hostnames = ${this.properties.enable_dns_hostnames}\n`;
      }
      if (this.properties.tags) {
        hcl += `${spaces}  tags = {\n`;
        hcl += `${spaces}    Name = "${this.properties.tags}"\n`;
        hcl += `${spaces}  }\n`;
      }
      hcl += `${spaces}}\n\n`;
    } else if (this.type === 'subnet') {
      hcl += `${spaces}resource "aws_subnet" "${this.properties.name || 'main_subnet'}" {\n`;
      hcl += `${spaces}  vpc_id     = aws_vpc.${this.parent?.properties?.name || 'main_vpc'}.id\n`;
      hcl += `${spaces}  cidr_block = "${this.properties.cidr || '10.0.1.0/24'}"\n`;
      if (this.properties.availability_zone) {
        hcl += `${spaces}  availability_zone = "${this.properties.availability_zone}"\n`;
      }
      if (this.properties.map_public_ip) {
        hcl += `${spaces}  map_public_ip_on_launch = ${this.properties.map_public_ip}\n`;
      }
      if (this.properties.tags) {
        hcl += `${spaces}  tags = {\n`;
        hcl += `${spaces}    Name = "${this.properties.tags}"\n`;
        hcl += `${spaces}  }\n`;
      }
      hcl += `${spaces}}\n\n`;
    } else if (this.type === 'instance') {
      hcl += `${spaces}resource "aws_instance" "${this.properties.name || 'main_instance'}" {\n`;
      hcl += `${spaces}  ami           = "${this.properties.ami || 'ami-0c94855ba95b798c7'}"\n`;
      hcl += `${spaces}  instance_type = "${this.properties.instance_type || 't2.micro'}"\n`;
      if (this.parent?.type === 'subnet') {
        hcl += `${spaces}  subnet_id     = aws_subnet.${this.parent.properties.name || 'main_subnet'}.id\n`;
      }
      if (this.properties.key_name) {
        hcl += `${spaces}  key_name      = "${this.properties.key_name}"\n`;
      }
      if (this.properties.tags) {
        hcl += `${spaces}  tags = {\n`;
        hcl += `${spaces}    Name = "${this.properties.tags}"\n`;
        hcl += `${spaces}  }\n`;
      }
      hcl += `${spaces}}\n\n`;
    } else if (this.type === 'security_group') {
      hcl += `${spaces}resource "aws_security_group" "${this.properties.name || 'main_sg'}" {\n`;
      hcl += `${spaces}  name_prefix = "${this.properties.name_prefix || 'terraform-sg'}"\n`;
      if (this.parent?.type === 'vpc') {
        hcl += `${spaces}  vpc_id      = aws_vpc.${this.parent.properties.name || 'main_vpc'}.id\n`;
      }
      if (this.properties.description) {
        hcl += `${spaces}  description = "${this.properties.description}"\n`;
      }
      hcl += `${spaces}}\n\n`;
    } else if (this.type === 'iam_role') {
      hcl += `${spaces}resource "aws_iam_role" "${this.properties.name || 'main_role'}" {\n`;
      hcl += `${spaces}  name = "${this.properties.role_name || 'terraform-role'}"\n`;
      hcl += `${spaces}  assume_role_policy = jsonencode({\n`;
      hcl += `${spaces}    Version = "2012-10-17"\n`;
      hcl += `${spaces}    Statement = [\n`;
      hcl += `${spaces}      {\n`;
      hcl += `${spaces}        Action = "sts:AssumeRole"\n`;
      hcl += `${spaces}        Effect = "Allow"\n`;
      hcl += `${spaces}        Principal = {\n`;
      hcl += `${spaces}          Service = "${this.properties.service || 'ec2.amazonaws.com'}"\n`;
      hcl += `${spaces}        }\n`;
      hcl += `${spaces}      }\n`;
      hcl += `${spaces}    ]\n`;
      hcl += `${spaces}  })\n`;
      hcl += `${spaces}}\n\n`;
    }

    // Generate HCL for children
    this.children.forEach(child => {
      hcl += child.generateHCL(indent);
    });

    return hcl;
  }
}

// Blockly Block Definitions
function defineBlocks() {
  const Blockly = window.Blockly;

  // Provider Block
  Blockly.Blocks['terraform_provider'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("🌐 Provider")
        .appendField(new Blockly.FieldDropdown([
          ["AWS", "aws"],
          ["Azure", "azurerm"],
          ["GCP", "google"]
        ]), "PROVIDER");
      this.appendDummyInput()
        .appendField("Region")
        .appendField(new Blockly.FieldTextInput("us-west-2"), "REGION");
      this.setColour(230);
      this.setTooltip("Configure cloud provider");
      this.setHelpUrl("");
    }
  };

  // VPC Block (Container)
  Blockly.Blocks['terraform_vpc'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("🏗️ VPC")
        .appendField(new Blockly.FieldTextInput("main_vpc"), "NAME");
      this.appendDummyInput()
        .appendField("CIDR Block")
        .appendField(new Blockly.FieldTextInput("10.0.0.0/16"), "CIDR");
      this.appendDummyInput()
        .appendField("Enable DNS Hostnames")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "DNS_HOSTNAMES");
      this.appendDummyInput()
        .appendField("Tags")
        .appendField(new Blockly.FieldTextInput("Main VPC"), "TAGS");
      this.appendStatementInput("SUBNETS")
        .setCheck(["terraform_subnet", "terraform_security_group"])
        .appendField("Contains:");
      this.setColour(160);
      this.setTooltip("AWS VPC - Virtual Private Cloud");
      this.setHelpUrl("");
    }
  };

  // Subnet Block
  Blockly.Blocks['terraform_subnet'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("🔗 Subnet")
        .appendField(new Blockly.FieldTextInput("main_subnet"), "NAME");
      this.appendDummyInput()
        .appendField("CIDR Block")
        .appendField(new Blockly.FieldTextInput("10.0.1.0/24"), "CIDR");
      this.appendDummyInput()
        .appendField("Availability Zone")
        .appendField(new Blockly.FieldDropdown([
          ["us-west-2a", "us-west-2a"],
          ["us-west-2b", "us-west-2b"],
          ["us-west-2c", "us-west-2c"]
        ]), "AZ");
      this.appendDummyInput()
        .appendField("Map Public IP")
        .appendField(new Blockly.FieldCheckbox("FALSE"), "MAP_PUBLIC_IP");
      this.appendDummyInput()
        .appendField("Tags")
        .appendField(new Blockly.FieldTextInput("Main Subnet"), "TAGS");
      this.appendStatementInput("INSTANCES")
        .setCheck(["terraform_instance"])
        .appendField("Contains:");
      this.setPreviousStatement(true, ["terraform_subnet"]);
      this.setNextStatement(true, ["terraform_subnet", "terraform_security_group"]);
      this.setColour(200);
      this.setTooltip("AWS Subnet");
      this.setHelpUrl("");
    }
  };

  // EC2 Instance Block
  Blockly.Blocks['terraform_instance'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("💻 EC2 Instance")
        .appendField(new Blockly.FieldTextInput("web_server"), "NAME");
      this.appendDummyInput()
        .appendField("AMI")
        .appendField(new Blockly.FieldTextInput("ami-0c94855ba95b798c7"), "AMI");
      this.appendDummyInput()
        .appendField("Instance Type")
        .appendField(new Blockly.FieldDropdown([
          ["t2.micro", "t2.micro"],
          ["t2.small", "t2.small"],
          ["t2.medium", "t2.medium"],
          ["t3.micro", "t3.micro"],
          ["t3.small", "t3.small"]
        ]), "INSTANCE_TYPE");
      this.appendDummyInput()
        .appendField("Key Name")
        .appendField(new Blockly.FieldTextInput("my-key"), "KEY_NAME");
      this.appendDummyInput()
        .appendField("Tags")
        .appendField(new Blockly.FieldTextInput("Web Server"), "TAGS");
      this.appendStatementInput("IAM_ROLES")
        .setCheck(["terraform_iam_role"])
        .appendField("IAM Roles:");
      this.setPreviousStatement(true, ["terraform_instance"]);
      this.setNextStatement(true, ["terraform_instance"]);
      this.setColour(120);
      this.setTooltip("AWS EC2 Instance");
      this.setHelpUrl("");
    }
  };

  // Security Group Block
  Blockly.Blocks['terraform_security_group'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("🔒 Security Group")
        .appendField(new Blockly.FieldTextInput("web_sg"), "NAME");
      this.appendDummyInput()
        .appendField("Name Prefix")
        .appendField(new Blockly.FieldTextInput("web-sg"), "NAME_PREFIX");
      this.appendDummyInput()
        .appendField("Description")
        .appendField(new Blockly.FieldTextInput("Web server security group"), "DESCRIPTION");
      this.setPreviousStatement(true, ["terraform_security_group"]);
      this.setNextStatement(true, ["terraform_subnet", "terraform_security_group"]);
      this.setColour(290);
      this.setTooltip("AWS Security Group");
      this.setHelpUrl("");
    }
  };

  // IAM Role Block
  Blockly.Blocks['terraform_iam_role'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("👤 IAM Role")
        .appendField(new Blockly.FieldTextInput("ec2_role"), "NAME");
      this.appendDummyInput()
        .appendField("Role Name")
        .appendField(new Blockly.FieldTextInput("EC2Role"), "ROLE_NAME");
      this.appendDummyInput()
        .appendField("Service")
        .appendField(new Blockly.FieldDropdown([
          ["ec2.amazonaws.com", "ec2.amazonaws.com"],
          ["lambda.amazonaws.com", "lambda.amazonaws.com"],
          ["ecs-tasks.amazonaws.com", "ecs-tasks.amazonaws.com"]
        ]), "SERVICE");
      this.setPreviousStatement(true, ["terraform_iam_role"]);
      this.setNextStatement(true, ["terraform_iam_role"]);
      this.setColour(65);
      this.setTooltip("AWS IAM Role");
      this.setHelpUrl("");
    }
  };

  // RDS Instance Block
  Blockly.Blocks['terraform_rds'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("🗄️ RDS Database")
        .appendField(new Blockly.FieldTextInput("main_db"), "NAME");
      this.appendDummyInput()
        .appendField("Engine")
        .appendField(new Blockly.FieldDropdown([
          ["MySQL", "mysql"],
          ["PostgreSQL", "postgres"],
          ["MariaDB", "mariadb"]
        ]), "ENGINE");
      this.appendDummyInput()
        .appendField("Instance Class")
        .appendField(new Blockly.FieldDropdown([
          ["db.t3.micro", "db.t3.micro"],
          ["db.t3.small", "db.t3.small"],
          ["db.t3.medium", "db.t3.medium"]
        ]), "INSTANCE_CLASS");
      this.appendDummyInput()
        .appendField("Storage (GB)")
        .appendField(new Blockly.FieldNumber(20, 20, 1000), "STORAGE");
      this.setColour(45);
      this.setTooltip("AWS RDS Database Instance");
      this.setHelpUrl("");
    }
  };

  // Lambda Function Block
  Blockly.Blocks['terraform_lambda'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("⚡ Lambda Function")
        .appendField(new Blockly.FieldTextInput("my_function"), "NAME");
      this.appendDummyInput()
        .appendField("Runtime")
        .appendField(new Blockly.FieldDropdown([
          ["Python 3.9", "python3.9"],
          ["Node.js 18", "nodejs18.x"],
          ["Java 11", "java11"]
        ]), "RUNTIME");
      this.appendDummyInput()
        .appendField("Handler")
        .appendField(new Blockly.FieldTextInput("index.handler"), "HANDLER");
      this.appendDummyInput()
        .appendField("Memory (MB)")
        .appendField(new Blockly.FieldNumber(128, 128, 3008), "MEMORY");
      this.setColour(330);
      this.setTooltip("AWS Lambda Function");
      this.setHelpUrl("");
    }
  };

  // S3 Bucket Block
  Blockly.Blocks['terraform_s3'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("🪣 S3 Bucket")
        .appendField(new Blockly.FieldTextInput("my-bucket"), "NAME");
      this.appendDummyInput()
        .appendField("Versioning")
        .appendField(new Blockly.FieldCheckbox("FALSE"), "VERSIONING");
      this.appendDummyInput()
        .appendField("Public Access")
        .appendField(new Blockly.FieldDropdown([
          ["Blocked", "blocked"],
          ["Allowed", "allowed"]
        ]), "PUBLIC_ACCESS");
      this.setColour(270);
      this.setTooltip("AWS S3 Storage Bucket");
      this.setHelpUrl("");
    }
  };
}

// Code Generator
function generateTerraformCode(workspace: any): string {
  const blocks = workspace.getTopBlocks();
  let terraformObjects: TerraformBlock[] = [];
  
  blocks.forEach((block: any) => {
    const terraformObj = blockToTerraformObject(block);
    if (terraformObj) {
      terraformObjects.push(terraformObj);
    }
  });

  let hcl = '';
  terraformObjects.forEach(obj => {
    hcl += obj.generateHCL();
  });

  return hcl || '# No blocks in workspace\n# Drag blocks from the toolbox to start building';
}

function blockToTerraformObject(block: any): TerraformBlock | null {
  if (!block) return null;

  const type = block.type.replace('terraform_', '');
  const properties: any = {};

  // Extract properties from block fields
  Object.keys(block.inputList).forEach(key => {
    const input = block.inputList[key];
    input.fieldRow.forEach((field: any) => {
      if (field.name_) {
        properties[field.name_.toLowerCase()] = field.getValue();
      }
    });
  });

  const terraformObj = new TerraformBlock(type, properties.name, [], properties);

  // Process child blocks
  block.inputList.forEach((input: any) => {
    if (input.type === window.Blockly.NEXT_STATEMENT || input.type === window.Blockly.INPUT_VALUE) {
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

export function initializeBlockly(container: HTMLElement): any {
  const Blockly = window.Blockly;
  
  if (!Blockly) {
    console.error('Blockly not loaded');
    return null;
  }

  defineBlocks();

  const toolbox = {
    "kind": "categoryToolbox",
    "contents": [
      {
        "kind": "category",
        "name": "🌐 Infrastructure",
        "colour": "#3b82f6",
        "contents": [
          {
            "kind": "block",
            "type": "terraform_provider"
          },
          {
            "kind": "block",
            "type": "terraform_vpc"
          }
        ]
      },
      {
        "kind": "category",
        "name": "🔗 Network",
        "colour": "#10b981",
        "contents": [
          {
            "kind": "block",
            "type": "terraform_subnet"
          },
          {
            "kind": "block",
            "type": "terraform_security_group"
          }
        ]
      },
      {
        "kind": "category",
        "name": "💻 Compute",
        "colour": "#f59e0b",
        "contents": [
          {
            "kind": "block",
            "type": "terraform_instance"
          },
          {
            "kind": "block",
            "type": "terraform_lambda"
          }
        ]
      },
      {
        "kind": "category",
        "name": "🗄️ Database & Storage",
        "colour": "#ef4444",
        "contents": [
          {
            "kind": "block",
            "type": "terraform_rds"
          },
          {
            "kind": "block",
            "type": "terraform_s3"
          }
        ]
      },
      {
        "kind": "category",
        "name": "👤 Security",
        "colour": "#8b5cf6",
        "contents": [
          {
            "kind": "block",
            "type": "terraform_iam_role"
          }
        ]
      }
    ]
  };

  const workspace = Blockly.inject(container, {
    toolbox: toolbox,
    grid: {
      spacing: 20,
      length: 3,
      colour: '#ccc',
      snap: true
    },
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1.0,
      maxScale: 3,
      minScale: 0.3,
      scaleSpeed: 1.2
    },
    trashcan: true,
    scrollbars: true,
    sounds: false,
    theme: Blockly.Themes.Modern || undefined
  });

  // Return the workspace directly and a bound code generation function
  const generateCodeBound = () => generateTerraformCode(workspace);

  return { 
    workspace: workspace, 
    generateTerraformCode: generateCodeBound 
  };
}