import { Cloud, Server, Shield, Lock, Network, Layers } from "lucide-react";

const blockCategories = [
  {
    name: "Network",
    blocks: [
      {
        type: "vpc",
        name: "VPC",
        description: "Virtual Private Cloud",
        icon: Network,
        color: "bg-blue-500",
      },
      {
        type: "subnet",
        name: "Subnet",
        description: "Network Subnet",
        icon: Layers,
        color: "bg-green-500",
      },
      {
        type: "security_group",
        name: "Security Group",
        description: "Firewall Rules",
        icon: Shield,
        color: "bg-red-500",
      },
    ],
  },
  {
    name: "Compute",
    blocks: [
      {
        type: "ec2_instance",
        name: "EC2 Instance",
        description: "Virtual Server",
        icon: Server,
        color: "bg-orange-500",
      },
    ],
  },
  {
    name: "Identity & Access",
    blocks: [
      {
        type: "iam_role",
        name: "IAM Role",
        description: "Access Control",
        icon: Lock,
        color: "bg-purple-500",
      },
    ],
  },
];

export default function BlockPalette() {
  const handleBlockDragStart = (event: React.DragEvent, blockType: string) => {
    event.dataTransfer.setData("application/blockly-block", blockType);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Resource Blocks</h2>
        <input
          type="text"
          placeholder="Search blocks..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {blockCategories.map((category) => (
          <div key={category.name} className="p-4 border-t border-gray-100 first:border-t-0">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {category.name}
            </h3>
            <div className="space-y-2">
              {category.blocks.map((block) => {
                const IconComponent = block.icon;
                return (
                  <div
                    key={block.type}
                    className="block-category p-3 rounded-lg cursor-move transition-all duration-200 hover:shadow-sm"
                    draggable={true}
                    onDragStart={(e) => handleBlockDragStart(e, block.type)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${block.color} rounded-lg flex items-center justify-center`}>
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{block.name}</div>
                        <div className="text-xs text-gray-500">{block.description}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
