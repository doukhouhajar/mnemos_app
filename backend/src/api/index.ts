/**
 * Main API Server
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { MemoryService } from '../services/memory-service';
import { ReviewService } from '../services/review-service';
import { AIService } from '../services/ai-service';
import { SchedulerService } from '../domain/scheduler';
import { ExperienceGenerator } from '../domain/experiences/generator';
import { createMemoryRouter } from './routes/memory';
import { createReviewRouter } from './routes/reviews';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (configure for production)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize services
const schedulerService = new SchedulerService();
const experienceGenerator = new ExperienceGenerator();
const memoryService = new MemoryService(schedulerService);
const aiService = new AIService();
const reviewService = new ReviewService(
  schedulerService,
  experienceGenerator,
  memoryService
);

// Routes
app.use('/api/memory', createMemoryRouter(memoryService, reviewService, aiService));
app.use('/api/reviews', createReviewRouter(reviewService));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`MNEMOS API server running on port ${PORT}`);
  });
}

export default app;

