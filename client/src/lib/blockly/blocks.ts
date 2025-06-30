declare global {
  interface Window {
    Blockly: any;
  }
}

export function initializeBlockly(container: HTMLElement) {
  const Blockly = window.Blockly;

  // Define VPC block
  Blockly.Blocks['vpc'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("VPC")
        .appendField(new Blockly.FieldTextInput("main-vpc"), "NAME");
      this.appendValueInput("CIDR")
        .setCheck(null)
        .appendField("CIDR");
      this.appendStatementInput("RESOURCES")
        .setCheck(["subnet", "security_group"])
        .appendField("Contains");
      this.setColour("#1976D2");
      this.setTooltip("Amazon VPC - Virtual Private Cloud");
      this.setHelpUrl("");
    }
  };

  // Define Subnet block
  Blockly.Blocks['subnet'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("Subnet")
        .appendField(new Blockly.FieldTextInput("subnet"), "NAME");
      this.appendValueInput("CIDR")
        .setCheck(null)
        .appendField("CIDR");
      this.appendDummyInput()
        .appendField("AZ")
        .appendField(new Blockly.FieldDropdown([
          ["us-west-2a", "us-west-2a"],
          ["us-west-2b", "us-west-2b"],
          ["us-west-2c", "us-west-2c"]
        ]), "AZ");
      this.appendDummyInput()
        .appendField("Public")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "PUBLIC");
      this.appendStatementInput("RESOURCES")
        .setCheck(["ec2_instance"])
        .appendField("Contains");
      this.setPreviousStatement(true, ["subnet"]);
      this.setNextStatement(true, ["subnet", "security_group"]);
      this.setColour("#4CAF50");
      this.setTooltip("AWS Subnet");
    }
  };

  // Define EC2 Instance block
  Blockly.Blocks['ec2_instance'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("EC2 Instance")
        .appendField(new Blockly.FieldTextInput("web-server"), "NAME");
      this.appendDummyInput()
        .appendField("AMI")
        .appendField(new Blockly.FieldTextInput("ami-12345678"), "AMI");
      this.appendDummyInput()
        .appendField("Type")
        .appendField(new Blockly.FieldDropdown([
          ["t3.micro", "t3.micro"],
          ["t3.small", "t3.small"],
          ["t3.medium", "t3.medium"],
          ["t3.large", "t3.large"]
        ]), "INSTANCE_TYPE");
      this.appendStatementInput("RESOURCES")
        .setCheck(["iam_role"])
        .appendField("Attachments");
      this.setPreviousStatement(true, ["ec2_instance"]);
      this.setNextStatement(true, ["ec2_instance"]);
      this.setColour("#FF9800");
      this.setTooltip("AWS EC2 Instance");
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

  // Define CIDR block for values
  Blockly.Blocks['cidr_block'] = {
    init: function() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput("10.0.0.0/16"), "CIDR");
      this.setOutput(true, null);
      this.setColour("#607D8B");
      this.setTooltip("CIDR Block");
    }
  };

  // Create toolbox
  const toolbox = {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Network',
        colour: '#1976D2',
        contents: [
          { kind: 'block', type: 'vpc' },
          { kind: 'block', type: 'subnet' },
          { kind: 'block', type: 'security_group' },
          { kind: 'block', type: 'cidr_block' }
        ]
      },
      {
        kind: 'category',
        name: 'Compute',
        colour: '#FF9800',
        contents: [
          { kind: 'block', type: 'ec2_instance' }
        ]
      },
      {
        kind: 'category',
        name: 'Identity',
        colour: '#9C27B0',
        contents: [
          { kind: 'block', type: 'iam_role' }
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
