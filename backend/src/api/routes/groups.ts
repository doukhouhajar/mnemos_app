/**
 * Groups API Routes
 */

import { Router, Request, Response } from 'express';
import { GroupService } from '../../services/group-service';

export function createGroupsRouter(groupService: GroupService): Router {
  const router = Router();

  /**
   * POST /api/groups
   * Create a new group
   */
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;
      const userId = req.user?.id || req.body.user_id;

      if (!userId || !name) {
        return res.status(400).json({ error: 'user_id and name are required' });
      }

      const group = await groupService.createGroup(userId, name, description);
      res.status(201).json(group);
    } catch (error: any) {
      console.error('Error creating group:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/groups
   * Get user's groups
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id || req.query.user_id as string;

      if (!userId) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      const groups = await groupService.getUserGroups(userId);
      res.json(groups);
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/groups/:id
   * Get a specific group
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const group = await groupService.getGroup(req.params.id);

      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      res.json(group);
    } catch (error: any) {
      console.error('Error fetching group:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/groups/:id/join
   * Join a group
   */
  router.post('/:id/join', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id || req.body.user_id;

      if (!userId) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      const group = await groupService.joinGroup(req.params.id, userId);
      res.json(group);
    } catch (error: any) {
      console.error('Error joining group:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/groups/:id/leave
   * Leave a group
   */
  router.post('/:id/leave', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id || req.body.user_id;

      if (!userId) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      const group = await groupService.leaveGroup(req.params.id, userId);
      res.json(group);
    } catch (error: any) {
      console.error('Error leaving group:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/groups/:id/members
   * Get group members
   */
  router.get('/:id/members', async (req: Request, res: Response) => {
    try {
      const members = await groupService.getGroupMembers(req.params.id);
      res.json(members);
    } catch (error: any) {
      console.error('Error fetching group members:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/groups/:id/members
   * Add a member to a group
   */
  router.post('/:id/members', async (req: Request, res: Response) => {
    try {
      const { user_id } = req.body;
      if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      const group = await groupService.addMember(req.params.id, user_id);
      res.json(group);
    } catch (error: any) {
      console.error('Error adding member:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/groups/:id/share-memory
   * Share a memory object with a group
   */
  router.post('/:id/share-memory', async (req: Request, res: Response) => {
    try {
      const { memory_object_id } = req.body;
      if (!memory_object_id) {
        return res.status(400).json({ error: 'memory_object_id is required' });
      }

      const group = await groupService.shareMemoryObject(req.params.id, memory_object_id);
      res.json(group);
    } catch (error: any) {
      console.error('Error sharing memory:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/groups/:id/unshare-memory
   * Unshare a memory object from a group
   */
  router.post('/:id/unshare-memory', async (req: Request, res: Response) => {
    try {
      const { memory_object_id } = req.body;
      if (!memory_object_id) {
        return res.status(400).json({ error: 'memory_object_id is required' });
      }

      const group = await groupService.unshareMemoryObject(req.params.id, memory_object_id);
      res.json(group);
    } catch (error: any) {
      console.error('Error unsharing memory:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/users/search
   * Search users by email or name
   */
  router.get('/users/search', async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: 'query parameter q is required' });
      }

      const users = await groupService.searchUsers(query);
      res.json(users);
    } catch (error: any) {
      console.error('Error searching users:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

