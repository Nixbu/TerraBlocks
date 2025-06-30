export const toolboxConfig = {
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
      name: 'Identity & Access',
      colour: '#9C27B0',
      contents: [
        { kind: 'block', type: 'iam_role' }
      ]
    }
  ]
};
