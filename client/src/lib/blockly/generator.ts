export function generateTerraformHCL(workspace: any): string {
  const Blockly = window.Blockly;
  const blocks = workspace.getTopBlocks();
  let hcl = '# Generated Terraform Configuration\n# Auto-updated from visual blocks\n\n';

  const resources: string[] = [];
  const outputs: string[] = [];

  blocks.forEach((block: any) => {
    const blockHcl = generateBlockHCL(block);
    if (blockHcl) {
      resources.push(blockHcl);
    }
  });

  // Add resources to HCL
  resources.forEach(resource => {
    hcl += resource + '\n\n';
  });

  // Add outputs
  if (resources.length > 0) {
    hcl += '# Output values\n';
    
    // Generate outputs based on resources
    blocks.forEach((block: any) => {
      if (block.type === 'vpc') {
        const vpcName = block.getFieldValue('NAME');
        hcl += `output "${vpcName}_id" {\n`;
        hcl += `  description = "ID of the VPC"\n`;
        hcl += `  value       = aws_vpc.${vpcName.replace(/-/g, '_')}.id\n`;
        hcl += '}\n\n';
      }
      if (block.type === 'ec2_instance') {
        const instanceName = block.getFieldValue('NAME');
        hcl += `output "${instanceName}_public_ip" {\n`;
        hcl += `  description = "Public IP of ${instanceName}"\n`;
        hcl += `  value       = aws_instance.${instanceName.replace(/-/g, '_')}.public_ip\n`;
        hcl += '}\n\n';
      }
    });
  }

  return hcl;
}

function generateRDSHCL(block: any): string {
  const name = block.getFieldValue('NAME');
  const engine = block.getFieldValue('ENGINE');
  const instanceClass = block.getFieldValue('INSTANCE_CLASS');
  const allocatedStorage = block.getFieldValue('ALLOCATED_STORAGE');
  const username = block.getFieldValue('USERNAME');
  const multiAz = block.getFieldValue('MULTI_AZ') === 'TRUE';
  
  let hcl = `# RDS Instance\n`;
  hcl += `resource "aws_db_instance" "${name.replace(/-/g, '_')}" {\n`;
  hcl += `  identifier             = "${name}"\n`;
  hcl += `  engine                 = "${engine}"\n`;
  hcl += `  instance_class         = "${instanceClass}"\n`;
  hcl += `  allocated_storage      = ${allocatedStorage}\n`;
  hcl += `  username               = "${username}"\n`;
  hcl += `  password               = "changeme123!"  # Change this!\n`;
  hcl += `  vpc_security_group_ids = [aws_security_group.database_sg.id]\n`;
  hcl += `  db_subnet_group_name   = aws_db_subnet_group.main.name\n`;
  hcl += `  multi_az               = ${multiAz ? 'true' : 'false'}\n`;
  hcl += `  skip_final_snapshot    = true\n`;
  hcl += `  \n`;
  hcl += `  tags = {\n`;
  hcl += `    Name = "${name}"\n`;
  hcl += `  }\n`;
  hcl += `}`;

  return hcl;
}

function generateLambdaHCL(block: any): string {
  const name = block.getFieldValue('NAME');
  const runtime = block.getFieldValue('RUNTIME');
  const handler = block.getFieldValue('HANDLER');
  const memory = block.getFieldValue('MEMORY');
  const timeout = block.getFieldValue('TIMEOUT');
  
  let hcl = `# Lambda Function\n`;
  hcl += `resource "aws_lambda_function" "${name.replace(/-/g, '_')}" {\n`;
  hcl += `  function_name = "${name}"\n`;
  hcl += `  role          = aws_iam_role.lambda_role.arn\n`;
  hcl += `  handler       = "${handler}"\n`;
  hcl += `  runtime       = "${runtime}"\n`;
  hcl += `  memory_size   = ${memory}\n`;
  hcl += `  timeout       = ${timeout}\n`;
  hcl += `  \n`;
  hcl += `  filename         = "function.zip"\n`;
  hcl += `  source_code_hash = filebase64sha256("function.zip")\n`;
  hcl += `  \n`;
  hcl += `  tags = {\n`;
  hcl += `    Name = "${name}"\n`;
  hcl += `  }\n`;
  hcl += `}`;

  return hcl;
}

function generateS3HCL(block: any): string {
  const name = block.getFieldValue('NAME');
  const versioning = block.getFieldValue('VERSIONING') === 'TRUE';
  const publicAccess = block.getFieldValue('PUBLIC_ACCESS');
  const encryption = block.getFieldValue('ENCRYPTION') === 'TRUE';
  
  let hcl = `# S3 Bucket\n`;
  hcl += `resource "aws_s3_bucket" "${name.replace(/-/g, '_')}" {\n`;
  hcl += `  bucket = "${name}"\n`;
  hcl += `  \n`;
  hcl += `  tags = {\n`;
  hcl += `    Name = "${name}"\n`;
  hcl += `  }\n`;
  hcl += `}\n`;
  
  if (versioning) {
    hcl += `\n`;
    hcl += `resource "aws_s3_bucket_versioning" "${name.replace(/-/g, '_')}_versioning" {\n`;
    hcl += `  bucket = aws_s3_bucket.${name.replace(/-/g, '_')}.id\n`;
    hcl += `  versioning_configuration {\n`;
    hcl += `    status = "Enabled"\n`;
    hcl += `  }\n`;
    hcl += `}`;
  }
  
  if (encryption) {
    hcl += `\n\n`;
    hcl += `resource "aws_s3_bucket_server_side_encryption_configuration" "${name.replace(/-/g, '_')}_encryption" {\n`;
    hcl += `  bucket = aws_s3_bucket.${name.replace(/-/g, '_')}.id\n`;
    hcl += `  \n`;
    hcl += `  rule {\n`;
    hcl += `    apply_server_side_encryption_by_default {\n`;
    hcl += `      sse_algorithm = "AES256"\n`;
    hcl += `    }\n`;
    hcl += `  }\n`;
    hcl += `}`;
  }

  return hcl;
}

function generateInternetGatewayHCL(block: any): string {
  const name = block.getFieldValue('NAME');
  
  let hcl = `# Internet Gateway\n`;
  hcl += `resource "aws_internet_gateway" "${name.replace(/-/g, '_')}" {\n`;
  hcl += `  vpc_id = aws_vpc.main_vpc.id\n`;
  hcl += `  \n`;
  hcl += `  tags = {\n`;
  hcl += `    Name = "${name}"\n`;
  hcl += `  }\n`;
  hcl += `}`;

  return hcl;
}

function generateRouteTableHCL(block: any): string {
  const name = block.getFieldValue('NAME');
  const routeType = block.getFieldValue('ROUTE_TYPE');
  const destinationCidr = block.getFieldValue('DESTINATION_CIDR');
  
  let hcl = `# Route Table\n`;
  hcl += `resource "aws_route_table" "${name.replace(/-/g, '_')}" {\n`;
  hcl += `  vpc_id = aws_vpc.main_vpc.id\n`;
  hcl += `  \n`;
  
  if (routeType === 'igw') {
    hcl += `  route {\n`;
    hcl += `    cidr_block = "${destinationCidr}"\n`;
    hcl += `    gateway_id = aws_internet_gateway.main_igw.id\n`;
    hcl += `  }\n`;
  }
  
  hcl += `  \n`;
  hcl += `  tags = {\n`;
  hcl += `    Name = "${name}"\n`;
  hcl += `  }\n`;
  hcl += `}`;

  return hcl;
}

function generateBlockHCL(block: any): string {
  switch (block.type) {
    case 'vpc':
      return generateVPCHCL(block);
    case 'subnet':
      return generateSubnetHCL(block);
    case 'ec2_instance':
      return generateEC2HCL(block);
    case 'security_group':
      return generateSecurityGroupHCL(block);
    case 'iam_role':
      return generateIAMRoleHCL(block);
    case 'rds_instance':
      return generateRDSHCL(block);
    case 'lambda_function':
      return generateLambdaHCL(block);
    case 's3_bucket':
      return generateS3HCL(block);
    case 'internet_gateway':
      return generateInternetGatewayHCL(block);
    case 'route_table':
      return generateRouteTableHCL(block);
    default:
      return '';
  }
}

function generateVPCHCL(block: any): string {
  const name = block.getFieldValue('NAME');
  const cidrBlock = getConnectedValue(block, 'CIDR') || '10.0.0.0/16';
  const dnsHostnames = block.getFieldValue('DNS_HOSTNAMES') === 'TRUE';
  const dnsSupport = block.getFieldValue('DNS_SUPPORT') === 'TRUE';
  const environment = block.getFieldValue('ENVIRONMENT') || 'production';
  
  let hcl = `# VPC Resource\n`;
  hcl += `resource "aws_vpc" "${name.replace(/-/g, '_')}" {\n`;
  hcl += `  cidr_block           = "${cidrBlock}"\n`;
  hcl += `  enable_dns_hostnames = ${dnsHostnames ? 'true' : 'false'}\n`;
  hcl += `  enable_dns_support   = ${dnsSupport ? 'true' : 'false'}\n`;
  hcl += `  \n`;
  hcl += `  tags = {\n`;
  hcl += `    Name        = "${name}"\n`;
  hcl += `    Environment = "${environment}"\n`;
  hcl += `    ManagedBy   = "terraform"\n`;
  hcl += `  }\n`;
  hcl += `}`;

  // Generate nested resources
  const nestedBlocks = getNestedBlocks(block, 'RESOURCES');
  nestedBlocks.forEach(nestedBlock => {
    const nestedHcl = generateBlockHCL(nestedBlock);
    if (nestedHcl) {
      hcl += '\n\n' + nestedHcl;
    }
  });

  return hcl;
}

function generateSubnetHCL(block: any): string {
  const name = block.getFieldValue('NAME');
  const cidrBlock = getConnectedValue(block, 'CIDR') || '10.0.1.0/24';
  const az = block.getFieldValue('AZ');
  const isPublic = block.getFieldValue('PUBLIC') === 'TRUE';
  const subnetType = block.getFieldValue('SUBNET_TYPE') || 'public';
  
  let hcl = `# Subnet\n`;
  hcl += `resource "aws_subnet" "${name.replace(/-/g, '_')}" {\n`;
  hcl += `  vpc_id                  = aws_vpc.main_vpc.id\n`;
  hcl += `  cidr_block              = "${cidrBlock}"\n`;
  hcl += `  availability_zone       = "${az}"\n`;
  hcl += `  map_public_ip_on_launch = ${isPublic ? 'true' : 'false'}\n`;
  hcl += `  \n`;
  hcl += `  tags = {\n`;
  hcl += `    Name = "${name}"\n`;
  hcl += `    Type = "${subnetType}"\n`;
  hcl += `  }\n`;
  hcl += `}`;

  // Generate nested resources
  const nestedBlocks = getNestedBlocks(block, 'RESOURCES');
  nestedBlocks.forEach(nestedBlock => {
    const nestedHcl = generateBlockHCL(nestedBlock);
    if (nestedHcl) {
      hcl += '\n\n' + nestedHcl;
    }
  });

  return hcl;
}

function generateEC2HCL(block: any): string {
  const name = block.getFieldValue('NAME');
  const ami = block.getFieldValue('AMI');
  const instanceType = block.getFieldValue('INSTANCE_TYPE');
  const keyName = getConnectedValue(block, 'KEY_NAME');
  const monitoring = block.getFieldValue('MONITORING') === 'TRUE';
  const associatePublicIp = block.getFieldValue('ASSOCIATE_PUBLIC_IP') === 'TRUE';
  
  let hcl = `# EC2 Instance\n`;
  hcl += `resource "aws_instance" "${name.replace(/-/g, '_')}" {\n`;
  hcl += `  ami                         = "${ami}"\n`;
  hcl += `  instance_type               = "${instanceType}"\n`;
  hcl += `  subnet_id                   = aws_subnet.public_subnet.id\n`;
  hcl += `  vpc_security_group_ids      = [aws_security_group.web_sg.id]\n`;
  if (keyName) {
    hcl += `  key_name                    = "${keyName}"\n`;
  }
  hcl += `  associate_public_ip_address = ${associatePublicIp ? 'true' : 'false'}\n`;
  hcl += `  monitoring                  = ${monitoring ? 'true' : 'false'}\n`;
  hcl += `  \n`;
  hcl += `  user_data = <<-EOF\n`;
  hcl += `    #!/bin/bash\n`;
  hcl += `    yum update -y\n`;
  hcl += `    yum install -y httpd\n`;
  hcl += `    systemctl start httpd\n`;
  hcl += `    systemctl enable httpd\n`;
  hcl += `  EOF\n`;
  hcl += `  \n`;
  hcl += `  tags = {\n`;
  hcl += `    Name = "${name}"\n`;
  hcl += `    Type = "web"\n`;
  hcl += `  }\n`;
  hcl += `}`;

  return hcl;
}

function generateSecurityGroupHCL(block: any): string {
  const name = block.getFieldValue('NAME');
  const httpPort = block.getFieldValue('HTTP_PORT');
  const sshPort = block.getFieldValue('SSH_PORT');
  
  let hcl = `# Security Group\n`;
  hcl += `resource "aws_security_group" "${name.replace(/-/g, '_')}" {\n`;
  hcl += `  name_prefix = "${name}"\n`;
  hcl += `  vpc_id      = aws_vpc.main_vpc.id\n`;
  hcl += `  \n`;
  hcl += `  ingress {\n`;
  hcl += `    from_port   = ${httpPort}\n`;
  hcl += `    to_port     = ${httpPort}\n`;
  hcl += `    protocol    = "tcp"\n`;
  hcl += `    cidr_blocks = ["0.0.0.0/0"]\n`;
  hcl += `    description = "HTTP access"\n`;
  hcl += `  }\n`;
  hcl += `  \n`;
  hcl += `  ingress {\n`;
  hcl += `    from_port   = ${sshPort}\n`;
  hcl += `    to_port     = ${sshPort}\n`;
  hcl += `    protocol    = "tcp"\n`;
  hcl += `    cidr_blocks = [aws_vpc.main_vpc.cidr_block]\n`;
  hcl += `    description = "SSH access from VPC"\n`;
  hcl += `  }\n`;
  hcl += `  \n`;
  hcl += `  egress {\n`;
  hcl += `    from_port   = 0\n`;
  hcl += `    to_port     = 0\n`;
  hcl += `    protocol    = "-1"\n`;
  hcl += `    cidr_blocks = ["0.0.0.0/0"]\n`;
  hcl += `  }\n`;
  hcl += `  \n`;
  hcl += `  tags = {\n`;
  hcl += `    Name = "${name}"\n`;
  hcl += `  }\n`;
  hcl += `}`;

  return hcl;
}

function generateIAMRoleHCL(block: any): string {
  const name = block.getFieldValue('NAME');
  const service = block.getFieldValue('SERVICE');
  
  let hcl = `# IAM Role\n`;
  hcl += `resource "aws_iam_role" "${name.replace(/-/g, '_')}" {\n`;
  hcl += `  name = "${name}"\n`;
  hcl += `  \n`;
  hcl += `  assume_role_policy = jsonencode({\n`;
  hcl += `    Version = "2012-10-17"\n`;
  hcl += `    Statement = [\n`;
  hcl += `      {\n`;
  hcl += `        Action = "sts:AssumeRole"\n`;
  hcl += `        Effect = "Allow"\n`;
  hcl += `        Principal = {\n`;
  hcl += `          Service = "${service}"\n`;
  hcl += `        }\n`;
  hcl += `      }\n`;
  hcl += `    ]\n`;
  hcl += `  })\n`;
  hcl += `  \n`;
  hcl += `  tags = {\n`;
  hcl += `    Name = "${name}"\n`;
  hcl += `  }\n`;
  hcl += `}`;

  return hcl;
}

function getConnectedValue(block: any, inputName: string): string | null {
  const input = block.getInput(inputName);
  if (input && input.connection && input.connection.targetBlock()) {
    const targetBlock = input.connection.targetBlock();
    if (targetBlock.type === 'cidr_block') {
      return targetBlock.getFieldValue('CIDR');
    }
    if (targetBlock.type === 'key_pair') {
      return targetBlock.getFieldValue('KEY_NAME');
    }
  }
  return null;
}

function getNestedBlocks(block: any, inputName: string): any[] {
  const blocks: any[] = [];
  const input = block.getInput(inputName);
  
  if (input && input.connection) {
    let currentBlock = input.connection.targetBlock();
    while (currentBlock) {
      blocks.push(currentBlock);
      currentBlock = currentBlock.getNextBlock();
    }
  }
  
  return blocks;
}