# MNEMOS Architecture

## Overview

MNEMOS is built with a clean architecture that separates concerns and enables testability and extensibility.

## Architecture Layers

### 1. Domain Layer (`shared/types`, `backend/src/domain`)
- **Pure business logic** - no dependencies on infrastructure
- Core entities: LearningMoment, MemoryObject, ReviewEvent, ScheduleState
- Scheduler algorithms (SM-2, upgradeable to probabilistic models)
- Experience templates and generators

### 2. Service Layer (`backend/src/services`)
- Orchestrates domain logic
- Handles data persistence
- MemoryService, ReviewService

### 3. API Layer (`backend/src/api`)
- Express routes
- Request/response handling
- Input validation

### 4. Infrastructure (`backend/src/db`)
- Database connection
- Schema definitions
- Query utilities

### 5. Presentation (`frontend/src`)
- React Native components
- API client
- UI/UX

## Key Design Decisions

### Pluggable Scheduler
The scheduler is abstracted behind an interface, allowing easy upgrades:
- MVP: SM-2 algorithm
- Future: Probabilistic forgetting curve models

### Experience Templates
Different retrieval experience types are defined as templates with:
- Scoring logic
- Prompt generation
- Difficulty levels
- Priority weights

### Calendar-Native UX
The UI is built around a calendar view, making memory review feel natural and integrated into daily routines.

## Data Flow

1. **Capture**: User creates LearningMoment → processed into MemoryObject
2. **Schedule**: MemoryObject gets initial ScheduleState
3. **Review**: User completes experience → ReviewEvent created → ScheduleState updated
4. **Adapt**: Scheduler calculates next review date based on performance

## Extensibility Points

1. **Scheduler Algorithms**: Implement `SchedulerAlgorithm` interface
2. **Experience Types**: Add new templates to `experienceTemplates`
3. **AI Integration**: Add AI service for content generation (scoped to generation only)
4. **Group Features**: Extend with weekly quests and challenges

## Testing Strategy

- **Unit Tests**: Domain logic (scheduler, experiences)
- **Integration Tests**: Services and API endpoints
- **E2E Tests**: Full user flows

## Scalability Considerations

- Stateless scheduler service (can be horizontally scaled)
- Database indexes on frequently queried fields
- Event-driven architecture ready (ReviewEvent → schedule update)
- Offline-first frontend design

