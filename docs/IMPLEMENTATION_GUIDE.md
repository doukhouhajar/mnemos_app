# MNEMOS Implementation Guide

## Quick Start

### Backend Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Set up PostgreSQL:**
```bash
createdb mnemos
psql mnemos < src/db/schema.sql
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Start server:**
```bash
npm run dev
```

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Start Metro bundler:**
```bash
npm start
```

3. **Run on device/simulator:**
```bash
npm run ios    # or npm run android
```

## MVP Implementation Checklist

### Phase 1: Core Infrastructure 
- [x] Database schema
- [x] Domain models
- [x] Scheduler service (SM-2)
- [x] Experience templates
- [x] API endpoints

### Phase 2: Basic Functionality
- [ ] Learning moment capture UI
- [ ] Memory object creation (manual)
- [ ] Review experience UI
- [ ] Calendar view with due dates
- [ ] Schedule state visualization

### Phase 3: Enhanced Features
- [ ] AI-assisted content generation
- [ ] Multiple experience types in UI
- [ ] Metacognition dashboard
- [ ] Group features
- [ ] Weekly quests

### Phase 4: Polish
- [ ] Offline support
- [ ] Push notifications for reviews
- [ ] Analytics dashboard
- [ ] A/B testing framework

## API Usage Examples

### Create a Learning Moment
```bash
curl -X POST http://localhost:3000/api/memory/learning-moments \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-123",
    "raw_input": {
      "text": "Spaced repetition is a learning technique"
    },
    "source": "manual"
  }'
```

### Create a Memory Object
```bash
curl -X POST http://localhost:3000/api/memory/memory-objects \
  -H "Content-Type: application/json" \
  -d '{
    "learning_moment_id": "moment-id",
    "owner_id": "user-123",
    "title": "Spaced Repetition",
    "definition": "A learning technique that increases intervals between reviews",
    "intuition": "Like exercising muscles, memory needs spaced practice",
    "examples": ["Anki flashcards", "MNEMOS app"],
    "common_misconceptions": ["More reviews = better"],
    "references": []
  }'
```

### Record a Review
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-123",
    "memory_object_id": "memory-id",
    "experience_type": "free_recall",
    "recall_result": "correct",
    "confidence_score": 85,
    "response_latency_ms": 5000
  }'
```

### Get Due Memories
```bash
curl "http://localhost:3000/api/memory/due?user_id=user-123"
```

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

### Backend
- Use a process manager (PM2, systemd)
- Set up PostgreSQL on a managed service
- Configure environment variables
- Set up reverse proxy (nginx)

### Frontend
- Build for production: `npm run build`
- Deploy to App Store / Play Store
- Configure API endpoint for production

## Next Steps

1. Add authentication (JWT)
2. Implement AI content generation
3. Add group/social features
4. Build analytics dashboard
5. Add offline sync capability

