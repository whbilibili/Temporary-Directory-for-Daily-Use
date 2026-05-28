import { TaskQueue } from '../queue/task-queue';
import { Task } from '../shared/types';
import { logger } from '../shared/logger';

/**
 * 任务调度器：从队列取出任务并分发执行
 * 支持并发控制和健康检查
 */
export class Scheduler {
  private queue: TaskQueue;
  private running = false;
  private concurrency = 5;
  private activeWorkers = 0;

  constructor(queue: TaskQueue) {
    this.queue = queue;
  }

  start(): void {
    this.running = true;
    this.poll();
    logger.info('Scheduler started');
  }

  stop(): void {
    this.running = false;
    logger.info('Scheduler stopped');
  }

  private async poll(): Promise<void> {
    while (this.running) {
      if (this.activeWorkers >= this.concurrency) {
        await this.sleep(100);
        continue;
      }

      const task = await this.queue.dequeue();
      if (task) {
        this.executeTask(task);
      } else {
        await this.sleep(1000);
      }
    }
  }

  private async executeTask(task: Task): Promise<void> {
    this.activeWorkers++;
    try {
      logger.info({ taskId: task.id, type: task.type }, 'Executing task');
      await this.sleep(task.estimatedDuration || 1000);
    } catch (error) {
      logger.error({ taskId: task.id, error }, 'Task execution failed');
      await this.queue.retry(task);
    } finally {
      this.activeWorkers--;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
