/**
 * Memory Service
 * Business logic for memory objects and learning moments
 */

import { query, transaction } from '../db/connection';
import {
  LearningMoment,
  MemoryObject,
  UserId,
  MemoryObjectId,
  LearningMomentId,
} from '@shared/types/domain';
import { SchedulerService } from '../domain/scheduler';

export class MemoryService {
  private scheduler: SchedulerService;

  constructor(scheduler: SchedulerService) {
    this.scheduler = scheduler;
  }

  /**
   * Create a learning moment from user input
   */
  async createLearningMoment(
    userId: UserId,
    rawInput: LearningMoment['raw_input'],
    source: 'manual' | 'ai-assisted' = 'manual'
  ): Promise<LearningMoment> {
    const result = await query<LearningMoment>(
      `INSERT INTO learning_moments (user_id, timestamp, raw_input, source)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, new Date(), JSON.stringify(rawInput), source]
    );

    return this.mapRowToLearningMoment(result.rows[0]);
  }

  /**
   * Create a memory object from a learning moment
   */
  async createMemoryObject(
    learningMomentId: LearningMomentId,
    memoryData: Omit<MemoryObject, 'id' | 'created_at' | 'updated_at'>
  ): Promise<MemoryObject> {
    return await transaction(async (client) => {
      // Create memory object
      const memoryResult = await client.query<MemoryObject>(
        `INSERT INTO memory_objects (
          owner_id, title, definition, intuition, examples,
          common_misconceptions, reference_links, metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          memoryData.owner_id,
          memoryData.title,
          memoryData.definition,
          memoryData.intuition,
          JSON.stringify(memoryData.examples),
          JSON.stringify(memoryData.common_misconceptions),
          JSON.stringify(memoryData.reference_links),
          JSON.stringify(memoryData.metadata || {}),
        ]
      );

      const memoryObject = this.mapRowToMemoryObject(memoryResult.rows[0]);

      // Link learning moment to memory object
      await client.query(
        `UPDATE learning_moments
         SET memory_object_id = $1
         WHERE id = $2`,
        [memoryObject.id, learningMomentId]
      );

      // Initialize schedule state
      const scheduleState = this.scheduler.initializeState(
        memoryObject.id,
        memoryData.owner_id
      );

      await client.query(
        `INSERT INTO schedule_states (
          memory_object_id, user_id, last_reviewed, next_due,
          difficulty, stability, estimated_recall_probability,
          review_count, consecutive_correct, scheduler_version
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          scheduleState.memory_object_id,
          scheduleState.user_id,
          scheduleState.last_reviewed,
          scheduleState.next_due,
          scheduleState.difficulty,
          scheduleState.stability,
          scheduleState.estimated_recall_probability,
          scheduleState.review_count,
          scheduleState.consecutive_correct,
          scheduleState.scheduler_version,
        ]
      );

      return memoryObject;
    });
  }

  /**
   * Get memory objects for a user
   */
  async getUserMemoryObjects(userId: UserId): Promise<MemoryObject[]> {
    const result = await query<MemoryObject>(
      `SELECT * FROM memory_objects WHERE owner_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows.map(row => this.mapRowToMemoryObject(row));
  }

  /**
   * Get a single memory object
   */
  async getMemoryObject(memoryObjectId: MemoryObjectId): Promise<MemoryObject | null> {
    const result = await query<MemoryObject>(
      `SELECT * FROM memory_objects WHERE id = $1`,
      [memoryObjectId]
    );

    if (result.rows.length === 0) return null;
    return this.mapRowToMemoryObject(result.rows[0]);
  }

  /**
   * Get learning moments for a user
   */
  async getUserLearningMoments(userId: UserId): Promise<LearningMoment[]> {
    const result = await query<LearningMoment>(
      `SELECT * FROM learning_moments
       WHERE user_id = $1
       ORDER BY timestamp DESC`,
      [userId]
    );

    return result.rows.map(row => this.mapRowToLearningMoment(row));
  }

  /**
   * Get learning moments for a specific date
   */
  async getLearningMomentsByDate(userId: UserId, date: Date): Promise<LearningMoment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await query<LearningMoment>(
      `SELECT * FROM learning_moments
       WHERE user_id = $1 AND timestamp >= $2 AND timestamp <= $3
       ORDER BY timestamp DESC`,
      [userId, startOfDay, endOfDay]
    );

    return result.rows.map(row => this.mapRowToLearningMoment(row));
  }

  /**
   * Delete a learning moment
   */
  async deleteLearningMoment(learningMomentId: string): Promise<void> {
    const result = await query(
      `DELETE FROM learning_moments WHERE id = $1`,
      [learningMomentId]
    );
    
    if (result.rowCount === 0) {
      throw new Error('Learning moment not found');
    }
  }

  /**
   * Get memories due for review
   */
  async getDueMemories(userId: UserId, atTime: Date = new Date()): Promise<MemoryObject[]> {
    const result = await query<{
      memory_object_id: string;
      next_due: Date;
    }>(
      `SELECT memory_object_id, next_due
       FROM schedule_states
       WHERE user_id = $1 AND next_due <= $2
       ORDER BY next_due ASC`,
      [userId, atTime]
    );

    if (result.rows.length === 0) return [];

    const memoryIds = result.rows.map(row => row.memory_object_id);
    const placeholders = memoryIds.map((_, i) => `$${i + 1}`).join(', ');

    const memoriesResult = await query<MemoryObject>(
      `SELECT * FROM memory_objects WHERE id IN (${placeholders})`,
      memoryIds
    );

    return memoriesResult.rows.map(row => this.mapRowToMemoryObject(row));
  }

  private mapRowToLearningMoment(row: any): LearningMoment {
    return {
      ...row,
      raw_input: typeof row.raw_input === 'string' ? JSON.parse(row.raw_input) : row.raw_input,
      timestamp: new Date(row.timestamp),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  private mapRowToMemoryObject(row: any): MemoryObject {
    return {
      ...row,
      examples: typeof row.examples === 'string' ? JSON.parse(row.examples) : row.examples,
      common_misconceptions:
        typeof row.common_misconceptions === 'string'
          ? JSON.parse(row.common_misconceptions)
          : row.common_misconceptions,
      reference_links:
        typeof row.reference_links === 'string' ? JSON.parse(row.reference_links) : row.reference_links,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata || {},
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  /**
   * Update a memory object
   */
  async updateMemoryObject(
    memoryObjectId: MemoryObjectId,
    updates: Partial<Omit<MemoryObject, 'id' | 'owner_id' | 'created_at' | 'updated_at'>>
  ): Promise<MemoryObject> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(updates.title);
    }
    if (updates.definition !== undefined) {
      fields.push(`definition = $${paramIndex++}`);
      values.push(updates.definition);
    }
    if (updates.intuition !== undefined) {
      fields.push(`intuition = $${paramIndex++}`);
      values.push(updates.intuition);
    }
    if (updates.examples !== undefined) {
      fields.push(`examples = $${paramIndex++}`);
      values.push(JSON.stringify(updates.examples));
    }
    if (updates.common_misconceptions !== undefined) {
      fields.push(`common_misconceptions = $${paramIndex++}`);
      values.push(JSON.stringify(updates.common_misconceptions));
    }
    if (updates.reference_links !== undefined) {
      fields.push(`reference_links = $${paramIndex++}`);
      values.push(JSON.stringify(updates.reference_links));
    }
    if (updates.metadata !== undefined) {
      fields.push(`metadata = $${paramIndex++}`);
      values.push(JSON.stringify(updates.metadata));
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(memoryObjectId);

    const result = await query<MemoryObject>(
      `UPDATE memory_objects
       SET ${fields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Memory object not found');
    }

    return this.mapRowToMemoryObject(result.rows[0]);
  }

  /**
   * Delete a memory object
   */
  async deleteMemoryObject(memoryObjectId: MemoryObjectId): Promise<void> {
    await query(
      `DELETE FROM memory_objects WHERE id = $1`,
      [memoryObjectId]
    );
  }

  /**
   * Duplicate a memory object
   */
  async duplicateMemoryObject(
    memoryObjectId: MemoryObjectId,
    newOwnerId: UserId
  ): Promise<MemoryObject> {
    const original = await this.getMemoryObject(memoryObjectId);
    if (!original) {
      throw new Error('Memory object not found');
    }

    // Create new learning moment for the duplicate
    const learningMomentResult = await query<LearningMoment>(
      `INSERT INTO learning_moments (user_id, timestamp, raw_input, source)
       VALUES ($1, CURRENT_TIMESTAMP, $2, 'manual')
       RETURNING *`,
      [
        newOwnerId,
        JSON.stringify({ text: `Duplicate of: ${original.title}` }),
      ]
    );

    const learningMoment = this.mapRowToLearningMoment(learningMomentResult.rows[0]);

    // Create duplicate memory object
    return await this.createMemoryObject(learningMoment.id, {
      owner_id: newOwnerId,
      title: `${original.title} (Copy)`,
      definition: original.definition,
      intuition: original.intuition,
      examples: original.examples,
      common_misconceptions: original.common_misconceptions,
      reference_links: original.reference_links,
      metadata: { ...original.metadata, duplicated_from: memoryObjectId },
    });
  }
}

