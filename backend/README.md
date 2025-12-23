# MNEMOS Backend

Science-based memorization system backend services.

## Architecture

```
backend/
├── src/
│   ├── api/              # Express API routes
│   ├── db/               # Database connection and schema
│   ├── domain/           # Core business logic
│   │   ├── scheduler/    # Spaced repetition algorithms
│   │   └── experiences/  # Memory experience templates
│   └── services/         # Service layer
├── dist/                 # Compiled JavaScript
└── tests/                # Unit tests
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up PostgreSQL database:
```bash
createdb mnemos
psql mnemos < src/db/schema.sql
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and OpenAI API key
# Get your OpenAI API key from: https://platform.openai.com/account/api-keys
# Important: Replace the placeholder with your actual API key (starts with "sk-")
```

4. Run migrations (if needed):
```bash
npm run db:migrate
```

5. Start development server:
```bash
npm run dev
```

## API Endpoints

### Memory Objects
- `POST /api/memory/learning-moments` - Create a learning moment
- `POST /api/memory/memory-objects` - Create a memory object
- `GET /api/memory/memory-objects` - Get user's memory objects
- `GET /api/memory/memory-objects/:id` - Get specific memory object
- `GET /api/memory/due` - Get memories due for review
- `GET /api/memory/learning-moments` - Get user's learning moments

### Reviews
- `POST /api/reviews` - Record a review event
- `GET /api/reviews/:memoryObjectId` - Get review history
- `GET /api/reviews/:memoryObjectId/schedule` - Get schedule state
- `GET /api/reviews/:memoryObjectId/experiences` - Generate experiences

## Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Core Components

### Scheduler Service
Implements SM-2-like spaced repetition algorithm. Pluggable architecture allows for future upgrades to probabilistic models.

### Experience Generator
Generates different types of retrieval experiences (free recall, application, etc.) with varying difficulty levels.

### Memory Service
Handles creation and retrieval of learning moments and memory objects.

### Review Service
Processes review events, updates schedule states, and tracks metacognition metrics.

