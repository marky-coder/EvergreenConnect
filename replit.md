# Evergreen Land Investments Website

## Overview

This is a marketing website for Evergreen Land Investments, a real estate company that provides cash offers for properties. The application is built as a full-stack TypeScript project with a React frontend and Express backend, featuring a modern, nature-inspired design system with comprehensive UI components from shadcn/ui.

The website showcases the company's services, team members, testimonials, and provides a contact form for potential clients to request cash offers for their properties.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- Single-page application (SPA) architecture with route-based code organization

**UI Component System**
- shadcn/ui component library (New York style variant) providing 40+ pre-built components
- Radix UI primitives for accessible, unstyled component foundations
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for variant-based component styling
- Custom theme system supporting light/dark modes with nature-inspired color palette

**State Management**
- TanStack Query (React Query) for server state management and data fetching
- React Hook Form with Zod resolvers for form state and validation
- Local state management using React hooks

**Design System**
- Custom color palette centered around green tones (forest green, sage) representing the "Evergreen" brand
- Typography using Inter font family across all weights
- Responsive design with mobile-first approach
- Custom utility classes for elevation effects (hover-elevate, active-elevate-2)
- HSL-based color system for consistent theming across light/dark modes

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- TypeScript for type safety across the stack
- ESM (ES Modules) module system throughout

**Development Environment**
- Vite middleware integration for hot module replacement in development
- Custom logging middleware for API request tracking
- Development-only plugins (Replit cartographer, dev banner) for enhanced DX

**Data Layer Preparation**
- Drizzle ORM configured for PostgreSQL with Neon serverless driver
- Schema definitions using Drizzle with Zod validation
- In-memory storage implementation (MemStorage) as placeholder for database integration
- Storage interface pattern allowing easy swap between in-memory and database implementations

**Session Management**
- Infrastructure prepared for connect-pg-simple session storage
- Session middleware ready for authentication implementation

### File Structure & Organization

**Client Directory (`/client`)**
- `/src/components` - Reusable React components organized by feature
- `/src/components/ui` - shadcn/ui component library
- `/src/pages` - Route-level page components
- `/src/lib` - Utility functions and shared logic
- `/src/hooks` - Custom React hooks

**Server Directory (`/server`)**
- `index.ts` - Express server setup and middleware configuration
- `routes.ts` - API route registration
- `storage.ts` - Data access layer with storage interface
- `vite.ts` - Vite integration for development

**Shared Directory (`/shared`)**
- `schema.ts` - Shared database schema and validation types

**Configuration Files**
- Path aliases configured via TypeScript and Vite for clean imports (@/, @shared/, @assets/)
- Tailwind configured with custom theme extending shadcn/ui defaults
- PostCSS for CSS processing

## External Dependencies

### UI & Styling
- **shadcn/ui** - Comprehensive component library built on Radix UI primitives
- **Radix UI** - 20+ primitive components for accessible UI (accordion, dialog, dropdown, popover, etc.)
- **Tailwind CSS** - Utility-first CSS framework with custom configuration
- **Lucide React** - Icon library for consistent iconography
- **React Icons** - Additional icons including social media icons (Facebook, LinkedIn, Instagram)

### Data & Forms
- **TanStack Query v5** - Server state management with caching and background updates
- **React Hook Form** - Performant form state management
- **Zod** - Schema validation for forms and data
- **Drizzle Zod** - Integration between Drizzle ORM and Zod validators

### Database & ORM
- **Drizzle ORM** - TypeScript ORM for SQL databases
- **@neondatabase/serverless** - Neon Postgres serverless driver for edge/serverless environments
- **Drizzle Kit** - CLI tool for database migrations and schema management
- **connect-pg-simple** - PostgreSQL session store for Express sessions

### Development Tools
- **Vite** - Fast build tool and dev server with HMR
- **@vitejs/plugin-react** - Official React plugin for Vite
- **TSX** - TypeScript execution for development server
- **esbuild** - Fast bundler for production builds
- **@replit plugins** - Development experience enhancements (runtime error overlay, cartographer, dev banner)

### Utilities
- **date-fns** - Date manipulation and formatting
- **embla-carousel-react** - Carousel/slider component
- **cmdk** - Command palette component
- **clsx & tailwind-merge** - Utility for merging Tailwind classes
- **nanoid** - Unique ID generation

### Assets
- Custom images stored in `/attached_assets` including logos and generated service images
- Font loading via Google Fonts (Inter family)