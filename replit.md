# Visual Terraform Editor SaaS - Replit Guide

## Overview

This project has been transformed from a simple visual Terraform editor into a comprehensive SaaS platform. The platform provides a web-based visual Terraform editor using Blockly blocks (similar to Scratch) with enterprise features including user authentication, team collaboration, project management, Git integration, subscription billing through Stripe, and cloud deployment capabilities.

## System Architecture

### SaaS Platform Features
- **Multi-tenant architecture** with user authentication via Replit Auth
- **Subscription-based billing** with Stripe integration (Free, Pro, Enterprise tiers)
- **Team collaboration** with project sharing and role-based access
- **Git integration** for version control and repository management
- **Project templates** and example infrastructures
- **Cloud deployment** with status tracking and cost estimation
- **API usage tracking** for billing and analytics

### Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Enhanced UI Components**: Advanced sidebar, multi-tab code editor, comprehensive toolbar
- **Vite** as the build tool and development server
- **Tailwind CSS** for styling with shadcn/ui component library
- **Blockly** for the visual block-based editor with AI/ML resources
- **TanStack Query** for state management and API calls
- **Wouter** for client-side routing

### Backend Architecture
- **Express.js** server with TypeScript
- **PostgreSQL database** with Drizzle ORM for production data persistence
- **Replit Authentication** with session management
- **Stripe payment processing** for subscription management
- **RESTful API** design for all platform features
- **Database Storage** replacing in-memory storage for production use

### Enhanced Data Storage
- **PostgreSQL** as primary database with full schema for SaaS features
- **User management** with subscription tiers and Stripe integration
- **Project management** with collaboration and sharing features
- **Template system** with official and community templates
- **Deployment tracking** with history and cost estimation
- **API usage analytics** for billing and monitoring

## Key Enhanced Components

### Advanced UI Components
- **ProjectSidebar**: Project management, Git integration, template selection
- **EnhancedBlocklyWorkspace**: Multi-category blocks including AI/ML resources
- **EnhancedCodePreview**: Multi-file tabs with syntax highlighting and export
- **EnhancedToolbar**: Comprehensive actions including validation and deployment

### Expanded Infrastructure Block Types
- **Core**: Provider AWS, VPC configuration
- **Network**: Subnet, Security Group blocks
- **Compute**: EC2 Instance, Lambda Function blocks
- **Storage & DB**: S3 Bucket, RDS Instance blocks
- **Security**: IAM Role configuration
- **AI & ML**: Bedrock Model, Glue Job, Transcribe Job blocks

### SaaS Database Schema
- **Users**: Authentication, subscription management, Stripe integration
- **Projects**: User-associated with collaboration and sharing
- **Templates**: Official and community infrastructure templates
- **Deployments**: History tracking with cost and resource metrics
- **Collaborators**: Team features with role-based access
- **API Usage**: Billing and analytics tracking

### Advanced Features
- **Multi-file code generation** (main.tf, variables.tf, outputs.tf, lambda.py)
- **Project templates** for different use cases (webapp, microservices, data platform, ML)
- **Git repository integration** with commit, push, pull operations
- **Real-time validation** and deployment status tracking
- **Cost estimation** and resource planning
- **Team collaboration** with project sharing

## Data Flow (Enhanced)

1. **User Authentication**: Replit Auth with session management
2. **Project Management**: CRUD operations with user association
3. **Block Interaction**: Enhanced drag-and-drop with AI/ML resources
4. **Multi-file Generation**: Complete Terraform project structure
5. **Git Integration**: Version control with repository sync
6. **Deployment Pipeline**: Status tracking with cost estimation
7. **Collaboration**: Real-time sharing with role-based access
8. **Billing Integration**: Usage tracking with Stripe subscriptions

## External Dependencies (Enhanced)

### SaaS Platform
- **Replit Authentication**: Multi-user support with OpenID Connect
- **Stripe**: Subscription billing and payment processing
- **PostgreSQL**: Production database with Neon integration

### Enhanced Core Libraries
- **Blockly**: Visual programming editor with extended AWS resources
- **@neondatabase/serverless**: PostgreSQL driver for Neon database
- **Drizzle ORM**: Type-safe database toolkit with migration support
- **shadcn/ui**: Component library for professional SaaS interface

### Platform Integration
- **Git repositories**: Version control integration
- **AWS services**: Extended support for AI/ML and data services
- **Cost estimation**: Resource planning and budget management

## Deployment Strategy (Production SaaS)

### Multi-tenant Environment
- **User isolation** with database-level security
- **Subscription management** with Stripe webhooks
- **Session storage** in PostgreSQL for scalability
- **API rate limiting** based on subscription tiers

### Production Features
- **Database migrations** via Drizzle with version control
- **Environment configuration** for multi-stage deployment
- **Monitoring and analytics** for usage tracking
- **Cost optimization** with resource estimation

## Recent Changes

### June 30, 2025 - SaaS Platform Transformation
- **Enhanced UI**: Complete redesign with professional SaaS interface
- **Database Schema**: Full PostgreSQL schema for multi-tenant SaaS
- **Authentication**: Replit Auth integration with user management
- **Subscription Billing**: Stripe integration with tiered pricing
- **Team Features**: Project collaboration with role-based access
- **AI/ML Blocks**: Extended AWS resource support including Bedrock, Glue, Transcribe
- **Git Integration**: Version control with repository management
- **Multi-file Support**: Complete Terraform project generation
- **Deployment Pipeline**: Status tracking with cost estimation

## User Preferences

Preferred communication style: Simple, everyday language.
Architecture: Full-stack SaaS platform with enterprise features.
Focus: Professional multi-tenant application with subscription billing.