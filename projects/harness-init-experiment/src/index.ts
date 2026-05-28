import express from 'express';
import { TaskQueue } from './queue/task-queue';
import { Scheduler } from './scheduler/scheduler';
import { createRoutes } from './api/routes';
import { logger } from './shared/logger';
import { config } from './shared/config';

const app = express();
app.use(express.json());

const queue = new TaskQueue(config.redis);
const scheduler = new Scheduler(queue);

app.use('/api', createRoutes(queue, scheduler));

app.listen(config.port, () => {
  logger.info(`Task Queue Service started on port ${config.port}`);
  scheduler.start();
});

export { app };
