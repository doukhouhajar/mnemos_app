/**
 * Review API Routes
 */

import { Router, Request, Response } from 'express';
import { ReviewService } from '../../services/review-service';
import { RecallResult } from '@shared/types/domain';

export function createReviewRouter(reviewService: ReviewService): Router {
  const router = Router();

  /**
   * POST /api/reviews
   * Record a review event
   */
  router.post('/', async (req: Request, res: Response) => {
    try {
      const {
        memory_object_id,
        experience_type,
        recall_result,
        confidence_score,
        response_latency_ms,
        metadata,
      } = req.body;

      const userId = req.user?.id || req.body.user_id; // TODO: Get from auth middleware

      if (
        !userId ||
        !memory_object_id ||
        !experience_type ||
        !recall_result ||
        confidence_score === undefined ||
        !response_latency_ms
      ) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Validate recall_result
      if (!['correct', 'incorrect', 'partial'].includes(recall_result)) {
        return res.status(400).json({ error: 'Invalid recall_result' });
      }

      const reviewEvent = await reviewService.recordReview(
        userId,
        memory_object_id,
        experience_type,
        recall_result as RecallResult,
        confidence_score,
        response_latency_ms,
        metadata
      );

      res.status(201).json(reviewEvent);
    } catch (error: any) {
      console.error('Error recording review:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/reviews/:memoryObjectId
   * Get review history for a memory object
   */
  router.get('/:memoryObjectId', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id || req.query.user_id as string;
      const { memoryObjectId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      const reviewHistory = await reviewService.getReviewHistory(userId, memoryObjectId);
      res.json(reviewHistory);
    } catch (error: any) {
      console.error('Error fetching review history:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/reviews/:memoryObjectId/schedule
   * Get schedule state for a memory object
   */
  router.get('/:memoryObjectId/schedule', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id || req.query.user_id as string;
      const { memoryObjectId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      const scheduleState = await reviewService.getScheduleState(userId, memoryObjectId);

      if (!scheduleState) {
        return res.status(404).json({ error: 'Schedule state not found' });
      }

      res.json(scheduleState);
    } catch (error: any) {
      console.error('Error fetching schedule state:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/reviews/:memoryObjectId/experiences
   * Generate experiences for a memory object
   */
  router.get('/:memoryObjectId/experiences', async (req: Request, res: Response) => {
    try {
      const { memoryObjectId } = req.params;
      const count = parseInt(req.query.count as string) || 3;
      const experienceType = req.query.type as string | undefined;

      const experiences = await reviewService.generateExperiences(
        memoryObjectId,
        count,
        experienceType
      );
      res.json(experiences);
    } catch (error: any) {
      console.error('Error generating experiences:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

