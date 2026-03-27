# MNEMOS - Science-Based Memorization System

A calendar-native memory system grounded in cognitive science (retrieval practice, spaced repetition, forgetting curves, metacognition).

## Architecture Overview

```
mnemos/
├── backend/          # Node.js/TypeScript backend services
├── frontend/         # React Native mobile app
├── shared/           # Shared types and domain models
└── docs/             # Architecture and design docs
```

## Core Principles

- **Clean Architecture**: Domain-driven design with clear separation of concerns
- **Testable Logic**: All core logic is unit-testable without dependencies
- **Extensibility**: Pluggable schedulers, experience types, and AI integrations
- **Fast MVP**: Prioritize working features over perfection

## Technology Stack

- **Backend**: Node.js, TypeScript, Express, PostgreSQL
- **Frontend**: React Native, TypeScript
- **Scheduler**: Custom implementation with SM-2-like algorithm (upgradeable)
- **AI Integration**: OpenAI API (scoped to content generation only)

