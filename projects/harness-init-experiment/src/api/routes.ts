import { Router } from 'express';
import { TaskQueue } from '../queue/task-queue';
import { Scheduler } from '../scheduler/scheduler';
import { taskSchema } from '../shared/types';
import { logger } from '../shared/logger';

export function createRoutes(queue: TaskQueue, scheduler: Scheduler): Router {
  const router = Router();

  router.post('/tasks', async (req, res) => {
    const parsed = taskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }
    const taskId = await queue.enqueue(parsed.data);
    logger.info({ taskId }, 'Task enqueued');
    res.status(201).json({ taskId });
  });

  router.get('/tasks/:id/status', async (req, res) => {
    const status = await queue.getStatus(req.params.id);
    if (!status) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ taskId: req.params.id, status });
  });

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  return router;
}
