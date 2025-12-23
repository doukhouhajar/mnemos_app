/**
 * Scheduler Types and Interfaces
 * Pluggable scheduler system for different spaced repetition algorithms
 */

import { ScheduleState, RecallResult } from '@shared/types/domain';

export interface SchedulerAlgorithm {
  /**
   * Calculate the next review date and update schedule state
   * based on the current review result
   */
  calculateNextReview(
    currentState: ScheduleState,
    recallResult: RecallResult,
    responseLatencyMs: number,
    confidenceScore: number
  ): ScheduleState;

  /**
   * Estimate recall probability at a given time
   */
  estimateRecallProbability(
    state: ScheduleState,
    atTime: Date
  ): number;

  /**
   * Get the scheduler version identifier
   */
  getVersion(): string;
}

export interface SchedulerConfig {
  targetRecallProbability: number; // Default: 0.9 (90%)
  minIntervalDays: number; // Minimum days between reviews
  maxIntervalDays: number; // Maximum interval cap
  easeFactorMin: number; // Minimum ease factor
  easeFactorMax: number; // Maximum ease factor
}

export const DEFAULT_SCHEDULER_CONFIG: SchedulerConfig = {
  targetRecallProbability: 0.9,
  minIntervalDays: 1,
  maxIntervalDays: 365,
  easeFactorMin: 1.3,
  easeFactorMax: 2.5,
};

