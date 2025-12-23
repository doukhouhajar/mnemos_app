# MNEMOS Design Decisions

## Why SM-2 for MVP?

SM-2 is a proven, simple algorithm that provides good results with minimal complexity. It's deterministic and auditable, which aligns with our requirement for transparent scheduling logic. The pluggable architecture allows us to upgrade to more sophisticated probabilistic models (like FSRS) later without changing the API.

## Calendar-Native UX

Traditional flashcard apps show a list of cards. MNEMOS uses a calendar because:
1. Memory is time-dependent - reviews are scheduled on specific days
2. Users naturally think about learning in terms of "what do I need to review today?"
3. Calendar view makes it easy to see learning patterns and streaks
4. Integrates naturally with daily routines

## Experience Types vs Simple Quizzes

MNEMOS uses multiple experience types (free recall, application, etc.) because:
1. **Variety improves retention** - different retrieval paths strengthen memory
2. **Transfer learning** - application questions test understanding, not just recall
3. **Metacognition** - different experiences reveal different aspects of understanding
4. **Engagement** - variety keeps the experience fresh

## Separation of AI and Core Logic

AI is used ONLY for:
- Content generation (structuring raw input into MemoryObjects)
- Generating experience prompts
- Creating question variants

Scheduling, scoring, and state management remain deterministic and testable. This ensures:
- Reproducible results
- No "black box" behavior
- Easy debugging
- User trust

## Offline-First Design

Memory review should work even without internet:
- Capture learning moments offline
- Queue reviews for sync
- Cache schedule states locally
- Sync when connection is available

## Group Features Philosophy

Group learning focuses on:
- **Quality over quantity** - difficulty-adjusted scoring prevents gaming
- **Collaboration** - relay challenges encourage teaching (which reinforces learning)
- **Social accountability** - weekly quests create positive peer pressure

Not about:
- Leaderboards based on volume
- Competitive pressure that reduces learning quality
- Gamification that distracts from actual learning

## Database Schema Choices

### JSONB for Flexible Fields
- `raw_input`, `metadata`, `examples` use JSONB for flexibility
- Allows schema evolution without migrations
- PostgreSQL JSONB is performant and queryable

### Separate Schedule States Table
- One schedule state per user-memory pair
- Allows different users to have different review schedules for shared memories
- Enables group features where multiple users review the same content

### Review Events as Audit Trail
- Every review is recorded with full context
- Enables analytics and experimentation
- Supports future ML models that learn from review patterns

## Testing Strategy

### Unit Tests
- Domain logic (scheduler, experiences) - pure functions, easy to test
- No database dependencies

### Integration Tests
- Services with database
- API endpoints with test database

### E2E Tests
- Full user flows
- Calendar interactions
- Review completion

## Future Upgrade Paths

1. **Scheduler**: SM-2 → FSRS → Custom probabilistic model
2. **Scoring**: Keyword matching → NLP → AI-assisted (with human override)
3. **Experiences**: Template-based → AI-generated variants → Adaptive difficulty
4. **Analytics**: Basic metrics → Predictive models → Personalized recommendations

