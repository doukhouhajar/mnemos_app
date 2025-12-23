/**
 * Custom Error Classes
 */

export class MemoryNotFoundError extends Error {
  constructor(memoryObjectId: string) {
    super(`Memory object not found: ${memoryObjectId}`);
    this.name = 'MemoryNotFoundError';
  }
}

export class ScheduleStateNotFoundError extends Error {
  constructor(memoryObjectId: string, userId: string) {
    super(`Schedule state not found for memory ${memoryObjectId} and user ${userId}`);
    this.name = 'ScheduleStateNotFoundError';
  }
}

export class InvalidRecallResultError extends Error {
  constructor(result: string) {
    super(`Invalid recall result: ${result}. Must be 'correct', 'incorrect', or 'partial'`);
    this.name = 'InvalidRecallResultError';
  }
}

