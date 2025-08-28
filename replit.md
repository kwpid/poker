# Overview

PokerElo is an online competitive poker platform built with React TypeScript frontend and Express.js backend. The application features both casual and ranked poker gameplay with an ELO rating system, seasonal rankings, and real-time multiplayer functionality. Players can compete in 2-6 player poker games with comprehensive user authentication, matchmaking, and progression systems.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite build system
- **UI Library**: Shadcn/ui components with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom dark gaming theme using CSS variables
- **State Management**: React hooks with custom hooks for auth (`use-auth`) and game state (`use-game`)
- **Real-time Communication**: WebSocket client for live game updates and matchmaking
- **Query Management**: TanStack React Query for server state management

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Real-time**: WebSocket server for game communication and matchmaking
- **Architecture Pattern**: Service-oriented with dedicated services for game logic, ELO calculations, and season management
- **Storage**: In-memory storage implementation with interface for future database integration
- **Build**: ESBuild for production bundling

## Authentication System
- **Provider**: Firebase Authentication with support for email/password and Google OAuth
- **Database**: Firestore for user profiles and game data
- **Session Management**: Firebase auth state management with custom user profile extension
- **Username System**: Unique usernames (3-20 chars, alphanumeric only) required for all auth methods

## Game Logic
- **Game Types**: Casual and ranked poker modes supporting 2-6 players
- **Poker Implementation**: Texas Hold'em with standard betting rounds (preflop, flop, turn, river)
- **ELO System**: Custom ELO calculation for ranked games with K-factor of 32
- **Matchmaking**: Queue-based system with MMR-based wait times for ranked games
- **Season System**: Monthly seasons with soft resets and placement matches

## Data Schema
- **User Schema**: Comprehensive player profiles with rank, MMR, statistics, and season progress
- **Game Schema**: Complete game state including players, chips, cards, betting rounds, and results
- **Queue Schema**: Matchmaking queue entries with user info and game type preferences
- **Season Schema**: Season management with start/end dates and active status

## Real-time Features
- **WebSocket Events**: Join/leave queue, game actions (bet/fold/check), game state updates
- **Live Updates**: Real-time game state synchronization across all players
- **Queue Management**: Dynamic matchmaking with estimated wait times
- **Connection Handling**: Automatic reconnection with fallback mechanisms

# External Dependencies

## Core Technologies
- **React 18**: Frontend framework with hooks and TypeScript support
- **Express.js**: Backend web server framework
- **WebSocket (ws)**: Real-time bidirectional communication
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type-safe development across frontend and backend

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with custom dark theme
- **Shadcn/ui**: Pre-built accessible component library
- **Radix UI**: Primitive components for accessibility and customization
- **Lucide React**: Icon library for consistent iconography

## Authentication and Database
- **Firebase**: Authentication provider and Firestore database
- **Firebase Auth**: Email/password and Google OAuth authentication
- **Firestore**: NoSQL database for user profiles and game persistence

## Development Tools
- **Drizzle ORM**: Type-safe SQL query builder (configured for PostgreSQL)
- **Zod**: Runtime type validation and schema definition
- **ESBuild**: Fast JavaScript bundler for production builds
- **TanStack React Query**: Server state management and caching

## Validation and Forms
- **React Hook Form**: Form state management with validation
- **Hookform Resolvers**: Integration between React Hook Form and Zod schemas
- **Zod**: Schema validation for both client and server data models

## Date and Time
- **date-fns**: Date manipulation and formatting utilities for countdown timers and season management