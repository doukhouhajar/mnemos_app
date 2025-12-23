/**
 * Group Service
 * Business logic for learning groups
 */

import { query } from '../db/connection';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  members: string[];
  shared_memory_objects: string[];
  created_at: Date;
  updated_at: Date;
}

export class GroupService {
  /**
   * Create a new group
   */
  async createGroup(
    ownerId: string,
    name: string,
    description?: string
  ): Promise<Group> {
    const result = await query<Group>(
      `INSERT INTO groups (owner_id, name, description, members)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        ownerId,
        name,
        description || null,
        JSON.stringify([ownerId]), // Owner is automatically a member
      ]
    );

    return this.mapRowToGroup(result.rows[0]);
  }

  /**
   * Get groups for a user (where user is owner or member)
   */
  async getUserGroups(userId: string): Promise<Group[]> {
    const result = await query<Group>(
      `SELECT * FROM groups
       WHERE owner_id = $1 OR members @> $2::jsonb
       ORDER BY created_at DESC`,
      [userId, JSON.stringify([userId])]
    );

    return result.rows.map(row => this.mapRowToGroup(row));
  }

  /**
   * Get a specific group
   */
  async getGroup(groupId: string): Promise<Group | null> {
    const result = await query<Group>(
      `SELECT * FROM groups WHERE id = $1`,
      [groupId]
    );

    if (result.rows.length === 0) return null;
    return this.mapRowToGroup(result.rows[0]);
  }

  /**
   * Join a group
   */
  async joinGroup(groupId: string, userId: string): Promise<Group> {
    const group = await this.getGroup(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    if (group.members.includes(userId)) {
      return group; // Already a member
    }

    const updatedMembers = [...group.members, userId];
    const result = await query<Group>(
      `UPDATE groups
       SET members = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(updatedMembers), groupId]
    );

    return this.mapRowToGroup(result.rows[0]);
  }

  /**
   * Leave a group
   */
  async leaveGroup(groupId: string, userId: string): Promise<Group> {
    const group = await this.getGroup(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    if (group.owner_id === userId) {
      throw new Error('Group owner cannot leave the group');
    }

    const updatedMembers = group.members.filter(id => id !== userId);
    const result = await query<Group>(
      `UPDATE groups
       SET members = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(updatedMembers), groupId]
    );

    return this.mapRowToGroup(result.rows[0]);
  }

  /**
   * Get group members with user details
   */
  async getGroupMembers(groupId: string): Promise<Array<{ id: string; name: string; email: string }>> {
    const group = await this.getGroup(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    if (group.members.length === 0) {
      return [];
    }

    const result = await query<{ id: string; name: string; email: string }>(
      `SELECT id, name, email FROM users WHERE id = ANY($1::uuid[])`,
      [group.members]
    );

    return result.rows;
  }

  /**
   * Search users by email
   */
  async searchUsers(emailQuery: string, limit: number = 10): Promise<Array<{ id: string; name: string; email: string }>> {
    const result = await query<{ id: string; name: string; email: string }>(
      `SELECT id, name, email FROM users 
       WHERE email ILIKE $1 OR name ILIKE $1
       LIMIT $2`,
      [`%${emailQuery}%`, limit]
    );

    return result.rows;
  }

  /**
   * Add member to group
   */
  async addMember(groupId: string, userId: string): Promise<Group> {
    return await this.joinGroup(groupId, userId);
  }

  /**
   * Share memory object with group
   */
  async shareMemoryObject(groupId: string, memoryObjectId: string): Promise<Group> {
    const group = await this.getGroup(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    if (group.shared_memory_objects.includes(memoryObjectId)) {
      return group; // Already shared
    }

    const updatedShared = [...group.shared_memory_objects, memoryObjectId];
    const result = await query<Group>(
      `UPDATE groups
       SET shared_memory_objects = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(updatedShared), groupId]
    );

    return this.mapRowToGroup(result.rows[0]);
  }

  /**
   * Unshare memory object from group
   */
  async unshareMemoryObject(groupId: string, memoryObjectId: string): Promise<Group> {
    const group = await this.getGroup(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    const updatedShared = group.shared_memory_objects.filter(id => id !== memoryObjectId);
    const result = await query<Group>(
      `UPDATE groups
       SET shared_memory_objects = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(updatedShared), groupId]
    );

    return this.mapRowToGroup(result.rows[0]);
  }

  private mapRowToGroup(row: any): Group {
    return {
      ...row,
      members: typeof row.members === 'string' ? JSON.parse(row.members) : row.members,
      shared_memory_objects: typeof row.shared_memory_objects === 'string'
        ? JSON.parse(row.shared_memory_objects)
        : row.shared_memory_objects,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}

