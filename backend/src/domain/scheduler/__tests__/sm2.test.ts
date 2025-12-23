/**
 * Unit tests for SM-2 Scheduler
 */

import { SM2Scheduler } from '../sm2';
import { ScheduleState, RecallResult } from '@shared/types/domain';

describe('SM2Scheduler', () => {
  let scheduler: SM2Scheduler;

  beforeEach(() => {
    scheduler = new SM2Scheduler();
  });

  describe('calculateNextReview', () => {
    it('should initialize first review correctly', () => {
      const initialState: ScheduleState = {
        memory_object_id: 'mem-1',
        user_id: 'user-1',
        last_reviewed: null,
        next_due: new Date(),
        difficulty: 0.3,
        stability: 1.0,
        estimated_recall_probability: 0.5,
        review_count: 0,
        consecutive_correct: 0,
        scheduler_version: 'sm2-v1',
        updated_at: new Date(),
      };

      const newState = scheduler.calculateNextReview(
        initialState,
        'correct',
        5000,
        80
      );

      expect(newState.review_count).toBe(1);
      expect(newState.consecutive_correct).toBe(1);
      expect(newState.last_reviewed).not.toBeNull();
    });

    it('should increase interval after correct review', () => {
      const initialState: ScheduleState = {
        memory_object_id: 'mem-1',
        user_id: 'user-1',
        last_reviewed: new Date(Date.now() - 86400000), // 1 day ago
        next_due: new Date(),
        difficulty: 0.3,
        stability: 6.0,
        estimated_recall_probability: 0.9,
        review_count: 1,
        consecutive_correct: 1,
        scheduler_version: 'sm2-v1',
        updated_at: new Date(),
      };

      const newState = scheduler.calculateNextReview(
        initialState,
        'correct',
        4000,
        90
      );

      expect(newState.stability).toBeGreaterThan(initialState.stability);
      expect(newState.review_count).toBe(2);
    });

    it('should reset interval after incorrect review', () => {
      const initialState: ScheduleState = {
        memory_object_id: 'mem-1',
        user_id: 'user-1',
        last_reviewed: new Date(Date.now() - 86400000),
        next_due: new Date(),
        difficulty: 0.3,
        stability: 10.0,
        estimated_recall_probability: 0.9,
        review_count: 5,
        consecutive_correct: 5,
        scheduler_version: 'sm2-v1',
        updated_at: new Date(),
      };

      const newState = scheduler.calculateNextReview(
        initialState,
        'incorrect',
        10000,
        30
      );

      expect(newState.stability).toBeLessThan(initialState.stability);
      expect(newState.consecutive_correct).toBe(0);
    });
  });

  describe('estimateRecallProbability', () => {
    it('should return high probability for recently reviewed memory', () => {
      const state: ScheduleState = {
        memory_object_id: 'mem-1',
        user_id: 'user-1',
        last_reviewed: new Date(Date.now() - 3600000), // 1 hour ago
        next_due: new Date(),
        difficulty: 0.3,
        stability: 10.0,
        estimated_recall_probability: 0.9,
        review_count: 5,
        consecutive_correct: 5,
        scheduler_version: 'sm2-v1',
        updated_at: new Date(),
      };

      const probability = scheduler.estimateRecallProbability(state, new Date());
      expect(probability).toBeGreaterThan(0.8);
    });

    it('should return lower probability for long-unreviewed memory', () => {
      const state: ScheduleState = {
        memory_object_id: 'mem-1',
        user_id: 'user-1',
        last_reviewed: new Date(Date.now() - 30 * 86400000), // 30 days ago
        next_due: new Date(),
        difficulty: 0.3,
        stability: 10.0,
        estimated_recall_probability: 0.9,
        review_count: 5,
        consecutive_correct: 5,
        scheduler_version: 'sm2-v1',
        updated_at: new Date(),
      };

      const probability = scheduler.estimateRecallProbability(state, new Date());
      expect(probability).toBeLessThan(0.5);
    });
  });

  describe('getVersion', () => {
    it('should return correct version string', () => {
      expect(scheduler.getVersion()).toBe('sm2-v1');
    });
  });
});

