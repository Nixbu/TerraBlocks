declare global {
  interface Window {
    Blockly: any;
  }
}

export function initializeBlockly(container: HTMLElement) {
  const Blockly = window.Blockly;

  if (!Blockly) {
    console.error('Blockly not loaded');
    return null;
  }

  // Define VPC block with enhanced properties
  Blockly.Blocks['vpc'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("VPC")
        .appendField(new Blockly.FieldTextInput("main-vpc"), "NAME");
      this.appendValueInput("CIDR")
        .setCheck("cidr")
        .appendField("CIDR");
      this.appendDummyInput()
        .appendField("DNS Hostnames")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "DNS_HOSTNAMES");
      this.appendDummyInput()
        .appendField("DNS Support")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "DNS_SUPPORT");
      this.appendDummyInput()
        .appendField("Environment")
        .appendField(new Blockly.FieldDropdown([
          ["production", "production"],
          ["staging", "staging"],
          ["development", "development"],
          ["testing", "testing"]
        ]), "ENVIRONMENT");
      this.appendStatementInput("RESOURCES")
        .setCheck(["subnet", "security_group", "internet_gateway", "route_table"])
        .appendField("Contains");
      this.setColour("#1976D2");
      this.setTooltip("Amazon VPC - Virtual Private Cloud");
      this.setHelpUrl("");
    }
  };

  // Define Subnet block with enhanced properties
  Blockly.Blocks['subnet'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("Subnet")
        .appendField(new Blockly.FieldTextInput("public-subnet"), "NAME");
      this.appendValueInput("CIDR")
        .setCheck("cidr")
        .appendField("CIDR");
      this.appendDummyInput()
        .appendField("Availability Zone")
        .appendField(new Blockly.FieldDropdown([
          ["us-west-2a", "us-west-2a"],
          ["us-west-2b", "us-west-2b"],
          ["us-west-2c", "us-west-2c"],
          ["us-east-1a", "us-east-1a"],
          ["us-east-1b", "us-east-1b"],
          ["us-east-1c", "us-east-1c"],
          ["eu-west-1a", "eu-west-1a"],
          ["eu-west-1b", "eu-west-1b"],
          ["eu-west-1c", "eu-west-1c"]
        ]), "AZ");
      this.appendDummyInput()
        .appendField("Public IP on Launch")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "PUBLIC");
      this.appendDummyInput()
        .appendField("Subnet Type")
        .appendField(new Blockly.FieldDropdown([
          ["Public", "public"],
          ["Private", "private"],
          ["Database", "database"]
        ]), "SUBNET_TYPE");
      this.appendStatementInput("RESOURCES")
        .setCheck(["ec2_instance", "rds_instance", "lambda_function"])
        .appendField("Contains");
      this.setPreviousStatement(true, ["subnet"]);
      this.setNextStatement(true, ["subnet", "security_group", "internet_gateway", "route_table"]);
      this.setColour("#4CAF50");
      this.setTooltip("AWS Subnet - Network segment within VPC");
    }
  };

  // Define EC2 Instance block with enhanced properties
  Blockly.Blocks['ec2_instance'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("EC2 Instance")
        .appendField(new Blockly.FieldTextInput("web-server"), "NAME");
      this.appendDummyInput()
        .appendField("AMI ID")
        .appendField(new Blockly.FieldTextInput("ami-0c02fb55956c7d316"), "AMI");
      this.appendDummyInput()
        .appendField("Instance Type")
        .appendField(new Blockly.FieldDropdown([
          ["t3.micro", "t3.micro"],
          ["t3.small", "t3.small"],
          ["t3.medium", "t3.medium"],
          ["t3.large", "t3.large"],
          ["t3.xlarge", "t3.xlarge"],
          ["m5.large", "m5.large"],
          ["m5.xlarge", "m5.xlarge"],
          ["c5.large", "c5.large"],
          ["c5.xlarge", "c5.xlarge"]
        ]), "INSTANCE_TYPE");
      this.appendValueInput("KEY_NAME")
        .setCheck("key_pair")
        .appendField("Key Pair");
      this.appendDummyInput()
        .appendField("Monitoring")
        .appendField(new Blockly.FieldCheckbox("FALSE"), "MONITORING");
      this.appendDummyInput()
        .appendField("Associate Public IP")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "ASSOCIATE_PUBLIC_IP");
      this.appendStatementInput("RESOURCES")
        .setCheck(["iam_role", "ebs_volume", "security_group_attachment"])
        .appendField("Attachments");
      this.setPreviousStatement(true, ["ec2_instance"]);
      this.setNextStatement(true, ["ec2_instance", "rds_instance", "lambda_function"]);
      this.setColour("#FF9800");
      this.setTooltip("AWS EC2 Instance - Virtual server in the cloud");
    }
  };

  // Define Security Group block
  Blockly.Blocks['security_group'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("Security Group")
        .appendField(new Blockly.FieldTextInput("web-sg"), "NAME");
      this.appendDummyInput()
        .appendField("HTTP Port")
        .appendField(new Blockly.FieldNumber(80, 1, 65535), "HTTP_PORT");
      this.appendDummyInput()
        .appendField("SSH Port")
        .appendField(new Blockly.FieldNumber(22, 1, 65535), "SSH_PORT");
      this.setPreviousStatement(true, ["security_group"]);
      this.setNextStatement(true, ["subnet", "security_group"]);
      this.setColour("#F44336");
      this.setTooltip("AWS Security Group");
    }
  };

  // Define IAM Role block
  Blockly.Blocks['iam_role'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("IAM Role")
        .appendField(new Blockly.FieldTextInput("ec2-role"), "NAME");
      this.appendDummyInput()
        .appendField("Service")
        .appendField(new Blockly.FieldDropdown([
          ["ec2.amazonaws.com", "ec2.amazonaws.com"],
          ["lambda.amazonaws.com", "lambda.amazonaws.com"],
          ["ecs-tasks.amazonaws.com", "ecs-tasks.amazonaws.com"]
        ]), "SERVICE");
      this.setPreviousStatement(true, ["iam_role"]);
      this.setNextStatement(true, ["iam_role"]);
      this.setColour("#9C27B0");
      this.setTooltip("AWS IAM Role");
    }
  };

  // Define RDS Instance block
  Blockly.Blocks['rds_instance'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("RDS Instance")
        .appendField(new Blockly.FieldTextInput("main-database"), "NAME");
      this.appendDummyInput()
        .appendField("Engine")
        .appendField(new Blockly.FieldDropdown([
          ["MySQL", "mysql"],
          ["PostgreSQL", "postgres"],
          ["MariaDB", "mariadb"],
          ["Oracle", "oracle-ee"],
          ["SQL Server", "sqlserver-ex"]
        ]), "ENGINE");
      this.appendDummyInput()
        .appendField("Instance Class")
        .appendField(new Blockly.FieldDropdown([
          ["db.t3.micro", "db.t3.micro"],
          ["db.t3.small", "db.t3.small"],
          ["db.t3.medium", "db.t3.medium"],
          ["db.r5.large", "db.r5.large"],
          ["db.r5.xlarge", "db.r5.xlarge"]
        ]), "INSTANCE_CLASS");
      this.appendDummyInput()
        .appendField("Storage (GB)")
        .appendField(new Blockly.FieldNumber(20, 20, 65536), "ALLOCATED_STORAGE");
      this.appendDummyInput()
        .appendField("Username")
        .appendField(new Blockly.FieldTextInput("admin"), "USERNAME");
      this.appendDummyInput()
        .appendField("Multi-AZ")
        .appendField(new Blockly.FieldCheckbox("FALSE"), "MULTI_AZ");
      this.setPreviousStatement(true, ["rds_instance"]);
      this.setNextStatement(true, ["rds_instance", "lambda_function"]);
      this.setColour("#FF5722");
      this.setTooltip("AWS RDS - Managed database service");
    }
  };

  // Define Lambda Function block
  Blockly.Blocks['lambda_function'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("Lambda Function")
        .appendField(new Blockly.FieldTextInput("my-function"), "NAME");
      this.appendDummyInput()
        .appendField("Runtime")
        .appendField(new Blockly.FieldDropdown([
          ["Python 3.9", "python3.9"],
          ["Python 3.8", "python3.8"],
          ["Node.js 18", "nodejs18.x"],
          ["Node.js 16", "nodejs16.x"],
          ["Java 11", "java11"],
          ["Go 1.x", "go1.x"],
          [".NET 6", "dotnet6"]
        ]), "RUNTIME");
      this.appendDummyInput()
        .appendField("Handler")
        .appendField(new Blockly.FieldTextInput("index.handler"), "HANDLER");
      this.appendDummyInput()
        .appendField("Memory (MB)")
        .appendField(new Blockly.FieldNumber(128, 128, 10240), "MEMORY");
      this.appendDummyInput()
        .appendField("Timeout (seconds)")
        .appendField(new Blockly.FieldNumber(3, 1, 900), "TIMEOUT");
      this.setPreviousStatement(true, ["lambda_function"]);
      this.setNextStatement(true, ["lambda_function"]);
      this.setColour("#FF9C27");
      this.setTooltip("AWS Lambda - Serverless compute service");
    }
  };

  // Define S3 Bucket block
  Blockly.Blocks['s3_bucket'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("S3 Bucket")
        .appendField(new Blockly.FieldTextInput("my-bucket"), "NAME");
      this.appendDummyInput()
        .appendField("Versioning")
        .appendField(new Blockly.FieldCheckbox("FALSE"), "VERSIONING");
      this.appendDummyInput()
        .appendField("Public Access")
        .appendField(new Blockly.FieldDropdown([
          ["Block All", "block_all"],
          ["Allow Read", "allow_read"],
          ["Allow Write", "allow_write"],
          ["Allow All", "allow_all"]
        ]), "PUBLIC_ACCESS");
      this.appendDummyInput()
        .appendField("Encryption")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "ENCRYPTION");
      this.setColour("#4CAF50");
      this.setTooltip("AWS S3 Bucket - Object storage service");
    }
  };

  // Define Internet Gateway block
  Blockly.Blocks['internet_gateway'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("Internet Gateway")
        .appendField(new Blockly.FieldTextInput("main-igw"), "NAME");
      this.setPreviousStatement(true, ["internet_gateway"]);
      this.setNextStatement(true, ["route_table", "security_group"]);
      this.setColour("#2196F3");
      this.setTooltip("AWS Internet Gateway - Provides internet access to VPC");
    }
  };

  // Define Route Table block
  Blockly.Blocks['route_table'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("Route Table")
        .appendField(new Blockly.FieldTextInput("public-rt"), "NAME");
      this.appendDummyInput()
        .appendField("Route Type")
        .appendField(new Blockly.FieldDropdown([
          ["Internet Gateway", "igw"],
          ["NAT Gateway", "nat"],
          ["VPC Peering", "pcx"],
          ["VPN Gateway", "vgw"]
        ]), "ROUTE_TYPE");
      this.appendDummyInput()
        .appendField("Destination CIDR")
        .appendField(new Blockly.FieldTextInput("0.0.0.0/0"), "DESTINATION_CIDR");
      this.setPreviousStatement(true, ["route_table"]);
      this.setNextStatement(true, ["route_table", "security_group"]);
      this.setColour("#3F51B5");
      this.setTooltip("AWS Route Table - Controls network traffic routing");
    }
  };

  // Define CIDR block for values
  Blockly.Blocks['cidr_block'] = {
    init: function() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput("10.0.0.0/16"), "CIDR");
      this.setOutput(true, "cidr");
      this.setColour("#607D8B");
      this.setTooltip("CIDR Block - Network address range");
    }
  };

  // Define Key Pair block for values
  Blockly.Blocks['key_pair'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("Key Pair")
        .appendField(new Blockly.FieldTextInput("my-key-pair"), "KEY_NAME");
      this.setOutput(true, "key_pair");
      this.setColour("#795548");
      this.setTooltip("AWS Key Pair - SSH key for EC2 access");
    }
  };

  // Create enhanced toolbox with all AWS resources
  const toolbox = {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Network',
        colour: '#1976D2',
        contents: [
          { 
            kind: 'block', 
            type: 'vpc',
            inputs: {
              CIDR: {
                block: {
                  type: 'cidr_block',
                  fields: {
                    CIDR: '10.0.0.0/16'
                  }
                }
              }
            }
          },
          { 
            kind: 'block', 
            type: 'subnet',
            inputs: {
              CIDR: {
                block: {
                  type: 'cidr_block',
                  fields: {
                    CIDR: '10.0.1.0/24'
                  }
                }
              }
            }
          },
          { kind: 'block', type: 'security_group' },
          { kind: 'block', type: 'internet_gateway' },
          { kind: 'block', type: 'route_table' }
        ]
      },
      {
        kind: 'category',
        name: 'Compute',
        colour: '#FF9800',
        contents: [
          { 
            kind: 'block', 
            type: 'ec2_instance',
            inputs: {
              KEY_NAME: {
                block: {
                  type: 'key_pair',
                  fields: {
                    KEY_NAME: 'my-key-pair'
                  }
                }
              }
            }
          },
          { kind: 'block', type: 'lambda_function' }
        ]
      },
      {
        kind: 'category',
        name: 'Database',
        colour: '#FF5722',
        contents: [
          { kind: 'block', type: 'rds_instance' }
        ]
      },
      {
        kind: 'category',
        name: 'Storage',
        colour: '#4CAF50',
        contents: [
          { kind: 'block', type: 's3_bucket' }
        ]
      },
      {
        kind: 'category',
        name: 'Identity & Access',
        colour: '#9C27B0',
        contents: [
          { kind: 'block', type: 'iam_role' }
        ]
      },
      {
        kind: 'category',
        name: 'Values',
        colour: '#607D8B',
        contents: [
          { kind: 'block', type: 'cidr_block' },
          { kind: 'block', type: 'key_pair' }
        ]
      }
    ]
  };

  // Initialize workspace
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
    theme: Blockly.Themes.Modern
  });

  return workspace;
}
