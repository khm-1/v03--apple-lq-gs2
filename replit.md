# Financial Analytics Dashboard

## Overview

This is a modern full-stack financial analytics application built with a React frontend and Express.js backend. The application provides real-time portfolio management, market data visualization, and transaction tracking capabilities with a glassmorphism design aesthetic.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom glassmorphism design system
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Charts**: Recharts for data visualization
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Hot reload with Vite integration

### Database Schema
The application uses a relational database with the following entities:
- **Users**: Authentication and user management
- **Portfolios**: User portfolio data with performance metrics
- **Stocks**: Market data for individual securities
- **Transactions**: Financial transaction history

## Key Components

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Defined in `/shared/schema.ts` with Zod validation
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development
- **Migrations**: Drizzle Kit for database schema management

### API Layer
- **RESTful API**: Express.js with TypeScript
- **Endpoints**:
  - `GET /api/portfolio/:userId` - Retrieve user portfolio data
  - `GET /api/stocks` - Fetch all stock market data
  - `GET /api/transactions/:userId` - Get user transaction history
- **Error Handling**: Centralized error handling middleware
- **Logging**: Request/response logging for API endpoints

### Frontend Features
- **Dashboard**: Comprehensive financial overview with glassmorphism design
- **KPI Cards**: Portfolio metrics with animated visual indicators
- **Charts**: Interactive portfolio performance and allocation visualizations
- **Market Overview**: Real-time stock data with trend indicators
- **Transaction History**: Recent trading activity with visual categorization
- **Watchlist**: Customizable stock monitoring interface
- **Quick Actions**: Fast access to trading functions

## Data Flow

1. **Client Request**: React components use TanStack Query to make API requests
2. **API Processing**: Express.js routes handle requests and interact with storage layer
3. **Database Operations**: Drizzle ORM executes type-safe database queries
4. **Response Handling**: Data is returned as JSON and cached by React Query
5. **UI Updates**: Components re-render with new data automatically

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **recharts**: Chart visualization library
- **wouter**: Lightweight React router

### UI Dependencies
- **@radix-ui/***: Headless UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant management
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with PostgreSQL 16
- **Development Server**: Vite dev server with Express.js API
- **Hot Reload**: Vite HMR for frontend and tsx for backend
- **Port Configuration**: Frontend on port 5000, mapped to external port 80

### Production Build
- **Frontend Build**: Vite builds optimized React bundle to `dist/public`
- **Backend Build**: esbuild bundles Express.js server to `dist/index.js`
- **Asset Serving**: Express serves static files from build directory
- **Environment**: Production mode with optimized settings

### Replit Configuration
- **Deployment Target**: Autoscale deployment
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Environment Modules**: Node.js, Web, PostgreSQL

## Changelog

Changelog:
- June 19, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.