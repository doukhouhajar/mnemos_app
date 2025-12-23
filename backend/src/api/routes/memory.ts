/**
 * Memory API Routes
 */

import { Router, Request, Response } from 'express';
import { MemoryService } from '../../services/memory-service';
import { ReviewService } from '../../services/review-service';
import { ExperienceGenerator } from '../../domain/experiences/generator';
import { AIService } from '../../services/ai-service';

export function createMemoryRouter(
  memoryService: MemoryService,
  reviewService: ReviewService,
  aiService?: AIService
): Router {
  const router = Router();

  /**
   * POST /api/memory/learning-moments
   * Create a new learning moment
   */
  router.post('/learning-moments', async (req: Request, res: Response) => {
    try {
      const { raw_input, source } = req.body;
      const userId = req.user?.id || req.body.user_id; // TODO: Get from auth middleware

      if (!userId || !raw_input) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const learningMoment = await memoryService.createLearningMoment(
        userId,
        raw_input,
        source || 'manual'
      );

      res.status(201).json(learningMoment);
    } catch (error: any) {
      console.error('Error creating learning moment:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/memory/memory-objects
   * Create a memory object from a learning moment
   */
  router.post('/memory-objects', async (req: Request, res: Response) => {
    try {
      const { learning_moment_id, ...memoryData } = req.body;

      if (!learning_moment_id) {
        return res.status(400).json({ error: 'learning_moment_id is required' });
      }

      const memoryObject = await memoryService.createMemoryObject(
        learning_moment_id,
        memoryData
      );

      res.status(201).json(memoryObject);
    } catch (error: any) {
      console.error('Error creating memory object:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/memory/memory-objects
   * Get user's memory objects
   */
  router.get('/memory-objects', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id || req.query.user_id as string;

      if (!userId) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      const memoryObjects = await memoryService.getUserMemoryObjects(userId);
      res.json(memoryObjects);
    } catch (error: any) {
      console.error('Error fetching memory objects:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/memory/memory-objects/:id
   * Get a specific memory object
   */
  router.get('/memory-objects/:id', async (req: Request, res: Response) => {
    try {
      const memoryObject = await memoryService.getMemoryObject(req.params.id);

      if (!memoryObject) {
        return res.status(404).json({ error: 'Memory object not found' });
      }

      res.json(memoryObject);
    } catch (error: any) {
      console.error('Error fetching memory object:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/memory/due
   * Get memories due for review
   */
  router.get('/due', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id || req.query.user_id as string;

      if (!userId) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      const dueMemories = await memoryService.getDueMemories(userId);
      res.json(dueMemories);
    } catch (error: any) {
      console.error('Error fetching due memories:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/memory/learning-moments
   * Get user's learning moments
   * Optional query params: date (YYYY-MM-DD) to filter by date
   */
  router.get('/learning-moments', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id || req.query.user_id as string;
      const dateParam = req.query.date as string;

      if (!userId) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      let learningMoments;
      if (dateParam) {
        const date = new Date(dateParam);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        }
        learningMoments = await memoryService.getLearningMomentsByDate(userId, date);
      } else {
        learningMoments = await memoryService.getUserLearningMoments(userId);
      }

      res.json(learningMoments);
    } catch (error: any) {
      console.error('Error fetching learning moments:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/memory/ai-structure
   * Use AI to structure a learning moment into a memory object
   */
  router.post('/ai-structure', async (req: Request, res: Response) => {
    try {
      if (!aiService || !aiService.isAvailable()) {
        return res.status(503).json({ error: 'AI service is not available. Please set OPENAI_API_KEY.' });
      }

      const { raw_input } = req.body;

      if (!raw_input || !raw_input.text) {
        return res.status(400).json({ error: 'raw_input.text is required' });
      }

      const structured = await aiService.structureLearningMoment(raw_input.text);
      res.json(structured);
    } catch (error: any) {
      console.error('Error structuring with AI:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

