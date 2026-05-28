import Redis from 'ioredis';
import { Task, TaskStatus, TaskPriority } from '../shared/types';

/**
 * 基于 Redis Sorted Set 的优先级任务队列
 * 支持任务入队、出队、状态查询和重试
 */
export class TaskQueue {
  private redis: Redis;

  constructor(redisConfig: { host: string; port: number }) {
    this.redis = new Redis(redisConfig);
  }

  async enqueue(task: Task): Promise<string> {
    const score = this.calculateScore(task.priority, task.createdAt);
    await this.redis.zadd('queue:pending', score, JSON.stringify(task));
    return task.id;
  }

  async dequeue(): Promise<Task | null> {
    const result = await this.redis.zpopmin('queue:pending');
    if (!result || result.length === 0) return null;
    return JSON.parse(result[0]) as Task;
  }

  async getStatus(taskId: string): Promise<TaskStatus | null> {
    const raw = await this.redis.hget('task:status', taskId);
    return raw ? (raw as TaskStatus) : null;
  }

  async retry(task: Task): Promise<void> {
    if (task.retryCount >= task.maxRetries) {
      await this.markFailed(task);
      return;
    }
    task.retryCount++;
    await this.enqueue(task);
  }

  private calculateScore(priority: TaskPriority, createdAt: number): number {
    return priority * 1000000000000 + createdAt;
  }

  private async markFailed(task: Task): Promise<void> {
    await this.redis.hset('task:status', task.id, 'failed');
  }
}
