# Visual Terraform Editor - Replit Guide

## Overview

This project is a web-based visual Terraform editor that uses Blockly blocks (similar to Scratch) to build and manage infrastructure as code. Users can drag and drop infrastructure components to visually design their cloud architecture, with real-time Terraform HCL code generation.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend, backend, and shared components:

### Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Vite** as the build tool and development server
- **Tailwind CSS** for styling with shadcn/ui component library
- **Blockly** for the visual block-based editor
- **TanStack Query** for state management and API calls
- **Wouter** for client-side routing

### Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** design for project management
- **In-memory storage** (MemStorage) with interface for future database integration
- **Middleware** for request logging and error handling

### Data Storage
- **Drizzle ORM** configured for PostgreSQL (schema defined but using in-memory storage currently)
- **Schema** includes users and terraform_projects tables
- Database migrations handled through drizzle-kit

## Key Components

### Visual Editor Components
- **BlocklyWorkspace**: Main canvas for drag-and-drop block editing
- **BlockPalette**: Sidebar containing available infrastructure blocks
- **CodePreview**: Real-time HCL code generation and preview

### Infrastructure Block Types
- **VPC Block**: Root network container with CIDR configuration
- **Subnet Block**: Network segments with availability zone selection
- **Security Group Block**: Firewall rules configuration
- **EC2 Instance Block**: Virtual server configuration
- **IAM Role Block**: Access control configuration

### Block Hierarchy & Nesting
- VPC blocks contain subnet and security group blocks
- Subnet blocks can contain EC2 instances
- Hierarchical containment enforced through Blockly's type checking
- Parent-child relationships reflect real Terraform resource dependencies

### HCL Code Generation
- Real-time translation from block workspace to valid Terraform HCL
- Auto-generated outputs for key resource attributes
- Maintains proper Terraform resource naming conventions
- Live preview updates on any workspace changes

## Data Flow

1. **Block Interaction**: Users drag blocks from palette to workspace
2. **Workspace Updates**: Blockly triggers change events on block modifications
3. **HCL Generation**: Custom generator translates blocks to Terraform code
4. **Project Persistence**: Workspace data saved via REST API
5. **Code Export**: Generated HCL can be copied or downloaded

## External Dependencies

### Core Libraries
- **Blockly**: Visual programming editor (loaded via CDN)
- **@neondatabase/serverless**: PostgreSQL driver for Neon database
- **Drizzle ORM**: Type-safe database toolkit
- **shadcn/ui**: Component library built on Radix UI primitives

### Development Tools
- **TypeScript**: Type safety across the entire codebase
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Tailwind

### Cloud Integration
- Designed for AWS infrastructure (EC2, VPC, IAM)
- Extensible for other cloud providers
- Terraform HCL output compatible with standard Terraform workflows

## Deployment Strategy

### Development Environment
- **Vite dev server** for frontend with HMR
- **tsx** for running TypeScript server directly
- **Replit integration** with error overlays and cartographer

### Production Build
- **Vite build** generates optimized frontend assets
- **ESBuild** bundles server code for Node.js
- Static assets served from Express server
- Database migrations via `drizzle-kit push`

### Environment Configuration
- Database URL required via `DATABASE_URL` environment variable
- Neon database integration ready for production deployment
- Session storage configured for PostgreSQL with connect-pg-simple

## Changelog

- June 30, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.