/**
 * SM-2 Algorithm Implementation
 * Simplified version of SuperMemo 2 algorithm
 * 
 * This is the MVP scheduler. Can be upgraded to more sophisticated
 * probabilistic models later.
 */

import { ScheduleState, RecallResult } from '@shared/types/domain';
import { SchedulerAlgorithm, SchedulerConfig, DEFAULT_SCHEDULER_CONFIG } from './types';

export class SM2Scheduler implements SchedulerAlgorithm {
  private config: SchedulerConfig;

  constructor(config: Partial<SchedulerConfig> = {}) {
    this.config = { ...DEFAULT_SCHEDULER_CONFIG, ...config };
  }

  getVersion(): string {
    return 'sm2-v1';
  }

  calculateNextReview(
    currentState: ScheduleState,
    recallResult: RecallResult,
    responseLatencyMs: number,
    confidenceScore: number
  ): ScheduleState {
    const now = new Date();
    let newDifficulty = currentState.difficulty;
    let newStability = currentState.stability;
    let newReviewCount = currentState.review_count;
    let newConsecutiveCorrect = currentState.consecutive_correct;

    // Calculate quality score (0-5 scale, mapped from recall result)
    const quality = this.mapRecallResultToQuality(recallResult, confidenceScore);

    // Update difficulty based on performance
    newDifficulty = this.updateDifficulty(currentState.difficulty, quality);

    // Calculate new interval based on SM-2 formula
    let interval: number;
    if (quality < 3) {
      // Incorrect or partial - reset or reduce interval
      newConsecutiveCorrect = 0;
      if (currentState.review_count === 0) {
        interval = 1; // First review: 1 day
      } else {
        interval = Math.max(1, currentState.stability * 0.5);
      }
    } else {
      // Correct response
      newConsecutiveCorrect = currentState.consecutive_correct + 1;
      
      if (currentState.review_count === 0) {
        interval = 1;
      } else if (currentState.review_count === 1) {
        interval = 6;
      } else {
        // SM-2 formula: interval = previous_interval * ease_factor
        const easeFactor = this.calculateEaseFactor(newDifficulty);
        interval = currentState.stability * easeFactor;
      }
    }

    // Apply constraints
    interval = Math.max(this.config.minIntervalDays, interval);
    interval = Math.min(this.config.maxIntervalDays, interval);

    newStability = interval;
    newReviewCount = currentState.review_count + 1;

    // Calculate next due date
    const nextDue = new Date(now);
    nextDue.setDate(nextDue.getDate() + Math.round(interval));

    // Estimate recall probability (simplified - will be improved in v2)
    const estimatedRecallProbability = this.estimateRecallProbabilityAtTime(
      {
        ...currentState,
        difficulty: newDifficulty,
        stability: newStability,
        next_due: nextDue,
      },
      nextDue
    );

    return {
      ...currentState,
      last_reviewed: now,
      next_due: nextDue,
      difficulty: newDifficulty,
      stability: newStability,
      estimated_recall_probability: estimatedRecallProbability,
      review_count: newReviewCount,
      consecutive_correct: newConsecutiveCorrect,
      scheduler_version: this.getVersion(),
      updated_at: now,
    };
  }

  estimateRecallProbability(
    state: ScheduleState,
    atTime: Date
  ): number {
    return this.estimateRecallProbabilityAtTime(state, atTime);
  }

  private estimateRecallProbabilityAtTime(
    state: ScheduleState,
    atTime: Date
  ): number {
    if (!state.last_reviewed) {
      return 0.5; // Unknown state
    }

    const daysSinceReview = (atTime.getTime() - state.last_reviewed.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceReview <= 0) {
      return 0.95; // Just reviewed
    }

    // Simplified forgetting curve: P(recall) = e^(-days/stability)
    // Adjusted by difficulty
    const baseRecall = Math.exp(-daysSinceReview / (state.stability * (1 + state.difficulty)));
    
    // Clamp between 0 and 1
    return Math.max(0, Math.min(1, baseRecall));
  }

  private mapRecallResultToQuality(
    recallResult: RecallResult,
    confidenceScore: number
  ): number {
    // Map recall result to SM-2 quality scale (0-5)
    switch (recallResult) {
      case 'correct':
        // High confidence = 5, medium = 4
        return confidenceScore >= 80 ? 5 : 4;
      case 'partial':
        return 2;
      case 'incorrect':
        return 0;
    }
  }

  private updateDifficulty(currentDifficulty: number, quality: number): number {
    // SM-2 difficulty adjustment
    // Quality 0-2: increase difficulty
    // Quality 3-5: decrease difficulty
    let newDifficulty = currentDifficulty;
    
    if (quality < 3) {
      newDifficulty += 0.1 - (3 - quality) * 0.08;
    } else {
      newDifficulty -= (quality - 3) * 0.05;
    }

    // Clamp between 0 and 1
    return Math.max(0, Math.min(1, newDifficulty));
  }

  private calculateEaseFactor(difficulty: number): number {
    // Ease factor decreases as difficulty increases
    // Range: 1.3 to 2.5
    const range = this.config.easeFactorMax - this.config.easeFactorMin;
    return this.config.easeFactorMax - (difficulty * range);
  }
}

