/**
 * Scheduler Service
 * Main entry point for scheduling operations
 */

import { ScheduleState, RecallResult } from '@shared/types/domain';
import { SchedulerAlgorithm } from './types';
import { SM2Scheduler } from './sm2';

export class SchedulerService {
  private scheduler: SchedulerAlgorithm;

  constructor(scheduler?: SchedulerAlgorithm) {
    this.scheduler = scheduler || new SM2Scheduler();
  }

  /**
   * Process a review event and update the schedule state
   */
  processReview(
    currentState: ScheduleState,
    recallResult: RecallResult,
    responseLatencyMs: number,
    confidenceScore: number
  ): ScheduleState {
    return this.scheduler.calculateNextReview(
      currentState,
      recallResult,
      responseLatencyMs,
      confidenceScore
    );
  }

  /**
   * Get the estimated recall probability for a memory at a given time
   */
  getRecallProbability(state: ScheduleState, atTime: Date = new Date()): number {
    return this.scheduler.estimateRecallProbability(state, atTime);
  }

  /**
   * Check if a memory is due for review
   */
  isDue(state: ScheduleState, atTime: Date = new Date()): boolean {
    return new Date(state.next_due) <= atTime;
  }

  /**
   * Get memories due for review for a user
   */
  getDueMemories(states: ScheduleState[], atTime: Date = new Date()): ScheduleState[] {
    return states.filter(state => this.isDue(state, atTime));
  }

  /**
   * Initialize schedule state for a new memory
   */
  initializeState(
    memoryObjectId: string,
    userId: string,
    initialDifficulty: number = 0.3
  ): ScheduleState {
    const now = new Date();
    const nextDue = new Date(now);
    nextDue.setDate(nextDue.getDate() + 1); // First review in 1 day

    return {
      memory_object_id: memoryObjectId,
      user_id: userId,
      last_reviewed: null,
      next_due: nextDue,
      difficulty: initialDifficulty,
      stability: 1.0,
      estimated_recall_probability: 0.5,
      review_count: 0,
      consecutive_correct: 0,
      scheduler_version: this.scheduler.getVersion(),
      updated_at: now,
    };
  }

  /**
   * Set a custom scheduler algorithm
   */
  setScheduler(scheduler: SchedulerAlgorithm): void {
    this.scheduler = scheduler;
  }

  /**
   * Get current scheduler version
   */
  getSchedulerVersion(): string {
    return this.scheduler.getVersion();
  }
}

