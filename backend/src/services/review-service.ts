/**
 * Review Service
 * Handles review events and schedule updates
 */

import { query, transaction } from '../db/connection';
import {
  ReviewEvent,
  ScheduleState,
  RecallResult,
  UserId,
  MemoryObjectId,
} from '@shared/types/domain';
import { SchedulerService } from '../domain/scheduler';
import { ExperienceGenerator } from '../domain/experiences/generator';
import { MemoryService } from './memory-service';

export class ReviewService {
  private scheduler: SchedulerService;
  private experienceGenerator: ExperienceGenerator;
  private memoryService: MemoryService;

  constructor(
    scheduler: SchedulerService,
    experienceGenerator: ExperienceGenerator,
    memoryService: MemoryService
  ) {
    this.scheduler = scheduler;
    this.experienceGenerator = experienceGenerator;
    this.memoryService = memoryService;
  }

  /**
   * Record a review event and update schedule
   */
  async recordReview(
    userId: UserId,
    memoryObjectId: MemoryObjectId,
    experienceType: string,
    recallResult: RecallResult,
    confidenceScore: number,
    responseLatencyMs: number,
    metadata?: any
  ): Promise<ReviewEvent> {
    return await transaction(async (client) => {
      // Get current schedule state
      const stateResult = await client.query<ScheduleState>(
        `SELECT * FROM schedule_states
         WHERE memory_object_id = $1 AND user_id = $2`,
        [memoryObjectId, userId]
      );

      if (stateResult.rows.length === 0) {
        throw new Error('Schedule state not found');
      }

      const currentState = this.mapRowToScheduleState(stateResult.rows[0]);

      // Calculate new schedule state
      const newState = this.scheduler.processReview(
        currentState,
        recallResult,
        responseLatencyMs,
        confidenceScore
      );

      // Update schedule state
      await client.query(
        `UPDATE schedule_states
         SET last_reviewed = $1, next_due = $2, difficulty = $3,
             stability = $4, estimated_recall_probability = $5,
             review_count = $6, consecutive_correct = $7,
             scheduler_version = $8, updated_at = $9
         WHERE memory_object_id = $10 AND user_id = $11`,
        [
          newState.last_reviewed,
          newState.next_due,
          newState.difficulty,
          newState.stability,
          newState.estimated_recall_probability,
          newState.review_count,
          newState.consecutive_correct,
          newState.scheduler_version,
          newState.updated_at,
          memoryObjectId,
          userId,
        ]
      );

      // Create review event
      const reviewResult = await client.query<ReviewEvent>(
        `INSERT INTO review_events (
          memory_object_id, user_id, timestamp, experience_type,
          recall_result, confidence_score, response_latency_ms, metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          memoryObjectId,
          userId,
          new Date(),
          experienceType,
          recallResult,
          confidenceScore,
          responseLatencyMs,
          JSON.stringify(metadata || {}),
        ]
      );

      // Update metacognition metrics (async, non-blocking)
      this.updateMetacognitionMetrics(userId, memoryObjectId, recallResult, confidenceScore)
        .catch(err => console.error('Failed to update metacognition metrics', err));

      return this.mapRowToReviewEvent(reviewResult.rows[0]);
    });
  }

  /**
   * Get review history for a memory object
   */
  async getReviewHistory(
    userId: UserId,
    memoryObjectId: MemoryObjectId
  ): Promise<ReviewEvent[]> {
    const result = await query<ReviewEvent>(
      `SELECT * FROM review_events
       WHERE user_id = $1 AND memory_object_id = $2
       ORDER BY timestamp DESC`,
      [userId, memoryObjectId]
    );

    return result.rows.map(row => this.mapRowToReviewEvent(row));
  }

  /**
   * Get schedule state for a memory object
   */
  async getScheduleState(
    userId: UserId,
    memoryObjectId: MemoryObjectId
  ): Promise<ScheduleState | null> {
    const result = await query<ScheduleState>(
      `SELECT * FROM schedule_states
       WHERE user_id = $1 AND memory_object_id = $2`,
      [userId, memoryObjectId]
    );

    if (result.rows.length === 0) return null;
    return this.mapRowToScheduleState(result.rows[0]);
  }

  /**
   * Generate experiences for a memory object
   */
  async generateExperiences(memoryObjectId: MemoryObjectId, count: number = 3) {
    const memoryObject = await this.memoryService.getMemoryObject(memoryObjectId);
    if (!memoryObject) {
      throw new Error('Memory object not found');
    }

    return this.experienceGenerator.generateExperienceSet(memoryObject, count);
  }

  /**
   * Update metacognition metrics
   */
  private async updateMetacognitionMetrics(
    userId: UserId,
    memoryObjectId: MemoryObjectId,
    recallResult: RecallResult,
    confidenceScore: number
  ): Promise<void> {
    // Get existing metrics
    const existingResult = await query(
      `SELECT * FROM metacognition_metrics
       WHERE user_id = $1 AND memory_object_id = $2`,
      [userId, memoryObjectId]
    );

    const actualAccuracy = recallResult === 'correct' ? 1.0 : recallResult === 'partial' ? 0.5 : 0.0;
    const normalizedConfidence = confidenceScore / 100.0;
    const calibrationError = Math.abs(actualAccuracy - normalizedConfidence);

    if (existingResult.rows.length === 0) {
      // Create new metrics
      await query(
        `INSERT INTO metacognition_metrics (
          user_id, memory_object_id, recall_accuracy, average_confidence,
          calibration_error, overconfidence_count, underconfidence_count
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          memoryObjectId,
          actualAccuracy,
          normalizedConfidence,
          calibrationError,
          normalizedConfidence > actualAccuracy ? 1 : 0,
          normalizedConfidence < actualAccuracy ? 1 : 0,
        ]
      );
    } else {
      // Update existing metrics (exponential moving average)
      const existing = existingResult.rows[0];
      const alpha = 0.3; // Smoothing factor

      const newAccuracy = existing.recall_accuracy * (1 - alpha) + actualAccuracy * alpha;
      const newConfidence =
        existing.average_confidence * (1 - alpha) + normalizedConfidence * alpha;
      const newCalibrationError = Math.abs(newAccuracy - newConfidence);

      await query(
        `UPDATE metacognition_metrics
         SET recall_accuracy = $1, average_confidence = $2,
             calibration_error = $3,
             overconfidence_count = $4,
             underconfidence_count = $5,
             updated_at = $6
         WHERE user_id = $7 AND memory_object_id = $8`,
        [
          newAccuracy,
          newConfidence,
          newCalibrationError,
          normalizedConfidence > actualAccuracy
            ? existing.overconfidence_count + 1
            : existing.overconfidence_count,
          normalizedConfidence < actualAccuracy
            ? existing.underconfidence_count + 1
            : existing.underconfidence_count,
          new Date(),
          userId,
          memoryObjectId,
        ]
      );
    }
  }

  private mapRowToReviewEvent(row: any): ReviewEvent {
    return {
      ...row,
      timestamp: new Date(row.timestamp),
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata || {},
      created_at: new Date(row.created_at),
    };
  }

  private mapRowToScheduleState(row: any): ScheduleState {
    return {
      ...row,
      last_reviewed: row.last_reviewed ? new Date(row.last_reviewed) : null,
      next_due: new Date(row.next_due),
      updated_at: new Date(row.updated_at),
    };
  }
}

